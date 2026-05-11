import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  workers: undefined,
  use: {
    baseURL: "https://demo.playwright.dev/todomvc/#/",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
