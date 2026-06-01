import type { Page } from "@playwright/test";
import { expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";
import type { EditProgramModal } from "../pages/components/edit-program.modal";
import type { NewProgramModal } from "../pages/components/new-program.modal";

export const RENAME_DUPLICATE_DEMO_BUG =
  "Known demo bug — duplicate program names are allowed on rename.";

export function uniqueId(): string {
  return Date.now().toString();
}

export async function goToPrograms(page: Page): Promise<ProgramsPage> {
  const programs = new ProgramsPage(page);
  await programs.nav.goToPrograms();
  return programs;
}

export async function openNewProgramModal(programs: ProgramsPage): Promise<NewProgramModal> {
  await programs.openNewProgram();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  return programs.newProgramModal;
}

export async function openEditProgramModal(
  programs: ProgramsPage,
  programName: string
): Promise<EditProgramModal> {
  await expect(programs.programRow(programName)).toBeVisible();
  await programs.openEditFor(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();
  return programs.editProgramModal;
}
