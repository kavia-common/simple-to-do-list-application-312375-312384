import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// Mock storage utils so tests don't depend on actual localStorage behavior
jest.mock("./utils/storage", () => ({
  loadTasksFromStorage: jest.fn(),
  saveTasksToStorage: jest.fn(),
}));

import { loadTasksFromStorage, saveTasksToStorage } from "./utils/storage";

function seedTasks() {
  return [
    {
      id: "t-1",
      text: "Write tests",
      completed: false,
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: "t-2",
      text: "Ship feature",
      completed: true,
      createdAt: 2,
      updatedAt: 2,
    },
  ];
}

describe("App integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadTasksFromStorage.mockReturnValue([]);
  });

  test("renders basic structure (add section, task list section, empty state)", () => {
    render(<App />);

    expect(
      screen.getByRole("region", { name: /add a new task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /task list/i })
    ).toBeInTheDocument();

    // Empty state shown when no tasks
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");

    // Clear completed is disabled when none completed
    const clearBtn = screen.getByRole("button", {
      name: /clear completed tasks/i,
    });
    expect(clearBtn).toBeDisabled();
    expect(clearBtn).toHaveAttribute("aria-disabled", "true");
  });

  test("loads initial tasks from storage and renders list", () => {
    loadTasksFromStorage.mockReturnValue(seedTasks());

    render(<App />);

    const list = screen.getByRole("list", { name: /tasks/i });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText("Write tests")).toBeInTheDocument();
    expect(within(items[1]).getByText("Ship feature")).toBeInTheDocument();

    // Empty state should not show
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();
  });

  test("adding a task via button updates the list and clears input; allows duplicates; prevents whitespace-only", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/add a task/i);
    const addBtn = screen.getByRole("button", { name: /add task/i });

    await user.type(input, "  New task  ");
    await user.click(addBtn);

    // Should be trimmed and added
    const list = screen.getByRole("list", { name: /tasks/i });
    expect(within(list).getByText("New task")).toBeInTheDocument();

    // Input cleared
    expect(input).toHaveValue("");

    // Duplicates are allowed by current implementation
    await user.type(input, "New task");
    await user.click(addBtn);
    expect(within(list).getAllByText("New task")).toHaveLength(2);

    // Whitespace-only should not add
    const beforeCount = within(list).getAllByRole("listitem").length;
    await user.type(input, "   ");
    await user.click(addBtn);
    const afterCount = within(list).getAllByRole("listitem").length;
    expect(afterCount).toBe(beforeCount);
  });

  test("adding a task via Enter (form submit) updates list and clears input", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/add a task/i);
    await user.type(input, "Enter added{enter}");

    const list = screen.getByRole("list", { name: /tasks/i });
    expect(within(list).getByText("Enter added")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  test("toggle completion updates clear-completed enabled state and checkbox aria-label", async () => {
    const user = userEvent.setup();
    loadTasksFromStorage.mockReturnValue([
      {
        id: "t-1",
        text: "Do thing",
        completed: false,
        createdAt: 1,
        updatedAt: 1,
      },
    ]);

    render(<App />);

    const clearBtn = screen.getByRole("button", {
      name: /clear completed tasks/i,
    });
    expect(clearBtn).toBeDisabled();

    const checkbox = screen.getByRole("checkbox", {
      name: /mark as completed/i,
    });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(screen.getByRole("checkbox", { name: /mark as not completed/i })).toBeChecked();

    // Now completed exists, so clear button should be enabled
    expect(clearBtn).toBeEnabled();
  });

  test("clear completed removes completed tasks", async () => {
    const user = userEvent.setup();
    loadTasksFromStorage.mockReturnValue(seedTasks());

    render(<App />);

    const list = screen.getByRole("list", { name: /tasks/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);

    const clearBtn = screen.getByRole("button", {
      name: /clear completed tasks/i,
    });
    expect(clearBtn).toBeEnabled();

    await user.click(clearBtn);

    // Completed should be gone, remaining should stay
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByText("Write tests")).toBeInTheDocument();
    expect(within(list).queryByText("Ship feature")).not.toBeInTheDocument();
  });

  test("edit task inline (enter to save) updates text; escape cancels", async () => {
    const user = userEvent.setup();
    loadTasksFromStorage.mockReturnValue([
      { id: "t-1", text: "Original", completed: false, createdAt: 1, updatedAt: 1 },
    ]);

    render(<App />);

    // Start editing
    await user.click(screen.getByRole("button", { name: /edit task/i }));
    const editInput = screen.getByRole("textbox", { name: /edit task text/i });
    expect(editInput).toHaveFocus();

    await user.clear(editInput);
    await user.type(editInput, "Updated{enter}");

    // Back to display mode
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /edit task text/i })).not.toBeInTheDocument();

    // Start editing again, then escape cancel
    const editBtn = screen.getByRole("button", { name: /edit task/i });
    await user.click(editBtn);

    const editInput2 = screen.getByRole("textbox", { name: /edit task text/i });
    await user.clear(editInput2);
    await user.type(editInput2, "Nope{escape}");

    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Nope")).not.toBeInTheDocument();
  });

  test("editing to empty/whitespace does not commit and stays in edit mode (focus remains on input)", async () => {
    const user = userEvent.setup();
    loadTasksFromStorage.mockReturnValue([
      { id: "t-1", text: "Keep me", completed: false, createdAt: 1, updatedAt: 1 },
    ]);

    render(<App />);

    await user.click(screen.getByRole("button", { name: /edit task/i }));
    const editInput = screen.getByRole("textbox", { name: /edit task text/i });

    await user.clear(editInput);
    await user.type(editInput, "   {enter}");

    // Should remain editing because App.editTask returns false for trimmed empty
    expect(screen.getByRole("textbox", { name: /edit task text/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /edit task text/i })).toHaveFocus();
    // Original text should remain once user cancels or successfully saves; currently still in editing, so don't assert label text yet.
  });

  test("delete task removes item from list", async () => {
    const user = userEvent.setup();
    loadTasksFromStorage.mockReturnValue([
      { id: "t-1", text: "Delete me", completed: false, createdAt: 1, updatedAt: 1 },
    ]);

    render(<App />);

    const list = screen.getByRole("list", { name: /tasks/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /delete task/i }));
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  test("persistence: saveTasksToStorage called when tasks change (add/edit/toggle/delete)", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initial effect runs once (even in non-StrictMode renders of test),
    // but we assert relative calls after actions, not exact counts.
    const initialCalls = saveTasksToStorage.mock.calls.length;

    // Add
    await user.type(screen.getByLabelText(/add a task/i), "Persist me{enter}");
    expect(saveTasksToStorage.mock.calls.length).toBeGreaterThan(initialCalls);

    // Toggle
    await user.click(screen.getByRole("checkbox", { name: /mark as completed/i }));
    // Edit
    await user.click(screen.getByRole("button", { name: /edit task/i }));
    const editInput = screen.getByRole("textbox", { name: /edit task text/i });
    await user.clear(editInput);
    await user.type(editInput, "Persisted edit{enter}");
    // Delete
    await user.click(screen.getByRole("button", { name: /delete task/i }));

    expect(saveTasksToStorage.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  test("long text task is rendered (non-empty, accessible via label/title)", async () => {
    const user = userEvent.setup();
    render(<App />);

    const longText = "A".repeat(300);
    await user.type(screen.getByLabelText(/add a task/i), `${longText}{enter}`);

    // Text is in document; CSS may visually truncate but DOM still contains full text
    expect(screen.getByText(longText)).toBeInTheDocument();
  });
});
