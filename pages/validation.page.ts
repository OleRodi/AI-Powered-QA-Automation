import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppNavigation } from "./components/app-navigation";

export class ValidationPage extends BasePage {
  readonly nav;
  readonly heading;

  constructor(page: Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole("heading", { name: "Validation" });
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}/validation`);
  }
}
