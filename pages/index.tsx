import { useState, useEffect } from "react";
import type { Todo } from "../types/todo";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo }),
    });
    setNewTodo("");
    await fetchTodos();
  };

  const toggleTodo = async (id: string) => {
    await fetch(`/api/todos?id=${id}`, { method: "PUT" });
    await fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    await fetchTodos();
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-4xl font-bold row-start-1">✨ TODO 📃 App ✨</h1>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={addTodo} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Add ✨
          </button>
        </form>

        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5"
              />
              <span
                data-testid="todo-text"
                className={`flex-1 ${todo.completed ? "line-through text-gray-500" : ""}`}
              >
                {todo.text}
              </span>
              <button 
                data-testid="delete-btn"
                onClick={() => deleteTodo(todo.id)} 
                className="text-red-500 hover:text-red-600"
              >
                Delete 🗑️
              </button>
            </li>
          ))}
        </ul>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
          Powered by 👩‍🏫 with 💖
        </a>
      </footer>
    </div>
  );
}
