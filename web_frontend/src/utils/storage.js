const STORAGE_KEY = "kavia.todo.tasks.v1";

/**
 * Validates basic task shape to avoid runtime issues if storage is corrupted.
 */
function isValidTask(task) {
  return (
    task &&
    typeof task === "object" &&
    typeof task.id === "string" &&
    typeof task.text === "string" &&
    typeof task.completed === "boolean"
  );
}

// PUBLIC_INTERFACE
export function loadTasksFromStorage() {
  /** Loads tasks from localStorage, returning [] if unavailable or invalid. */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask);
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveTasksToStorage(tasks) {
  /** Saves tasks to localStorage. */
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore quota/security errors; app should still function in-memory.
  }
}
