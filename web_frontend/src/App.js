import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";
import { loadTasksFromStorage, saveTasksToStorage } from "./utils/storage";

/**
 * Generates a reasonably-unique id without external dependencies.
 * Using crypto.randomUUID when available, falling back to time+random.
 */
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Main tasks state */
  const [tasks, setTasks] = useState(() => loadTasksFromStorage());

  /** Derived stats for UI */
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    return { total, completed, remaining: total - completed };
  }, [tasks]);

  /** Persist tasks to localStorage on every change */
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // PUBLIC_INTERFACE
  const addTask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setTasks((prev) => [
      {
        id: generateId(),
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      ...prev,
    ]);
  };

  // PUBLIC_INTERFACE
  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, updatedAt: Date.now() }
          : t
      )
    );
  };

  // PUBLIC_INTERFACE
  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // PUBLIC_INTERFACE
  const editTask = (taskId, nextText) => {
    const trimmed = nextText.trim();
    if (!trimmed) return false;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, text: trimmed, updatedAt: Date.now() } : t
      )
    );
    return true;
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  return (
    <div className="App">
      <main className="page">
        <header className="header">
          <div className="brand">
            <div className="brandMark" aria-hidden="true" />
            <div>
              <h1 className="title">To‑Do</h1>
              <p className="subtitle">
                {stats.total === 0
                  ? "Add your first task to get started."
                  : `${stats.remaining} remaining • ${stats.completed} completed`}
              </p>
            </div>
          </div>

          <div className="headerActions">
            <button
              type="button"
              className="btn btnSecondary"
              onClick={clearCompleted}
              disabled={stats.completed === 0}
              aria-disabled={stats.completed === 0}
              aria-label="Clear completed tasks"
              title="Clear completed"
            >
              Clear completed
            </button>
          </div>
        </header>

        <section className="card" aria-label="Add a new task">
          <AddTask onAddTask={addTask} />
        </section>

        <section className="card" aria-label="Task list">
          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
          {tasks.length === 0 ? (
            <div className="emptyState" role="status" aria-live="polite">
              <p className="emptyTitle">No tasks yet</p>
              <p className="emptyText">Use the input above to add one.</p>
            </div>
          ) : null}
        </section>

        <footer className="footer">
          <p className="footerText">
            Stored locally in your browser (localStorage). Refreshing the page keeps your tasks.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
