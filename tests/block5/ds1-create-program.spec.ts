import {
  test,
  expect,
  trackProgramFromCreateResponse,
} from "../../fixtures/cleanup.fixture";
import { clickCreateAndTrack, createProgram } from "../../support/playwright-program-helpers";
import {
  goToPrograms,
  openNewProgramModal,
  openEditProgramModal,
  uniqueId,
} from "../../support/programs-test.helpers";

const PROGRAM_NAME = "OleRodi Web Development 2026";
const PROGRAM_DESC = "Full-stack web development program";

test.describe("Programs – Create new academic program (DS-1)", () => {
  test("TC-001: Navigate to program creation form", async ({ page, trackProgram }) => {
    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);

    await expect(modal.programNameInput).toBeVisible();
    await expect(modal.descriptionInput).toBeVisible();
  });

  test("TC-002: Successfully create a program", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, modal);

    await expect(modal.dialog).toBeHidden();
    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-003: Created program persists after page reload", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, PROGRAM_DESC);

    await programs.reload();

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-004: Program can be created with only Program Name when Description is optional", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Data Science 2026 ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fillName(programName);
    await clickCreateAndTrack(page, trackProgram, modal);

    await expect(modal.dialog).toBeHidden();
    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-005: Modal closes within a reasonable time after successful Create", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, PROGRAM_DESC);

    const start = Date.now();
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden({ timeout: 2000 });
    expect(Date.now() - start).toBeLessThan(2000);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-006: Validation prevents empty program name", async ({ page, trackProgram }) => {
    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fillDescription(PROGRAM_DESC);

    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-007: Create is blocked when Program Name contains only whitespace", async ({ page, trackProgram }) => {
    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fill("   ", PROGRAM_DESC);

    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-008: Duplicate program name is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, PROGRAM_DESC);

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, "Duplicate name attempt");
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
    await expect(modal.duplicateNameError).toBeVisible();
    await expect(programs.matchingRows(programName)).toHaveCount(1);
  });

  test("TC-009: Duplicate name error does not clear entered Description", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const duplicateDesc = "Duplicate name attempt";

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, PROGRAM_DESC);

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, duplicateDesc);
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
    await expect(modal.descriptionInput).toHaveValue(duplicateDesc);
  });

  test("TC-010: Cancel discards unsaved program data", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, PROGRAM_DESC);
    await modal.cancel();

    await expect(modal.dialog).toBeHidden();
    await expect(programs.matchingRows(programName)).toHaveCount(0);
  });

  test("TC-011: Backend failure keeps modal open and preserves entered values", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);

    await page.route(/\/programs\/?[^?]*/i, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    const modal = await openNewProgramModal(programs);

    await modal.fill(programName, PROGRAM_DESC);
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toHaveValue(programName);
    await expect(modal.descriptionInput).toHaveValue(PROGRAM_DESC);
    await expect(programs.matchingRows(programName)).toHaveCount(0);

    await page.unroute(/\/programs\/?[^?]*/i);
    await modal.cancel();
  });

  test("TC-012: Program Name accepts valid special characters", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Web Development 2026: Front-End & API (Evening) ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, modal);

    await expect(modal.dialog).toBeHidden();
    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-013: Leading and trailing spaces in Program Name are trimmed on save", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const trimmedName = `${PROGRAM_NAME} ${suffix}`;
    const paddedName = `   ${trimmedName}   `;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fill(paddedName, PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, modal);

    await expect(modal.dialog).toBeHidden();
    await expect(programs.programRow(trimmedName)).toBeVisible();
    await expect(programs.matchingRows(paddedName)).toHaveCount(0);
  });

  test("TC-014: Rapid double-click on Create does not create duplicate programs", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, PROGRAM_DESC);
    await trackProgramFromCreateResponse(page, trackProgram, async () => {
      await modal.submitDoubleClick();
    });

    await expect(modal.dialog).toBeHidden();
    await expect(programs.matchingRows(programName)).toHaveCount(1);
  });

  test("TC-015: Program list row matches the created program name exactly", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const partialName = `OleRodi Web Development ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, partialName, "TC-015 partial-name decoy");

    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    const createdRow = programs.programRow(programName);
    await expect(createdRow).toBeVisible();
    await expect(programs.programNameText(programName)).toBeVisible();
    await expect(programs.matchingRows(programName)).toHaveCount(1);
    await expect(programs.programRow(partialName)).toBeVisible();
  });

  test("TC-016: Program Name at maximum allowed length is accepted", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const base = `${PROGRAM_NAME} ${suffix} `;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    const maxLengthAttr = await modal.programNameInput.getAttribute("maxlength");
    const maxLength = maxLengthAttr ? Number(maxLengthAttr) : 255;
    const atMaxName = base + "A".repeat(Math.max(0, maxLength - base.length));

    await modal.fillName(atMaxName);
    await modal.fillDescription(PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(atMaxName.substring(0, 40))).toBeVisible();

    const editModal = await openEditProgramModal(programs, atMaxName);
    await expect(editModal.programNameInput).toHaveValue(atMaxName);
    await editModal.cancel();
  });

  test("TC-017: Program Name exceeding maximum allowed length is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const base = `${PROGRAM_NAME} ${suffix} `;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    const maxLengthAttr = await modal.programNameInput.getAttribute("maxlength");
    const maxLength = maxLengthAttr ? Number(maxLengthAttr) : 255;
    const overMaxName = base + "B".repeat(Math.max(1, maxLength - base.length + 1));

    await modal.fillName(overMaxName);
    await modal.fillDescription(PROGRAM_DESC);

    if (maxLengthAttr) {
      const actualValue = await modal.programNameInput.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(Number(maxLengthAttr));
    } else {
      await modal.submit();
      await expect(modal.dialog).toBeVisible();
      await expect(modal.maxLengthError).toBeVisible();
      await expect(programs.matchingRows(overMaxName)).toHaveCount(0);
    }

    if (await modal.dialog.isVisible()) {
      await modal.cancel();
    }
  });

  test("TC-018: Empty Description is allowed when Description is optional", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fillName(programName);

    if (!(await modal.createButton.isEnabled())) {
      test.skip(true, "Description is required in this environment");
    }

    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();
    await expect(programs.programRow(programName)).toBeVisible();
  });

  test("TC-019: Empty Description is blocked when Description is required", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    const programs = await goToPrograms(page);

    const modal = await openNewProgramModal(programs);
    await modal.fillName(programName);

    if (await modal.createButton.isDisabled()) {
      await expect(modal.createButton).toBeDisabled();
      await expect(modal.dialog).toBeVisible();
      await modal.cancel();
    } else {
      await clickCreateAndTrack(page, trackProgram, modal);
      await expect(programs.programRow(programName)).toBeVisible();
    }
  });
});
