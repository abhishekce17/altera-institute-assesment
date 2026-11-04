# Phase 4 Context: Full-Stack Integration, Polish & Deployment Preparation

## 1. Scope & Objective
Phase 4 bridges the React frontend and the Express/Node.js backend into a cohesive, production-ready MERN stack application. It delivers a resilient API client service layer with optimistic UI updates and graceful offline fallback, configures local development proxying, establishes Netlify deployment configuration, and prepares comprehensive submission documentation.

## 2. Requirements Mapped to this Phase
- **REQ-DEP-01**: Netlify deployment configuration and production readiness for both client and API.
- **End-to-End Task Management Flow**:
  - Live task creation persisted to MongoDB.
  - Real-time status toggling updating weekly cards and progress bars.
  - Touch swipe-to-delete and trash button triggering server deletions.
  - Live keyword search querying tasks across the database.
- **Resilient Fallback Mode**:
  - If the backend is running and connected, all operations sync with MongoDB.
  - If the backend is unreachable (e.g. during offline review or frontend-only evaluation), the app gracefully falls back to local in-memory storage without crashing, alerting the user with an unobtrusive status pill.

## 3. Deployment & Environment Strategy

### Frontend (Netlify)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Redirection**: `netlify.toml` and `public/_redirects` forwarding `/*` to `/index.html` with status `200`.
- **Environment Variable**: `VITE_API_BASE_URL` (points to the hosted backend API URL, or `/api`).

### Backend (Cloud: Render / Railway / Fly.io)
- **Build Command**: `npm run build`
- **Start Command**: `npm start` (executes `node dist/server.js`)
- **Environment Variables**:
  - `PORT`: assigned by cloud provider (defaults to 5001).
  - `MONGODB_URI`: connection string to MongoDB Atlas.
  - `CLIENT_URL`: frontend origin permitted by CORS (e.g., `https://your-app.netlify.app`).
  - `NODE_ENV`: `production`.

## 4. Scope Fences
- **In Scope**:
  - `api.ts` frontend API client with type-safe methods.
  - Integration of `api.ts` into `useTasks.ts` with optimistic UI mutations.
  - Dev proxy configuration in `vite.config.ts`.
  - Netlify build configuration (`netlify.toml` and `_redirects`).
  - Loading indicators and feedback notifications for network operations.
  - Root `README.md` with setup guides, API specs, and deployment walkthrough.
- **Out of Scope**:
  - Manual provisioning of paid external third-party cloud accounts (documented with instructions for the evaluator).

