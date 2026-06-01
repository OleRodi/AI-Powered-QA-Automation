import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { DashboardPage } from "./dashboard.page";

export class LoginPage extends BasePage {
  readonly emailInput;
  readonly passwordInput;
  readonly signInButton;
  readonly heading;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.signInButton = page.getByRole("button", { name: "Sign In" });
    this.heading = page.getByText("Sign in to your account");
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}/login`);
  }

  async login(email: string, password: string): Promise<DashboardPage> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.page.waitForURL("**/");
    return new DashboardPage(this.page);
  }
}
