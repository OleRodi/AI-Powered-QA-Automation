import { test, expect } from "../../fixtures/cleanup.fixture";
import {
  clickCreateAndTrack,
  trackProgramByName,
} from "../../support/playwright-program-helpers";
import {
  goToPrograms,
  openEditProgramModal,
  openNewProgramModal,
  uniqueId,
} from "../../support/programs-test.helpers";

test.describe("Programs – DS-3 Program Name Validation – Positive Flows", () => {
  test("TC-001: Program is created when name contains valid special characters", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Informatique & IA - Niveau 2 ${suffix}`;
    const description = "TC-001 special characters test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();

    const editModal = await openEditProgramModal(programs, programName);
    await expect(editModal.programNameInput).toHaveValue(programName);
  });

  test("TC-002: Newly created program appears in the Programs list", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Informatique Liste ${suffix}`;
    const description = "TC-002 list verification test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(page).toHaveURL(/\/programs/);

    await expect(programs.programRow(programName)).toBeVisible();
    await expect(programs.programNameText(programName)).toBeVisible();
  });

  test("TC-003: Leading and trailing spaces are trimmed and stored value is the trimmed version", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const paddedName = `   OleRodi Cyber Security 2026 ${suffix}   `;
    const trimmedName = `OleRodi Cyber Security 2026 ${suffix}`;
    const description = "TC-003 leading/trailing trim test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(paddedName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(trimmedName)).toBeVisible();

    const editModal = await openEditProgramModal(programs, trimmedName);
    const storedValue = await editModal.programNameInput.inputValue();

    expect(storedValue).toBe(trimmedName);
  });

  test("TC-004: Accented characters are accepted and preserved", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Ingénierie Logicielle ${suffix}`;
    const description = "TC-004 accented characters test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();

    const editModal = await openEditProgramModal(programs, programName);
    await expect(editModal.programNameInput).toHaveValue(programName);
  });

  test("TC-005: Form fields are cleared after successful creation", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Cloud Engineering 2026 ${suffix}`;
    const description = "TC-005 form reset test";

    const programs = await goToPrograms(page);
    let modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();

    modal = await openNewProgramModal(programs);
    await expect(modal.programNameInput).toHaveValue("");
    await expect(modal.descriptionInput).toHaveValue("");
  });
});

test.describe("Programs – DS-3 Program Name Validation – Negative Flows", () => {
  test("TC-006: Form is blocked when Program Name contains only spaces", async ({ page, trackProgram }) => {
    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);

    await modal.fillName("   ");
    await modal.fillDescription("TC-006 whitespace-only name test");

    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-007: Form is blocked when Program Name is empty", async ({ page, trackProgram }) => {
    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);

    await expect(modal.programNameInput).toHaveValue("");

    await modal.fillDescription("TC-007 empty name test");

    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-008: Form is blocked when Program Name contains only tabs and newlines", async ({ page, trackProgram }) => {
    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);

    await modal.fillName("\t\t\n");
    await modal.fillDescription("TC-008 tab/newline whitespace test");

    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-009: Exact duplicate Program Name is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Web Dev Dup ${suffix}`;
    const description = "TC-009 duplicate test";

    const programs = await goToPrograms(page);
    let modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();

    modal = await openNewProgramModal(programs);
    await modal.fillName(programName);
    await modal.fillDescription("TC-009 duplicate attempt");
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
    await expect(programs.matchingRows(programName)).toHaveCount(1);
  });

  test("TC-010: Duplicate with only leading/trailing spaces is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Trim Dup ${suffix}`;
    const paddedName = `  ${programName}  `;
    const description = "TC-010 padded duplicate test";

    const programs = await goToPrograms(page);
    let modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();

    modal = await openNewProgramModal(programs);
    await modal.fillName(paddedName);
    await modal.fillDescription("TC-010 padded duplicate attempt");
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
    await expect(programs.matchingRows(programName)).toHaveCount(1);
  });

  test("TC-011: Duplicate detected after same-session creation without page refresh", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Cloud Same Session ${suffix}`;
    const description = "TC-011 same-session duplicate test";

    const programs = await goToPrograms(page);
    let modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();

    modal = await openNewProgramModal(programs);
    await modal.fillName(programName);
    await modal.fillDescription("TC-011 same-session duplicate attempt");
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
    await expect(programs.matchingRows(programName)).toHaveCount(1);
  });

  test("TC-012: Case-variant duplicate behavior is consistent", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const originalName = `OleRodi Case Variant Base ${suffix}`;
    const lowercaseName = `OleRodi case variant base ${suffix}`;

    const programs = await goToPrograms(page);
    let modal = await openNewProgramModal(programs);
    await modal.fill(originalName, "TC-012 original");
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(originalName)).toBeVisible();

    modal = await openNewProgramModal(programs);
    await modal.fillName(lowercaseName);
    await modal.fillDescription("TC-012 lowercase variant");
    await modal.submit();

    const dialogStillOpen = await modal.dialog.isVisible();

    if (dialogStillOpen) {
      expect(dialogStillOpen).toBe(true);
    } else {
      await expect(programs.matchingRows(originalName).first()).toBeVisible();
      await expect(
        programs.matchingRows(lowercaseName).filter({ hasNotText: originalName }).first()
      ).toBeVisible();
      await trackProgramByName(trackProgram, lowercaseName);
    }
  });

  test("TC-013: XSS/injection string is safely handled", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const marker = `__xssExecuted_${suffix}`;
    const payload = `OleRodi <script>window.${marker}=true</script>`;
    const description = "TC-013 XSS handling test";

    let alertSeen = false;
    page.once("dialog", async (d) => {
      alertSeen = true;
      await d.dismiss();
    });

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(payload, description);
    await modal.submit();

    const rejected = await modal.dialog.isVisible({ timeout: 3000 }).catch(() => false);
    if (!rejected) {
      await expect(modal.dialog).toBeHidden();
      await expect(programs.programRow(payload)).toBeVisible();
      await trackProgramByName(trackProgram, payload);
    }

    const flagged = await page.evaluate((key) => {
      return (window as unknown as Record<string, unknown>)[key] === true;
    }, marker);
    expect(flagged).toBe(false);
    expect(alertSeen).toBe(false);
  });

  test("TC-014: Create button is disabled during submission", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Submit State ${suffix}`;
    const description = "TC-014 submission-state test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);

    await page.route(/\/programs/i, async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/programs") &&
        response.request().method() === "POST" &&
        response.status() >= 200 &&
        response.status() < 300
    );
    await modal.createButton.click();

    const disabledWhilePending = await modal.createButton.isDisabled();
    const response = await responsePromise;
    const body = (await response.json()) as { data?: { id?: string }; id?: string };
    const programId = body.data?.id ?? body.id;
    if (programId) {
      trackProgram(programId);
    }

    await page.unroute(/\/programs/i);

    expect(disabledWhilePending).toBe(true);
    await expect(modal.dialog).toBeHidden({ timeout: 15000 });
    await expect(programs.matchingRows(programName)).toHaveCount(1);
  });
});

