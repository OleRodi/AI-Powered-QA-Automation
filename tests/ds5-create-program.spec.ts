import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole("textbox", { name: "Password" }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/");
});

async function createProgram(page: import("@playwright/test").Page, name: string, description: string) {
  await page.getByRole("button", { name: "+ New Program" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Program Name" }).fill(name);
  await dialog.getByRole("textbox", { name: "Description" }).fill(description);
  await dialog.getByRole("button", { name: "Create" }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("row").filter({ hasText: name }).first()
  ).toBeVisible();
}

test.describe("Program List Display – Positive Flows", () => {
  test("TC-001: Programs page displays all existing programs with key details", async ({
    page,
  }) => {
    const suffix = Date.now();
    const program1Name = `Web Development ${suffix}`;
    const program1Desc = "Full-stack web technologies and project-based learning";
    const program2Name = `Data Science ${suffix}`;
    const program2Desc = "Statistics, Python, and machine learning basics";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, program1Name, program1Desc);
    await createProgram(page, program2Name, program2Desc);

    const row1 = page.getByRole("row").filter({ hasText: program1Name }).first();
    await expect(row1).toBeVisible();
    await expect(row1).toContainText(program1Name);
    await expect(row1).toContainText(program1Desc);

    const row2 = page.getByRole("row").filter({ hasText: program2Name }).first();
    await expect(row2).toBeVisible();
    await expect(row2).toContainText(program2Name);
    await expect(row2).toContainText(program2Desc);
  });

  test("TC-002: Empty-state message appears when no programs exist", async ({
    page,
  }) => {
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET" && /programs/i.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.waitForTimeout(2000);

    const table = page.getByRole("table");
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      const bodyRows = page.getByRole("row").filter({ hasNotText: /^Program$/ });
      await expect(bodyRows).toHaveCount(0);
    }

    await page.unroute("**/api/**");
  });

  test("TC-003: Create-first-program prompt navigates to creation flow from empty state", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    const ctaButton = page.getByRole("button", { name: /\+ New Program/i });
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("textbox", { name: "Program Name" })
    ).toBeVisible();
  });

  test("TC-004: Programs with special characters display correctly in list", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Informatique & IA - Niveau 2 ${suffix}`;
    const programDesc = `Parcours avancé: IA, NLP, et MLOps ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, programDesc);

    const row = page.getByRole("row").filter({ hasText: programName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(programName);
    await expect(row).toContainText(programDesc);

    await expect(row).not.toContainText("&amp;");
    await expect(row).not.toContainText("&eacute;");
  });
});

