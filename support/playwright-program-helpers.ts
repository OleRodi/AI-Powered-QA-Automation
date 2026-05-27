import { expect, type Locator, type Page } from "@playwright/test";
import { trackProgramFromCreateResponse } from "../fixtures/cleanup.fixture";
import { getAllPrograms } from "./delete-program";

export const TEST_PROGRAM_OWNER = "OleRodi";

export function testProgramName(base: string, suffix: string | number = Date.now()): string {
  const trimmedBase = base.trim();
  const prefixedBase = trimmedBase.startsWith(`${TEST_PROGRAM_OWNER} `)
    ? trimmedBase
    : `${TEST_PROGRAM_OWNER} ${trimmedBase}`;

  return `${prefixedBase} ${suffix}`;
}

export async function clickCreateAndTrack(
  page: Page,
  trackProgram: (uuid: string) => void,
  dialog: Locator
): Promise<void> {
  await trackProgramFromCreateResponse(page, trackProgram, async () => {
    await dialog.getByRole("button", { name: "Create" }).click();
  });
}

export async function createProgram(
  page: Page,
  trackProgram: (uuid: string) => void,
  name: string,
  description: string
): Promise<void> {
  await page.getByRole("button", { name: "+ New Program" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Program Name" }).fill(name);
  await dialog.getByRole("textbox", { name: "Description" }).fill(description);
  await clickCreateAndTrack(page, trackProgram, dialog);
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("row").filter({ hasText: name }).first()).toBeVisible();
}

export async function trackProgramByName(
  trackProgram: (uuid: string) => void,
  name: string
): Promise<void> {
  const programs = await getAllPrograms();
  for (const program of programs.filter((entry) => entry.name === name)) {
    trackProgram(program.id);
  }
}
