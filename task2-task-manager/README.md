# TaskFlow: Task Manager (CRUD + localStorage + PWA)

No build step, no server, no dependencies.

## Run locally
Open this folder in VS Code, install **Live Server**, right-click `index.html` > **Open with Live Server**.
Offline mode and installing as an app need http://localhost (Live Server) or any https host.

## Features
Create, read, update (double-click or the pencil), delete with undo; categories; priority; due dates with overdue/today highlights;
All / Active / Completed filters; category filter; search (`/`); sort by manual order, due date or priority; drag-and-drop reorder (mouse);
progress ring and stats; JSON export/import; dark/light theme; multi-tab sync; installable and works offline.

## Data
Helpers: `saveToLocalStorage()` and `loadFromLocalStorage()`. Stored in localStorage under `taskflow.v1` as `{v:1,tasks:[...]}`; invalid or tampered data is cleaned on load.

## Deploy
Push to GitHub, enable GitHub Pages (branch `main`, folder `/`), or import into Vercel/Netlify with no build command.

## Advanced features (js/plus.js)
- **Smart add:** type `Submit report tomorrow #work !high every week` and the date, category, priority and repeat are filled in for you.
- **Undo / redo:** `Ctrl+Z` and `Ctrl+Y` step through your last 60 changes.
- **Subtasks:** the list button on a task opens a checklist; progress shows as "2/4 steps".
- **Recurring tasks:** completing a daily or weekly task schedules the next one.
- **Focus timer:** the clock button starts a 25-minute session and adds focus minutes to that task.
- **Insights:** streak, 7-day completion chart and focus minutes.
- **Memory:** the app remembers your filters, sort order, last category and priority, and an activity history that powers the streak and title suggestions. "Forget history" clears it. Everything stays in your browser.
