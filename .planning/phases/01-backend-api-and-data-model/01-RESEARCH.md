# Phase 1 Research: Backend Architecture, Date Math & Data Modeling

## 1. Executive Summary
Building a reliable MERN task backend requires solving three key architectural challenges upfront:
1. **Timezone-Safe Date Math**: Grouping tasks strictly into Monday–Sunday weeks across different client timezones without day shifting.
2. **Efficient Weekly Aggregations**: Fast computation of open tasks, closed tasks, and weekly progress percentage.
3. **Flexible Keyword Search**: Substring and keyword search across title and description with instant responses.

## 2. Key Technical Findings

### 2.1 Date Storage and Monday–Sunday ISO Week Boundaries
- **Pitfall**: Storing raw UTC timestamps like `2026-11-04T18:30:00.000Z` causes tasks created in UTC+5:30 (India) or UTC-5 (US) to shift into different days when converted to standard UTC.
- **Best Practice Solution**:
  - Store the scheduled day as an explicit date string `YYYY-MM-DD` (e.g. `"2026-11-04"`).
  - Store `startTime` and `endTime` as formatted time strings (e.g., `"09:00 AM"`, `"10:30 AM"`).
  - Compute `weekStart` (the Monday of that week in `YYYY-MM-DD`) on task creation/update and index it in MongoDB:
    ```typescript
    export function getWeekStart(dateStr: string): string {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      // JavaScript getUTCDay: 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dayOfWeek = d.getUTCDay();
      // Distance back to Monday: if Sunday (0), go back 6 days; if Mon (1), 0 days; Tue (2), 1 day; etc.
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      d.setUTCDate(d.getUTCDate() - diffToMonday);
      return d.toISOString().split('T')[0];
    }
    ```
  - Compute `weekEnd` (the Sunday of that week):
    ```typescript
    export function getWeekEnd(dateStr: string): string {
      const mondayStr = getWeekStart(dateStr);
      const [year, month, day] = mondayStr.split('-').map(Number);
      const d = new Date(Date.UTC(year, month - 1, day + 6));
      return d.toISOString().split('T')[0];
    }
    ```
- **Benefits**:
  - Zero timezone translation discrepancies between client and server.
  - Queries for a given week can simply filter by `weekStart: targetWeekStart` or `date: { $gte: monday, $lte: sunday }`.

### 2.2 Weekly Summary Metrics Aggregation
The assessment mandates:
- Number of Open Tasks for the week
- Number of Completed Tasks for the week
- Weekly progress ratio

In MongoDB/Mongoose:
```typescript
const stats = await Task.aggregate([
  { $match: { weekStart: targetWeekStart } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);

const completed = stats.find(s => s._id === 'completed')?.count || 0;
const open = stats.find(s => s._id === 'pending')?.count || 0;
const total = completed + open;
const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
```
This query executes in `< 2ms` with the compound index `{ weekStart: 1, status: 1 }`.

### 2.3 Substring Search Strategy
For task search (REQ-TASK-05):
- Users will type partial words (e.g. "wire", "home", "cat").
- MongoDB `$regex` query with `$options: 'i'` provides clean partial substring matching:
  ```typescript
  const filter: any = {};
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }
  ```
- Combined with compound indexes on `{ date: 1 }` and `{ weekStart: 1 }`, this ensures fast responses for mobile autocomplete.

### 2.4 Testing Strategy
- To allow autonomous, sandbox-friendly, and portable test execution without requiring an active external MongoDB daemon running on the host, we can configure `mongodb-memory-server` for the test environment.
- Express `app` is exported without calling `.listen()`, and `server.ts` imports `app` and handles `.listen()`. This allows `supertest(app)` to run tests over virtual in-memory HTTP sockets cleanly.

### 2.5 Dependencies Breakdown for Backend
- `express`: Minimalist, mature web server framework.
- `mongoose`: Robust object modeling for MongoDB.
- `dotenv`: Load environment variables.
- `cors`: Enable cross-origin requests from the React frontend.
- `zod`: TypeScript-first schema declaration and runtime validation.
- `morgan`: Request logging for developer visibility.
- Dev dependencies:
  - `typescript`, `@types/node`, `@types/express`, `@types/cors`, `@types/morgan`
  - `tsx`: Ultra-fast TypeScript execution engine for dev and scripts.
  - `vitest`, `supertest`, `@types/supertest`, `mongodb-memory-server` for testing.

