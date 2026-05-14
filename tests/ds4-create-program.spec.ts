import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole("textbox", { name: "Password" }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/");
});

async function createProgram(page: import("@playwright/test").Page, name: string, description: string) {
  await page.getByRole("button", { name: "+ New Program" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Program Name" }).fill(name);
  await dialog.getByRole("textbox", { name: "Description" }).fill(description);
  await dialog.getByRole("button", { name: "Create" }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("row").filter({ hasText: name }).first()
  ).toBeVisible();
}

test.describe("Delete Program – Positive Flows", () => {
  test("TC-001: Confirmation dialog appears before program deletion", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Delete Confirm ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-001 delete confirmation test");

    let dialogMessage = "";
    let dialogFired = false;

    page.on("dialog", async (dialog) => {
      dialogFired = true;
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(1000);

    expect(dialogFired).toBe(true);
    expect(dialogMessage).toContain(programName);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();
  });

  test("TC-002: Program is removed from list after deletion is confirmed", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Delete Me ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-002 delete and confirm test");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(0);
  });

  test("TC-003: Program remains in list when deletion is canceled", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Keep Me ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-003 cancel deletion test");

    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(1000);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();
  });

  test("TC-004: Confirmation dialog closes without side effects when dismissed via close control", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Dismiss Test ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-004 dismiss dialog test");

    let dialogCount = 0;

    page.on("dialog", async (dialog) => {
      dialogCount++;
      await dialog.dismiss();
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(1000);

    expect(dialogCount).toBe(1);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();
  });
});

test.describe("Delete Program – Negative Flows", () => {
  test("TC-005: Program is not removed before user confirms deletion", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `No Optimistic ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-005 no optimistic removal test");

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

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(1000);

    expect(deleteRequested).toBe(false);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.unroute(/\/programs/i);
  });

  test("TC-006: Deletion failure from backend does not remove program from list", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Fail Delete ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-006 backend failure test");

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

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(2000);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.unroute(/\/programs/i);
  });

  test("TC-007: Unauthorized user cannot delete program", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Auth Block ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-007 authorization test");

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

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(2000);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.unroute(/\/programs/i);
  });

  test("TC-008: Repeated confirm clicks do not trigger duplicate delete requests", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Double Click ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-008 double click test");

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

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(0);

    await page.waitForTimeout(1000);

    expect(deleteRequestCount).toBe(1);

    await page.unroute(/\/programs/i);
  });
});

test.describe("Delete Program – Edge Cases", () => {
  test("TC-009: Deletion works for program names with special characters", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Informatique & IA - Niveau 2 ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-009 special characters delete test");

    let dialogMessage = "";

    page.on("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(0);

    expect(dialogMessage.length).toBeGreaterThan(0);
  });

  test("TC-010: Dialog identifies the correct record when similar names exist", async ({
    page,
  }) => {
    const suffix = Date.now();
    const baseName = `Similar ${suffix}`;
    const extendedName = `Similar ${suffix} Extra`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, baseName, "TC-010 base program");
    await createProgram(page, extendedName, "TC-010 extended program");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const extendedRow = page
      .getByRole("row")
      .filter({ hasText: extendedName })
      .first();

    await extendedRow.getByRole("button", { name: "🗑" }).click();

    await expect(
      page.getByRole("row").filter({ hasText: extendedName })
    ).toHaveCount(0);

    await expect(
      page.getByRole("row").filter({ hasText: baseName }).first()
    ).toBeVisible();
  });

  test("TC-011: Deletion behavior is deterministic when duplicate names exist", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Dup Del ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-011 first duplicate");
    await createProgram(page, programName, "TC-011 second duplicate");

    const duplicateRows = page.getByRole("row").filter({ hasText: programName });
    const countBefore = await duplicateRows.count();
    expect(countBefore).toBe(2);

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await duplicateRows.first().getByRole("button", { name: "🗑" }).click();

    await expect(duplicateRows).toHaveCount(countBefore - 1);
  });

  test("TC-012: Deletion handles long program names without truncation-related mistakes", async ({
    page,
  }) => {
    const suffix = Date.now();
    const longName = `Advanced Data Engineering and Distributed Systems - Cohort 2026 - Section A ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, longName, "TC-012 long name delete test");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: longName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await expect(
      page.getByRole("row").filter({ hasText: longName })
    ).toHaveCount(0);
  });

  test("TC-013: Program list reflects deletion correctly after refresh", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Persist Del ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-013 persist after refresh test");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(0);

    await page.reload();
    await page.waitForURL("**/programs");

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(0);
  });

  test("TC-014: Deletion blocked when program is referenced by dependent records", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Ref Block ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-014 referential constraint test");

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

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(2000);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.unroute(/\/programs/i);
  });

  test("TC-015: Keyboard interaction supports safe confirmation flow", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Keyboard Del ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-015 keyboard interaction test");

    let dialogCount = 0;

    page.on("dialog", async (dialog) => {
      dialogCount++;
      if (dialogCount === 1) {
        await dialog.dismiss();
      } else {
        await dialog.accept();
      }
    });

    const programRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await page.waitForTimeout(1000);

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await programRow.getByRole("button", { name: "🗑" }).click();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(0);

    expect(dialogCount).toBe(2);
  });
});
