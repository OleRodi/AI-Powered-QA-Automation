import type { Page } from "@playwright/test";
import { trackProgramFromCreateResponse } from "../fixtures/cleanup.fixture";
import { getAllPrograms } from "./delete-program";
import { ProgramsPage } from "../pages/programs.page";
import type { NewProgramModal } from "../pages/components/new-program.modal";

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
  modal: NewProgramModal
): Promise<void> {
  await trackProgramFromCreateResponse(page, trackProgram, () => modal.submit());
}

export async function createProgram(
  page: Page,
  trackProgram: (uuid: string) => void,
  name: string,
  description: string
): Promise<ProgramsPage> {
  const programs = new ProgramsPage(page);
  await programs.nav.goToPrograms();
  await programs.openNewProgram();
  await programs.newProgramModal.fill(name, description);
  await clickCreateAndTrack(page, trackProgram, programs.newProgramModal);
  return programs;
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
