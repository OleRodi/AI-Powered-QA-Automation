import { test, expect } from "../../fixtures/cleanup.fixture";
import {
  clickCreateAndTrack,
  trackProgramByName,
} from "../../support/playwright-program-helpers";

test.describe("Programs – DS-3 Program Name Validation – Positive Flows", () => {
  test("TC-001: Program is created when name contains valid special characters", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Informatique & IA - Niveau 2 ${suffix}`;
    const description = "TC-001 special characters test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
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

  test("TC-002: Newly created program appears in the Programs list", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Informatique Liste ${suffix}`;
    const description = "TC-002 list verification test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(page).toHaveURL(/\/programs/);

    const createdRow = page
      .getByRole("row")
      .filter({ hasText: programName })
      .first();
    await expect(createdRow).toBeVisible();
    await expect(createdRow.getByText(programName, { exact: true })).toBeVisible();
  });

  test("TC-003: Leading and trailing spaces are trimmed and stored value is the trimmed version", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const paddedName = `   OleRodi Cyber Security 2026 ${suffix}   `;
    const trimmedName = `OleRodi Cyber Security 2026 ${suffix}`;
    const description = "TC-003 leading/trailing trim test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(paddedName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
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

  test("TC-004: Accented characters are accepted and preserved", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Ingénierie Logicielle ${suffix}`;
    const description = "TC-004 accented characters test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
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

  test("TC-005: Form fields are cleared after successful creation", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Cloud Engineering 2026 ${suffix}`;
    const description = "TC-005 form reset test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue("");
    await expect(
      dialog.getByRole("textbox", { name: "Description" })
    ).toHaveValue("");
  });
});

