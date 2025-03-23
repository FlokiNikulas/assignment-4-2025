import { test, expect } from "@playwright/test";

function createUniqueTodo(browserName, label) {
  return `TODO for ${browserName} ${label} ${Math.random().toString(36).slice(2, 10)}`;
}

async function getTodoCount(page, _browserName, label) {
  await page.waitForTimeout(500);
  const items = page.locator("ul > li span[data-testid='todo-text']").filter({ hasText: label });
  return await items.count();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  await page.evaluate(async () => {
    const res = await fetch("/api/todos");
    const todos = await res.json();
    await Promise.all(
      todos.map(todo => fetch(`/api/todos?id=${todo.id}`, { method: "DELETE" }))
    );
    await new Promise(resolve => setTimeout(resolve, 500));
  });
});

test.afterEach(async ({ page }) => {
  await page.evaluate(async () => {
    const res = await fetch("/api/todos");
    const todos = await res.json();
    await Promise.all(
      todos.map(todo => fetch(`/api/todos?id=${todo.id}`, { method: "DELETE" }))
    );
    await new Promise(resolve => setTimeout(resolve, 300));
  });
});

test("initial state should have no TODOs", async ({ page, browserName }, testInfo) => {
  const total = await getTodoCount(page, browserName, testInfo.title);
  expect(total).toBe(0);
});

test("can add a new TODO entry", async ({ page, browserName }, testInfo) => {
  const todoText = createUniqueTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", todoText);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await expect(page.locator("ul > li span").filter({ hasText: todoText })).toHaveCount(1);
  expect(await getTodoCount(page, browserName, testInfo.title)).toBe(1);
});

test("can add multiple TODOs", async ({ page, browserName }, testInfo) => {
  const task1 = createUniqueTodo(browserName, testInfo.title);
  const task2 = createUniqueTodo(browserName, testInfo.title);

  for (const task of [task1, task2]) {
    await page.fill("input[type='text']", task);
    await page.locator("button:text('Add ✨')").click({ force: true });
  }

  await expect(page.locator("ul > li span").filter({ hasText: task1 })).toHaveCount(1);
  await expect(page.locator("ul > li span").filter({ hasText: task2 })).toHaveCount(1);
  expect(await getTodoCount(page, browserName, testInfo.title)).toBe(2);
});

test("can remove a TODO item", async ({ page, browserName }, testInfo) => {
  const first = createUniqueTodo(browserName, testInfo.title);
  const second = createUniqueTodo(browserName, testInfo.title);

  for (const task of [first, second]) {
    await page.fill("input[type='text']", task);
    await page.locator("button:text('Add ✨')").click({ force: true });
  }

  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: first })).toHaveCount(1);
  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: second })).toHaveCount(1);

  const itemToDelete = page.locator("ul > li").filter({
    has: page.locator("span[data-testid='todo-text']", { hasText: first }),
  }).first();

  await itemToDelete.locator("button[data-testid='delete-btn']").click({ force: true });

  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: first })).toHaveCount(0);
  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: second })).toHaveCount(1);
  expect(await getTodoCount(page, browserName, testInfo.title)).toBe(1);
});

test("should display correct page title", async ({ page }) => {
  await expect(page.title()).resolves.toMatch("TODO 📃");
});
