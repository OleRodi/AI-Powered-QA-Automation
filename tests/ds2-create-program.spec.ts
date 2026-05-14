import { test, expect } from "@playwright/test";

const PROGRAM_NAME = "Web Development 2026";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole("textbox", { name: "Password" }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/");
});

test.describe("Programs – Edit form", () => {
  test("TC-001: Edit form opens with existing program data pre-populated", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    const programRow = page
      .getByRole("row")
      .filter({ hasText: PROGRAM_NAME })
      .first();
    await expect(programRow).toBeVisible();

    await programRow.getByRole("button", { name: "✏️" }).click();

    const dialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(dialog).toBeVisible();

    const nameField = dialog.getByRole("textbox", { name: "Program Name" });
    await expect(nameField).toBeVisible();
    await expect(nameField).toHaveValue(new RegExp(`^${PROGRAM_NAME}`));

    const descField = dialog.getByRole("textbox", { name: "Description" });
    await expect(descField).toBeVisible();
    await expect(descField).not.toHaveValue("");
  });

  test("TC-002: Saving a valid updated Name closes modal and refreshes list immediately", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-002 setup program";
    const updatedName = `${PROGRAM_NAME} ${suffix} - Updated`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(originalDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const programRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(programRow).toBeVisible();

    await programRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(updatedName);
    await editDialog.getByRole("button", { name: "Save" }).click();

    await expect(editDialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: updatedName })
    ).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).filter({ hasNotText: updatedName })
    ).toHaveCount(0);
  });

  test("TC-003: Updating only Description preserves all other field values", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-003 baseline description";
    const updatedDesc = "Updated description for evening and weekend learners";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(originalDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const programRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(programRow).toBeVisible();
    await programRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    const descField = editDialog.getByRole("textbox", { name: "Description" });

    await expect(nameField).toHaveValue(originalName);
    await expect(descField).toHaveValue(originalDesc);

    await descField.clear();
    await descField.fill(updatedDesc);

    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    const updatedRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(updatedRow).toBeVisible();
    await updatedRow.getByRole("button", { name: "✏️" }).click();

    const reopenedDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(reopenedDialog).toBeVisible();

    await expect(
      reopenedDialog.getByRole("textbox", { name: "Description" })
    ).toHaveValue(updatedDesc);
    await expect(
      reopenedDialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue(originalName);
  });

  test("TC-004: Persisted updates remain correct after page reload", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-004 baseline description";
    const updatedName = `${PROGRAM_NAME} ${suffix} - Updated`;
    const updatedDesc = "TC-004 persisted description";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(originalDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const programRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(programRow).toBeVisible();
    await programRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    const descField = editDialog.getByRole("textbox", { name: "Description" });
    await nameField.clear();
    await nameField.fill(updatedName);
    await descField.clear();
    await descField.fill(updatedDesc);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: updatedName })
    ).toBeVisible();

    await page.reload();
    await page.waitForURL("**/programs");

    const reloadedRow = page
      .getByRole("row")
      .filter({ hasText: updatedName })
      .first();
    await expect(reloadedRow).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).filter({ hasNotText: updatedName })
    ).toHaveCount(0);

    await reloadedRow.getByRole("button", { name: "✏️" }).click();

    const reopenedDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(reopenedDialog).toBeVisible();

    await expect(
      reopenedDialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue(updatedName);
    await expect(
      reopenedDialog.getByRole("textbox", { name: "Description" })
    ).toHaveValue(updatedDesc);
  });

  test("TC-005: Save is blocked when Name is empty", async ({ page }) => {
    const suffix = Date.now();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-005 baseline description";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(originalDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const programRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(programRow).toBeVisible();
    await programRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await expect(nameField).toHaveValue("");

    const saveButton = editDialog.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeDisabled();

    await expect(editDialog).toBeVisible();

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(editDialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).first()
    ).toBeVisible();
  });

  test("TC-006: Save is blocked when Name contains only whitespace", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-006 baseline description";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(originalDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const programRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(programRow).toBeVisible();
    await programRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill("   ");

    const saveButton = editDialog.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeDisabled();

    await expect(editDialog).toBeVisible();

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(editDialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).first()
    ).toBeVisible();
  });

  test("TC-007: Duplicate program Name is rejected and existing entry is not overwritten", async ({
    page,
  }) => {
    const suffix = Date.now();
    const targetName = `${PROGRAM_NAME} ${suffix}`;
    const targetDesc = "TC-007 target program";
    const duplicateName = `Data Science ${suffix}`;
    const duplicateDesc = "TC-007 existing duplicate target";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(duplicateName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(duplicateDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    await page.getByRole("button", { name: "+ New Program" }).click();
    createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(targetName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(targetDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const targetRow = page
      .getByRole("row")
      .filter({ hasText: targetName })
      .first();
    await expect(targetRow).toBeVisible();
    await targetRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(duplicateName);

    await editDialog.getByRole("button", { name: "Save" }).click();

    await expect(editDialog).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: targetName }).first()
    ).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: duplicateName })
    ).toHaveCount(1);
  });

  test("TC-008: Failed save does not close modal or partially update list", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-008 baseline description";

    const attemptedDesc = "TC-008 attempted update during forced failure";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(originalDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const programRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(programRow).toBeVisible();
    await programRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const descField = editDialog.getByRole("textbox", { name: "Description" });
    await descField.clear();
    await descField.fill(attemptedDesc);

    await page.route(/\/programs\/?[^?]*/i, async (route) => {
      const method = route.request().method();
      if (method === "PUT" || method === "PATCH" || method === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    await editDialog.getByRole("button", { name: "Save" }).click();

    await expect(editDialog).toBeVisible();
    await expect(descField).toHaveValue(attemptedDesc);

    await page.unroute(/\/programs\/?[^?]*/i);

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(editDialog).toBeHidden();

    await programRow.getByRole("button", { name: "✏️" }).click();
    const reopenedDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(reopenedDialog).toBeVisible();
    await expect(
      reopenedDialog.getByRole("textbox", { name: "Description" })
    ).toHaveValue(originalDesc);
  });

  test("TC-009: Cancel action does not persist unsaved edits", async ({
    page,
  }) => {
    const suffix = Date.now();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-009 baseline description";
    const draftName = `${PROGRAM_NAME} ${suffix} - Draft`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(originalDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();
    await expect(createDialog).toBeHidden();

    const programRow = page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first();
    await expect(programRow).toBeVisible();
    await programRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(draftName);

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(editDialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("row").filter({ hasText: draftName })
    ).toHaveCount(0);

    await page
      .getByRole("row")
      .filter({ hasText: originalName })
      .first()
      .getByRole("button", { name: "✏️" })
      .click();

    const reopenedDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(reopenedDialog).toBeVisible();
    await expect(
      reopenedDialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue(originalName);
  });
});
