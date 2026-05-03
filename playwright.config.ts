import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4322',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 4322 --force',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
