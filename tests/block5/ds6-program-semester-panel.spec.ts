import { test, expect } from "../../fixtures/cleanup.fixture";
import { createProgram } from "../../support/playwright-program-helpers";
import { goToPrograms, uniqueId } from "../../support/programs-test.helpers";

test.describe("Programs – Semester panel selection (discovered)", () => {
  test("TC-001: Selecting a program reveals the semester panel", async ({
    page,
    trackProgram,
  }) => {
    const suffix = uniqueId();
    const programName = `OleRodi Semester Panel Alpha ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, programName, "Semester panel selection test");

    await expect(programs.selectProgramHint).toBeVisible();

    await programs.selectProgram(programName);

    await expect(programs.selectProgramHint).toBeHidden();
    await expect(programs.semesterConfigSubtitle).toBeVisible();
    await expect(programs.addSemesterButton).toBeVisible();
    await expect(programs.semesterPanelHeading(programName)).toBeVisible();
  });

  test("TC-002: Switching selection updates the semester panel", async ({
    page,
    trackProgram,
  }) => {
    const suffix = uniqueId();
    const alphaName = `OleRodi Semester Panel Alpha ${suffix}`;
    const betaName = `OleRodi Semester Panel Beta ${suffix}`;

    const programs = await goToPrograms(page);
    await createProgram(page, trackProgram, alphaName, "Alpha semester panel test");
    await createProgram(page, trackProgram, betaName, "Beta semester panel test");

    await programs.selectProgram(alphaName);
    await expect(programs.semesterPanelHeading(alphaName)).toBeVisible();

    await programs.selectProgram(betaName);

    await expect(programs.semesterPanelHeading(betaName)).toBeVisible();
    await expect(programs.semesterPanelHeading(alphaName)).toBeHidden();
    await expect(programs.semesterConfigSubtitle).toBeVisible();
    await expect(programs.addSemesterButton).toBeVisible();
  });
});
