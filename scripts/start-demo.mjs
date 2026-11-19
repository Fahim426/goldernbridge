import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { testEnvironment } from './test-environment.mjs'

const server = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '--hostname','127.0.0.1','--port','3100'], {
  stdio:'inherit', windowsHide:true, env:{...process.env,...testEnvironment(),NODE_ENV:'production'},
})
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.kill())
server.once('exit', code => {process.exitCode = code ?? 0})
