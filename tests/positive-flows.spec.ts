import { test, expect } from "@playwright/test";
import {
  TODO_PATH,
  TODOS,
  addTodo,
  addTodos,
  itemByText,
  newTodoInput,
  todoCount,
  todoItems,
  todoLabels,
} from "./todomvc-helpers";

test.beforeEach(async ({ page }) => {
  await page.goto(TODO_PATH);
});

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
