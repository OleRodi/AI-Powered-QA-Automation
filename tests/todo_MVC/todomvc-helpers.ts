import { Page } from "@playwright/test";

export const TODO_PATH = "/todomvc/#/";

export const TODOS = [
  "Buy milk",
  "Walk the dog",
  "Write tests",
  "Submit PR",
];

export const newTodoInput = (page: Page) =>
  page.getByPlaceholder("What needs to be done?");

export const todoItems = (page: Page) => page.locator(".todo-list li");

export const todoLabels = (page: Page) =>
  page.locator(".todo-list li label");

export const todoCount = (page: Page) => page.locator(".todo-count");

export const itemByText = (page: Page, text: string) =>
  page.locator(".todo-list li").filter({ hasText: text });

export async function addTodo(page: Page, text: string): Promise<void> {
  const input = newTodoInput(page);
  await input.fill(text);
  await input.press("Enter");
}

export async function addTodos(page: Page, items: string[]): Promise<void> {
  for (const item of items) {
    await addTodo(page, item);
  }
}
