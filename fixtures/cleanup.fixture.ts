import { test as base, expect, type Page } from "@playwright/test";
import { deleteProgramsByIds } from "../support/delete-program";

type CleanupFixtures = {
  trackProgram: (uuid: string) => void;
};

export const test = base.extend<CleanupFixtures>({
  trackProgram: async ({}, use, testInfo) => {
    const programIds = new Set<string>();

    await use((uuid: string) => {
      const trimmed = uuid.trim();
      if (trimmed) {
        programIds.add(trimmed);
      }
    });

    if (programIds.size === 0) {
      return;
    }

    const isFinalAttempt =
      testInfo.status === "passed" ||
      testInfo.status === "skipped" ||
      testInfo.status === "interrupted" ||
      testInfo.retry === testInfo.project.retries;

    if (!isFinalAttempt) {
      return;
    }

    const results = await deleteProgramsByIds([...programIds]);
    const failures = results.filter((result) => !result.ok && result.status !== 404);

    if (failures.length > 0) {
      const summary = failures
        .map((result) => `${result.id} (${result.status}: ${result.message})`)
        .join("; ");
      console.warn(
        `[cleanup] ${testInfo.title}: failed to delete ${failures.length} program(s): ${summary}`
      );
    }
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

export { expect };
export type { Page } from "@playwright/test";

type CreateProgramResponse = {
  data?: { id?: string };
  id?: string;
};

export async function trackProgramFromCreateResponse(
  page: Page,
  trackProgram: (uuid: string) => void,
  createAction: () => Promise<void>
): Promise<string> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/programs") &&
      response.request().method() === "POST" &&
      response.status() >= 200 &&
      response.status() < 300
  );

  await createAction();

  const response = await responsePromise;
  const body = (await response.json()) as CreateProgramResponse;
  const programId = body.data?.id ?? body.id;

  if (!programId) {
    throw new Error("Could not extract program id from POST /api/programs response");
  }

  trackProgram(programId);
  return programId;
}
