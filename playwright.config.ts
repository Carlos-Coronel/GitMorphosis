import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', fullyParallel: true, retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://127.0.0.1:4173/GitMorphosis/', trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'pnpm build:pages && node tools/prepare-e2e.mjs && pnpm exec serve .e2e-site -l 4173',
    url: 'http://127.0.0.1:4173/GitMorphosis/', reuseExistingServer: false, timeout: 120_000,
  },
});
