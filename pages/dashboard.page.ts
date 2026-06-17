import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppNavigation } from "./components/app-navigation";

export class DashboardPage extends BasePage {
  readonly nav;
  readonly heading;
  readonly welcomeText;
  readonly connectedStatus;
  readonly quickStartSection;
  readonly programsCard;

  constructor(page: Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole("heading", { name: "Dashboard" });
    this.welcomeText = page.getByText("Welcome to Didaxis Studio");
    this.connectedStatus = page.getByText("Connected");
    this.quickStartSection = page.getByText("Quick Start");
    this.programsCard = page.getByText("Manage academic programs");
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}/`);
  }

  async clickProgramsQuickStart(): Promise<void> {
    await this.programsCard.click();
  }
}
