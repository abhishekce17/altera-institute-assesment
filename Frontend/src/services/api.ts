import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import type { User, AuthResponse } from '../types/auth';

// Configurable base URL: uses VITE_API_BASE_URL if defined, otherwise defaults to /api (handled by Vite proxy in dev)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const TOKEN_KEY = 'todo_app_auth_token';

class ApiService {
  private base: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.base = baseUrl;
    // Load stored session token if available
    try {
      this.token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
      this.token = null;
    }
  }

  setToken(token: string | null, persist = true) {
    this.token = token;
    try {
      if (token) {
        if (persist) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors in restricted iframe environments
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...customHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Health check to detect if the backend server is reachable.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==================== AUTHENTICATION & USER PROFILE ====================

  /**
   * Register a new user account in MongoDB.
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    preferences?: { defaultPriority?: string; notificationEnabled?: boolean };
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });

    const json: AuthResponse = await res.json().catch(() => ({ success: false, error: 'Registration failed' }));
    if (!res.ok || !json.success || !json.token || !json.user) {
      throw new Error(json.error || 'Failed to create account');
    }

    this.setToken(json.token);
    return { token: json.token, user: json.user };
  }

  /**
   * Log in to an existing MongoDB user account.
   */
  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });

    const json: AuthResponse = await res.json().catch(() => ({ success: false, error: 'Login request failed' }));
    if (!res.ok || !json.success || !json.token || !json.user) {
      throw new Error(json.error || 'Invalid email or password');
    }

    this.setToken(json.token);
    return { token: json.token, user: json.user };
  }

  /**
   * Fetch current user profile and preferences directly from MongoDB.
   */
  async getProfile(): Promise<User> {
    const res = await fetch(`${this.base}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const json = await res.json().catch(() => ({ success: false, error: 'Failed to fetch user profile' }));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.error || 'Failed to load user profile from MongoDB');
    }

    return json.user;
  }

  /**
   * Update user details and preferences in MongoDB.
   */
  async updateProfile(data: {
    name?: string;
    email?: string;
    password?: string;
    preferences?: { defaultPriority?: string; notificationEnabled?: boolean };
  }): Promise<User> {
    const res = await fetch(`${this.base}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({ success: false, error: 'Failed to update user profile' }));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.error || 'Failed to update profile in MongoDB');
    }

    return json.user;
  }

  // ==================== TASK OPERATIONS (MONGODB) ====================

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
      headers: this.getHeaders(),
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
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch weekly stats' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Create a new task in MongoDB.
   */
  async createTask(data: TaskFormData): Promise<Task> {
    const res = await fetch(`${this.base}/tasks`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
   * Update an existing task in MongoDB.
   */
  async updateTask(id: string, data: TaskFormData): Promise<Task> {
    const res = await fetch(`${this.base}/tasks/${id}`, {
      method: 'PUT',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
   * Toggle task status between pending and completed in MongoDB.
   */
  async toggleTaskStatus(id: string, status?: 'pending' | 'completed'): Promise<Task> {
    const res = await fetch(`${this.base}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
   * Delete a task by ID from MongoDB.
   */
  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${this.base}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete task' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
  }
}

export const api = new ApiService(API_BASE);
