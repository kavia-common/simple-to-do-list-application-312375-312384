import React, { useId, useState } from "react";

/**
 * AddTask renders a labeled input and submit button for creating new tasks.
 */
// PUBLIC_INTERFACE
export default function AddTask({ onAddTask }) {
  const inputId = useId();
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setText("");
  };

  return (
    <form className="addTask" onSubmit={submit}>
      <div className="addTaskField">
        <label className="label" htmlFor={inputId}>
          Add a task
        </label>
        <input
          id={inputId}
          className="input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Buy groceries"
          autoComplete="off"
        />
      </div>

      <button type="submit" className="btn btnPrimary" aria-label="Add task">
        Add
      </button>
    </form>
  );
}
