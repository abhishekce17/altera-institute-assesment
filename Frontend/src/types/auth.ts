import type { TaskPriority } from './task';

export interface UserPreferences {
  defaultPriority: TaskPriority;
  notificationEnabled: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

