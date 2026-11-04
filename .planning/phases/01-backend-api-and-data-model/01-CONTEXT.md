# Phase 1 Context: Backend API & Data Model Foundation

## 1. Scope & Objective
Phase 1 establishes the server-side foundation of the To-Do List Application. It delivers a type-safe Express.js REST API with TypeScript, backed by MongoDB and Mongoose, providing complete task lifecycle operations, search, week-based metrics calculation, request validation, and automated integration tests.

## 2. Requirements Mapped to this Phase
- **REQ-TASK-01**: Create task with title (mandatory), description (optional), date (mandatory), start time (mandatory), end time (mandatory), priority (Low, Medium, High).
- **REQ-TASK-02**: Edit/update task details.
- **REQ-TASK-03**: Delete task by ID.
- **REQ-TASK-04**: Task status toggle (pending <-> completed).
- **REQ-TASK-05**: Task search across title and description using regex or text index.
- **REQ-WEEK-01**: Monday-to-Sunday weekly boundary calculation.
- **REQ-API-01**: REST API endpoints for all operations.
- **REQ-API-02**: Mongoose schema and validation with Zod.
- **REQ-API-03**: CORS, logging, and unified error middleware.

## 3. Data Contract: Task Model

```typescript
export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  date: string; // ISO date format YYYY-MM-DD
  startTime: string; // e.g., "09:00 AM" or "09:00"
  endTime: string; // e.g., "10:30 AM" or "10:30"
  priority: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'completed';
  weekStart: string; // Precomputed Monday date (YYYY-MM-DD) for high-performance weekly indexing
  createdAt?: Date;
  updatedAt?: Date;
}
```

## 4. REST API Endpoint Specifications

| Method | Endpoint | Description | Query / Body Params | Response Status |
|---|---|---|---|---|
| `GET` | `/api/tasks` | List tasks | `?date=YYYY-MM-DD&weekStart=YYYY-MM-DD&search=query&status=pending\|completed` | 200 OK |
| `GET` | `/api/tasks/stats/weekly` | Get weekly summary metrics | `?date=YYYY-MM-DD` or `?weekStart=YYYY-MM-DD` | 200 OK |
| `GET` | `/api/tasks/:id` | Get single task | Route param `:id` | 200 OK / 404 |
| `POST` | `/api/tasks` | Create new task | JSON body (validated via Zod) | 201 Created / 400 |
| `PUT` | `/api/tasks/:id` | Update task details | JSON body with updated attributes | 200 OK / 400 / 404 |
| `PATCH` | `/api/tasks/:id/status` | Toggle completion status | `{ status?: 'pending' \| 'completed' }` | 200 OK / 400 / 404 |
| `DELETE` | `/api/tasks/:id` | Delete task | Route param `:id` | 200 OK / 404 |

## 5. Scope Fences
- **In Scope**:
  - Express application setup with TypeScript (`tsx`, `typescript`, `@types/*`).
  - Mongoose Task schema, indexes (`date`, `weekStart`, text index on `title` and `description`).
  - Helper functions for ISO Monday–Sunday date math.
  - Zod validation schemas for request bodies and queries.
  - Complete controller and route implementations.
  - Vitest + Supertest integration tests verifying all endpoints and boundary conditions.
  - Seed script to populate mock tasks across the current week.
- **Out of Scope (Deferred to Later Phases)**:
  - React components, styling, or UI rendering (Phases 2 & 3).
  - Client-side state synchronization (Phase 4).
  - Production cloud deployment execution (Phase 4).
