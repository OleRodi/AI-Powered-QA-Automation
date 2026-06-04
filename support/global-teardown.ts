import { deleteAllTestPrograms, summarizeDeleteResults } from "./test-program-cleanup";

async function globalTeardown(): Promise<void> {
  try {
    const { found, results } = await deleteAllTestPrograms();

    if (found === 0) {
      console.log("[cleanup] global teardown: no OleRodi test programs left on Didaxis");
      return;
    }

    summarizeDeleteResults(`global teardown (${found} OleRodi program(s) found)`, results);
  } catch (error) {
    console.warn(
      `[cleanup] global teardown failed: ${error instanceof Error ? error.message : error}`
    );
  }
}

export default globalTeardown;
