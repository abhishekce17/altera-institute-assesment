# Requirements Specification: To-Do List Mobile App (MERN Stack)

## 1. Functional Requirements

### Task Management (REQ-TASK)
- **REQ-TASK-01: Create Task**
  - The system shall allow users to create a task with:
    - `title`: String (Mandatory, non-empty, trimmed)
    - `description`: String (Optional)
    - `date`: String/Date (Mandatory, format YYYY-MM-DD)
    - `startTime`: String (Mandatory, e.g. "09:00 AM" or "09:00")
    - `endTime`: String (Mandatory, e.g. "10:30 AM" or "10:30")
    - `priority`: Enum ['Low', 'Medium', 'High'] (Optional, default 'Medium')
  - Newly created tasks default to status `pending` (`isCompleted: false`).
- **REQ-TASK-02: Edit Task**
  - The system shall allow users to edit any attribute of an existing task (title, description, date, start time, end time, priority).
  - Changes must persist to the database and immediately reflect across the UI.
- **REQ-TASK-03: Delete Task**
  - The system shall allow users to delete a task either by clicking the trash icon or by performing a swipe-left gesture on the task row.
  - Deletion removes the task from the database and updates weekly summary metrics.
- **REQ-TASK-04: Task Status Toggle**
  - The system shall allow users to toggle task status between `pending` (open) and `completed` (closed).
  - Completed tasks render with visual strikethrough and checked checkbox.
  - Status changes immediately update weekly progress cards and progress bar.
- **REQ-TASK-05: Search Tasks**
  - The system shall allow users to search tasks by entering text queries matching against `title` and `description` (case-insensitive).
  - Search results display relevant tasks with instant options to toggle status, edit, or delete.

### Weekly & Daily Organization (REQ-WEEK)
- **REQ-WEEK-01: Monday–Sunday Weekly Grouping**
  - The system shall organize tasks by calendar weeks starting on **Monday** and ending on **Sunday**.
  - System calculates the current week boundaries automatically.
- **REQ-WEEK-02: Task Summary Cards**
  - The Home screen shall display two prominent summary cards:
    - **Task Complete Card**: Count of closed tasks for the selected week with subtitle "This Week".
    - **Task Pending Card**: Count of open tasks for the selected week with subtitle "This Week".
  - Cards dynamically refresh whenever tasks are added, modified, or status-toggled.
- **REQ-WEEK-03: Weekly Progress Bar**
  - The Home screen shall display a progress bar showing percentage completion: `(completed / (completed + open)) * 100%`.
  - Empty week (0 tasks) displays 0% progress cleanly without errors.
- **REQ-WEEK-04: Date Strip Selector**
  - The Home screen shall render a horizontal 7-day strip displaying the day abbreviation and date number (e.g., "Wed 12").
  - The active/selected day is highlighted with a blue background and active indicator dot.
  - Tapping a day filters the "Tasks Today" list to tasks scheduled for that specific date.
  - A "View All" button allows toggling between the selected day's tasks and all tasks for the week.

### User Interface & Experience (REQ-UI)
- **REQ-UI-01: Onboarding Screen**
  - Implements Figma Frame 1: Blue background illustration using `onboarding-bg.png`.
  - Header: "Manage What To Do".
  - Subtitle: "The best way to manage what you have to do, don't forget your plans".
  - "Get Started" button transitions to Home screen and remembers completion in `localStorage`.
- **REQ-UI-02: Home Screen**
  - Implements Figma Frame 2:
    - Top search bar with search icon.
    - Settings and notification icons in header.
    - 7-day calendar strip selector.
    - "Task Complete" and "Task Pending" summary cards.
    - "Weekly Progress" bar section.
    - "Tasks Today" section with "View All" link and task row items.
    - Central Floating Action Button (`+`) to open task creation bottom sheet.
- **REQ-UI-03: Add / Edit Task Modal / Sheet**
  - Implements Figma Frame 3:
    - Header with "Add New Task" (or "Edit Task") and close `✕` icon.
    - "Task title" input field.
    - "Set Time": side-by-side Start Time and Ends Time inputs.
    - "Set Date": Date input with calendar picker.
    - "Description": Textarea input.
    - Priority selection: Low / Medium / High chip selectors.
    - Full-width blue action button ("Create task" / "Save changes").
- **REQ-UI-04: Search View (Frame 9)**
  - Implements Figma Frame 4:
    - Back navigation arrow `←`.
    - Real-time search query input with clear button.
    - Matching task items with status checkboxes.
- **REQ-UI-05: Responsive Mobile First Layout**
  - Built with Tailwind CSS.
  - Optimized for mobile viewports (375px–430px wide).
  - Centered mobile simulator viewport frame with soft shadow when viewed on desktop browsers.

### Backend API & Database (REQ-API)
- **REQ-API-01: RESTful Endpoints**
  - `GET /api/tasks` - List tasks with optional filters (`date`, `weekStart`, `search`, `status`).
  - `GET /api/tasks/stats/weekly` - Returns weekly open vs completed task counts and progress ratio.
  - `GET /api/tasks/:id` - Fetch single task details.
  - `POST /api/tasks` - Create task with validation.
  - `PUT /api/tasks/:id` - Full update of task attributes.
  - `PATCH /api/tasks/:id/status` - Quick toggle of completion status.
  - `DELETE /api/tasks/:id` - Delete a task.
- **REQ-API-02: Data Validation & Error Handling**
  - Request body validation using Zod.
  - Consistent error responses (`{ error: string, details?: any }`).
  - Safe 404 and 500 error handlers.
- **REQ-API-03: CORS & Configuration**
  - Configurable CORS allowing requests from the frontend dev server and production frontend URL.
  - Environment variables loaded via `.env` (`PORT`, `MONGODB_URI`, `CLIENT_URL`).

### Deployment & Submission (REQ-DEP)
- **REQ-DEP-01: Deployment Readiness**
  - Frontend configured for one-click deployment on Netlify (`netlify.toml` with SPA redirects).
  - Backend prepared for cloud deployment (Render / Railway / Fly.io).
  - Clear README.md with setup instructions, API documentation, environment variables, and deployment links.

