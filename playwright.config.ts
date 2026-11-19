import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3189'
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  retries: 0,
  reporter: 'list',
  globalSetup: './tests/e2e/start-server.ts',
  use: {
    baseURL, browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    viewport: { width: 1440, height: 960 }, screenshot: 'only-on-failure',
  },
})
