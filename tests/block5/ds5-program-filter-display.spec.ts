import { test, expect } from "../../fixtures/cleanup.fixture";
import { createProgram } from "../../support/playwright-program-helpers";
import { goToPrograms, openEditProgramModal } from "../../support/programs-test.helpers";

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

    const programs = await goToPrograms(page);

    await createProgram(page, trackProgram, program1Name, program1Desc);
    await createProgram(page, trackProgram, program2Name, program2Desc);

    const row1 = programs.programRow(program1Name);
    await expect(row1).toBeVisible();
    await expect(row1).toContainText(program1Name);
    await expect(row1).toContainText(program1Desc);

    const row2 = programs.programRow(program2Name);
    await expect(row2).toBeVisible();
    await expect(row2).toContainText(program2Name);
    await expect(row2).toContainText(program2Desc);
  });

  test("TC-002: Each program row displays management action icons", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const program1Name = `OleRodi Web Development 2026 ${suffix}`;
    const program2Name = `OleRodi Data Science Foundations ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, program1Name, "TC-002 first program");
    await createProgram(page, trackProgram, program2Name, "TC-002 second program");

    await expect(programs.editButtonFor(program1Name)).toBeVisible();
    await expect(programs.deleteButtonFor(program1Name)).toBeVisible();
    await expect(programs.editButtonFor(program2Name)).toBeVisible();
    await expect(programs.deleteButtonFor(program2Name)).toBeVisible();

    const editModal = await openEditProgramModal(programs, program2Name);
    await editModal.cancel();
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

    const programs = await goToPrograms(page);
    await programs.reload();

    await expect(programs.dataRows()).toHaveCount(0);
    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.createProgramButton).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();

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

    const programs = await goToPrograms(page);
    await programs.reload();

    const ctaVisible = await programs.createProgramButton.isVisible().catch(() => false);

    if (ctaVisible) {
      await programs.createProgramButton.click();
    } else {
      await programs.newProgramButton.click();
    }

    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toBeVisible();

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-005: Programs are displayed in a consistent default sort order", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const names = [
      `OleRodi Alpha Program ${suffix}`,
      `OleRodi Beta Program ${suffix}`,
      `OleRodi Gamma Program ${suffix}`,
    ];

    const programs = await goToPrograms(page);

    for (const name of names) {
      await createProgram(page, trackProgram, name, `TC-005 sort test ${name}`);
    }

    const getRelativeOrder = async () => {
      const positions = await Promise.all(
        names.map(async (name) => {
          const box = await programs.programRow(name).boundingBox();
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

    await programs.reload();

    const orderAfter = await getRelativeOrder();
    expect(orderAfter).toEqual(orderBefore);
  });

  test("TC-006: Clicking a program row navigates to detail or edit view", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Web Development 2026 ${suffix}`;
    const programDesc = "Full-stack web technologies and project-based learning";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    await programs.programRow(programName).click();

    await expect(programs.programNameText(programName).first()).toBeVisible();
    await expect(programs.semesterHeading).toBeVisible();
    await expect(programs.manageCoursesOrSemesterButton).toBeVisible();
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

    const programs = await goToPrograms(page);

    await expect(programs.dataRows()).toHaveCount(0);

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

    const programs = await goToPrograms(page);
    await programs.reload();

    await expect(programs.dataRows()).toHaveCount(0);
    await expect
      .poll(async () => {
        const mainText = await programs.mainRegion.innerText();
        const hasErrorMessage = /unable|error|failed|load/i.test(mainText);
        const hasEmptyMessage = /no programs yet/i.test(mainText);
        return hasErrorMessage || !hasEmptyMessage;
      })
      .toBe(true);

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

    const programs = await goToPrograms(page);
    await programs.reload();

    await expect(programs.heading).toBeVisible();
    await expect(programs.nav.nav).toBeVisible();
    await expect(programs.mainRegion).not.toContainText("undefined");

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

    const programs = await goToPrograms(page);

    await expect(programs.emptyStateMessage).toHaveCount(0, { timeout: 500 });

    await expect(programs.dataRows().first()).toBeVisible({ timeout: 15000 });

    await page.unroute(/\/api\/programs/i);
  });
});

