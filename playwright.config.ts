import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests/block5",
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  workers: 2,
  retries: 1,
  use: {
    baseURL: process.env.DIDAXIS_URL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
});
