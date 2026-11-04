# Phase 3 Research: Mobile Touch Gestures, Bottom Sheet Modals & Search UX

## 1. Executive Summary
Phase 3 focuses on mobile ergonomics: fluid touch-driven swipe deletion, an accessible bottom sheet modal for task authoring, and a dedicated search screen matching Figma Frame 9.

## 2. Key Technical Findings

### 2.1 Mobile Swipe-to-Delete Gesture
- **Requirement**: "Swipe left on a task in the week's list. Tap 'Delete' to remove it."
- **Ergonomics & Mechanics**:
  - Rather than requiring a heavy external physics library, native pointer/touch listeners (`onTouchStart`, `onTouchMove`, `onTouchEnd`, and pointer fallback) offer zero-dependency, high-frame-rate 60fps performance on mobile Safari and Chrome.
  - **Structure**:
    - Outer container: `relative overflow-hidden rounded-xl` with background action container: `absolute inset-y-0 right-0 w-20 bg-red-500 text-white flex items-center justify-center font-semibold text-xs`.
    - Foreground card: `relative bg-white z-10 transition-transform duration-200 ease-out`.
    - Touch logic:
      - `deltaX = startX - currentX`
      - If `deltaX > 20px`, translate row left up to `maxTranslateX = 80px`.
      - On touch end: if `deltaX > 45px`, lock open at `-80px`; otherwise snap back to `0px`.
      - Tapping the delete action triggers deletion with smooth exit animation.
      - A permanent trash icon is also visible on desktop for accessibility and keyboard navigation.

### 2.2 Bottom Sheet Modal (Figma Frame 3)
- **Visual Anatomy**:
  - Slide-up bottom sheet anchored to the bottom on mobile viewports (`rounded-t-[32px]`), or centered modal on desktop (`sm:rounded-[28px]`).
  - Inputs designed to match Figma:
    - Title: Single-line input with placeholder `"Doing Homework"`.
    - Set Time: Two side-by-side inputs: "Start" and "Ends" with clock icons.
    - Set Date: Date input showing "Friday 14, January" format with calendar icon.
    - Description: Multi-line textarea with placeholder `"Add Description"`.
    - Priority Selector: 3 chips:
      - `Low`: Green accent badge
      - `Medium`: Blue/Amber accent badge
      - `High`: Red/Salmon accent badge
    - CTA: Full-width blue button (`bg-[#3866F2] hover:bg-[#2B52D4]`) labeled `"Create task"` (or `"Save changes"` when editing).

### 2.3 Search View (Figma Frame 9)
- **Visual Anatomy**:
  - Top navigation bar with back arrow `←` (`ArrowLeft` from Lucide).
  - Search input with search icon:
    - Auto-focuses on open.
    - Clear button `✕` when text is present.
  - Live query filtering matching both `title` and `description` (case-insensitive).
  - Interactive result items:
    - Users can toggle task completion directly inside search results.
    - Tapping edit opens the task in the edit modal.
    - Tapping trash removes the task.
  - Empty query state shows all tasks or prompts to type; non-matching query displays an empty state illustration/message.

### 2.4 State Management Strategy for Phase 3
- We implement an encapsulated React hook `useTasks`:
  - Maintains task array, selected date, and filter view mode (daily vs. all).
  - Computes weekly statistics (`completedCount`, `pendingCount`, `progressPercentage`) dynamically.
  - Supports:
    - `addTask(input: CreateTaskInput)`
    - `updateTask(id: string, input: UpdateTaskInput)`
    - `toggleTaskStatus(id: string)`
    - `deleteTask(id: string)`
  - Preloaded with the sample tasks from the Figma mockups ("Finishing Wireframe", "Meeting with team", "Buy a cat food", "Finishing daily commission", "Doing Homework") for immediate offline testing.
