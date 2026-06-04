import {
  deleteProgramsByIds,
  getAllPrograms,
  type DeleteResult,
} from "./delete-program";
import { TEST_PROGRAM_OWNER } from "./test-data.constants";

/** Programs created by this suite use the OleRodi name prefix. */
export function isTestProgramName(name: string): boolean {
  return name.startsWith(`${TEST_PROGRAM_OWNER} `);
}

export async function deleteTrackedPrograms(ids: string[]): Promise<DeleteResult[]> {
  if (ids.length === 0) {
    return [];
  }
  return deleteProgramsByIds(ids);
}

/**
 * Deletes every program whose name starts with "OleRodi " (GET all, then DELETE each).
 * Same API flow as didaxis-program-deleter skill, scoped to automation test data only.
 */
export async function deleteAllTestPrograms(): Promise<{
  found: number;
  results: DeleteResult[];
}> {
  const programs = await getAllPrograms();
  const testPrograms = programs.filter((program) => isTestProgramName(program.name));
  const ids = testPrograms.map((program) => program.id);

  if (ids.length === 0) {
    return { found: 0, results: [] };
  }

  const results = await deleteProgramsByIds(ids);
  return { found: ids.length, results };
}

export function summarizeDeleteResults(
  label: string,
  results: DeleteResult[]
): void {
  const deleted = results.filter((result) => result.ok || result.status === 404);
  const failed = results.filter((result) => !result.ok && result.status !== 404);

  console.log(`[cleanup] ${label}: removed ${deleted.length} program(s)`);

  if (failed.length > 0) {
    const summary = failed
      .map((result) => `${result.id} (${result.status}: ${result.message})`)
      .join("; ");
    console.warn(`[cleanup] ${label}: failed to delete ${failed.length} program(s): ${summary}`);
  }
}
