import type { Page } from "@playwright/test";

export abstract class BasePage {
  protected readonly baseURL: string;

  constructor(protected readonly page: Page) {
    const baseURL = process.env.DIDAXIS_URL;
    if (!baseURL) {
      throw new Error("DIDAXIS_URL is not set");
    }
    this.baseURL = baseURL;
  }
}
