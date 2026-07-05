import { test, expect } from "../../fixtures/cleanup.fixture";
import { AiAssistPage } from "../../pages/ai-assist.page";
import { CalendarPage } from "../../pages/calendar.page";
import { DashboardPage } from "../../pages/dashboard.page";
import { ProgramsPage } from "../../pages/programs.page";
import { ValidationPage } from "../../pages/validation.page";

test.describe("DS-119 — Dashboard displaying the right components", () => {
  test.describe("Dashboard content", () => {
    test("TC-001: Navigate to the Dashboard and see expected blocks", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.heading).toBeVisible();
      await expect(dashboard.programsBlock).toBeVisible();
      await expect(dashboard.calendarBlock).toBeVisible();
      await expect(dashboard.validationBlock).toBeVisible();
      await expect(dashboard.aiAssistBlock).toBeVisible();
    });

    test("TC-002: Each dashboard block shows descriptive subtitle text", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.programsCard).toBeVisible();
      await expect(dashboard.calendarCard).toBeVisible();
      await expect(dashboard.validationCard).toBeVisible();
      await expect(dashboard.aiAssistCard).toBeVisible();
    });
  });

  test.describe("Dashboard card navigation", () => {
    test("TC-003: Programs card navigates to Programs page", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.clickProgramsCard();
      await page.waitForURL("**/programs");

      const programs = new ProgramsPage(page);
      await expect(programs.heading).toBeVisible();
    });

    test("TC-004: Calendar card navigates to Calendar page", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.clickCalendarCard();
      await page.waitForURL("**/calendar");

      const calendar = new CalendarPage(page);
      await expect(calendar.heading).toBeVisible();
    });

    test("TC-005: Validation card navigates to Validation page", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.clickValidationCard();
      await page.waitForURL("**/validation");

      const validation = new ValidationPage(page);
      await expect(validation.heading).toBeVisible();
    });

    test("TC-006: AI Assist card navigates to AI Assist page", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.clickAiAssistCard();
      await page.waitForURL("**/cli");

      const aiAssist = new AiAssistPage(page);
      await expect(aiAssist.heading).toBeVisible();
      await expect(aiAssist.subtitle).toBeVisible();
    });
  });
});
