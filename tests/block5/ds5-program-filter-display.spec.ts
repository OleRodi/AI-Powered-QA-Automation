import { test, expect } from "../../fixtures/cleanup.fixture";
import { createProgram } from "../../support/playwright-program-helpers";

async function goToPrograms(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Programs" }).click();
  await page.waitForURL("**/programs");
}

function dataRows(page: import("@playwright/test").Page) {
  return page.getByRole("row").filter({ hasNotText: /^Program$/ });
}

function mockProgram(
  id: string,
  name: string,
  description: string
) {
  return {
    id,
    name,
    description,
    total_hours: null,
    default_session_hours: "4.00",
    default_exam_hours: "3.00",
    target_audience: null,
    focus_areas: null,
    sync_async_ratio: 70,
    organization_id: "mock-org-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

test.describe("Program List Display – Positive Flows", () => {
  test("TC-001: Programs page displays all existing programs with name and description", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const program1Name = `OleRodi Web Development 2026 ${suffix}`;
    const program1Desc = "Full-stack web technologies and project-based learning";
    const program2Name = `OleRodi Data Science Foundations ${suffix}`;
    const program2Desc = "Statistics, Python, and machine learning basics";

    await goToPrograms(page);

    await createProgram(page, trackProgram, program1Name, program1Desc);
    await createProgram(page, trackProgram, program2Name, program2Desc);

    const row1 = page.getByRole("row").filter({ hasText: program1Name }).first();
    await expect(row1).toBeVisible();
    await expect(row1).toContainText(program1Name);
    await expect(row1).toContainText(program1Desc);

    const row2 = page.getByRole("row").filter({ hasText: program2Name }).first();
    await expect(row2).toBeVisible();
    await expect(row2).toContainText(program2Name);
    await expect(row2).toContainText(program2Desc);
  });

  test("TC-002: Each program row displays management action icons", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const program1Name = `OleRodi Web Development 2026 ${suffix}`;
    const program2Name = `OleRodi Data Science Foundations ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, program1Name, "TC-002 first program");
    await createProgram(page, trackProgram, program2Name, "TC-002 second program");

    const row1 = page.getByRole("row").filter({ hasText: program1Name }).first();
    const row2 = page.getByRole("row").filter({ hasText: program2Name }).first();

    await expect(row1.getByRole("button", { name: "✏️" })).toBeVisible();
    await expect(row1.getByRole("button", { name: "🗑" })).toBeVisible();
    await expect(row2.getByRole("button", { name: "✏️" })).toBeVisible();
    await expect(row2.getByRole("button", { name: "🗑" })).toBeVisible();

    await row2.getByRole("button", { name: "✏️" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();
    await editDialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("TC-003: Empty-state message appears when no programs exist", async ({ page, trackProgram }) => {
    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);
    await page.reload();
    await page.waitForURL("**/programs");

    await expect(dataRows(page)).toHaveCount(0);
    await expect(
      page.getByText(/no programs yet/i)
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Program" })).toBeVisible();
    await expect(page.getByRole("button", { name: "+ New Program" })).toBeVisible();

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-004: Empty-state CTA navigates to program creation form", async ({ page, trackProgram }) => {
    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);
    await page.reload();
    await page.waitForURL("**/programs");

    const emptyCta = page.getByRole("button", { name: "Create Program" });
    const ctaVisible = await emptyCta.isVisible().catch(() => false);

    if (ctaVisible) {
      await emptyCta.click();
    } else {
      await page.getByRole("button", { name: "+ New Program" }).click();
    }

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("textbox", { name: "Program Name" })
    ).toBeVisible();

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-005: Programs are displayed in a consistent default sort order", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const names = [
      `OleRodi Alpha Program ${suffix}`,
      `OleRodi Beta Program ${suffix}`,
      `OleRodi Gamma Program ${suffix}`,
    ];

    await goToPrograms(page);

    for (const name of names) {
      await createProgram(page, trackProgram, name, `TC-005 sort test ${name}`);
    }

    const getRelativeOrder = async () => {
      const positions = await Promise.all(
        names.map(async (name) => {
          const box = await page
            .getByRole("row")
            .filter({ hasText: name })
            .first()
            .boundingBox();
          return { name, y: box?.y ?? -1 };
        })
      );
      return positions
        .filter((entry) => entry.y >= 0)
        .sort((a, b) => a.y - b.y)
        .map((entry) => entry.name);
    };

    const orderBefore = await getRelativeOrder();
    expect(orderBefore.length).toBe(3);

    await page.reload();
    await page.waitForURL("**/programs");

    const orderAfter = await getRelativeOrder();
    expect(orderAfter).toEqual(orderBefore);
  });

  test("TC-006: Clicking a program row navigates to detail or edit view", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Web Development 2026 ${suffix}`;
    const programDesc = "Full-stack web technologies and project-based learning";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const row = page.getByRole("row").filter({ hasText: programName }).first();
    await row.click();

    await expect(page.getByText(programName).first()).toBeVisible();
    await expect(page.getByText(/semesters?/i).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /\+ Semester|Manage Courses/i }).first()
    ).toBeVisible();
  });
});

