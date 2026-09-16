import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', timeout: 90000, workers: 2,
  use: { baseURL: 'http://127.0.0.1:5191', channel: 'chrome', viewport: {width:1440,height:900}, screenshot: 'only-on-failure', trace:'retain-on-failure' },
  webServer: { command: 'npm run build && node scripts/serve-built.mjs', url: 'http://127.0.0.1:5191', reuseExistingServer:false, timeout:120000 },
});
