# Phase 3 Context: Task Management Workflows & Interactions

## 1. Scope & Objective
Phase 3 builds out the full interactive task lifecycle in the mobile frontend matching Figma Frames 2, 3, and 4 (Frame 9). Users will be able to view daily tasks, toggle completion with immediate strikethrough styling, delete tasks using both a trash button and a mobile-native swipe-left gesture, create and edit tasks via a bottom sheet modal, and search tasks in real-time on a dedicated search screen.

## 2. Requirements Mapped to this Phase
- **REQ-TASK-01**: Create task with title, date, start time, end time, description, and priority.
- **REQ-TASK-02**: Edit task details with prefilled fields in the modal.
- **REQ-TASK-03**: Delete task via trash button or swipe-left touch gesture.
- **REQ-TASK-04**: Toggle task status (pending <-> completed) with checkbox and strikethrough style.
- **REQ-TASK-05**: Real-time keyword search across title and description.
- **REQ-UI-03**: Add / Edit Task Bottom Sheet Modal (matching Figma Frame 3).
- **REQ-UI-04**: Dedicated Search Screen (matching Figma Frame 9).

## 3. UI Specifications from Figma

### 3.1 Task List Item (Figma Frame 2)
- Left: Checkbox (square outline for pending; blue filled square with white checkmark for completed).
- Center: Task title (bold slate-800, line-through slate-400 when completed).
- Sub-info: Scheduled start and end times, priority chip.
- Right: Action icons (trash icon for delete, pencil icon for edit).
- Gesture: Swiping left exposes a red "Delete" button.

### 3.2 Add / Edit Task Modal (Figma Frame 3)
- Container: Bottom sheet modal with backdrop blur/darkening.
- Title: "Add New Task" / "Edit Task" with close `✕` icon.
- Form fields:
  - **Task title**: Text input (e.g. "Doing Homework").
  - **Set Time**: Two inputs side-by-side: "Start" (with clock icon) and "Ends" (with clock icon).
  - **Set Date**: Date input (with calendar icon) displaying formatted date.
  - **Description**: Multiline textarea ("Add Description").
  - **Priority**: Low / Medium / High chip selectors.
- Action: Full-width blue submit button ("Create task" / "Save changes").

### 3.3 Search Screen (Figma Frame 9)
- Top Navigation: Back arrow `←` returning to Home screen.
- Search Input: Active text field with search icon and clear button.
- Results List: Matching tasks with checkboxes to toggle status, edit button, and delete button.
- Empty State: Helpful message when no tasks match the search query.

## 4. Scope Fences
- **In Scope**:
  - Task item component with checkbox animation and swipe-left gesture.
  - Add / Edit Task bottom sheet modal with complete form validation.
  - Frame 9 Search screen with real-time text query filtering.
  - Integrated local state manager handling task create, update, delete, status toggle, and metric updates.
- **Out of Scope (Deferred to Phase 4)**:
  - Axios HTTP integration with the live backend server (Phase 4).
  - Netlify deployment scripts and environment configs (Phase 4).