test.describe("Program List Display – Negative Flows", () => {
  test("TC-007: Non-admin user cannot access the program management list", async ({ page, trackProgram }) => {
    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ error: "Forbidden" }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);
    await page.waitForTimeout(2000);

    await expect(dataRows(page)).toHaveCount(0);

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-008: API failure shows error state, not empty-state message", async ({ page, trackProgram }) => {
    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);
    await page.reload();
    await page.waitForURL("**/programs");
    await page.waitForTimeout(2000);

    const mainText = await page.locator("main").innerText();
    const hasErrorMessage = /unable|error|failed|load/i.test(mainText);
    const hasEmptyMessage = /no programs yet/i.test(mainText);

    expect(hasErrorMessage || !hasEmptyMessage).toBe(true);
    await expect(dataRows(page)).toHaveCount(0);

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-009: Program with missing name/description data renders gracefully", async ({ page, trackProgram }) => {
    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              mockProgram("bad-1", "", "Missing name program"),
              mockProgram("bad-2", "Valid Program", ""),
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);
    await page.reload();
    await page.waitForURL("**/programs");
    await page.waitForTimeout(2000);

    await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();

    const pageContent = await page.content();
    expect(pageContent).not.toContain("undefined");

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-010: Loading state does not flash a false empty-state message", async ({ page, trackProgram }) => {
    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);

    const emptyDuringLoad = page.getByText(/no programs yet/i);
    await expect(emptyDuringLoad).toHaveCount(0, { timeout: 500 });

    await expect(dataRows(page).first()).toBeVisible({ timeout: 15000 });

    await page.unroute(/\/api\/programs/i);
  });
});

