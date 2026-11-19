import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'

export function testEnvironment() {
  const env = parseEnv(readFileSync(new URL('../.env.test.local', import.meta.url), 'utf8'))
  const url = new URL(env.DATABASE_URL)
  if (url.protocol !== 'mysql:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !url.pathname.endsWith('_test')) {
    throw new Error('Browser tests require a loopback MySQL database with a name ending in _test.')
  }
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) throw new Error('Set the staff and session settings in .env.test.local.')
  return env
}
