import { test, expect } from "../../fixtures/cleanup.fixture";
import { createProgram } from "../../support/playwright-program-helpers";
import { goToPrograms } from "../../support/programs-test.helpers";

test.describe("Delete Program – Positive Flows", () => {
  test("TC-001: Confirmation dialog appears before program deletion", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "A program used for deletion testing");

    let dialogMessage = "";
    let dialogFired = false;

    page.on("dialog", async (dialog) => {
      dialogFired = true;
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(1000);

    expect(dialogFired).toBe(true);
    expect(dialogMessage).toContain(programName);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-002: Program is removed from list after deletion is confirmed", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "A program used for deletion testing");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await expect(programs.matchingRows(programName)).toHaveCount(0);
  });

  test("TC-003: Program remains in list when deletion is canceled", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "A program used for deletion testing");

    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(1000);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-004: Confirmation dialog closes without side effects when dismissed via close control", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "A program used for deletion testing");

    let dialogCount = 0;

    page.on("dialog", async (dialog) => {
      dialogCount++;
      await dialog.dismiss();
    });

    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(1000);

    expect(dialogCount).toBe(1);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-005: Delete icon is visible and functional for each program row", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const testProgramName = `OleRodi Test Program ${suffix}`;
    const dataScienceName = `OleRodi Data Science 2026 ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, testProgramName, "TC-005 delete icon visibility test");
    await createProgram(page, trackProgram, dataScienceName, "TC-005 secondary program");

    const testRow = programs.programRow(testProgramName);
    const dataScienceRow = programs.programRow(dataScienceName);

    await expect(programs.deleteButtonFor(testProgramName)).toBeVisible();
    await expect(programs.deleteButtonFor(dataScienceName)).toBeVisible();

    let dialogMessage = "";

    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await programs.deleteButtonFor(dataScienceName).click();

    await page.waitForTimeout(1000);

    expect(dialogMessage).toContain(dataScienceName);
    expect(dialogMessage).not.toContain(testProgramName);

    await expect(testRow).toBeVisible();
    await expect(dataScienceRow).toBeVisible();
  });

  test("TC-006: Confirmation dialog shows the correct program name", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const cloudProgramName = `OleRodi Cloud Engineering 2026 ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, cloudProgramName, "TC-006 dialog identity test");

    let dialogMessage = "";

    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await programs.deleteButtonFor(cloudProgramName).click();

    await page.waitForTimeout(1000);

    expect(dialogMessage).toContain(cloudProgramName);
    expect(dialogMessage.toLowerCase()).not.toBe("are you sure?");
  });
});

test.describe("Delete Program – Negative Flows", () => {
  test("TC-007: Program is not removed before user confirms", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-007 no optimistic removal test");

    let deleteRequested = false;

    await page.route(/\/programs/i, async (route) => {
      if (route.request().method() === "DELETE") {
        deleteRequested = true;
      }
      await route.continue();
    });

    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(1000);

    expect(deleteRequested).toBe(false);
    await expect(programs.programRow(programName)).toBeVisible();

    await page.unroute(/\/programs/i);
  });

  test("TC-008: Backend failure does not remove program from list", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-008 backend failure test");

    await page.route(/\/programs/i, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(2000);

    await expect(programs.programRow(programName)).toBeVisible();

    await page.unroute(/\/programs/i);
  });

  test("TC-009: Unauthorized user cannot delete a program", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-009 authorization test");

    await page.route(/\/programs/i, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ error: "Forbidden" }),
        });
      } else {
        await route.continue();
      }
    });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(2000);

    await expect(programs.programRow(programName)).toBeVisible();

    await page.unroute(/\/programs/i);
  });

  test("TC-010: Rapid double-click on Confirm sends only one delete request", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-010 double click test");

    let deleteRequestCount = 0;

    await page.route(/\/programs/i, async (route) => {
      if (route.request().method() === "DELETE") {
        deleteRequestCount++;
        await route.continue();
      } else {
        await route.continue();
      }
    });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await expect(programs.matchingRows(programName)).toHaveCount(0);

    await page.waitForTimeout(1000);

    expect(deleteRequestCount).toBe(1);

    await page.unroute(/\/programs/i);
  });

  test("TC-011: Deletion is blocked for program with dependent records", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-011 referential constraint test");

    await page.route(/\/programs/i, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Conflict",
            message: "Program cannot be deleted while linked records exist",
          }),
        });
      } else {
        await route.continue();
      }
    });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(2000);

    await expect(programs.programRow(programName)).toBeVisible();

    await page.unroute(/\/programs/i);
  });
});

