# To-Do List Mobile App (MERN Stack)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v4.21-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)](https://mongoosejs.com/)
[![React](https://img.shields.io/badge/React-v19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v8-purple?logo=vite)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-16%2F16%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)

A modern, responsive, mobile-first task management web application built on the **MERN Stack** (MongoDB, Express, React 19 + TypeScript, Node.js) and styled with **Tailwind CSS**, designed in strict accordance with the SDE I Assessment specification and Figma design.

---

## 📱 Visual Previews & Figma Alignment

The application faithfully implements all four frames from the [Figma Design](https://www.figma.com/design/mz2PJoTwa5DxYrdrFPem3f/To-Do-List-Mobileapp?node-id=0-1&t=7XVtCMzMmLV08Avn-1):

| Screen | Figma Specification | Implementation Highlights |
|---|---|---|
| **1. Onboarding** | Frame 1 | Hero background graphic (`onboarding-bg.png`), typography, *"Get Started"* CTA, and persistent state in `localStorage`. |
| **2. Home Screen** | Frame 2 | Top search bar, settings/notification icons, 7-day calendar strip selector, dual summary cards, weekly progress bar, and floating action button (`+`). |
| **3. New/Edit Task** | Frame 3 | Slide-up bottom sheet modal with Title, Start/End Time pickers, Date picker, Description textarea, Priority chips (`Low`, `Medium`, `High`), and validation. |
| **4. Search Screen** | Frame 9 | Back navigation `←`, active search input, real-time keyword filtering on title/description, inline status toggling, editing, and deletion. |

---

## ✨ Key Features & User Stories

### 1. Task Lifecycle Management
- **Create Tasks**: Mandatory title, date (`YYYY-MM-DD`), start time, and end time. Optional description and priority (`Low`, `Medium`, `High` - default: `Medium`).
- **Edit Tasks**: Update any field with prefilled data in the modal.
- **Delete Tasks**: Touch **swipe-left gesture** on mobile viewports to expose a red delete trigger, plus direct trash can icon.
- **Status Toggle**: One-tap completion toggle with smooth strikethrough animation and instant reflection on weekly statistics.
- **Instant Search**: Real-time keyword filtering across title and description on a dedicated search screen.

### 2. Weekly & Daily Organization
- **Monday-to-Sunday ISO Calendar Weeks**: Week boundaries strictly follow the ISO convention (Monday 00:00:00 to Sunday 23:59:59) with timezone-safe UTC date calculations.
- **Task Summary Cards**:
  - **Task Complete Card**: Count of closed tasks for the selected week with subtitle *"This Week"*.
  - **Task Pending Card**: Count of open tasks for the selected week with subtitle *"This Week"*.
- **Weekly Progress Bar**: Real-time progress percentage: `(completed / (completed + open)) * 100%`.
- **7-Day Date Strip**: Horizontally scrollable day picker displaying day abbreviation, date number, active blue pill highlight, and indicator dot.

### 3. Responsive Mobile Chassis
- **Handheld Devices**: Seamless native mobile app experience spanning 100vw.
- **Desktop Browsers**: Displays an authentic centered smartphone chassis (`max-w-[420px]`, `rounded-[36px]`, `shadow-2xl`) with simulated sensor bar for optimal reviewer demonstration.

### 4. Resilient Full-Stack Architecture
- **Optimistic UI Updates**: Status toggles and deletions reflect immediately (< 16ms), synchronizing with MongoDB in the background.
- **Dual-Mode Offline Resilience**: If the backend is running, it connects to MongoDB. If evaluated offline or before backend cloud deployment, it seamlessly operates in local demo mode with pre-seeded mock tasks without throwing unhandled exceptions.

---

## 🛠️ Architecture & Folder Structure

```text
SDE-Assignement/
├── Backend/
│   ├── src/
│   │   ├── config/             # MongoDB connection manager (db.ts)
│   │   ├── controllers/        # REST controllers with CRUD & weekly stats
│   │   ├── middlewares/        # Zod request validation & error middleware
│   │   ├── models/             # Mongoose Task model with compound indexes
│   │   ├── routes/             # Express task router (/api/tasks)
│   │   ├── utils/              # Timezone-safe Monday-to-Sunday date math
│   │   ├── validations/        # Zod validation schemas
│   │   ├── seed.ts             # Development seeder with realistic tasks
│   │   ├── app.ts              # Express application config (CORS, Morgan, JSON)
│   │   └── server.ts           # Entrypoint with graceful shutdown
│   ├── tests/                  # Automated integration tests (Vitest + Supertest)
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   │   ├── assets/             # Onboarding hero graphic (onboarding-bg.png)
│   │   ├── components/
│   │   │   ├── home/           # Header, DateStrip, SummaryCards, ProgressBar, HomeScreen
│   │   │   ├── layout/         # MobileContainer (responsive chassis)
│   │   │   ├── onboarding/     # OnboardingScreen
│   │   │   ├── search/         # SearchScreen (Figma Frame 9)
│   │   │   ├── tasks/          # TaskItem (swipe-to-delete), TaskList, TaskModal
│   │   │   └── ui/             # FloatingActionButton (+)
│   │   ├── hooks/              # Central useTasks state manager with optimistic sync
│   │   ├── services/           # api.ts client (fetch, CRUD, health check)
│   │   ├── types/              # TypeScript contracts matching backend
│   │   ├── utils/              # Date formatting & week generator
│   │   ├── App.tsx             # Root screen switcher (Onboarding / Home / Search)
│   │   └── index.css           # Tailwind v4 theme variables & typography
│   ├── public/
│   │   └── _redirects          # Netlify SPA routing rules
│   ├── netlify.toml            # Netlify deployment configuration
│   ├── package.json
│   └── vite.config.ts          # Vite configuration with dev proxy & Tailwind
│
├── .planning/                  # GSD planning specs (PROJECT, REQUIREMENTS, ROADMAP, STATE)
└── netlify.toml                # Root Netlify configuration
```

---

## 🚀 Quickstart Guide (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node v22)
- [MongoDB](https://www.mongodb.com/) (local daemon or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd SDE-Assignement
```

### 2. Backend Setup
```bash
cd Backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env if using MongoDB Atlas or custom port (default: mongodb://localhost:27017/todo-app)

# (Optional) Seed realistic sample tasks across the current week
npm run seed

# Start development server (with hot reload via tsx)
npm run dev
# Server will run on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install

# Start development server
npm run dev
# Application will run on http://localhost:5173
```
*Note: Vite automatically proxies `/api` requests to `http://localhost:5001`, eliminating CORS issues during development.*

---

## 🧪 Running Automated Tests

The backend includes a comprehensive automated test suite powered by **Vitest** and **Supertest** covering all CRUD routes, boundary validations, search queries, and weekly progress statistics:

```bash
cd Backend
npm test
```

### Test Suite Results:
```text
✓ tests/task.test.ts (16 tests) 966ms
   ✓ Task API Endpoints > POST /api/tasks > should create a new task with valid data and auto-compute weekStart
   ✓ Task API Endpoints > POST /api/tasks > should fail with 400 if title is missing or empty
   ✓ Task API Endpoints > POST /api/tasks > should fail with 400 if date format is invalid
   ✓ Task API Endpoints > POST /api/tasks > should fail with 400 if startTime or endTime is missing
   ✓ Task API Endpoints > GET /api/tasks > should retrieve list of tasks
   ✓ Task API Endpoints > GET /api/tasks > should filter tasks by date
   ✓ Task API Endpoints > GET /api/tasks > should filter tasks by keyword search
   ✓ Task API Endpoints > GET /api/tasks/stats/weekly > should calculate weekly open vs completed metrics correctly
   ✓ Task API Endpoints > GET /api/tasks/stats/weekly > should return 0% progress when no tasks exist for the week
   ✓ Task API Endpoints > GET /api/tasks/:id > should retrieve task by ID
   ✓ Task API Endpoints > GET /api/tasks/:id > should return 404 if task ID does not exist
   ✓ Task API Endpoints > GET /api/tasks/:id > should return 400 for invalid ID format
   ✓ Task API Endpoints > PUT /api/tasks/:id > should update task attributes and recalculate weekStart if date changes
   ✓ Task API Endpoints > PATCH /api/tasks/:id/status > should toggle task status between pending and completed
   ✓ Task API Endpoints > PATCH /api/tasks/:id/status > should assign explicit status when provided
   ✓ Task API Endpoints > DELETE /api/tasks/:id > should delete task and remove it from database

Test Files  1 passed (1)
     Tests  16 passed (16)
```

---

## 📡 REST API Reference

Base URL: `http://localhost:5001/api` (or `/api` via Vite dev proxy)

| Method | Endpoint | Description | Query / Body Parameters | Status |
|---|---|---|---|---|
| `GET` | `/health` | Server health check | None | `200 OK` |
| `GET` | `/tasks` | List tasks | `?date=YYYY-MM-DD&weekStart=YYYY-MM-DD&status=pending\|completed&search=keyword` | `200 OK` |
| `GET` | `/tasks/stats/weekly` | Weekly metrics summary | `?date=YYYY-MM-DD` or `?weekStart=YYYY-MM-DD` | `200 OK` |
| `GET` | `/tasks/:id` | Fetch single task | `:id` (MongoDB ObjectId) | `200 OK` / `404` |
| `POST` | `/tasks` | Create task | `{ title, description?, date, startTime, endTime, priority? }` | `201 Created` / `400` |
| `PUT` | `/tasks/:id` | Update task | `{ title?, description?, date?, startTime?, endTime?, priority? }` | `200 OK` / `400` / `404` |
| `PATCH` | `/tasks/:id/status` | Toggle or set status | `{ status?: 'pending' \| 'completed' }` | `200 OK` / `400` / `404` |
| `DELETE` | `/tasks/:id` | Delete task | `:id` (MongoDB ObjectId) | `200 OK` / `404` |

### Sample Response: `GET /api/tasks/stats/weekly`
```json
{
  "success": true,
  "data": {
    "weekStart": "2026-11-02",
    "weekEnd": "2026-11-08",
    "completed": 50,
    "open": 8,
    "total": 58,
    "progressPercentage": 86
  }
}
```

---

## 🌐 Production Deployment Guide

### Deploying Frontend to Netlify
1. Connect your GitHub repository to [Netlify](https://app.netlify.com/).
2. Select repository settings:
   - **Base directory**: `Frontend` (or leave empty if using root `netlify.toml`)
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist` (or `dist`)
3. Add Environment Variable in Netlify (Site Configuration -> Environment variables):
   - `VITE_API_BASE_URL`: `https://<your-backend-api-url>/api`
4. Click **Deploy Site**.
*The included `netlify.toml` and `public/_redirects` automatically configure Single Page Application rewrites.*

### Deploying Backend to Cloud (Render / Railway)
1. In [Render](https://render.com/) or [Railway](https://railway.app/), create a **New Web Service** connected to the repository.
2. Configure settings:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Configure Environment Variables:
   - `PORT`: `5001`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `CLIENT_URL`: `https://<your-netlify-app-name>.netlify.app`
4. Save and deploy.

---

## 📄 License
This project is submitted for the SDE I Assessment. All rights reserved.

