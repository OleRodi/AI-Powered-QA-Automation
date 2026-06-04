import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './support/auth.constant';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
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
