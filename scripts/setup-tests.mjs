import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { testEnvironment } from './test-environment.mjs'

const require = createRequire(import.meta.url)
const env = { ...process.env, ...testEnvironment() }
for (const args of [['migrate', 'deploy'], ['db', 'seed']]) {
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), ...args], { env, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
