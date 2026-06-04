import { test, expect } from "../../fixtures/cleanup.fixture";
import { createProgram } from "../../support/playwright-program-helpers";
import { AUTH_FILE } from "../../support/auth.constant";
import {
  goToPrograms,
  openEditProgramModal,
  uniqueId,
} from "../../support/programs-test.helpers";
import { ProgramsPage } from "../../pages/programs.page";

const PROGRAM_NAME = "OleRodi Web Development 2026";

test.describe("Programs – Edit existing program details (DS-2)", () => {
  test("TC-001: Edit form opens with existing program data pre-populated", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const programDesc = "TC-001 baseline description";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const editModal = await openEditProgramModal(programs, programName);

    await expect(editModal.programNameInput).toHaveValue(programName);
    await expect(editModal.descriptionInput).toHaveValue(programDesc);
  });

  test("TC-002: Edit form pre-populates every visible field with current data", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const programDesc = "TC-002 full field baseline";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const editModal = await openEditProgramModal(programs, programName);

    await expect(editModal.programNameInput).toHaveValue(programName);
    await expect(editModal.programNameInput).not.toHaveValue("");
    await expect(editModal.descriptionInput).toHaveValue(programDesc);
    await expect(editModal.descriptionInput).not.toHaveValue("");

    const fieldCount = await editModal.textboxes.count();
    expect(fieldCount).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < fieldCount; i++) {
      const field = editModal.textboxes.nth(i);
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

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, firstName, "TC-003 first program");
    await createProgram(page, trackProgram, secondName, "TC-003 second program");

    await expect(programs.editButtonFor(firstName)).toBeVisible();
    await expect(programs.editButtonFor(secondName)).toBeVisible();

    const editModal = await openEditProgramModal(programs, secondName);

    await expect(editModal.programNameInput).toHaveValue(secondName);
    await expect(editModal.programNameInput).not.toHaveValue(firstName);
  });

  test("TC-004: Saving a valid updated Name closes modal and refreshes list immediately", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const updatedName = `${PROGRAM_NAME} ${suffix} - Updated`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, "TC-004 baseline");

    const editModal = await openEditProgramModal(programs, originalName);
    await editModal.clearAndFillName(updatedName);
    await editModal.submit();

    await expect(editModal.dialog).toBeHidden();
    await expect(programs.programRow(updatedName)).toBeVisible();
    await expect(
      programs.matchingRows(originalName).filter({ hasNotText: updatedName })
    ).toHaveCount(0);
  });

  test("TC-005: List update after save occurs within 2 seconds", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const timedName = `${PROGRAM_NAME} ${suffix} - Timed`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, "TC-005 baseline");

    const editModal = await openEditProgramModal(programs, originalName);
    await editModal.clearAndFillName(timedName);

    const start = Date.now();
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    await expect(programs.programRow(timedName)).toBeVisible({
      timeout: 2000,
    });
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test("TC-006: Updating only Description preserves all other field values", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-006 baseline description";
    const updatedDesc = "Updated description for evening and weekend learners";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, originalDesc);

    let editModal = await openEditProgramModal(programs, programName);

    await expect(editModal.programNameInput).toHaveValue(programName);
    await expect(editModal.descriptionInput).toHaveValue(originalDesc);

    await editModal.clearAndFillDescription(updatedDesc);
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    editModal = await openEditProgramModal(programs, programName);
    await expect(editModal.descriptionInput).toHaveValue(updatedDesc);
    await expect(editModal.programNameInput).toHaveValue(programName);
  });

  test("TC-007: Editing multiple fields simultaneously saves all changes correctly", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const updatedName = `${PROGRAM_NAME} ${suffix} - Multi`;
    const originalDesc = "TC-007 baseline";
    const updatedDesc = "Multi-field update test";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, originalDesc);

    const editModal = await openEditProgramModal(programs, originalName);
    await editModal.clearAndFillName(updatedName);
    await editModal.clearAndFillDescription(updatedDesc);
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    const reopened = await openEditProgramModal(programs, updatedName);
    await expect(reopened.programNameInput).toHaveValue(updatedName);
    await expect(reopened.descriptionInput).toHaveValue(updatedDesc);
  });

  test("TC-008: Description change persists through browser reload", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const persistedDesc = "Verified persistence of description field";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-008 baseline");

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.clearAndFillDescription(persistedDesc);
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    await programs.reload();

    const reopened = await openEditProgramModal(programs, programName);
    await expect(reopened.descriptionInput).toHaveValue(persistedDesc);
  });

  test("TC-009: All persisted updates remain correct after page reload", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `${PROGRAM_NAME} ${suffix}`;
    const updatedName = `${PROGRAM_NAME} ${suffix} - Updated`;
    const updatedDesc = "TC-009 persisted description";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, originalName, "TC-009 baseline");

    const editModal = await openEditProgramModal(programs, originalName);
    await editModal.clearAndFillName(updatedName);
    await editModal.clearAndFillDescription(updatedDesc);
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    await programs.reload();

    await expect(programs.programRow(updatedName)).toBeVisible();

    const reopened = await openEditProgramModal(programs, updatedName);
    await expect(reopened.programNameInput).toHaveValue(updatedName);
    await expect(reopened.descriptionInput).toHaveValue(updatedDesc);
  });

  test("TC-010: Save is blocked when Name is empty", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-010 baseline");

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.programNameInput.clear();
    await expect(editModal.programNameInput).toHaveValue("");

    await expect(editModal.saveButton).toBeDisabled();
    await expect(editModal.dialog).toBeVisible();

    await editModal.cancel();
    await expect(editModal.dialog).toBeHidden();
    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-011: Save is blocked when Name contains only whitespace", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-011 baseline");

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.programNameInput.clear();
    await editModal.programNameInput.fill("   ");

    await expect(editModal.saveButton).toBeDisabled();
    await expect(editModal.dialog).toBeVisible();

    await editModal.cancel();
    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-012: Duplicate program name is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const targetName = `${PROGRAM_NAME} ${suffix}`;
    const duplicateName = `OleRodi Data Science ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, duplicateName, "TC-012 duplicate target");
    await createProgram(page, trackProgram, targetName, "TC-012 target program");

    const editModal = await openEditProgramModal(programs, targetName);
    await editModal.clearAndFillName(duplicateName);
    await editModal.submit();

    await expect(editModal.dialog).toBeVisible();
    await expect(programs.programRow(targetName)).toBeVisible();
    await expect(programs.matchingRows(duplicateName)).toHaveCount(1);
  });

  test("TC-013: Backend failure does not close modal or corrupt list", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-013 baseline description";
    const attemptedDesc = "TC-013 attempted update during forced failure";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, originalDesc);

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.clearAndFillDescription(attemptedDesc);

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

    await editModal.submit();
    await expect(editModal.dialog).toBeVisible();
    await expect(editModal.descriptionInput).toHaveValue(attemptedDesc);

    await page.unroute(/\/programs\/?[^?]*/i);
    await editModal.cancel();

    const reopened = await openEditProgramModal(programs, programName);
    await expect(reopened.descriptionInput).toHaveValue(originalDesc);
  });

  test("TC-014: Cancel action discards all unsaved changes", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const originalDesc = "TC-014 baseline description";
    const draftName = `${PROGRAM_NAME} ${suffix} - Draft`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, originalDesc);

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.clearAndFillName(draftName);
    await editModal.clearAndFillDescription("Should not persist");
    await editModal.cancel();
    await expect(editModal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();
    await expect(programs.matchingRows(draftName)).toHaveCount(0);

    const reopened = await openEditProgramModal(programs, programName);
    await expect(reopened.programNameInput).toHaveValue(programName);
    await expect(reopened.descriptionInput).toHaveValue(originalDesc);
  });

  test("TC-015: Name accepts valid special characters and saves correctly", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const specialName = `OleRodi Web Development 2026: Front-End & API (Evening) ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-015 baseline");

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.clearAndFillName(specialName);
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    await expect(programs.programRow(specialName)).toBeVisible();
  });

  test("TC-016: Name at maximum allowed length is accepted", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const maxLengthName = `OleRodi ${"A".repeat(100)}${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-016 baseline");

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.clearAndFillName(maxLengthName);
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    await expect(programs.programRow(maxLengthName)).toBeVisible();
  });

  test("TC-017: Name exceeding maximum length is prevented or rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const overMaxName = `OleRodi ${"B".repeat(101)}${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-017 baseline");

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.clearAndFillName(overMaxName);

    const maxLengthAttr = await editModal.programNameInput.getAttribute("maxlength");

    if (maxLengthAttr) {
      const actualValue = await editModal.programNameInput.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(Number(maxLengthAttr));
    } else {
      await editModal.submit();
      const stillOnPage = await programs.programRow(programName).isVisible();
      const overMaxVisible = await programs.matchingRows(overMaxName).count();
      expect(stillOnPage || overMaxVisible === 0).toBeTruthy();
    }

    await editModal.cancel();
    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-018: Empty Description behavior is consistent", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "TC-018 baseline description");

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.descriptionInput.clear();

    if (await editModal.saveButton.isEnabled()) {
      await editModal.submit();
      await expect(editModal.dialog).toBeHidden();

      const reopened = await openEditProgramModal(programs, programName);
      await expect(reopened.descriptionInput).toHaveValue("");
    } else {
      await expect(editModal.saveButton).toBeDisabled();
      await editModal.cancel();
    }
  });

  test("TC-019: Unchanged Save does not alter any data", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const programDesc = "TC-019 unchanged baseline";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, programDesc);

    const editModal = await openEditProgramModal(programs, programName);
    await editModal.submit();
    await expect(editModal.dialog).toBeHidden();

    const reopened = await openEditProgramModal(programs, programName);
    await expect(reopened.programNameInput).toHaveValue(programName);
    await expect(reopened.descriptionInput).toHaveValue(programDesc);
    await expect(programs.matchingRows(programName)).toHaveCount(1);
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
    const programsA = new ProgramsPage(pageA);
    const programsB = new ProgramsPage(pageB);

    await pageA.goto("/");
    await pageB.goto("/");

    await programsA.nav.goToPrograms();
    await createProgram(pageA, trackProgram, programName, "TC-020 concurrent baseline");

    await programsB.nav.goToPrograms();
    await programsB.reload();

    const editModalA = await openEditProgramModal(programsA, programName);
    const editModalB = await openEditProgramModal(programsB, programName);

    await editModalA.clearAndFillName(sessionAName);
    await editModalA.submit();
    await expect(editModalA.dialog).toBeHidden();
    await expect(programsA.programRow(sessionAName)).toBeVisible();

    await editModalB.clearAndFillDescription(sessionBDesc);
    await editModalB.submit();

    const nameStillA = await programsB.matchingRows(sessionAName).count();
    const conflictHandled =
      (await editModalB.dialog.isVisible()) ||
      nameStillA > 0 ||
      (await programsB.matchingRows(programName).count()) === 0;

    expect(conflictHandled).toBeTruthy();

    await contextA.close();
    await contextB.close();
  });
});
