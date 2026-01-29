import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTask from "./components/AddTask";

describe("AddTask", () => {
  test("renders labeled input and Add button with aria-label", () => {
    render(<AddTask onAddTask={jest.fn()} />);

    expect(screen.getByLabelText(/add a task/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
  });

  test("typing updates input value", async () => {
    const user = userEvent.setup();
    render(<AddTask onAddTask={jest.fn()} />);

    const input = screen.getByLabelText(/add a task/i);
    await user.type(input, "Buy groceries");
    expect(input).toHaveValue("Buy groceries");
  });

  test("submit via button calls onAddTask with trimmed value and clears input", async () => {
    const user = userEvent.setup();
    const onAddTask = jest.fn();
    render(<AddTask onAddTask={onAddTask} />);

    const input = screen.getByLabelText(/add a task/i);
    await user.type(input, "   Walk dog   ");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(onAddTask).toHaveBeenCalledTimes(1);
    expect(onAddTask).toHaveBeenCalledWith("Walk dog");
    expect(input).toHaveValue("");
  });

  test("submit via Enter (form submit) calls onAddTask and clears input", async () => {
    const user = userEvent.setup();
    const onAddTask = jest.fn();
    render(<AddTask onAddTask={onAddTask} />);

    const input = screen.getByLabelText(/add a task/i);
    await user.type(input, "Enter add{enter}");

    expect(onAddTask).toHaveBeenCalledWith("Enter add");
    expect(input).toHaveValue("");
  });

  test("does not submit when input is empty or whitespace-only", async () => {
    const user = userEvent.setup();
    const onAddTask = jest.fn();
    render(<AddTask onAddTask={onAddTask} />);

    const input = screen.getByLabelText(/add a task/i);

    // Empty submit
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(onAddTask).not.toHaveBeenCalled();

    // Whitespace submit
    await user.type(input, "    ");
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(onAddTask).not.toHaveBeenCalled();
  });

  test("allows duplicate task names (delegated to parent) and clears each time", async () => {
    const user = userEvent.setup();
    const onAddTask = jest.fn();
    render(<AddTask onAddTask={onAddTask} />);

    const input = screen.getByLabelText(/add a task/i);

    await user.type(input, "Same{enter}");
    await user.type(input, "Same{enter}");

    expect(onAddTask).toHaveBeenCalledTimes(2);
    expect(onAddTask.mock.calls[0][0]).toBe("Same");
    expect(onAddTask.mock.calls[1][0]).toBe("Same");
    expect(input).toHaveValue("");
  });
});
