import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../pages/index";
import { server } from "./setupMSW";
import { http, HttpResponse } from "msw";


describe("Todo List", () => {
  afterEach(() => {
    cleanup(); // 🧑‍🏫 Clean up the DOM after each test
  });

  // 🧑‍🏫 Example test
  it("should show todos when page is loaded", async () => {
    render(<Home />);

    const todo1 = await screen.findByText("Learn Testing"); // 🧑‍🏫 These are defined in __tests__/mocks/handlers.ts
    const todo2 = await screen.findByText("Write Tests");

    expect(todo1).toBeDefined();
    expect(todo2).toBeDefined();
    expect(
      todo2.parentElement?.querySelector('input[type="checkbox"]')
    ).toBeDefined();
  });


  it("should display loading state when API response is incorrect", async () => {
    server.use(
      http.get("/api/todos", async () => {
        return HttpResponse.json({ error: "Internal Server Error" }, { status: 500 });
      })
    );
  
    render(<Home />);
  
    expect(screen.queryByText("Learn Testing")).toBeNull();
    expect(screen.queryByText("Write Tests")).toBeNull();
  });
  
  

  it("should have two items in the list when the component is loaded", async () => {
    render(<Home />);
  
    const todos = await screen.findAllByRole("listitem");
    
    expect(todos).toHaveLength(2);
  });
  

  it("should add a new todo item", async () => {
    render(<Home />);

    const input = screen.getByPlaceholderText("Add a new todo...");
    const addButton = screen.getByText(/add/i);
  
    await userEvent.type(input, "New Task");
    await userEvent.click(addButton);
  
    await waitFor(() => {
      expect(screen.getByText("New Task")).toBeDefined();
    });
  });
  

  it("should remove an item from the list", async () => {
    render(<Home />);
  
    const todo = await screen.findByText("Write Tests");
    expect(todo).toBeDefined();
  
    const deleteButton = todo.parentElement?.querySelector("button");
    expect(deleteButton).toBeDefined();
  
    await userEvent.click(deleteButton!);
  
    await waitFor(() => {
      expect(screen.queryByText("Write Tests")).toBeNull();
    });
  });  

});
