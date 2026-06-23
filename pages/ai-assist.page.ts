import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppNavigation } from "./components/app-navigation";

export class AiAssistPage extends BasePage {
  readonly nav;
  readonly heading;
  readonly subtitle;

  constructor(page: Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole("heading", { name: "AI Assist" });
    this.subtitle = page.getByText("AI-powered schedule generation and editing via the Didaxis CLI");
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}/cli`);
  }
}
