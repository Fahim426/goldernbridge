import next from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...next,
  ...typescript,
  globalIgnores(['.next/**', '.local/**', 'src/generated/**', 'GB Assets/**', 'Golden Bridge/**', 'public/**', 'tmp/**', 'test-results/**', 'playwright-report/**', 'next-env.d.ts']),
])
