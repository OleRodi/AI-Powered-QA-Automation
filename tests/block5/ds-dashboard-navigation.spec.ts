import { test, expect } from "../../fixtures/cleanup.fixture";
import { DashboardPage } from "../../pages/dashboard.page";
import { ProgramsPage } from "../../pages/programs.page";
import { goToPrograms } from "../../support/programs-test.helpers";

test.describe("DS-DASH — Dashboard navigation smoke", () => {
  test.describe("Dashboard content", () => {
    test("TC-001: Dashboard loads with expected content for authenticated user", async ({
      page,
    }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.heading).toBeVisible();
      await expect(dashboard.welcomeText).toBeVisible();
      await expect(dashboard.quickStartSection).toBeVisible();
      await expect(dashboard.programsCard).toBeVisible();
    });
  });

  test.describe("Sidebar navigation", () => {
    test("TC-002: Sidebar navigates to Programs page", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.nav.goToPrograms();

      const programs = new ProgramsPage(page);
      await expect(programs.heading).toBeVisible();
      await expect(programs.newProgramButton).toBeVisible();
    });

    test("TC-003: Sidebar navigates back to Dashboard from Programs", async ({ page }) => {
      const programs = await goToPrograms(page);

      await programs.nav.goToDashboard();

      const dashboard = new DashboardPage(page);
      await expect(dashboard.heading).toBeVisible();
    });
  });

  test.describe("Quick Start navigation", () => {
    test("TC-004: Quick Start programs card navigates to Programs", async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.clickProgramsQuickStart();

      const programs = new ProgramsPage(page);
      await expect(programs.heading).toBeVisible();
    });
  });
});
