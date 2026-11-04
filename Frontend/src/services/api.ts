import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';

// Configurable base URL: uses VITE_API_BASE_URL if defined, otherwise defaults to /api (handled by Vite proxy in dev)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

class ApiService {
  private base: string;

  constructor(baseUrl: string) {
    this.base = baseUrl;
  }

  /**
   * Health check to detect if the backend server is reachable.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000), // 3s timeout
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch tasks with optional filters (date, weekStart, status, search).
   */
  async fetchTasks(params?: {
    date?: string;
    weekStart?: string;
    status?: string;
    search?: string;
  }): Promise<Task[]> {
    const url = new URL(`${this.base}/tasks`, window.location.origin);
    if (params) {
      if (params.date) url.searchParams.set('date', params.date);
      if (params.weekStart) url.searchParams.set('weekStart', params.weekStart);
      if (params.status) url.searchParams.set('status', params.status);
      if (params.search) url.searchParams.set('search', params.search);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch tasks' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data || [];
  }

  /**
   * Fetch weekly statistics (open count, completed count, progress ratio).
   */
  async fetchWeeklyStats(params?: { date?: string; weekStart?: string }): Promise<WeeklyStats> {
    const url = new URL(`${this.base}/tasks/stats/weekly`, window.location.origin);
    if (params) {
      if (params.date) url.searchParams.set('date', params.date);
      if (params.weekStart) url.searchParams.set('weekStart', params.weekStart);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch weekly stats' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Create a new task.
   */
  async createTask(data: TaskFormData): Promise<Task> {
    const res = await fetch(`${this.base}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create task' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Update an existing task.
   */
  async updateTask(id: string, data: TaskFormData): Promise<Task> {
    const res = await fetch(`${this.base}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update task' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Toggle task status between pending and completed.
   */
  async toggleTaskStatus(id: string, status?: 'pending' | 'completed'): Promise<Task> {
    const res = await fetch(`${this.base}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(status ? { status } : {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to toggle status' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Delete a task by ID.
   */
  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${this.base}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete task' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
  }
}

export const api = new ApiService(API_BASE);

