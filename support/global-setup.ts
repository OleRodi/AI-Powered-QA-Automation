import { deleteAllTestPrograms, summarizeDeleteResults } from "./test-program-cleanup";

async function globalSetup(): Promise<void> {
  try {
    const { found, results } = await deleteAllTestPrograms();

    if (found === 0) {
      return;
    }

    summarizeDeleteResults(
      `global setup (removed ${found} leftover OleRodi program(s) from a prior run)`,
      results
    );
  } catch (error) {
    console.warn(
      `[cleanup] global setup failed: ${error instanceof Error ? error.message : error}`
    );
  }
}

export default globalSetup;