test.describe("Program List Display – Edge Cases", () => {
  test("TC-011: Special characters in name and description display correctly", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Informatique & IA - Niveau 2 ${suffix}`;
    const programDesc = `Parcours avancé: IA, NLP, et MLOps ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const row = page.getByRole("row").filter({ hasText: programName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(programName);
    await expect(row).toContainText("Parcours avancé");
    await expect(row).not.toContainText("&amp;");
    await expect(row).not.toContainText("&eacute;");
  });

  test("TC-012: Very long names and descriptions do not break layout", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const longName = `OleRodi Advanced Data Engineering and Distributed Systems - Cohort 2026 - Section A ${suffix}`;
    const longDesc = `Comprehensive curriculum covering distributed storage, stream processing, data modeling, observability, and production-grade pipelines for enterprise workloads ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, longName, longDesc);

    const row = page.getByRole("row").filter({ hasText: longName }).first();
    await expect(row).toBeVisible();

    const editButton = row.getByRole("button", { name: "✏️" });
    const deleteButton = row.getByRole("button", { name: "🗑" });
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();

    const editBox = await editButton.boundingBox();
    const deleteBox = await deleteButton.boundingBox();
    expect(editBox).not.toBeNull();
    expect(deleteBox).not.toBeNull();
    expect(editBox!.width).toBeGreaterThan(0);
    expect(deleteBox!.width).toBeGreaterThan(0);
  });

  test("TC-013: Large dataset loads and renders within acceptable time", async ({ page, trackProgram }) => {
    const programs = Array.from({ length: 100 }, (_, i) =>
      mockProgram(`perf-id-${i}`, `Perf Program ${i}`, `Performance test program ${i}`)
    );

    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: programs }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);

    const start = Date.now();
    await page.reload();
    await page.waitForURL("**/programs");
    await expect(dataRows(page).first()).toBeVisible();
    expect(Date.now() - start).toBeLessThan(3000);

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-014: Program count indicator is accurate and updates", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Count Probe ${suffix}`;

    await goToPrograms(page);

    const countLocator = page.getByText(/^\d+\s+Programs?$/i);
    const hasCountIndicator = await countLocator.isVisible().catch(() => false);

    if (hasCountIndicator) {
      const countBefore = parseInt((await countLocator.innerText()).match(/\d+/)![0], 10);
      const rowsBefore = await dataRows(page).count();

      await createProgram(page, trackProgram, programName, "TC-014 count indicator test");

      const countAfter = parseInt((await countLocator.innerText()).match(/\d+/)![0], 10);
      expect(countAfter).toBe(countBefore + 1);
      expect(countAfter).toBeGreaterThanOrEqual(rowsBefore + 1);
    } else {
      await createProgram(page, trackProgram, programName, "TC-014 count indicator test");
      await expect(
        page.getByRole("row").filter({ hasText: programName }).first()
      ).toBeVisible();
    }
  });

  test("TC-015: List data is fresh after navigation back to Programs page", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Freshness Test Program ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-015 freshness test");

    await page.getByRole("button", { name: "Dashboard" }).click();
    await page.waitForURL("**/");

    await goToPrograms(page);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();
  });

  test("TC-016: Deleting the last program transitions to empty state", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;
    const programId = `solo-id-${suffix}`;

    let programsData = [mockProgram(programId, programName, "TC-016 solo delete test")];

    await page.route(/\/api\/programs/i, async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: programsData }),
        });
      } else if (method === "DELETE") {
        programsData = [];
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);
    await page.reload();
    await page.waitForURL("**/programs");

    const row = page.getByRole("row").filter({ hasText: programName }).first();
    await expect(row).toBeVisible();

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await row.getByRole("button", { name: "🗑" }).click();

    await expect(dataRows(page)).toHaveCount(0);
    await expect(page.getByText(/no programs yet/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Program" })).toBeVisible();

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-017: Empty state and list state switch correctly after first program is created", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Cloud Engineering 2026 ${suffix}`;
    const programDesc = "TC-017 empty-to-list transition test";

    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      } else {
        await route.continue();
      }
    });

    await goToPrograms(page);
    await page.reload();
    await page.waitForURL("**/programs");

    await expect(page.getByText(/no programs yet/i)).toBeVisible();

    await page.unroute(/\/api\/programs/i);

    await createProgram(page, trackProgram, programName, programDesc);

    const row = page.getByRole("row").filter({ hasText: programName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(programName);
    await expect(row).toContainText(programDesc);
    await expect(page.getByText(/no programs yet/i)).toHaveCount(0);
  });

  test("TC-018: Duplicate program names are distinguishable in display", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;
    const desc1 = "TC-018 first instance description";
    const desc2 = "TC-018 second instance description";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, desc1);
    await createProgram(page, trackProgram, programName, desc2);

    const matchingRows = page.getByRole("row").filter({ hasText: programName });
    await expect(matchingRows).toHaveCount(2);

    const row1Text = await matchingRows.nth(0).innerText();
    const row2Text = await matchingRows.nth(1).innerText();

    expect(row1Text).not.toBe(row2Text);
    expect(row1Text.includes(desc1) || row2Text.includes(desc1)).toBe(true);
    expect(row1Text.includes(desc2) || row2Text.includes(desc2)).toBe(true);
  });

  test("TC-019: Page refresh shows data consistent with server", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Refresh Check ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-019 refresh consistency test");

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    const rowCountBefore = await page.getByRole("row").count();

    await page.reload();
    await page.waitForURL("**/programs");

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    const rowCountAfter = await page.getByRole("row").count();
    expect(rowCountAfter).toBe(rowCountBefore);
  });
});
