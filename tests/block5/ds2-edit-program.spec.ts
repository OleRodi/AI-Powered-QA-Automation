import { test, expect, type Page } from "../../fixtures/cleanup.fixture";
import { createProgram } from "../../support/playwright-program-helpers";
import { AUTH_FILE } from "../../support/auth.constant";

const PROGRAM_NAME = "OleRodi Web Development 2026";

async function goToPrograms(page: Page) {
  await page.getByRole("button", { name: "Programs" }).click();
  await page.waitForURL("**/programs");
}

async function openEditDialog(page: Page, programName: string) {
  const programRow = page.getByRole("row").filter({ hasText: programName }).first();
  await expect(programRow).toBeVisible();
  await programRow.getByRole("button", { name: "✏️" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Program" });
  await expect(editDialog).toBeVisible();
  return editDialog;
}

function uniqueId() {
  return Date.now().toString();
}

test.describe("Programs – Edit existing program details (DS-2)", () => {
  test("TC-001: Edit form opens with existing program data pre-populated", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const programDesc = "TC-001 baseline description";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const editDialog = await openEditDialog(page, programName);

    await expect(editDialog.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      programName
    );
    await expect(editDialog.getByRole("textbox", { name: "Description" })).toHaveValue(
      programDesc
    );
  });

  test("TC-002: Edit form pre-populates every visible field with current data", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const programDesc = "TC-002 full field baseline";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const editDialog = await openEditDialog(page, programName);

    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    const descField = editDialog.getByRole("textbox", { name: "Description" });

    await expect(nameField).toHaveValue(programName);
    await expect(nameField).not.toHaveValue("");
    await expect(descField).toHaveValue(programDesc);
    await expect(descField).not.toHaveValue("");

    const labeledFields = editDialog.getByRole("textbox");
    const fieldCount = await labeledFields.count();
    expect(fieldCount).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < fieldCount; i++) {
      const field = labeledFields.nth(i);
      const placeholder = await field.getAttribute("placeholder");
      if (placeholder?.includes("e.g.")) {
        continue;
      }
      const value = await field.inputValue();
      const ariaLabel = await field.getAttribute("aria-label");
      if (ariaLabel === "Program Name" || ariaLabel === "Description") {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("TC-003: Edit icon is visible per row and opens the correct program", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const firstName = `${PROGRAM_NAME} A ${suffix}`;
    const secondName = `${PROGRAM_NAME} B ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, firstName, "TC-003 first program");
    await createProgram(page, trackProgram, secondName, "TC-003 second program");

    const rows = page.getByRole("row").filter({ has: page.getByRole("button", { name: "✏️" }) });
    await expect(rows.first().getByRole("button", { name: "✏️" })).toBeVisible();
    await expect(rows.nth(1).getByRole("button", { name: "✏️" })).toBeVisible();

    const secondRow = page.getByRole("row").filter({ hasText: secondName }).first();
    await secondRow.getByRole("button", { name: "✏️" }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();
    await expect(editDialog.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      secondName
    );
    await expect(editDialog.getByRole("textbox", { name: "Program Name" })).not.toHaveValue(
      firstName
    );
  });

  test("TC-004: Saving a valid updated Name closes modal and refreshes list immediately", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const updatedName = `${PROGRAM_NAME} ${suffix} - Updated`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, "TC-004 baseline");

    const editDialog = await openEditDialog(page, originalName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(updatedName);
    await editDialog.getByRole("button", { name: "Save" }).click();

    await expect(editDialog).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: updatedName })).toBeVisible();
    await expect(
      page.getByRole("row").filter({ hasText: originalName }).filter({ hasNotText: updatedName })
    ).toHaveCount(0);
  });

  test("TC-005: List update after save occurs within 2 seconds", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const timedName = `${PROGRAM_NAME} ${suffix} - Timed`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, "TC-005 baseline");

    const editDialog = await openEditDialog(page, originalName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(timedName);

    const start = Date.now();
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    await expect(page.getByRole("row").filter({ hasText: timedName })).toBeVisible({
      timeout: 2000,
    });
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test("TC-006: Updating only Description preserves all other field values", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-006 baseline description";
    const updatedDesc = "Updated description for evening and weekend learners";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, originalDesc);

    let editDialog = await openEditDialog(page, programName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    const descField = editDialog.getByRole("textbox", { name: "Description" });

    await expect(nameField).toHaveValue(programName);
    await expect(descField).toHaveValue(originalDesc);

    await descField.clear();
    await descField.fill(updatedDesc);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    editDialog = await openEditDialog(page, programName);
    await expect(editDialog.getByRole("textbox", { name: "Description" })).toHaveValue(
      updatedDesc
    );
    await expect(editDialog.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      programName
    );
  });

  test("TC-007: Editing multiple fields simultaneously saves all changes correctly", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const updatedName = `${PROGRAM_NAME} ${suffix} - Multi`;
    const originalDesc = "TC-007 baseline";
    const updatedDesc = "Multi-field update test";

    await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, originalDesc);

    const editDialog = await openEditDialog(page, originalName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    const descField = editDialog.getByRole("textbox", { name: "Description" });

    await nameField.clear();
    await nameField.fill(updatedName);
    await descField.clear();
    await descField.fill(updatedDesc);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    const reopened = await openEditDialog(page, updatedName);
    await expect(reopened.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      updatedName
    );
    await expect(reopened.getByRole("textbox", { name: "Description" })).toHaveValue(updatedDesc);
  });

  test("TC-008: Description change persists through browser reload", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const persistedDesc = "Verified persistence of description field";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-008 baseline");

    const editDialog = await openEditDialog(page, programName);
    const descField = editDialog.getByRole("textbox", { name: "Description" });
    await descField.clear();
    await descField.fill(persistedDesc);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    await page.reload();
    await page.waitForURL("**/programs");

    const reopened = await openEditDialog(page, programName);
    await expect(reopened.getByRole("textbox", { name: "Description" })).toHaveValue(
      persistedDesc
    );
  });

  test("TC-009: All persisted updates remain correct after page reload", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const updatedName = `${PROGRAM_NAME} ${suffix} - Updated`;
    const updatedDesc = "TC-009 persisted description";

    await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, "TC-009 baseline");

    const editDialog = await openEditDialog(page, originalName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    const descField = editDialog.getByRole("textbox", { name: "Description" });
    await nameField.clear();
    await nameField.fill(updatedName);
    await descField.clear();
    await descField.fill(updatedDesc);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    await page.reload();
    await page.waitForURL("**/programs");

    await expect(page.getByRole("row").filter({ hasText: updatedName })).toBeVisible();

    const reopened = await openEditDialog(page, updatedName);
    await expect(reopened.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      updatedName
    );
    await expect(reopened.getByRole("textbox", { name: "Description" })).toHaveValue(updatedDesc);
  });

  test("TC-010: Save is blocked when Name is empty", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-010 baseline");

    const editDialog = await openEditDialog(page, programName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await expect(nameField).toHaveValue("");

    const saveButton = editDialog.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeDisabled();
    await expect(editDialog).toBeVisible();

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(editDialog).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: programName }).first()).toBeVisible();
  });

  test("TC-011: Save is blocked when Name contains only whitespace", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-011 baseline");

    const editDialog = await openEditDialog(page, programName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill("   ");

    const saveButton = editDialog.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeDisabled();
    await expect(editDialog).toBeVisible();

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("row").filter({ hasText: programName }).first()).toBeVisible();
  });

  test("TC-012: Duplicate program name is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const targetName = `${PROGRAM_NAME} ${suffix}`;
    const duplicateName = `OleRodi Data Science ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, duplicateName, "TC-012 duplicate target");
    await createProgram(page, trackProgram, targetName, "TC-012 target program");

    const editDialog = await openEditDialog(page, targetName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(duplicateName);
    await editDialog.getByRole("button", { name: "Save" }).click();

    await expect(editDialog).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: targetName }).first()).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: duplicateName })).toHaveCount(1);
  });

  test("TC-013: Backend failure does not close modal or corrupt list", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-013 baseline description";
    const attemptedDesc = "TC-013 attempted update during forced failure";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, originalDesc);

    const editDialog = await openEditDialog(page, programName);
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

    const reopened = await openEditDialog(page, programName);
    await expect(reopened.getByRole("textbox", { name: "Description" })).toHaveValue(
      originalDesc
    );
  });

  test("TC-014: Cancel action discards all unsaved changes", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-014 baseline description";
    const draftName = `${PROGRAM_NAME} ${suffix} - Draft`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, originalDesc);

    const editDialog = await openEditDialog(page, programName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    const descField = editDialog.getByRole("textbox", { name: "Description" });

    await nameField.clear();
    await nameField.fill(draftName);
    await descField.clear();
    await descField.fill("Should not persist");

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(editDialog).toBeHidden();

    await expect(page.getByRole("row").filter({ hasText: programName }).first()).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: draftName })).toHaveCount(0);

    const reopened = await openEditDialog(page, programName);
    await expect(reopened.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      programName
    );
    await expect(reopened.getByRole("textbox", { name: "Description" })).toHaveValue(
      originalDesc
    );
  });

  test("TC-015: Name accepts valid special characters and saves correctly", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const specialName = `OleRodi Web Development 2026: Front-End & API (Evening) ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-015 baseline");

    const editDialog = await openEditDialog(page, programName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(specialName);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    await expect(page.getByRole("row").filter({ hasText: specialName })).toBeVisible();
  });

  test("TC-016: Name at maximum allowed length is accepted", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const maxLengthName = `OleRodi ${"A".repeat(100)}${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-016 baseline");

    const editDialog = await openEditDialog(page, programName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(maxLengthName);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    await expect(page.getByRole("row").filter({ hasText: maxLengthName })).toBeVisible();
  });

  test("TC-017: Name exceeding maximum length is prevented or rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const overMaxName = `OleRodi ${"B".repeat(101)}${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-017 baseline");

    const editDialog = await openEditDialog(page, programName);
    const nameField = editDialog.getByRole("textbox", { name: "Program Name" });
    await nameField.clear();
    await nameField.fill(overMaxName);

    const saveButton = editDialog.getByRole("button", { name: "Save" });
    const maxLengthAttr = await nameField.getAttribute("maxlength");

    if (maxLengthAttr) {
      const actualValue = await nameField.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(Number(maxLengthAttr));
    } else {
      await saveButton.click();
      const stillOnPage = await page
        .getByRole("row")
        .filter({ hasText: programName })
        .first()
        .isVisible();
      const overMaxVisible = await page
        .getByRole("row")
        .filter({ hasText: overMaxName })
        .count();
      expect(stillOnPage || overMaxVisible === 0).toBeTruthy();
    }

    await editDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("row").filter({ hasText: programName }).first()).toBeVisible();
  });

  test("TC-018: Empty Description behavior is consistent", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-018 baseline description");

    const editDialog = await openEditDialog(page, programName);
    const descField = editDialog.getByRole("textbox", { name: "Description" });
    await descField.clear();

    const saveButton = editDialog.getByRole("button", { name: "Save" });
    if (await saveButton.isEnabled()) {
      await saveButton.click();
      await expect(editDialog).toBeHidden();

      const reopened = await openEditDialog(page, programName);
      await expect(reopened.getByRole("textbox", { name: "Description" })).toHaveValue("");
    } else {
      await expect(saveButton).toBeDisabled();
      await editDialog.getByRole("button", { name: "Cancel" }).click();
    }
  });

  test("TC-019: Unchanged Save does not alter any data", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const programDesc = "TC-019 unchanged baseline";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const editDialog = await openEditDialog(page, programName);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await expect(editDialog).toBeHidden();

    const reopened = await openEditDialog(page, programName);
    await expect(reopened.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      programName
    );
    await expect(reopened.getByRole("textbox", { name: "Description" })).toHaveValue(
      programDesc
    );
    await expect(page.getByRole("row").filter({ hasText: programName })).toHaveCount(1);
  });

  test("TC-020: Concurrent edit conflict is handled safely", async ({ browser, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const sessionAName = `OleRodi Concurrent A ${suffix}`;
    const sessionBDesc = `Concurrent B ${suffix}`;

    const contextA = await browser.newContext({
      baseURL: process.env.DIDAXIS_URL,
      storageState: AUTH_FILE,
    });
    const contextB = await browser.newContext({
      baseURL: process.env.DIDAXIS_URL,
      storageState: AUTH_FILE,
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.goto("/");
    await pageB.goto("/");

    await goToPrograms(pageA);
    await createProgram(pageA, trackProgram, programName, "TC-020 concurrent baseline");

    await goToPrograms(pageB);
    await pageB.reload();
    await pageB.waitForURL("**/programs");

    const dialogA = await openEditDialog(pageA, programName);
    const dialogB = await openEditDialog(pageB, programName);

    const nameFieldA = dialogA.getByRole("textbox", { name: "Program Name" });
    await nameFieldA.clear();
    await nameFieldA.fill(sessionAName);
    await dialogA.getByRole("button", { name: "Save" }).click();
    await expect(dialogA).toBeHidden();
    await expect(pageA.getByRole("row").filter({ hasText: sessionAName })).toBeVisible();

    const descFieldB = dialogB.getByRole("textbox", { name: "Description" });
    await descFieldB.clear();
    await descFieldB.fill(sessionBDesc);
    await dialogB.getByRole("button", { name: "Save" }).click();

    const nameStillA = await pageB.getByRole("row").filter({ hasText: sessionAName }).count();
    const conflictHandled =
      (await dialogB.isVisible()) ||
      nameStillA > 0 ||
      (await pageB.getByRole("row").filter({ hasText: programName }).count()) === 0;

    expect(conflictHandled).toBeTruthy();

    await contextA.close();
    await contextB.close();
  });
});
