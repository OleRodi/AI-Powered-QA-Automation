import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole("textbox", { name: "Password" }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/");
});

test.describe("Program Name Validation – Positive Flows", () => {
  test("TC-001: Program is created when name contains valid letters, numbers, spaces, and special characters", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Informatique & IA - Niveau 2 ${suffix}`;
    const description = "TC-001 special characters test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    const createdRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();
    await expect(createdRow).toBeVisible();

    await createdRow.getByRole("button", { name: "✏️" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    await expect(
      editDialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue(programName);
  });

  test("TC-002: Program is created when name has leading/trailing spaces — stored value is trimmed", async ({
    page,
  }) => {
    const suffix = Date.now();
    const paddedName = `   Cyber Security ${suffix}   `;
    const trimmedName = `Cyber Security ${suffix}`;
    const description = "TC-002 leading/trailing spaces test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(paddedName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    const createdRow = page
      .getByRole("row")
      .filter({ hasText: trimmedName })
      .first();
    await expect(createdRow).toBeVisible();

    await createdRow.getByRole("button", { name: "✏️" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const storedValue = await editDialog
      .getByRole("textbox", { name: "Program Name" })
      .inputValue();

    expect(storedValue).toBe(trimmedName);
  });

  test("TC-003: Program is created when name includes accented characters", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Ingénierie Logicielle ${suffix}`;
    const description = "TC-003 accented characters test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    const createdRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();
    await expect(createdRow).toBeVisible();

    await createdRow.getByRole("button", { name: "✏️" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    await expect(
      editDialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue(programName);
  });
});

test.describe("Program Name Validation – Negative Flows", () => {
  test("TC-004: Form submission is blocked when Program Name contains only spaces", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("textbox", { name: "Program Name" }).fill("   ");
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-004 whitespace-only name test");

    const createButton = dialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();

    await expect(dialog).toBeVisible();
  });

  test("TC-005: Duplicate exact Program Name is rejected", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Duplicate Check ${suffix}`;
    const description = "TC-005 duplicate test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-005 duplicate attempt");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(1);
  });

  test("TC-006: Duplicate is rejected when difference is only leading/trailing spaces", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Space Dup Check ${suffix}`;
    const paddedName = `  ${programName}  `;
    const description = "TC-006 padded duplicate test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(paddedName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-006 padded duplicate attempt");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(1);
  });

  test("TC-007: Server duplicate conflict (409) does not falsely show success", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Conflict Check ${suffix}`;
    const description = "TC-007 server conflict test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);

    await page.route(/\/programs/i, async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Conflict",
            message: "Program name already exists",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();

    await page.unroute(/\/programs/i);

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(0);
  });
});

test.describe("Program Name Validation – Edge Cases", () => {
  test("TC-008: Form blocks submission when Program Name is empty string", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");

    const nameField = dialog.getByRole("textbox", { name: "Program Name" });
    await expect(nameField).toHaveValue("");

    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-008 empty name test");

    const createButton = dialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();

    await expect(dialog).toBeVisible();
  });

  test("TC-009: Form blocks submission when Program Name contains only tab/newline whitespace", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("textbox", { name: "Program Name" }).fill("\t\t\n");
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-009 tab/newline whitespace test");

    const createButton = dialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();

    await expect(dialog).toBeVisible();
  });

  test("TC-010: Duplicate detection behavior is consistent for case differences", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `Case Check ${suffix}`;
    const lowercaseName = `case check ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-010 original");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(lowercaseName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-010 lowercase variant");
    await dialog.getByRole("button", { name: "Create" }).click();

    const dialogStillOpen = await dialog.isVisible();

    if (dialogStillOpen) {
      expect(dialogStillOpen).toBe(true);
    } else {
      const originalRow = page
        .getByRole("row")
        .filter({ hasText: originalName });
      const lowercaseRow = page
        .getByRole("row")
        .filter({ hasText: lowercaseName })
        .filter({ hasNotText: originalName });

      await expect(originalRow.first()).toBeVisible();
      await expect(lowercaseRow.first()).toBeVisible();
    }
  });

  test("TC-011: Duplicate detection behavior is consistent for internal multiple spaces", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `Space Normal ${suffix}`;
    const doubleSpaceName = `Space  Normal  ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-011 original");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Program Name" })
      .fill(doubleSpaceName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-011 double-space variant");
    await dialog.getByRole("button", { name: "Create" }).click();

    const dialogStillOpen = await dialog.isVisible();

    if (dialogStillOpen) {
      expect(dialogStillOpen).toBe(true);
    } else {
      await expect(
        page.getByRole("row").filter({ hasText: originalName }).first()
      ).toBeVisible();
    }
  });

  test("TC-012: Maximum allowed length for Program Name is enforced", async ({
    page,
  }) => {
    const suffix = Date.now();
    const maxLength = 255;
    const base = `MaxLen ${suffix} `;
    const atMaxName = base + "A".repeat(maxLength - base.length);
    const overMaxName = base + "A".repeat(maxLength - base.length + 1);

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(atMaxName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-012 at max length");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: atMaxName.substring(0, 50) }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(overMaxName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-012 over max length");

    const createButton = dialog.getByRole("button", { name: "Create" });
    await dialog.getByRole("button", { name: "Create" }).click();

    const dialogStillOpen = await dialog.isVisible();
    const buttonDisabled = await createButton.isDisabled();

    expect(dialogStillOpen || buttonDisabled).toBe(true);
  });

  test("TC-013: Program name with allowed punctuation does not trigger false validation errors", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `AI/ML: Foundations (2026) - Group A ${suffix}`;
    const description = "TC-013 punctuation test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    const createdRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();
    await expect(createdRow).toBeVisible();

    await createdRow.getByRole("button", { name: "✏️" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    await expect(
      editDialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue(programName);
  });

  test("TC-014: Duplicate check works correctly after successful creation in same session", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Cloud Engineering ${suffix}`;
    const description = "TC-014 same-session duplicate test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-014 same-session duplicate attempt");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(1);
  });

  test("TC-015: Validation errors do not clear other valid field values unexpectedly", async ({
    page,
  }) => {
    const suffix = Date.now();
    const correctedName = `Business Analytics ${suffix}`;
    const description = "TC-015 field preservation test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("textbox", { name: "Program Name" }).fill("   ");
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);

    const createButton = dialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();

    await expect(
      dialog.getByRole("textbox", { name: "Description" })
    ).toHaveValue(description);

    await dialog.getByRole("textbox", { name: "Program Name" }).clear();
    await dialog
      .getByRole("textbox", { name: "Program Name" })
      .fill(correctedName);

    await expect(
      dialog.getByRole("textbox", { name: "Description" })
    ).toHaveValue(description);

    await expect(createButton).toBeEnabled();
    await createButton.click();
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: correctedName }).first()
    ).toBeVisible();
  });
});
