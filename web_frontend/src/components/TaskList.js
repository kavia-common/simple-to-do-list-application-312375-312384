import React from "react";
import TaskItem from "./TaskItem";

/**
 * TaskList renders tasks in an accessible list.
 */
// PUBLIC_INTERFACE
export default function TaskList({ tasks, onToggle, onDelete, onEdit }) {
  return (
    <ul className="taskList" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
          onEdit={(nextText) => onEdit(task.id, nextText)}
        />
      ))}
    </ul>
  );
}
