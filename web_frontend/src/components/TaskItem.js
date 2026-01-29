import React, { useEffect, useId, useRef, useState } from "react";

/**
 * TaskItem renders one task with completion toggle, inline editing, and delete action.
 */
// PUBLIC_INTERFACE
export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const checkboxId = useId();
  const editInputId = useId();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);

  const inputRef = useRef(null);
  const editBtnRef = useRef(null);

  // Keep draft in sync if external edits happen
  useEffect(() => {
    setDraft(task.text);
  }, [task.text]);

  // Focus the text input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => setIsEditing(true);

  const cancelEditing = () => {
    setDraft(task.text);
    setIsEditing(false);
    // Return focus to edit button for keyboard users
    editBtnRef.current?.focus();
  };

  const commitEditing = () => {
    const ok = onEdit(draft);
    if (ok) {
      setIsEditing(false);
      editBtnRef.current?.focus();
    } else {
      // If invalid (empty), keep editing and focus input
      inputRef.current?.focus();
    }
  };

  const onEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEditing();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <li className={`taskItem ${task.completed ? "isCompleted" : ""}`}>
      <div className="taskLeft">
        <input
          id={checkboxId}
          className="checkbox"
          type="checkbox"
          checked={task.completed}
          onChange={onToggle}
          aria-label={task.completed ? "Mark as not completed" : "Mark as completed"}
        />

        {!isEditing ? (
          <label className="taskText" htmlFor={checkboxId} title={task.text}>
            {task.text}
          </label>
        ) : (
          <div className="editWrap">
            <label className="srOnly" htmlFor={editInputId}>
              Edit task text
            </label>
            <input
              id={editInputId}
              ref={inputRef}
              className="input inputInline"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onEditKeyDown}
              aria-label="Edit task text"
            />
            <div className="editActions">
              <button
                type="button"
                className="btn btnSmall btnPrimary"
                onClick={commitEditing}
                aria-label="Save edit"
              >
                Save
              </button>
              <button
                type="button"
                className="btn btnSmall btnSecondary"
                onClick={cancelEditing}
                aria-label="Cancel edit"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="taskRight">
          <button
            type="button"
            className="iconBtn"
            onClick={startEditing}
            aria-label="Edit task"
            ref={editBtnRef}
          >
            Edit
          </button>
          <button
            type="button"
            className="iconBtn iconBtnDanger"
            onClick={onDelete}
            aria-label="Delete task"
          >
            Delete
          </button>
        </div>
      ) : null}
    </li>
  );
}
