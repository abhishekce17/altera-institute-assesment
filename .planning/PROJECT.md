# Project Context: To-Do List Mobile App (MERN Stack)

## 1. Product Overview
The **To-Do List App** is a mobile-first task management web application built on the **MERN Stack** (MongoDB, Express, React 19 + TypeScript, Node.js) and styled with **Tailwind CSS**. It delivers an intuitive, aesthetically refined experience matching the Figma design specification (`https://www.figma.com/design/mz2PJoTwa5DxYrdrFPem3f/To-Do-List-Mobileapp`).

Users can create, edit, delete, and search for tasks scheduled by specific dates and times. The application organizes tasks by calendar weeks (starting on Monday and ending on Sunday) and visually tracks progress through weekly task summary cards ("Task Complete" vs. "Task Pending") and an interactive weekly progress indicator.

## 2. Core Objectives
1. **Intuitive Task Lifecycle**: Effortless creation, editing, status toggling, and deletion of tasks with attributes:
   - Mandatory: Title, Date, Time (Start & End Time)
   - Optional: Description, Priority (Low, Medium, High - default: Medium)
2. **Weekly Progress Visualization**: Grouping tasks by week (Mon–Sun), displaying live metrics for open and completed tasks, and rendering a weekly progress bar.
3. **Figma-Accurate Mobile Experience**: Pixel-accurate recreation of all 4 key Figma frames:
   - **Onboarding Screen**: Hero illustration utilizing `onboarding-bg.png`, clear value proposition, and a "Get Started" CTA.
   - **Home Screen**: Top search bar, 7-day calendar strip selector, weekly summary cards, progress bar, "Tasks Today" list with "View All", and a central floating action button (`+`).
   - **Add / Edit Task Modal / Sheet**: Form with Title, Start/End Time pickers, Date picker, Description textarea, Priority selector chips, and submit button.
   - **Search View (Frame 9)**: Search input with back navigation and real-time filtered results list with status checkboxes.
4. **Interactive Gestures & Responsiveness**:
   - Swipe-left gesture on task rows to trigger delete action.
   - Responsive mobile container preview on desktop displays with native touch-ready mobile responsiveness on smaller devices.
5. **Full-Stack Architecture & Deployment**:
   - RESTful Express/Node.js API backed by MongoDB/Mongoose.
   - Frontend built with React 19, TypeScript, Vite, Tailwind CSS, and Lucide icons.
   - Ready for one-click deployment: Netlify for the frontend and cloud hosting (e.g. Render / Railway / Fly.io) for the backend API.

## 3. Technology Stack
- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS (mobile-first design with responsive wrapper)
  - Lucide React (feather-style icons matching Figma)
  - Framer Motion / Touch listeners (for swipe-to-delete gesture and bottom sheet transitions)
  - Axios / Native Fetch for API communication with optimistic updates
- **Backend**:
  - Node.js (v18+) & Express (TypeScript / modern ES Modules)
  - MongoDB & Mongoose ORM
  - Zod / Express validation
  - CORS, Morgan logger, dotenv, unified error handling middleware
  - Supertest + Vitest/Jest for API automated integration testing
- **Database**:
  - MongoDB (local instance or MongoDB Atlas cluster)

## 4. Key Constraints & Non-Negotiables
- Weeks strictly defined as **Monday 00:00:00 to Sunday 23:59:59**.
- Weekly stats must dynamically recompute whenever any task is added, updated, status-toggled, or deleted.
- Search must query both `title` and `description` case-insensitively.
- The UI must adhere faithfully to the Figma color scheme:
  - Primary Blue: `#3B6BF5` / `#3866F2`
  - Success / Complete Light Blue: `#E8F0FE` / `#4378F7`
  - Pending / Warning Light Salmon: `#FDE8E8` / `#EF4444`
  - Background Neutral: `#F8FAFC`
  - Card & Surface: `#FFFFFF`