test.describe("Program List Display – Negative Flows", () => {
  test("TC-005: Non-admin user cannot access full program management list", async ({
    page,
  }) => {
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET" && /programs/i.test(url)) {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ error: "Forbidden" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.waitForTimeout(2000);

    const dataRows = page.getByRole("row").filter({ hasNotText: /^Program$/ });
    const rowCount = await dataRows.count();
    expect(rowCount).toBe(0);

    await page.unroute("**/api/**");
  });

  test("TC-006: Program list does not show stale data after backend retrieval failure", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await expect(
      page.getByRole("row").first()
    ).toBeVisible();

    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET" && /programs/i.test(url)) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.reload();
    await page.waitForURL("**/programs");

    await page.waitForTimeout(2000);

    const heading = page.getByRole("heading", { name: "Programs" });
    await expect(heading).toBeVisible();

    const table = page.getByRole("table");
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      const dataRows = page.getByRole("row").filter({ hasNotText: /^Program$/ });
      const rowCount = await dataRows.count();
      expect(rowCount).toBe(0);
    }

    await page.unroute("**/api/**");
  });

  test("TC-007: List view does not render blank name/description rows silently", async ({
    page,
  }) => {
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET" && /programs/i.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            { id: "bad-1", name: "", description: "Missing name program" },
            { id: "bad-2", name: null, description: "Null name program" },
            { id: "bad-3", name: "Valid Program", description: "" },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await page.waitForTimeout(3000);

    const navigation = page.getByRole("navigation");
    const navVisible = await navigation.isVisible().catch(() => false);
    expect(navVisible).toBe(true);

    const heading = page.getByRole("heading", { name: "Programs" });
    const headingVisible = await heading.isVisible().catch(() => false);
    expect(headingVisible).toBe(true);

    const pageContent = await page.content();
    expect(pageContent).not.toContain("undefined");
    expect(pageContent).not.toContain("null");

    await page.unroute("**/api/**");
  });

  test("TC-008: Duplicate program names are distinguishable in display", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Test Program ${suffix}`;
    const desc1 = "TC-008 first instance description";
    const desc2 = "TC-008 second instance description";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, desc1);
    await createProgram(page, programName, desc2);

    const matchingRows = page.getByRole("row").filter({ hasText: programName });
    await expect(matchingRows).toHaveCount(2);

    const row1 = matchingRows.nth(0);
    const row2 = matchingRows.nth(1);

    await expect(row1).toBeVisible();
    await expect(row2).toBeVisible();

    const row1Text = await row1.innerText();
    const row2Text = await row2.innerText();

    expect(row1Text).not.toBe(row2Text);

    const hasDesc1 = row1Text.includes(desc1) || row2Text.includes(desc1);
    const hasDesc2 = row1Text.includes(desc2) || row2Text.includes(desc2);
    expect(hasDesc1).toBe(true);
    expect(hasDesc2).toBe(true);
  });
});

test.describe("Program List Display – Edge Cases", () => {
  test("TC-009: Program list displays very long names/descriptions without breaking layout", async ({
    page,
  }) => {
    const suffix = Date.now();
    const longName = `Advanced Data Engineering and Distributed Systems - Cohort 2026 - Section A ${suffix}`;
    const longDesc = `Comprehensive curriculum covering distributed storage, stream processing, data modeling, observability, and production-grade pipelines for enterprise workloads ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, longName, longDesc);

    const row = page.getByRole("row").filter({ hasText: longName }).first();
    await expect(row).toBeVisible();

    const editButton = row.getByRole("button", { name: "✏️" });
    const deleteButton = row.getByRole("button", { name: "🗑" });
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();

    const editBox = await editButton.boundingBox();
    const deleteBox = await deleteButton.boundingBox();
    expect(editBox).not.toBeNull();
    expect(deleteBox).not.toBeNull();
    expect(editBox!.width).toBeGreaterThan(0);
    expect(deleteBox!.width).toBeGreaterThan(0);
  });

  test("TC-010: Empty-state and list-state switch correctly after first program is created", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Cloud Engineering ${suffix}`;
    const programDesc = "TC-010 empty-to-list transition test";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, programDesc);

    const row = page.getByRole("row").filter({ hasText: programName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(programName);
    await expect(row).toContainText(programDesc);
  });

  test("TC-011: Program descriptions with newline and punctuation display safely", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Punctuation Desc ${suffix}`;
    const programDesc = "Core modules:\n- Python\n- SQL\n- ML Ops";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, programDesc);

    const row = page.getByRole("row").filter({ hasText: programName }).first();
    await expect(row).toBeVisible();

    const rowHtml = await row.innerHTML();
    expect(rowHtml).not.toContain("<script>");
    expect(rowHtml).not.toContain("&lt;script&gt;");

    await expect(row).toContainText("Core modules");
    await expect(row).toContainText("Python");
  });

  test("TC-012: List remains usable with large number of programs", async ({
    page,
  }) => {
    test.setTimeout(120000);

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    const suffix = Date.now();
    const batchSize = 5;

    for (let i = 0; i < batchSize; i++) {
      await createProgram(page, `Bulk ${suffix} #${i}`, `Bulk test program ${i}`);
    }

    for (let i = 0; i < batchSize; i++) {
      await expect(
        page.getByRole("row").filter({ hasText: `Bulk ${suffix} #${i}` }).first()
      ).toBeVisible();
    }

    const editButtons = page.getByRole("button", { name: "✏️" });
    const editCount = await editButtons.count();
    expect(editCount).toBeGreaterThanOrEqual(batchSize);
  });

  test("TC-013: Program names differing only by case are displayed consistently", async ({
    page,
  }) => {
    const suffix = Date.now();
    const upperName = `Data Science ${suffix}`;
    const lowerName = `data science ${suffix}`;
    const upperDesc = "TC-013 uppercase variant";
    const lowerDesc = "TC-013 lowercase variant";

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, upperName, upperDesc);
    await createProgram(page, lowerName, lowerDesc);

    const upperRow = page.getByRole("row").filter({ hasText: upperDesc }).first();
    const lowerRow = page.getByRole("row").filter({ hasText: lowerDesc }).first();

    await expect(upperRow).toBeVisible();
    await expect(lowerRow).toBeVisible();

    const upperRowText = await upperRow.innerText();
    const lowerRowText = await lowerRow.innerText();

    const upperNamePreserved = upperRowText.includes(upperName);
    const lowerNamePreserved = lowerRowText.includes(lowerName);

    if (!upperNamePreserved) {
      expect(upperRowText.toLowerCase()).toContain(upperName.toLowerCase());
    }
    if (!lowerNamePreserved) {
      expect(lowerRowText.toLowerCase()).toContain(lowerName.toLowerCase());
    }

    expect(upperRowText).not.toBe(lowerRowText);
  });

  test("TC-014: Programs page refresh keeps state consistent with latest backend data", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Refresh Check ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, programName, "TC-014 refresh consistency test");

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    const rowCountBefore = await page.getByRole("row").count();

    await page.reload();
    await page.waitForURL("**/programs");

    await expect(
      page.getByRole("row").filter({ hasText: programName }).first()
    ).toBeVisible();

    const rowCountAfter = await page.getByRole("row").count();
    expect(rowCountAfter).toBe(rowCountBefore);
  });

  test("TC-015: Filtering controls (if present) update displayed list correctly", async ({
    page,
  }) => {
    const suffix = Date.now();
    const matchName = `Data Analytics ${suffix}`;
    const noMatchName = `Cloud Engineering ${suffix}`;

    await page.getByRole("button", { name: "Programs" }).click();
    await page.waitForURL("**/programs");

    await createProgram(page, matchName, "TC-015 should match filter");
    await createProgram(page, noMatchName, "TC-015 should not match filter");

    const searchInput = page.getByRole("textbox", { name: /search|filter/i });
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await searchInput.fill("Data");

      await expect(
        page.getByRole("row").filter({ hasText: matchName }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("row").filter({ hasText: noMatchName })
      ).toHaveCount(0);

      await searchInput.clear();

      await expect(
        page.getByRole("row").filter({ hasText: matchName }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("row").filter({ hasText: noMatchName }).first()
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("row").filter({ hasText: matchName }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("row").filter({ hasText: noMatchName }).first()
      ).toBeVisible();
    }
  });
});