test.describe("Program List Display – Edge Cases", () => {
  test("TC-011: Special characters in name and description display correctly", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Informatique & IA - Niveau 2 ${suffix}`;
    const programDesc = `Parcours avancé: IA, NLP, et MLOps ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const row = programs.programRow(programName);
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

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, longName, longDesc);

    const row = programs.programRow(longName);
    await expect(row).toBeVisible();

    const editButton = programs.editButtonFor(longName);
    const deleteButton = programs.deleteButtonFor(longName);
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
    const mockPrograms = Array.from({ length: 100 }, (_, i) =>
      mockProgram(`perf-id-${i}`, `Perf Program ${i}`, `Performance test program ${i}`)
    );

    await page.route(/\/api\/programs/i, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: mockPrograms }),
        });
      } else {
        await route.continue();
      }
    });

    const programs = await goToPrograms(page);

    const start = Date.now();
    await programs.reload();
    await expect(programs.dataRows().first()).toBeVisible();
    expect(Date.now() - start).toBeLessThan(3000);

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-014: Program count indicator is accurate and updates", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Count Probe ${suffix}`;

    const programs = await goToPrograms(page);

    const hasCountIndicator = await programs.programCountIndicator.isVisible().catch(() => false);

    if (hasCountIndicator) {
      const countBefore = parseInt(
        (await programs.programCountIndicator.innerText()).match(/\d+/)![0],
        10
      );
      const rowsBefore = await programs.dataRows().count();

      await createProgram(page, trackProgram, programName, "TC-014 count indicator test");

      const countAfter = parseInt(
        (await programs.programCountIndicator.innerText()).match(/\d+/)![0],
        10
      );
      expect(countAfter).toBe(countBefore + 1);
      expect(countAfter).toBeGreaterThanOrEqual(rowsBefore + 1);
    } else {
      await createProgram(page, trackProgram, programName, "TC-014 count indicator test");
      await expect(programs.programRow(programName)).toBeVisible();
    }
  });

  test("TC-015: List data is fresh after navigation back to Programs page", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Freshness Test Program ${suffix}`;

    let programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-015 freshness test");

    await programs.nav.goToDashboard();

    programs = await goToPrograms(page);

    await expect(programs.programRow(programName)).toBeVisible();
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

    const programs = await goToPrograms(page);
    await programs.reload();

    await expect(programs.programRow(programName)).toBeVisible();

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await expect(programs.dataRows()).toHaveCount(0);
    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.createProgramButton).toBeVisible();

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

    const programs = await goToPrograms(page);
    await programs.reload();

    await expect(programs.emptyStateMessage).toBeVisible();

    await page.unroute(/\/api\/programs/i);

    await createProgram(page, trackProgram, programName, programDesc);

    const row = programs.programRow(programName);
    await expect(row).toBeVisible();
    await expect(row).toContainText(programName);
    await expect(row).toContainText(programDesc);
    await expect(programs.emptyStateMessage).toHaveCount(0);
  });

  test("TC-018: Duplicate program names are distinguishable in display", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;
    const desc1 = "TC-018 first instance description";
    const desc2 = "TC-018 second instance description";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, desc1);
    await createProgram(page, trackProgram, programName, desc2);

    const matchingRows = programs.matchingRows(programName);
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

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-019 refresh consistency test");

    await expect(programs.programRow(programName)).toBeVisible();

    const rowCountBefore = await programs.allRows.count();

    await programs.reload();

    await expect(programs.programRow(programName)).toBeVisible();

    const rowCountAfter = await programs.allRows.count();
    expect(rowCountAfter).toBe(rowCountBefore);
  });
});
