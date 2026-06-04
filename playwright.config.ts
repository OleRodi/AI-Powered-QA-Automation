import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './support/auth.constant';

export default defineConfig({
  testDir: 'tests',
  globalSetup: './support/global-setup.ts',
  globalTeardown: './support/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The Didaxis test environment is remote and slow under parallel load, so the
  // default 30s/5s timeouts are too tight and cause spurious flakiness.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: process.env.CI ? 'never' : 'always' }],
  ],

  use: {
    baseURL: process.env.DIDAXIS_URL,
    trace: 'on',
    headless: !!process.env.CI,
    launchOptions: {
      slowMo: process.env.CI ? 0 : 1000,
    },
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },
  ],
});
