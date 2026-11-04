import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types/auth';
import type { TaskPriority } from '../types/task';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (info: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: {
    name?: string;
    email?: string;
    password?: string;
    preferences?: { defaultPriority?: TaskPriority; notificationEnabled?: boolean };
  }) => Promise<User>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshProfile = useCallback(async () => {
    const currentToken = api.getToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const profile = await api.getProfile();
      setUser(profile);
      setError(null);
    } catch (err) {
      console.warn('[AuthContext] Failed to load user profile from MongoDB:', err);
      // If unauthorized, reset token
      api.setToken(null);
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(credentials);
      setTokenState(res.token);
      setUser(res.user);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (info: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register(info);
      setTokenState(res.token);
      setUser(res.user);
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your details.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setTokenState(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updates: {
    name?: string;
    email?: string;
    password?: string;
    preferences?: { defaultPriority?: TaskPriority; notificationEnabled?: boolean };
  }): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await api.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      const msg = err.message || 'Failed to update user profile in MongoDB.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