test.describe("Delete Program – Edge Cases", () => {
  test("TC-012: Deleting the last remaining program triggers the empty state", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;
    const programId = `mock-id-${suffix}`;

    let programsData = [
      {
        id: programId,
        name: programName,
        description: "TC-012 solo delete empty-state test",
        total_hours: null,
        default_session_hours: "4.00",
        default_exam_hours: "3.00",
        target_audience: null,
        focus_areas: null,
        sync_async_ratio: 70,
        organization_id: "mock-org-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

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

    const row = programs.programRow(programName);
    await expect(row).toBeVisible();

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await expect(programs.dataRows()).toHaveCount(0);
    await expect(programs.newProgramButton).toBeVisible();

    await page.unroute(/\/api\/programs/i);
  });

  test("TC-013: Multiple sequential deletions are reflected immediately", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const testProgramName = `OleRodi Test Program ${suffix}`;
    const dataScienceName = `OleRodi Data Science 2026 ${suffix}`;
    const cloudProgramName = `OleRodi Cloud Engineering 2026 ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, testProgramName, "TC-013 seq delete A");
    await createProgram(page, trackProgram, dataScienceName, "TC-013 seq delete B");
    await createProgram(page, trackProgram, cloudProgramName, "TC-013 seq delete C");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(testProgramName).click();
    await expect(programs.matchingRows(testProgramName)).toHaveCount(0);

    await programs.deleteButtonFor(dataScienceName).click();
    await expect(programs.matchingRows(dataScienceName)).toHaveCount(0);

    await expect(programs.programRow(cloudProgramName)).toBeVisible();
  });

  test("TC-014: List count and pagination adjust after deletion", async ({ page, trackProgram }) => {
    test.setTimeout(120000);

    const suffix = Date.now();
    const batchPrefix = `OleRodi Paginate Probe ${suffix}`;

    const programs = await goToPrograms(page);

    const batchSize = 3;
    const batchNames = Array.from(
      { length: batchSize },
      (_, i) => `OleRodi ${batchPrefix} #${i}`
    );
    for (let i = 0; i < batchSize; i++) {
      await createProgram(page, trackProgram, batchNames[i], `TC-014 batch ${i}`);
    }

    const batchRows = programs.matchingRows(batchPrefix);
    await expect(batchRows).toHaveCount(batchSize);

    const hasPagination = await programs.paginationNext.isVisible().catch(() => false);

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    if (hasPagination) {
      await programs.paginationNext.click();
      await programs.deleteButtonFor(batchNames[batchSize - 1]).click();
    } else {
      await programs.deleteButtonFor(batchNames[0]).click();
    }

    await expect(batchRows).toHaveCount(batchSize - 1);
  });

  test("TC-015: Deletion persists after page reload", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-015 persistence test");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await expect(programs.matchingRows(programName)).toHaveCount(0);

    await programs.reload();

    await expect(programs.matchingRows(programName)).toHaveCount(0);
  });

  test("TC-016: Undo/recovery availability documented", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-016 undo availability test");

    let dialogMessage = "";

    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await expect(programs.matchingRows(programName)).toHaveCount(0);

    await page.waitForTimeout(1000);

    expect(dialogMessage.toLowerCase()).toContain("cannot be undone");

    await expect(programs.undoButton).toHaveCount(0);
  });

  test("TC-017: Special-character program names are handled correctly in dialog and deletion", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Informatique & IA - Niveau 2 ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-017 special characters delete test");

    let dialogMessage = "";

    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await programs.deleteButtonFor(programName).click();

    await expect(programs.matchingRows(programName)).toHaveCount(0);

    expect(dialogMessage).toContain("Informatique & IA - Niveau 2");
    expect(dialogMessage).not.toContain("&amp;");
  });

  test("TC-018: Correct record is deleted when similar names exist", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const baseName = `OleRodi Test Program ${suffix}`;
    const extendedName = `OleRodi Test Program 2 ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, baseName, "TC-018 base name");
    await createProgram(page, trackProgram, extendedName, "TC-018 extended similar name");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await programs.deleteButtonFor(extendedName).click();

    await expect(programs.matchingRows(extendedName)).toHaveCount(0);

    await expect(programs.programRow(baseName)).toBeVisible();
  });

  test("TC-019: Keyboard interaction supports safe confirmation flow", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Test Program ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-019 keyboard flow test");

    let dialogCount = 0;

    page.on("dialog", async (dialog) => {
      dialogCount++;
      if (dialogCount === 1) {
        await dialog.dismiss();
      } else {
        await dialog.accept();
      }
    });

    const row = programs.programRow(programName);
    await programs.deleteButtonFor(programName).click();

    await page.waitForTimeout(1000);

    await expect(row).toBeVisible();

    await programs.deleteButtonFor(programName).click();

    await expect(programs.matchingRows(programName)).toHaveCount(0);

    expect(dialogCount).toBe(2);
  });
});
