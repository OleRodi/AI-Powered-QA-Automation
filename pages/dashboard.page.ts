import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppNavigation } from "./components/app-navigation";

export class DashboardPage extends BasePage {
  readonly nav;
  readonly heading;
  readonly welcomeText;
  readonly connectedStatus;
  readonly quickStartSection;
  readonly mainRegion;
  readonly programsBlock;
  readonly calendarBlock;
  readonly validationBlock;
  readonly aiAssistBlock;
  readonly programsCard;
  readonly calendarCard;
  readonly validationCard;
  readonly aiAssistCard;

  constructor(page: Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole("heading", { name: "Dashboard" });
    this.welcomeText = page.getByText("Welcome to Didaxis Studio");
    this.connectedStatus = page.getByText("Connected");
    this.quickStartSection = page.getByText("Quick Start");
    this.mainRegion = page.getByRole("main");
    this.programsBlock = this.mainRegion.getByRole("paragraph").filter({ hasText: /^Programs$/ });
    this.calendarBlock = this.mainRegion.getByRole("paragraph").filter({ hasText: /^Calendar$/ });
    this.validationBlock = this.mainRegion.getByRole("paragraph").filter({ hasText: /^Validation$/ });
    this.aiAssistBlock = this.mainRegion.getByRole("paragraph").filter({ hasText: /^AI Assist$/ });
    this.programsCard = this.mainRegion.getByText("Manage academic programs");
    this.calendarCard = this.mainRegion.getByText("Schedule & drag-drop");
    this.validationCard = this.mainRegion.getByText("Check for conflicts");
    this.aiAssistCard = this.mainRegion.getByText("AI-powered editing");
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}/`);
  }

  async clickProgramsCard(): Promise<void> {
    await this.programsCard.click();
  }

  async clickCalendarCard(): Promise<void> {
    await this.calendarCard.click();
  }

  async clickValidationCard(): Promise<void> {
    await this.validationCard.click();
  }

  async clickAiAssistCard(): Promise<void> {
    await this.aiAssistCard.click();
  }

  /** @deprecated Use clickProgramsCard instead */
  async clickProgramsQuickStart(): Promise<void> {
    await this.clickProgramsCard();
  }
}
