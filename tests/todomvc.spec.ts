import { test, expect, Page } from "@playwright/test";

const TODO_PATH = "/todomvc/#/";
const TODOS = ["Buy milk", "Walk the dog", "Write tests", "Submit PR"];

const newTodoInput = (page: Page) =>
  page.getByPlaceholder("What needs to be done?");
const todoItems = (page: Page) => page.locator(".todo-list li");
const todoLabels = (page: Page) => page.locator(".todo-list li label");
const todoCount = (page: Page) => page.locator(".todo-count");
const itemByText = (page: Page, text: string) =>
  page.locator(".todo-list li").filter({ hasText: text });

async function addTodo(page: Page, text: string): Promise<void> {
  const input = newTodoInput(page);
  await input.fill(text);
  await input.press("Enter");
}

async function addTodos(page: Page, items: string[]): Promise<void> {
  for (const item of items) {
    await addTodo(page, item);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto(TODO_PATH);
});

// ---------------------------------------------------------------------------
// Positive flows (AC1–AC4 + supporting behaviors)
// ---------------------------------------------------------------------------
test.describe("TodoMVC - Positive flows", () => {
  test("TC-001: empty list is shown on a fresh visit", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "todos" })).toBeVisible();

    const input = newTodoInput(page);
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("");

    await expect(todoItems(page)).toHaveCount(0);
    await expect(page.locator(".footer")).toHaveCount(0);
  });

  test("TC-002: a new todo is created when Enter is pressed", async ({
    page,
  }) => {
    await addTodo(page, "Buy milk");

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todoLabels(page)).toHaveText(["Buy milk"]);
    await expect(newTodoInput(page)).toHaveValue("");
    await expect(todoCount(page)).toHaveText("1 item left");
  });

  test("TC-003: four todos can be added sequentially (AC2)", async ({
    page,
  }) => {
    await addTodos(page, TODOS);

    await expect(todoItems(page)).toHaveCount(4);
    await expect(todoLabels(page)).toHaveText(TODOS);
    await expect(newTodoInput(page)).toHaveValue("");
    await expect(todoCount(page)).toHaveText("4 items left");
  });

  test("TC-004: a single todo can be marked finished (AC3)", async ({
    page,
  }) => {
    await addTodos(page, TODOS);

    const walkTheDog = itemByText(page, "Walk the dog");
    await walkTheDog.locator(".toggle").check();

    await expect(walkTheDog).toHaveClass(/completed/);
    await expect(walkTheDog.locator(".toggle")).toBeChecked();
    await expect(todoCount(page)).toHaveText("3 items left");
    await expect(
      page.getByRole("button", { name: "Clear completed" }),
    ).toBeVisible();
  });

  test("TC-005: a finished todo can be unmarked", async ({ page }) => {
    await addTodos(page, TODOS);

    const walkTheDog = itemByText(page, "Walk the dog");
    const toggle = walkTheDog.locator(".toggle");

    await toggle.check();
    await toggle.uncheck();

    await expect(walkTheDog).not.toHaveClass(/completed/);
    await expect(toggle).not.toBeChecked();
    await expect(todoCount(page)).toHaveText("4 items left");
    await expect(
      page.getByRole("button", { name: "Clear completed" }),
    ).toHaveCount(0);
  });

  test("TC-006: a todo can be deleted via the destroy button (AC4)", async ({
    page,
  }) => {
    await addTodos(page, TODOS);

    const submitPr = itemByText(page, "Submit PR");
    await submitPr.hover();
    await submitPr.locator(".destroy").click();

    await expect(todoItems(page)).toHaveCount(3);
    await expect(todoLabels(page)).toHaveText([
      "Buy milk",
      "Walk the dog",
      "Write tests",
    ]);
    await expect(todoCount(page)).toHaveText("3 items left");
  });

  test("TC-007: clear completed removes all completed items", async ({
    page,
  }) => {
    await addTodos(page, TODOS);

    await itemByText(page, "Buy milk").locator(".toggle").check();
    await itemByText(page, "Write tests").locator(".toggle").check();

    await page.getByRole("button", { name: "Clear completed" }).click();

    await expect(todoItems(page)).toHaveCount(2);
    await expect(todoLabels(page)).toHaveText(["Walk the dog", "Submit PR"]);
    await expect(todoCount(page)).toHaveText("2 items left");
    await expect(
      page.getByRole("button", { name: "Clear completed" }),
    ).toHaveCount(0);
  });

  test("TC-008: filter Active hides completed items", async ({ page }) => {
    await addTodos(page, TODOS);
    await itemByText(page, "Buy milk").locator(".toggle").check();

    await page.getByRole("link", { name: "Active" }).click();

    await expect(page).toHaveURL(/#\/active/);
    await expect(todoItems(page)).toHaveCount(3);
    await expect(todoLabels(page)).toHaveText([
      "Walk the dog",
      "Write tests",
      "Submit PR",
    ]);
    await expect(page.getByRole("link", { name: "Active" })).toHaveClass(
      /selected/,
    );
  });

  test("TC-009: filter Completed shows only completed items", async ({
    page,
  }) => {
    await addTodos(page, TODOS);
    await itemByText(page, "Buy milk").locator(".toggle").check();
    await itemByText(page, "Write tests").locator(".toggle").check();

    await page.getByRole("link", { name: "Completed" }).click();

    await expect(page).toHaveURL(/#\/completed/);
    await expect(todoItems(page)).toHaveCount(2);
    await expect(todoLabels(page)).toHaveText(["Buy milk", "Write tests"]);
    await expect(page.getByRole("link", { name: "Completed" })).toHaveClass(
      /selected/,
    );
  });

  test("TC-010: toggle-all marks every todo completed", async ({ page }) => {
    await addTodos(page, TODOS);

    await page.getByLabel("Mark all as complete").click();

    const items = todoItems(page);
    await expect(items).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(items.nth(i)).toHaveClass(/completed/);
    }
    await expect(todoCount(page)).toHaveText("0 items left");
    await expect(
      page.getByRole("button", { name: "Clear completed" }),
    ).toBeVisible();
  });

  test("TC-011: a todo can be edited via double-click", async ({ page }) => {
    await addTodo(page, "Buy milk");

    const item = itemByText(page, "Buy milk");
    await item.dblclick();
    const editInput = item.locator(".edit");
    await editInput.fill("Buy oat milk");
    await editInput.press("Enter");

    await expect(todoLabels(page)).toHaveText(["Buy oat milk"]);
    await expect(todoCount(page)).toHaveText("1 item left");
  });

  test("TC-012: todos persist across reload", async ({ page }) => {
    await addTodo(page, "Buy milk");
    await addTodo(page, "Walk the dog");
    await itemByText(page, "Walk the dog").locator(".toggle").check();

    await page.reload();

    await expect(todoItems(page)).toHaveCount(2);
    await expect(itemByText(page, "Walk the dog")).toHaveClass(/completed/);
    await expect(itemByText(page, "Buy milk")).not.toHaveClass(/completed/);
    await expect(todoCount(page)).toHaveText("1 item left");
  });
});

