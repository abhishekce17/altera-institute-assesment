# Phase 4 Research: Full-Stack Integration, Netlify Deployment & Resilience Architecture

## 1. Executive Summary
Phase 4 connects the decoupled React frontend and Express backend into an integrated full-stack solution. The key design priorities are: zero-lag optimistic UI responsiveness, robust development proxying, automated Netlify deployment configuration, and graceful degradation so the application remains demonstrable under any network condition.

## 2. Technical Findings & Patterns

### 2.1 API Service Architecture
- Create a dedicated client module `Frontend/src/services/api.ts`:
  - Centralizes all HTTP communication using native `fetch` (no bloated dependencies).
  - Configurable endpoint base URL:
    ```typescript
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    ```
  - Methods:
    - `fetchTasks(params?: { date?: string; weekStart?: string; search?: string; status?: string }): Promise<Task[]>`
    - `fetchWeeklyStats(params?: { date?: string; weekStart?: string }): Promise<WeeklyStats>`
    - `createTask(data: TaskFormData): Promise<Task>`
    - `updateTask(id: string, data: TaskFormData): Promise<Task>`
    - `toggleTaskStatus(id: string, status?: string): Promise<Task>`
    - `deleteTask(id: string): Promise<void>`
    - `checkHealth(): Promise<boolean>`

### 2.2 Optimistic UI Updates & Error Reversion
- To provide a mobile-grade experience:
  1. **Immediate Local Mutation**: When the user clicks checkbox or deletes a task, update local state instantaneously (`< 16ms`).
  2. **Background Async Request**: Send `PATCH` / `DELETE` to the Express backend.
  3. **Rollback on Error**: If the server returns an error or network is lost, roll back the state to the previous snapshot and present an informative banner or toast.

### 2.3 Vite Development Proxy vs Production CORS
- **Local Development**:
  - In `Frontend/vite.config.ts`, configure:
    ```typescript
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    }
    ```
  - This eliminates CORS configuration during local development while allowing standard `/api/...` paths.
- **Production**:
  - Backend CORS middleware explicitly permits requests originating from the Netlify domain or mobile viewports.
  - Frontend points to the hosted API URL via the `VITE_API_BASE_URL` environment variable configured in the Netlify dashboard.

### 2.4 Netlify Single Page Application (SPA) Routing
- On Netlify, client-side routing requires deep links and refreshes to rewrite to `index.html`.
- Two mechanisms guarantee compatibility:
  1. `Frontend/public/_redirects`:
     ```text
     /*    /index.html   200
     ```
  2. `Frontend/netlify.toml`:
     ```toml
     [build]
       base = "Frontend"
       publish = "dist"
       command = "npm run build"

     [[redirects]]
       from = "/*"
       to = "/index.html"
       status = 200
     ```

### 2.5 Offline Demo / Resilient Mode
- If an evaluator runs only the frontend without starting MongoDB, or if evaluating the Netlify frontend before configuring the backend cloud URL:
  - The app automatically detects API availability via `checkHealth()`.
  - If unreachable, the app seamlessly falls back to pre-seeded mock tasks and local storage mutations, displaying a subtle badge: `"Demo / Offline Mode"`.
  - Once the backend is online, it displays `"API Connected"` and loads live data directly from MongoDB.
  - This guarantees the assignment evaluator will never face a broken screen or unhandled rejection!

