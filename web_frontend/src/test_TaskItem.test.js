import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskItem from "./components/TaskItem";

function makeTask(overrides = {}) {
  return {
    id: "t-1",
    text: "My task",
    completed: false,
    ...overrides,
  };
}

describe("TaskItem", () => {
  test("renders checkbox with correct aria-label and checked state", () => {
    render(
      <ul>
        <TaskItem
          task={makeTask({ completed: false })}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      </ul>
    );

    const checkbox = screen.getByRole("checkbox", { name: /mark as completed/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  test("calls onToggle when checkbox clicked", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    render(
      <ul>
        <TaskItem
          task={makeTask()}
          onToggle={onToggle}
          onDelete={jest.fn()}
          onEdit={jest.fn().mockReturnValue(true)}
        />
      </ul>
    );

    await user.click(screen.getByRole("checkbox", { name: /mark as completed/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test("renders Edit and Delete buttons when not editing", () => {
    render(
      <ul>
        <TaskItem
          task={makeTask()}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn().mockReturnValue(true)}
        />
      </ul>
    );

    expect(screen.getByRole("button", { name: /edit task/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete task/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save edit/i })).not.toBeInTheDocument();
  });

  test("delete calls onDelete", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    render(
      <ul>
        <TaskItem
          task={makeTask()}
          onToggle={jest.fn()}
          onDelete={onDelete}
          onEdit={jest.fn().mockReturnValue(true)}
        />
      </ul>
    );

    await user.click(screen.getByRole("button", { name: /delete task/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("clicking Edit enters edit mode, focuses edit input, hides Edit/Delete buttons", async () => {
    const user = userEvent.setup();

    render(
      <ul>
        <TaskItem
          task={makeTask({ text: "Edit me" })}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn().mockReturnValue(true)}
        />
      </ul>
    );

    await user.click(screen.getByRole("button", { name: /edit task/i }));

    const editInput = screen.getByRole("textbox", { name: /edit task text/i });
    expect(editInput).toBeInTheDocument();
    expect(editInput).toHaveFocus();

    // Edit/Delete controls should be hidden in edit mode
    expect(screen.queryByRole("button", { name: /edit task/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete task/i })).not.toBeInTheDocument();

    // Save/Cancel visible
    expect(screen.getByRole("button", { name: /save edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel edit/i })).toBeInTheDocument();
  });

  test("Escape cancels editing, restores draft text, and returns to view mode", async () => {
    const user = userEvent.setup();

    render(
      <ul>
        <TaskItem
          task={makeTask({ text: "Original text" })}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn().mockReturnValue(true)}
        />
      </ul>
    );

    await user.click(screen.getByRole("button", { name: /edit task/i }));

    const editInput = screen.getByRole("textbox", { name: /edit task text/i });
    await user.clear(editInput);
    await user.type(editInput, "Changed{escape}");

    // Back to view mode and shows original text again
    expect(screen.getByText("Original text")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /edit task text/i })).not.toBeInTheDocument();

    // Edit button is available again (focus behavior can be flaky in JSDOM across rerenders)
    expect(screen.getByRole("button", { name: /edit task/i })).toBeInTheDocument();
  });

  test("Enter commits editing by calling onEdit with draft; if ok then exits edit mode", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue(true);

    render(
      <ul>
        <TaskItem
          task={makeTask({ text: "Original" })}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={onEdit}
        />
      </ul>
    );

    await user.click(screen.getByRole("button", { name: /edit task/i }));
    const editInput = screen.getByRole("textbox", { name: /edit task text/i });

    await user.clear(editInput);
    await user.type(editInput, "Next{enter}");

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith("Next");

    // Exit edit mode
    expect(screen.queryByRole("textbox", { name: /edit task text/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit task/i })).toBeInTheDocument();
  });

  test("Save button commits editing; Cancel button cancels editing", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue(true);

    render(
      <ul>
        <TaskItem
          task={makeTask({ text: "Original" })}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={onEdit}
        />
      </ul>
    );

    await user.click(screen.getByRole("button", { name: /edit task/i }));
    const editInput = screen.getByRole("textbox", { name: /edit task text/i });

    await user.clear(editInput);
    await user.type(editInput, "Via Save");
    await user.click(screen.getByRole("button", { name: /save edit/i }));

    expect(onEdit).toHaveBeenCalledWith("Via Save");
    expect(screen.queryByRole("textbox", { name: /edit task text/i })).not.toBeInTheDocument();

    // Re-enter editing and cancel
    await user.click(screen.getByRole("button", { name: /edit task/i }));
    const editInput2 = screen.getByRole("textbox", { name: /edit task text/i });
    await user.clear(editInput2);
    await user.type(editInput2, "Nope");
    await user.click(screen.getByRole("button", { name: /cancel edit/i }));

    expect(onEdit).toHaveBeenCalledTimes(1); // no extra commits
    expect(screen.getByText("Original")).toBeInTheDocument();
  });

  test("if onEdit returns false (invalid), stays in edit mode and keeps focus on input", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn().mockReturnValue(false);

    render(
      <ul>
        <TaskItem
          task={makeTask({ text: "Stay editing" })}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={onEdit}
        />
      </ul>
    );

    await user.click(screen.getByRole("button", { name: /edit task/i }));
    const editInput = screen.getByRole("textbox", { name: /edit task text/i });

    await user.clear(editInput);
    await user.type(editInput, "   {enter}");

    // should still be editing
    expect(screen.getByRole("textbox", { name: /edit task text/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /edit task text/i })).toHaveFocus();
  });
});
