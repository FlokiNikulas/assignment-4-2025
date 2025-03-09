import { http, HttpResponse } from "msw";
import type { Todo } from "../../types/todo";

const initialTodos: Todo[] = [
  { id: "1", text: "Learn Testing", completed: false },
  { id: "2", text: "Write Tests", completed: true },
];

let mockTodos = [...initialTodos];

export const resetTodos = () => {
  mockTodos = [...initialTodos];
};

export const handlers = [
  http.get("/api/todos", () => {
    return HttpResponse.json(mockTodos);
  }),

  http.post("/api/todos", async ({ request }) => {
    const newTodo: Omit<Todo, "id"> = await request.json();
    const createdTodo: Todo = { id: crypto.randomUUID(), ...newTodo };
    mockTodos.push(createdTodo);
    return HttpResponse.json(createdTodo, { status: 201 });
  }),

  http.put("/api/todos", async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return HttpResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    mockTodos = mockTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    return HttpResponse.json({ success: true });
  }),

  http.delete("/api/todos", ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return HttpResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    mockTodos = mockTodos.filter(todo => todo.id !== id);
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
