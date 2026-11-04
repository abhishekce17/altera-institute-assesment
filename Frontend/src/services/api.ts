import { apiClient, setApiToken, getApiToken } from './apiClient';
import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import type { User, AuthResponse } from '../types/auth';

class ApiService {
  setToken(token: string | null) {
    setApiToken(token);
  }

  getToken(): string | null {
    return getApiToken();
  }

  /**
   * Health check to detect if the backend server is reachable.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await apiClient.get('/health', { timeout: 3000 });
      return res.status === 200;
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
    hasOnboarded?: boolean;
  }): Promise<{ token: string; user: User }> {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    const json = res.data;

    if (!json.success || !json.user) {
      throw new Error(json.error || 'Failed to create account');
    }

    if (json.token) {
      this.setToken(json.token);
    }
    return { token: json.token || '', user: json.user };
  }

  /**
   * Log in to an existing MongoDB user account.
   */
  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    const json = res.data;

    if (!json.success || !json.user) {
      throw new Error(json.error || 'Invalid email or password');
    }

    if (json.token) {
      this.setToken(json.token);
    }
    return { token: json.token || '', user: json.user };
  }

  /**
   * Log out of account and clear session.
   */
  async logout(): Promise<void> {
    this.setToken(null);
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Best-effort logout
    }
  }

  /**
   * Fetch current user profile directly from MongoDB via Cookie session.
   */
  async getProfile(): Promise<User> {
    const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    if (!res.data.success || !res.data.user) {
      throw new Error('Failed to load user profile from MongoDB');
    }
    return res.data.user;
  }

  /**
   * Update user details and preferences in MongoDB.
   */
  async updateProfile(data: {
    name?: string;
    email?: string;
    password?: string;
    preferences?: { defaultPriority?: string; notificationEnabled?: boolean };
    hasOnboarded?: boolean;
  }): Promise<User> {
    const res = await apiClient.put<{ success: boolean; user: User }>('/auth/profile', data);
    if (!res.data.success || !res.data.user) {
      throw new Error('Failed to update profile in MongoDB');
    }
    return res.data.user;
  }

  // ==================== TASK OPERATIONS ====================

  /**
   * Fetch tasks with optional filters (date, weekStart, status, search).
   */
  async fetchTasks(params?: {
    date?: string;
    weekStart?: string;
    status?: string;
    search?: string;
  }): Promise<Task[]> {
    const res = await apiClient.get<{ success: boolean; data: Task[] }>('/tasks', {
      params,
    });
    return res.data.data || [];
  }

  /**
   * Fetch weekly statistics.
   */
  async fetchWeeklyStats(params?: { date?: string; weekStart?: string }): Promise<WeeklyStats> {
    const res = await apiClient.get<{ success: boolean; data: WeeklyStats }>('/tasks/stats/weekly', {
      params,
    });
    return res.data.data;
  }

  /**
   * Fetch a single task by ID.
   */
  async getTaskById(id: string): Promise<Task> {
    const res = await apiClient.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return res.data.data;
  }

  /**
   * Create a new task in MongoDB.
   */
  async createTask(formData: TaskFormData): Promise<Task> {
    const res = await apiClient.post<{ success: boolean; data: Task }>('/tasks', formData);
    return res.data.data;
  }

  /**
   * Update an existing task in MongoDB.
   */
  async updateTask(id: string, formData: TaskFormData): Promise<Task> {
    const res = await apiClient.put<{ success: boolean; data: Task }>(`/tasks/${id}`, formData);
    return res.data.data;
  }

  /**
   * Toggle status or set status directly.
   */
  async patchTaskStatus(id: string, status?: 'pending' | 'completed'): Promise<Task> {
    const res = await apiClient.patch<{ success: boolean; data: Task }>(
      `/tasks/${id}/status`,
      status ? { status } : {}
    );
    return res.data.data;
  }

  /**
   * Alias for patchTaskStatus
   */
  async toggleTaskStatus(id: string, status?: 'pending' | 'completed'): Promise<Task> {
    return this.patchTaskStatus(id, status);
  }

  /**
   * Delete a task by ID from MongoDB.
   */
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Fetch real notifications from MongoDB Atlas.
   */
  async fetchNotifications(): Promise<Array<{
    _id: string;
    title: string;
    message: string;
    type: 'reminder' | 'progress' | 'task_created' | 'task_completed';
    isRead: boolean;
    createdAt: string;
  }>> {
    const res = await apiClient.get<{
      success: boolean;
      data: Array<{
        _id: string;
        title: string;
        message: string;
        type: 'reminder' | 'progress' | 'task_created' | 'task_completed';
        isRead: boolean;
        createdAt: string;
      }>;
    }>('/notifications');
    return res.data.data || [];
  }

  /**
   * Delete all notifications for the authenticated user from MongoDB Atlas.
   */
  async clearNotifications(): Promise<void> {
    await apiClient.delete('/notifications');
  }

  /**
   * Mark a single notification as read in MongoDB Atlas.
   */
  async markNotificationRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }
}

export const api = new ApiService();
