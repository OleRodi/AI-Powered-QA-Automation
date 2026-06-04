import { test as base, expect, type Page } from "@playwright/test";
import {
  deleteTrackedPrograms,
  summarizeDeleteResults,
} from "../support/test-program-cleanup";

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

    // Always delete tracked programs — including failed, timedOut, and non-final retries.
    const results = await deleteTrackedPrograms([...programIds]);
    summarizeDeleteResults(testInfo.title, results);
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
