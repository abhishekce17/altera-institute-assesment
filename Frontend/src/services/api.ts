import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import type { User, AuthResponse } from '../types/auth';

// Configurable base URL: uses VITE_API_BASE_URL if defined, otherwise defaults to /api (handled by Vite proxy in dev)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

class ApiService {
  private base: string;
  private token: string | null = null; // In-memory fallback token

  constructor(baseUrl: string) {
    this.base = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
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
        credentials: 'include',
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==================== AUTHENTICATION & USER PROFILE (COOKIES & MONGODB) ====================

  /**
   * Register a new user account in MongoDB.
   * Backend sets HTTP-only secure cookie with CORS.
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    preferences?: { defaultPriority?: string; notificationEnabled?: boolean };
    hasOnboarded?: boolean;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const json: AuthResponse = await res.json().catch(() => ({ success: false, error: 'Registration failed' }));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.error || 'Failed to create account');
    }

    if (json.token) {
      this.setToken(json.token);
    }
    return { token: json.token || '', user: json.user };
  }

  /**
   * Log in to an existing MongoDB user account.
   * Backend sets HTTP-only secure cookie with CORS.
   */
  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const json: AuthResponse = await res.json().catch(() => ({ success: false, error: 'Login request failed' }));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.error || 'Invalid email or password');
    }

    if (json.token) {
      this.setToken(json.token);
    }
    return { token: json.token || '', user: json.user };
  }

  /**
   * Log out of account and instruct backend to clear HTTP-only cookie.
   */
  async logout(): Promise<void> {
    this.setToken(null);
    try {
      await fetch(`${this.base}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });
    } catch {
      // Best-effort logout
    }
  }

  /**
   * Fetch current user profile and preferences directly from MongoDB via Cookie session.
   */
  async getProfile(): Promise<User> {
    const res = await fetch(`${this.base}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    const json = await res.json().catch(() => ({ success: false, error: 'Failed to fetch user profile' }));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.error || 'Failed to load user profile from MongoDB');
    }

    return json.user;
  }

  /**
   * Update user details, hasOnboarded status, and preferences in MongoDB.
   */
  async updateProfile(data: {
    name?: string;
    email?: string;
    password?: string;
    preferences?: { defaultPriority?: string; notificationEnabled?: boolean };
    hasOnboarded?: boolean;
  }): Promise<User> {
    const res = await fetch(`${this.base}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete task' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
  }
}

export const api = new ApiService(API_BASE);
