import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../pages/index";
import { server } from "./setupMSW";
import { http, HttpResponse } from "msw";

describe("Todo Application", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display todos when the page loads", async () => {
    render(<Home />);

    const firstTodo = await screen.findByText("Learn Testing");
    const secondTodo = await screen.findByText("Write Tests");

    expect(firstTodo).toBeDefined();
    expect(secondTodo).toBeDefined();
    expect(
      secondTodo.parentElement?.querySelector('input[type="checkbox"]')
    ).not.toBeNull();
  });

  it("should show a loading state when API response is incorrect", async () => {
    server.use(
      http.get("/api/todos", async () => {
        return HttpResponse.json({ error: "Internal Server Error" }, { status: 500 });
      })
    );

    render(<Home />);

    expect(screen.queryByText("Learn Testing")).toBeNull();
    expect(screen.queryByText("Write Tests")).toBeNull();
  });

  it("should render two items when loaded", async () => {
    render(<Home />);

    const todoItems = await screen.findAllByRole("listitem");

    expect(todoItems).toHaveLength(2);
  });

  it("should allow users to add a new task", async () => {
    render(<Home />);

    const inputField = screen.getByPlaceholderText("Add a new todo...");
    const submitButton = screen.getByText(/add/i);

    await userEvent.type(inputField, "New Task");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("New Task")).toBeDefined();
    });
  });

  it("should delete an existing todo item", async () => {
    render(<Home />);

    const targetTodo = await screen.findByText("Write Tests");
    expect(targetTodo).toBeDefined();

    const removeButton = targetTodo.parentElement?.querySelector("button");
    expect(removeButton).toBeDefined();

    await userEvent.click(removeButton!);

    await waitFor(() => {
      expect(screen.queryByText("Write Tests")).toBeNull();
    });
  });
});
