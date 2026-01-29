import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskList from "./components/TaskList";

function tasksFixture() {
  return [
    { id: "a", text: "First", completed: false },
    { id: "b", text: "Second", completed: true },
  ];
}

describe("TaskList", () => {
  test("renders an accessible list with correct number of items", () => {
    render(
      <TaskList tasks={tasksFixture()} onToggle={jest.fn()} onDelete={jest.fn()} onEdit={jest.fn()} />
    );

    const list = screen.getByRole("list", { name: /tasks/i });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText("First")).toBeInTheDocument();
    expect(within(items[1]).getByText("Second")).toBeInTheDocument();
  });

  test("wires handlers correctly (toggle/delete/edit receive task id)", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const onEdit = jest.fn().mockReturnValue(true);

    render(
      <TaskList tasks={tasksFixture()} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    );

    // Toggle first
    await user.click(screen.getAllByRole("checkbox")[0]);
    expect(onToggle).toHaveBeenCalledWith("a");

    // Delete second
    await user.click(screen.getAllByRole("button", { name: /delete task/i })[1]);
    expect(onDelete).toHaveBeenCalledWith("b");

    // Edit first and save via Enter
    await user.click(screen.getAllByRole("button", { name: /edit task/i })[0]);
    const editInput = screen.getByRole("textbox", { name: /edit task text/i });
    await user.clear(editInput);
    await user.type(editInput, "Updated{enter}");

    expect(onEdit).toHaveBeenCalledWith("a", "Updated");
  });

  test("renders an empty list (no items) when tasks array is empty", () => {
    render(<TaskList tasks={[]} onToggle={jest.fn()} onDelete={jest.fn()} onEdit={jest.fn()} />);

    const list = screen.getByRole("list", { name: /tasks/i });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
  });
});
