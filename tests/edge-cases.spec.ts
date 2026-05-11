import { test, expect } from "@playwright/test";
import {
  TODO_PATH,
  TODOS,
  addTodo,
  addTodos,
  itemByText,
  todoCount,
  todoItems,
  todoLabels,
} from "./todomvc-helpers";

test.beforeEach(async ({ page }) => {
  await page.goto(TODO_PATH);
});

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
