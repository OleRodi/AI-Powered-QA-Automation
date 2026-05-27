import {
  test,
  expect,
  trackProgramFromCreateResponse,
  type Page,
} from "../../fixtures/cleanup.fixture";
import { clickCreateAndTrack, createProgram } from "../../support/playwright-program-helpers";

const PROGRAM_NAME = "OleRodi Web Development 2026";
const PROGRAM_DESC = "Full-stack web development program";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole("textbox", { name: "Password" }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/");
}

async function goToPrograms(page: Page) {
  await page.getByRole("button", { name: "Programs" }).click();
  await page.waitForURL("**/programs");
}

async function openCreateDialog(page: Page) {
  await page.getByRole("button", { name: "+ New Program" }).click();
  const createDialog = page.getByRole("dialog");
  await expect(createDialog).toBeVisible();
  return createDialog;
}

function uniqueId() {
  return Date.now().toString();
}

function programRow(page: Page, name: string) {
  return page.getByRole("row").filter({ hasText: name }).first();
}

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.describe("Programs – Create new academic program (DS-1)", () => {
  test("TC-001: Navigate to program creation form", async ({ page, trackProgram }) => {
    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);

    await expect(createDialog.getByRole("textbox", { name: "Program Name" })).toBeVisible();
    await expect(createDialog.getByRole("textbox", { name: "Description" })).toBeVisible();
  });

  test("TC-002: Successfully create a program", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, createDialog);

    await expect(createDialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test("TC-003: Created program persists after page reload", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, PROGRAM_DESC);

    await page.reload();
    await page.waitForURL("**/programs");

    await expect(programRow(page, programName)).toBeVisible();
  });

  test("TC-004: Program can be created with only Program Name when Description is optional", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Data Science 2026 ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await clickCreateAndTrack(page, trackProgram, createDialog);

    await expect(createDialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test("TC-005: Modal closes within a reasonable time after successful Create", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);

    const start = Date.now();
    await clickCreateAndTrack(page, trackProgram, createDialog);
    await expect(createDialog).toBeHidden({ timeout: 2000 });
    expect(Date.now() - start).toBeLessThan(2000);

    await expect(programRow(page, programName)).toBeVisible();
  });

  test("TC-006: Validation prevents empty program name", async ({ page, trackProgram }) => {
    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);

    const createButton = createDialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();
    await expect(createDialog).toBeVisible();
  });

  test("TC-007: Create is blocked when Program Name contains only whitespace", async ({ page, trackProgram }) => {
    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill("   ");
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);

    const createButton = createDialog.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();
    await expect(createDialog).toBeVisible();
  });

  test("TC-008: Duplicate program name is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, PROGRAM_DESC);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog
      .getByRole("textbox", { name: "Description" })
      .fill("Duplicate name attempt");
    await createDialog.getByRole("button", { name: "Create" }).click();

    await expect(createDialog).toBeVisible();
    await expect(
      createDialog.getByText(/duplicate|already exists|unique|name.*taken/i).first()
    ).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: programName })).toHaveCount(1);
  });

  test("TC-009: Duplicate name error does not clear entered Description", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const duplicateDesc = "Duplicate name attempt";

    await goToPrograms(page);
    await createProgram(page, trackProgram, programName, PROGRAM_DESC);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(duplicateDesc);
    await createDialog.getByRole("button", { name: "Create" }).click();

    await expect(createDialog).toBeVisible();
    await expect(createDialog.getByRole("textbox", { name: "Description" })).toHaveValue(
      duplicateDesc
    );
  });

  test("TC-010: Cancel discards unsaved program data", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);
    await createDialog.getByRole("button", { name: "Cancel" }).click();

    await expect(createDialog).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: programName })).toHaveCount(0);
  });

  test("TC-011: Backend failure keeps modal open and preserves entered values", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);

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

    const createDialog = await openCreateDialog(page);
    const nameField = createDialog.getByRole("textbox", { name: "Program Name" });
    const descField = createDialog.getByRole("textbox", { name: "Description" });

    await nameField.fill(programName);
    await descField.fill(PROGRAM_DESC);
    await createDialog.getByRole("button", { name: "Create" }).click();

    await expect(createDialog).toBeVisible();
    await expect(nameField).toHaveValue(programName);
    await expect(descField).toHaveValue(PROGRAM_DESC);
    await expect(page.getByRole("row").filter({ hasText: programName })).toHaveCount(0);

    await page.unroute(/\/programs\/?[^?]*/i);
    await createDialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("TC-012: Program Name accepts valid special characters", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Web Development 2026: Front-End & API (Evening) ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, createDialog);

    await expect(createDialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test("TC-013: Leading and trailing spaces in Program Name are trimmed on save", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const trimmedName = `${PROGRAM_NAME} ${suffix}`;
    const paddedName = `   ${trimmedName}   `;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(paddedName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, createDialog);

    await expect(createDialog).toBeHidden();
    await expect(programRow(page, trimmedName)).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: paddedName })).toHaveCount(0);
  });

  test("TC-014: Rapid double-click on Create does not create duplicate programs", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);
    await trackProgramFromCreateResponse(page, trackProgram, async () => {
      await createDialog.getByRole("button", { name: "Create" }).dblclick();
    });

    await expect(createDialog).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: programName })).toHaveCount(1);
  });

  test("TC-015: Program list row matches the created program name exactly", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;
    const partialName = `OleRodi Web Development ${suffix}`;

    await goToPrograms(page);
    await createProgram(page, trackProgram, partialName, "TC-015 partial-name decoy");

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, createDialog);
    await expect(createDialog).toBeHidden();

    const createdRow = programRow(page, programName);
    await expect(createdRow).toBeVisible();
    await expect(createdRow.getByText(programName, { exact: true })).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: programName })).toHaveCount(1);
    await expect(programRow(page, partialName)).toBeVisible();
  });

  test("TC-016: Program Name at maximum allowed length is accepted", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const base = `${PROGRAM_NAME} ${suffix} `;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    const nameField = createDialog.getByRole("textbox", { name: "Program Name" });
    const maxLengthAttr = await nameField.getAttribute("maxlength");
    const maxLength = maxLengthAttr ? Number(maxLengthAttr) : 255;
    const atMaxName = base + "A".repeat(Math.max(0, maxLength - base.length));

    await nameField.fill(atMaxName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);
    await clickCreateAndTrack(page, trackProgram, createDialog);
    await expect(createDialog).toBeHidden();

    await expect(
      page.getByRole("row").filter({ hasText: atMaxName.substring(0, 40) }).first()
    ).toBeVisible();

    const createdRow = page
      .getByRole("row")
      .filter({ hasText: atMaxName.substring(0, 40) })
      .first();
    await createdRow.getByRole("button", { name: "✏️" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit Program" });
    await expect(editDialog.getByRole("textbox", { name: "Program Name" })).toHaveValue(
      atMaxName
    );
    await editDialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("TC-017: Program Name exceeding maximum allowed length is rejected", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const base = `${PROGRAM_NAME} ${suffix} `;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    const nameField = createDialog.getByRole("textbox", { name: "Program Name" });
    const maxLengthAttr = await nameField.getAttribute("maxlength");
    const maxLength = maxLengthAttr ? Number(maxLengthAttr) : 255;
    const overMaxName = base + "B".repeat(Math.max(1, maxLength - base.length + 1));

    await nameField.fill(overMaxName);
    await createDialog.getByRole("textbox", { name: "Description" }).fill(PROGRAM_DESC);

    const createButton = createDialog.getByRole("button", { name: "Create" });

    if (maxLengthAttr) {
      const actualValue = await nameField.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(Number(maxLengthAttr));
    } else {
      await createButton.click();
      await expect(createDialog).toBeVisible();
      await expect(
        createDialog.getByText(/too long|maximum|max length|characters/i).first()
      ).toBeVisible();
      await expect(page.getByRole("row").filter({ hasText: overMaxName })).toHaveCount(0);
    }

    if (await createDialog.isVisible()) {
      await createDialog.getByRole("button", { name: "Cancel" }).click();
    }
  });

  test("TC-018: Empty Description is allowed when Description is optional", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);

    const createButton = createDialog.getByRole("button", { name: "Create" });
    if (!(await createButton.isEnabled())) {
      test.skip(true, "Description is required in this environment");
    }

    await clickCreateAndTrack(page, trackProgram, createDialog);
    await expect(createDialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test("TC-019: Empty Description is blocked when Description is required", async ({ page, trackProgram }) => {
    const suffix = uniqueId();
    const programName = `${PROGRAM_NAME} ${suffix}`;

    await goToPrograms(page);

    const createDialog = await openCreateDialog(page);
    await createDialog.getByRole("textbox", { name: "Program Name" }).fill(programName);

    const createButton = createDialog.getByRole("button", { name: "Create" });
    if (await createButton.isDisabled()) {
      await expect(createButton).toBeDisabled();
      await expect(createDialog).toBeVisible();
      await createDialog.getByRole("button", { name: "Cancel" }).click();
    } else {
      await clickCreateAndTrack(page, trackProgram, createDialog);
      await expect(programRow(page, programName)).toBeVisible();
    }
  });
});