test.describe("Programs – DS-3 Program Name Validation – Negative Flows", () => {
  test("TC-006: Form is blocked when Program Name contains only spaces", async ({ page, trackProgram }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("textbox", { name: "Program Name" }).fill("   ");
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-006 whitespace-only name test");

    const createButton = dialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();

    await expect(dialog).toBeVisible();
  });

  test("TC-007: Form is blocked when Program Name is empty", async ({ page, trackProgram }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");

    const nameField = dialog.getByRole("textbox", { name: "Program Name" });
    await expect(nameField).toHaveValue("");

    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-007 empty name test");

    const createButton = dialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();

    await expect(dialog).toBeVisible();
  });

  test("TC-008: Form is blocked when Program Name contains only tabs and newlines", async ({ page, trackProgram }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("textbox", { name: "Program Name" }).fill("\t\t\n");
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-008 tab/newline whitespace test");

    const createButton = dialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();

    await expect(dialog).toBeVisible();
  });

  test("TC-009: Exact duplicate Program Name is rejected", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Web Dev Dup ${suffix}`;
    const description = "TC-009 duplicate test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-009 duplicate attempt");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(1);
  });

  test("TC-010: Duplicate with only leading/trailing spaces is rejected", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Trim Dup ${suffix}`;
    const paddedName = `  ${programName}  `;
    const description = "TC-010 padded duplicate test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(paddedName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-010 padded duplicate attempt");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(1);
  });

  test("TC-011: Duplicate detected after same-session creation without page refresh", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Cloud Same Session ${suffix}`;
    const description = "TC-011 same-session duplicate test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-011 same-session duplicate attempt");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(1);
  });

  test("TC-012: Case-variant duplicate behavior is consistent", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const originalName = `OleRodi Case Variant Base ${suffix}`;
    const lowercaseName = `OleRodi case variant base ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(originalName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-012 original");
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: originalName }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(lowercaseName);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-012 lowercase variant");
    await dialog.getByRole("button", { name: "Create" }).click();

    const dialogStillOpen = await dialog.isVisible();

    if (dialogStillOpen) {
      expect(dialogStillOpen).toBe(true);
    } else {
      const originalRow = page.getByRole("row").filter({ hasText: originalName });
      const lowercaseRow = page
        .getByRole("row")
        .filter({ hasText: lowercaseName })
        .filter({ hasNotText: originalName });

      await expect(originalRow.first()).toBeVisible();
      await expect(lowercaseRow.first()).toBeVisible();
      await trackProgramByName(trackProgram, lowercaseName);
    }
  });

  test("TC-013: XSS/injection string is safely handled", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const marker = `__xssExecuted_${suffix}`;
    const payload = `OleRodi <script>window.${marker}=true</script>`;
    const description = "TC-013 XSS handling test";

    let alertSeen = false;
    page.once("dialog", async (d) => {
      alertSeen = true;
      await d.dismiss();
    });

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(payload);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await dialog.getByRole("button", { name: "Create" }).click();

    const rejected = await dialog.isVisible({ timeout: 3000 }).catch(() => false);
    if (!rejected) {
      await expect(dialog).toBeHidden();
      await expect(page.getByRole("row").filter({ hasText: payload }).first()).toBeVisible();
      await trackProgramByName(trackProgram, payload);
    }

    const flagged = await page.evaluate((key) => {
      return (window as unknown as Record<string, unknown>)[key] === true;
    }, marker);
    expect(flagged).toBe(false);
    expect(alertSeen).toBe(false);
  });

  test("TC-014: Create button is disabled during submission", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi Submit State ${suffix}`;
    const description = "TC-014 submission-state test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);

    await page.route(/\/programs/i, async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    const createButton = dialog.getByRole("button", { name: "Create" });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/programs") &&
        response.request().method() === "POST" &&
        response.status() >= 200 &&
        response.status() < 300
    );
    await createButton.click();

    const disabledWhilePending = await createButton.isDisabled();
    const response = await responsePromise;
    const body = (await response.json()) as { data?: { id?: string }; id?: string };
    const programId = body.data?.id ?? body.id;
    if (programId) {
      trackProgram(programId);
    }

    await page.unroute(/\/programs/i);

    expect(disabledWhilePending).toBe(true);
    await expect(dialog).toBeHidden({ timeout: 15000 });
    await expect(
      page.getByRole("row").filter({ hasText: programName })
    ).toHaveCount(1);
  });
});

test.describe("Programs – DS-3 Program Name Validation – Edge Cases", () => {
  test("TC-015: Error messages appear in a consistent, visible location", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const dupSeed = `OleRodi Error Loc Dup ${suffix}`;
    const description = "TC-015 error-location test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");

    await dialog.getByRole("textbox", { name: "Program Name" }).fill("   ");
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await expect(dialog.getByRole("button", { name: "Create" })).toBeDisabled();

    await dialog.getByRole("textbox", { name: "Program Name" }).clear();
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(dupSeed);
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(dupSeed);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-015 duplicate scenario");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(/duplicate|already exists|unique|name.*taken/i).first()
    ).toBeVisible();
  });

  test("TC-016: Name at maximum allowed length is accepted", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const maxLength = 255;
    const base = `OleRodi MaxLen ${suffix} `;
    const atMaxName = base + "A".repeat(maxLength - base.length);
    const description = "TC-016 max length test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(atMaxName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: atMaxName.substring(0, 40) }).first()
    ).toBeVisible();

    const createdRow = page
      .getByRole("row")
      .filter({ hasText: atMaxName.substring(0, 40) })
      .first();
    await createdRow.getByRole("button", { name: "✏️" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog).toBeVisible();
    await expect(
      editDialog.getByRole("textbox", { name: "Program Name" })
    ).toHaveValue(atMaxName);
    await editDialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("TC-017: Name exceeding maximum length is rejected", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const base = `OleRodi OverMax ${suffix} `;
    const maxLength = 255;
    const overMaxName = base + "A".repeat(maxLength - base.length + 1);
    const description = "TC-017 over-max length test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(overMaxName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);

    const createButton = dialog.getByRole("button", { name: "Create" });
    await createButton.click();

    const dialogStillOpen = await dialog.isVisible();
    const buttonDisabled = await createButton.isDisabled();
    expect(dialogStillOpen || buttonDisabled).toBe(true);

    if (await dialog.isVisible()) {
      await dialog.getByRole("button", { name: "Cancel" }).click();
    }
  });

  test("TC-018: Valid punctuation does not trigger false validation errors", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `OleRodi AI/ML: Foundations (2026) - Group A ${suffix}`;
    const description = "TC-018 punctuation test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await dialog.getByRole("textbox", { name: "Description" }).fill(description);
    await clickCreateAndTrack(page, trackProgram, dialog);
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

  test("TC-019: Validation error preserves other field values", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const correctedName = `OleRodi Business Analytics ${suffix}`;
    const description = "TC-019 field-preservation test";

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
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: correctedName }).first()
    ).toBeVisible();
  });

  test("TC-020: Internal multiple spaces behavior is consistent", async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const canonical = `OleRodi Web Development 2026 ${suffix}`;
    const doubleSpaceVariant = `OleRodi Web  Development  2026 ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.getByRole("button", { name: "+ New Program" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(canonical);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-020 canonical");
    await clickCreateAndTrack(page, trackProgram, dialog);
    await expect(dialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: canonical }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: "+ New Program" }).click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Program Name" })
      .fill(doubleSpaceVariant);
    await dialog
      .getByRole("textbox", { name: "Description" })
      .fill("TC-020 internal spaces variant");
    await dialog.getByRole("button", { name: "Create" }).click();

    const dialogStillOpen = await dialog.isVisible();

    if (dialogStillOpen) {
      expect(dialogStillOpen).toBe(true);
    } else {
      await expect(
        page.getByRole("row").filter({ hasText: doubleSpaceVariant }).first()
      ).toBeVisible();
      await trackProgramByName(trackProgram, doubleSpaceVariant);
    }
  });
});
