import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

// An independent Windows MySQL instance for development and browser tests.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const state = path.join(root, '.local', 'mysql');
const data = path.join(state, 'data');
const initFile = path.join(state, 'bootstrap.sql');
const devEnv = path.join(root, '.env');
const testEnv = path.join(root, '.env.test.local');
const binaryDir = process.env.MYSQL_BIN || 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin';
const server = path.join(binaryDir, 'mysqld.exe');
const client = path.join(binaryDir, 'mysql.exe');
const secret = () => randomBytes(32).toString('hex');
const readEnv = file => parseEnv(readFileSync(file, 'utf8'));
const port = Number(process.env.MYSQL_LOCAL_PORT || (existsSync(testEnv) ? new URL(readEnv(testEnv).DATABASE_URL).port : 33469));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid local port.');
if (!existsSync(server) || !existsSync(client)) throw new Error('Set MYSQL_BIN to the MySQL 8+ bin directory.');

function localDatabaseReady() {
  if (!existsSync(testEnv)) return false;
  const url = new URL(readEnv(testEnv).DATABASE_URL);
  if (url.hostname !== '127.0.0.1' || url.pathname !== '/liora_connect_test') return false;
  const check = spawnSync(client, ['--no-defaults','--protocol=tcp','--host=127.0.0.1',
    '--port=' + port, '--user=' + url.username, '--connect-timeout=1', '--database=liora_connect_test',
    '--execute=SELECT 1'], { windowsHide:true, stdio:'ignore', env:{...process.env, MYSQL_PWD:url.password} });
  return check.status === 0;
}

const portOccupied = await new Promise((resolve) => {
  const socket = net.connect(port, '127.0.0.1');
  socket.once('connect', () => { socket.destroy(); resolve(true); });
  socket.once('error', () => resolve(false));
});
if (portOccupied) {
  if (!existsSync(data) || !localDatabaseReady()) throw new Error('The requested local port is already in use.');
  console.info('The project MySQL instance is already running on 127.0.0.1:' + port);
} else {
  if (!existsSync(data)) {
    if (existsSync(devEnv) || existsSync(testEnv)) throw new Error('An environment file exists. Use its configured database or run the helper in a fresh checkout.');
    mkdirSync(state, { recursive:true });
    const init = spawnSync(server, ['--no-defaults', '--initialize', '--datadir=' + data,
      '--log-error=' + path.join(state, 'initialize.log')], { windowsHide:true, stdio:'inherit' });
    if (init.status !== 0) throw new Error('MySQL initialization failed. See .local/mysql/initialize.log.');
    const rootSecret = secret();
    const adminSecret = secret();
    const statements = ["ALTER USER 'root'@'localhost' IDENTIFIED BY '" + rootSecret + "';"];
    for (const [name, user, file] of [['liora_connect','liora_local',devEnv], ['liora_connect_test','liora_test',testEnv]]) {
      const password = secret();
      statements.push('CREATE DATABASE ' + name + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
        "CREATE USER '" + user + "'@'127.0.0.1' IDENTIFIED BY '" + password + "';",
        "GRANT ALL PRIVILEGES ON " + name + ".* TO '" + user + "'@'127.0.0.1';");
      writeFileSync(file, ['DATABASE_URL=mysql://' + user + ':' + password + '@127.0.0.1:' + port + '/' + name,
        'SESSION_SECRET=' + secret(), 'ADMIN_EMAIL=staff@example.test','ADMIN_PASSWORD=' + adminSecret,
        'ADMIN_NAME="Assessment Staff"', ''].join('\n'), {flag:'wx',mode:0o600});
    }
    writeFileSync(initFile, statements.join('\n'), {flag:'wx',mode:0o600});
    writeFileSync(path.join(state,'root-password.local'), rootSecret, {flag:'wx',mode:0o600});
  }
  const args = ['--no-defaults','--datadir=' + data,'--port=' + port,'--bind-address=127.0.0.1','--mysqlx=OFF',
    '--skip-name-resolve','--skip-log-bin','--secure-file-priv=NULL','--pid-file=' + path.join(state,'mysqld.pid'),
    '--log-error=' + path.join(state,'mysql.log')];
  if (existsSync(initFile)) args.push('--init-file=' + initFile);
  const daemon = spawn(server, args, { windowsHide:true,detached:true,stdio:'ignore' });
  daemon.unref();
  for (let attempt = 0; attempt < 40 && !localDatabaseReady(); attempt++) {
    if (daemon.exitCode !== null) throw new Error('MySQL exited during startup. See .local/mysql/mysql.log.');
    await setTimeout(500);
  }
  if (!localDatabaseReady()) throw new Error('MySQL is unavailable. See .local/mysql/mysql.log.');
  if (existsSync(initFile)) unlinkSync(initFile);
  console.info('Project MySQL is running on 127.0.0.1:' + port + '. Settings are in .env and .env.test.local.');
}
