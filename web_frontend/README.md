# To‑Do List (React SPA)

A simple single-page to‑do list app built with React. Users can add tasks, toggle completion, edit inline, and delete tasks. Tasks persist in the browser using `localStorage` (no backend required).

## Quick start

From `web_frontend/`:

```bash
npm install
npm start
```

Then open http://localhost:3000

## Features

- Add tasks from the input at the top
- Toggle completion with a checkbox
- Inline edit task text
  - Press **Enter** to save
  - Press **Escape** to cancel
- Delete tasks
- Clear all completed tasks
- Local persistence via `localStorage` (refresh keeps your list)
- Light theme styling:
  - Primary `#3b82f6`
  - Success `#06b6d4`
  - Error `#EF4444`
  - Background `#f9fafb`
  - Surface `#ffffff`
  - Text `#111827`

## Notes

- Data is stored only in your browser at `localStorage` key: `kavia.todo.tasks.v1`.
- Clearing browser storage/site data will remove tasks.
- No backend/API is used (future backend integration can be added later).
"
