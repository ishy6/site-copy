import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:5188',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/serve-built.mjs',
    url: 'http://127.0.0.1:5188',
    reuseExistingServer: true,
  },
});