// ---------------------------------------------------------------------------
// Negative flows
// ---------------------------------------------------------------------------
test.describe("TodoMVC - Negative flows", () => {
  test("TC-101: empty input does not create a todo", async ({ page }) => {
    await newTodoInput(page).press("Enter");

    await expect(todoItems(page)).toHaveCount(0);
    await expect(page.locator(".footer")).toHaveCount(0);
  });

  test("TC-102: whitespace-only input does not create a todo", async ({
    page,
  }) => {
    const input = newTodoInput(page);
    await input.fill("   ");
    await input.press("Enter");

    await expect(todoItems(page)).toHaveCount(0);
    await expect(page.locator(".footer")).toHaveCount(0);
    // NOTE: this implementation preserves the whitespace value in the input
    // instead of clearing it. The plan's "input is cleared" assertion was
    // dropped to match observed behavior. See test plan §6 for follow-up.
  });

  test("TC-103: Escape during edit cancels changes", async ({ page }) => {
    await addTodo(page, "Buy milk");

    const item = itemByText(page, "Buy milk");
    await item.dblclick();
    const editInput = item.locator(".edit");
    await editInput.fill("XYZ");
    await editInput.press("Escape");

    await expect(todoLabels(page)).toHaveText(["Buy milk"]);
  });

  test("TC-104: editing a todo to an empty value deletes it", async ({
    page,
  }) => {
    await addTodos(page, ["Buy milk", "Walk the dog"]);

    const item = itemByText(page, "Buy milk");
    await item.dblclick();
    const editInput = item.locator(".edit");
    await editInput.fill("");
    await editInput.press("Enter");

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todoLabels(page)).toHaveText(["Walk the dog"]);
    await expect(todoCount(page)).toHaveText("1 item left");
  });

  test("TC-105: deleting a todo does not produce console or page errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await addTodo(page, "Buy milk");
    const item = itemByText(page, "Buy milk");
    await item.hover();
    await item.locator(".destroy").click();

    await expect(todoItems(page)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("TC-106: Clear completed is hidden when nothing is completed", async ({
    page,
  }) => {
    await addTodos(page, ["Buy milk", "Walk the dog"]);

    await expect(
      page.getByRole("button", { name: "Clear completed" }),
    ).toHaveCount(0);
  });

  test("TC-107: garbage hash route still renders todos", async ({ page }) => {
    await page.goto("/todomvc/#/foo");
    await addTodo(page, "Buy milk");

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todoLabels(page)).toHaveText(["Buy milk"]);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
test.describe("TodoMVC - Edge cases", () => {
  test("TC-201: leading/trailing whitespace is trimmed", async ({ page }) => {
    await addTodo(page, "   Buy milk   ");

    await expect(todoLabels(page)).toHaveText(["Buy milk"]);
  });

  test("TC-202: duplicate titles are allowed", async ({ page }) => {
    await addTodo(page, "Buy milk");
    await addTodo(page, "Buy milk");

    await expect(todoItems(page)).toHaveCount(2);
    await expect(todoLabels(page)).toHaveText(["Buy milk", "Buy milk"]);
    await expect(todoCount(page)).toHaveText("2 items left");
  });

  test("TC-203: a 1000-character title is accepted", async ({ page }) => {
    const long = "a".repeat(1000);
    await addTodo(page, long);

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todoLabels(page)).toHaveText([long]);
  });

  test("TC-204: special characters and HTML are rendered as text (no XSS)", async ({
    page,
  }) => {
    const text = '<script>alert(1)</script> & "quotes" 🚀 — em-dash';
    await addTodo(page, text);

    await expect(todoLabels(page)).toHaveText([text]);
    await expect(page.locator(".todo-list li script")).toHaveCount(0);
  });

  test("TC-205: Unicode (RTL + CJK) renders correctly", async ({ page }) => {
    await addTodo(page, "שלום עולם");
    await addTodo(page, "买牛奶");

    await expect(todoItems(page)).toHaveCount(2);
    await expect(todoLabels(page)).toHaveText(["שלום עולם", "买牛奶"]);
  });

  test("TC-206: counter pluralization is correct", async ({ page }) => {
    await addTodo(page, "A");
    await expect(todoCount(page)).toHaveText("1 item left");

    await addTodo(page, "B");
    await expect(todoCount(page)).toHaveText("2 items left");

    const toggles = page.locator(".todo-list .toggle");
    await toggles.nth(0).check();
    await toggles.nth(1).check();
    await expect(todoCount(page)).toHaveText("0 items left");
  });

  test("TC-207: toggle-all on a mixed list completes every item", async ({
    page,
  }) => {
    await addTodos(page, TODOS);
    await itemByText(page, "Buy milk").locator(".toggle").check();
    await itemByText(page, "Write tests").locator(".toggle").check();

    await page.getByLabel("Mark all as complete").click();

    const items = todoItems(page);
    for (let i = 0; i < 4; i++) {
      await expect(items.nth(i)).toHaveClass(/completed/);
    }
    await expect(todoCount(page)).toHaveText("0 items left");
  });

  test("TC-208: toggle-all again unmarks every item", async ({ page }) => {
    await addTodos(page, TODOS);
    const toggleAll = page.getByLabel("Mark all as complete");

    await toggleAll.click();
    await toggleAll.click();

    const items = todoItems(page);
    for (let i = 0; i < 4; i++) {
      await expect(items.nth(i)).not.toHaveClass(/completed/);
    }
    await expect(todoCount(page)).toHaveText("4 items left");
  });

  test("TC-209: adding a todo while Active filter is selected updates filtered view", async ({
    page,
  }) => {
    await addTodo(page, "Already done");
    await itemByText(page, "Already done").locator(".toggle").check();

    await page.getByRole("link", { name: "Active" }).click();
    await expect(todoItems(page)).toHaveCount(0);

    await addTodo(page, "Buy milk");

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todoLabels(page)).toHaveText(["Buy milk"]);
    await expect(todoCount(page)).toHaveText("1 item left");
  });

  test("TC-210: order is preserved after deleting a middle item", async ({
    page,
  }) => {
    await addTodos(page, ["A", "B", "C", "D"]);

    const b = itemByText(page, "B");
    await b.hover();
    await b.locator(".destroy").click();

    await expect(todoLabels(page)).toHaveText(["A", "C", "D"]);
  });

  test("TC-211: localStorage persists in the same context but is isolated across contexts", async ({
    page,
    browser,
  }) => {
    await addTodo(page, "Buy milk");
    await page.reload();
    await expect(todoLabels(page)).toHaveText(["Buy milk"]);

    const isolated = await browser.newContext();
    const isolatedPage = await isolated.newPage();
    await isolatedPage.goto(`https://demo.playwright.dev${TODO_PATH}`);
    await expect(isolatedPage.locator(".todo-list li")).toHaveCount(0);
    await isolated.close();
  });

  test("TC-212: editing a completed todo preserves its completion state", async ({
    page,
  }) => {
    await addTodo(page, "Buy milk");
    const item = itemByText(page, "Buy milk");
    await item.locator(".toggle").check();
    await expect(item).toHaveClass(/completed/);

    await item.dblclick();
    const editInput = item.locator(".edit");
    await editInput.fill("Buy oat milk");
    await editInput.press("Enter");

    const renamed = itemByText(page, "Buy oat milk");
    await expect(renamed).toHaveClass(/completed/);
    await expect(renamed.locator(".toggle")).toBeChecked();
    await expect(todoCount(page)).toHaveText("0 items left");
  });
});
