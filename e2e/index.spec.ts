import { test, expect } from "@playwright/test";

function generateRandomTodo(browser: string, testLabel: string) {
  return `TODO for ${browser} ${testLabel} ${Math.random().toString(36).substring(2, 10)}`;
}

async function countTodos(page, _browser, testLabel) {
  await page.waitForTimeout(500);
  return await page.locator("ul > li span[data-testid='todo-text']")
    .filter({ hasText: testLabel })
    .count();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  await page.evaluate(async () => {
    const response = await fetch(`/api/todos`);
    const todos = await response.json();
    await Promise.all(
      todos.map((todo: any) =>
        fetch(`/api/todos?id=${todo.id}`, { method: "DELETE" })
      )
    );
    await new Promise((res) => setTimeout(res, 500));
  });
});

test.afterEach(async ({ page }) => {
  await page.evaluate(async () => {
    const response = await fetch(`/api/todos`);
    const todos = await response.json();
    await Promise.all(
      todos.map((todo: { id: any }) =>
        fetch(`/api/todos?id=${todo.id}`, { method: "DELETE" })
      )
    );
    await new Promise((res) => setTimeout(res, 300));
  });
});

test("should initialize with an empty TODO list", async ({ page, browserName }, testInfo) => {
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(0);
});

test("should allow adding a new TODO entry", async ({ page, browserName }, testInfo) => {
  const uniqueTodo = generateRandomTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", uniqueTodo);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await expect(page.locator(`ul > li span`).filter({ hasText: uniqueTodo })).toHaveCount(1);
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(1);
});

test("should support adding multiple TODO items", async ({ page, browserName }, testInfo) => {
  const firstTask = generateRandomTodo(browserName, testInfo.title);
  const secondTask = generateRandomTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", firstTask);
  await page.locator("button:text('Add ✨')").click({ force: true });
  await page.fill("input[type='text']", secondTask);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await expect(page.locator(`ul > li span`).filter({ hasText: firstTask })).toHaveCount(1);
  await expect(page.locator(`ul > li span`).filter({ hasText: secondTask })).toHaveCount(1);
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(2);
});

test("should enable removing a TODO item", async ({ page, browserName }, testInfo) => {
  const taskOne = generateRandomTodo(browserName, testInfo.title);
  const taskTwo = generateRandomTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", taskOne);
  await page.locator("button:text('Add ✨')").click({ force: true });
  await page.fill("input[type='text']", taskTwo);
  await page.locator("button:text('Add ✨')").click({ force: true });

  // Verify both tasks are added
  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: taskOne })).toHaveCount(1);
  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: taskTwo })).toHaveCount(1);

  // Select the correct todo item
  const todoItem = await page.locator("ul > li").filter({
    has: page.locator("span[data-testid='todo-text']", { hasText: taskOne })
  }).nth(0);

  await todoItem.locator("button[data-testid='delete-btn']").click({ force: true });
  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: taskOne })).toHaveCount(0);
  await expect(page.locator("span[data-testid='todo-text']").filter({ hasText: taskTwo })).toHaveCount(1);
  await expect(await countTodos(page, browserName, testInfo.title)).toBe(1);
});


test("should confirm correct title on the index page", async ({ page }) => {
  await expect(page.title()).resolves.toMatch("TODO 📃");
});