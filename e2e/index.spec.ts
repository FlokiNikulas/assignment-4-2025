import { test, expect } from "@playwright/test";

function generateUniqueTodo(browserName, testName) {
  return `TODO for ${browserName} ${testName} ${Math.random().toString(36).substring(2, 10)}`;
}

async function countTodosForBrowser(page, browserName, testName) {
  await page.waitForTimeout(100);
  const todos = await page.locator("ul > li span").allTextContents();
  return todos.filter(todo => todo.includes(browserName) && todo.includes(testName)).length;
}

test.beforeEach(async ({ page, browserName }, testInfo) => {
  await page.goto("/");

  await page.evaluate(async ({ browserName, testName }) => {
    const response = await fetch(`/api/todos`);
    const todos = await response.json();

    await Promise.all(
      todos
        .filter(todo => todo.text.includes(browserName) && todo.text.includes(testName))
        .map(todo => fetch(`/api/todos?id=${todo.id}`, { method: "DELETE" }))
    );
    await new Promise(resolve => setTimeout(resolve, 100));
  }, { browserName, testName: testInfo.title });
});

test("should start with an empty TODO list", async ({ page, browserName }, testInfo) => {
  await expect(countTodosForBrowser(page, browserName, testInfo.title)).resolves.toBe(0);
});

test("should add a new TODO item", async ({ page, browserName }, testInfo) => {
  const uniqueTodo = generateUniqueTodo(browserName, testInfo.title);
  await page.fill("input[type='text']", uniqueTodo);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await expect(page.locator("ul > li span").filter({ hasText: uniqueTodo })).toHaveCount(1);
  await expect(countTodosForBrowser(page, browserName, testInfo.title)).resolves.toBe(1);
});

test("should add a second TODO item", async ({ page, browserName }, testInfo) => {
  const [firstTodo, secondTodo] = [
    generateUniqueTodo(browserName, testInfo.title),
    generateUniqueTodo(browserName, testInfo.title)
  ];

  await page.fill("input[type='text']", firstTodo);
  await page.locator("button:text('Add ✨')").click({ force: true });
  await page.fill("input[type='text']", secondTodo);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await expect(page.locator("ul > li span").filter({ hasText: firstTodo })).toHaveCount(1);
  await expect(page.locator("ul > li span").filter({ hasText: secondTodo })).toHaveCount(1);
  await expect(countTodosForBrowser(page, browserName, testInfo.title)).resolves.toBe(2);
});

test("should remove a TODO item", async ({ page, browserName }, testInfo) => {
  const [firstTodo, secondTodo] = [
    generateUniqueTodo(browserName, testInfo.title),
    generateUniqueTodo(browserName, testInfo.title)
  ];

  await page.fill("input[type='text']", firstTodo);
  await page.locator("button:text('Add ✨')").click({ force: true });
  await page.fill("input[type='text']", secondTodo);
  await page.locator("button:text('Add ✨')").click({ force: true });

  await page.locator("ul > li").filter({ hasText: firstTodo }).locator("button").click({ force: true });

  await expect(page.locator("ul > li span").filter({ hasText: secondTodo })).toHaveCount(1);
  await expect(countTodosForBrowser(page, browserName, testInfo.title)).resolves.toBe(1);
});

test("should navigate to index page and have correct title", async ({ page }) => {
  await expect(page).toHaveTitle(/TODO 📃/);
});