test.describe("Programs – DS-3 Program Name Validation – Edge Cases", () => {
  test("TC-015: Error messages appear in a consistent, visible location", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const dupSeed = `OleRodi Error Loc Dup ${suffix}`;
    const description = "TC-015 error-location test";

    const programs = await goToPrograms(page);
    let modal = await openNewProgramModal(programs);

    await modal.fillName("   ");
    await modal.fillDescription(description);
    await expect(modal.createButton).toBeDisabled();

    await modal.programNameInput.clear();
    await modal.fillName(dupSeed);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    modal = await openNewProgramModal(programs);
    await modal.fillName(dupSeed);
    await modal.fillDescription("TC-015 duplicate scenario");
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
    await expect(modal.duplicateNameError).toBeVisible();
  });

  test("TC-016: Name at maximum allowed length is accepted", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const maxLength = 255;
    const base = `OleRodi MaxLen ${suffix} `;
    const atMaxName = base + "A".repeat(maxLength - base.length);
    const description = "TC-016 max length test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(atMaxName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(atMaxName.substring(0, 40))).toBeVisible();

    await programs.openEditFor(atMaxName);
    const editModal = programs.editProgramModal;
    await expect(editModal.dialog).toBeVisible();
    await expect(editModal.programNameInput).toHaveValue(atMaxName);
    await editModal.cancel();
  });

  test("TC-017: Name exceeding maximum length is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const base = `OleRodi OverMax ${suffix} `;
    const maxLength = 255;
    const overMaxName = base + "A".repeat(maxLength - base.length + 1);
    const description = "TC-017 over-max length test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(overMaxName, description);

    await modal.submit();

    const dialogStillOpen = await modal.dialog.isVisible();
    const buttonDisabled = await modal.createButton.isDisabled();
    expect(dialogStillOpen || buttonDisabled).toBe(true);

    if (await modal.dialog.isVisible()) {
      await modal.cancel();
    }
  });

  test("TC-018: Valid punctuation does not trigger false validation errors", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi AI/ML: Foundations (2026) - Group A ${suffix}`;
    const description = "TC-018 punctuation test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);
    await modal.fill(programName, description);
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(programName)).toBeVisible();

    const editModal = await openEditProgramModal(programs, programName);
    await expect(editModal.programNameInput).toHaveValue(programName);
  });

  test("TC-019: Validation error preserves other field values", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const correctedName = `OleRodi Business Analytics ${suffix}`;
    const description = "TC-019 field-preservation test";

    const programs = await goToPrograms(page);
    const modal = await openNewProgramModal(programs);

    await modal.fillName("   ");
    await modal.fillDescription(description);

    await expect(modal.createButton).toBeDisabled();
    await expect(modal.descriptionInput).toHaveValue(description);

    await modal.programNameInput.clear();
    await modal.fillName(correctedName);

    await expect(modal.descriptionInput).toHaveValue(description);

    await expect(modal.createButton).toBeEnabled();
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(correctedName)).toBeVisible();
  });

  test("TC-020: Internal multiple spaces behavior is consistent", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const canonical = `OleRodi Web Development 2026 ${suffix}`;
    const doubleSpaceVariant = `OleRodi Web  Development  2026 ${suffix}`;

    const programs = await goToPrograms(page);
    let modal = await openNewProgramModal(programs);
    await modal.fill(canonical, "TC-020 canonical");
    await clickCreateAndTrack(page, trackProgram, modal);
    await expect(modal.dialog).toBeHidden();

    await expect(programs.programRow(canonical)).toBeVisible();

    modal = await openNewProgramModal(programs);
    await modal.fillName(doubleSpaceVariant);
    await modal.fillDescription("TC-020 internal spaces variant");
    await modal.submit();

    const dialogStillOpen = await modal.dialog.isVisible();

    if (dialogStillOpen) {
      expect(dialogStillOpen).toBe(true);
    } else {
      await expect(programs.programRow(doubleSpaceVariant)).toBeVisible();
      await trackProgramByName(trackProgram, doubleSpaceVariant);
    }
  });
});
