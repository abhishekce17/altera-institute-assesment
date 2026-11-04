import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types/auth';
import type { TaskPriority } from '../types/task';
import { api } from '../services/api';
import { queryClient } from '../services/queryClient';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (info: { name: string; email: string; password: string; hasOnboarded?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    email?: string;
    password?: string;
    preferences?: { defaultPriority?: TaskPriority; notificationEnabled?: boolean };
    hasOnboarded?: boolean;
  }) => Promise<User>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshProfile = useCallback(async () => {
    try {
      // HTTP-only cookie is sent automatically by the browser with credentials: 'include'
      const profile = await api.getProfile();
      setUser(profile);
      setError(null);
    } catch {
      // Unauthenticated session (guest)
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    api
      .getProfile()
      .then((profile) => {
        if (isMounted) {
          setUser(profile);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      await Promise.all([
        queryClient.resetQueries({ queryKey: ['tasks'] }),
        queryClient.resetQueries({ queryKey: ['notifications'] }),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (info: { name: string; email: string; password: string; hasOnboarded?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register(info);
      setUser(res.user);
      await Promise.all([
        queryClient.resetQueries({ queryKey: ['tasks'] }),
        queryClient.resetQueries({ queryKey: ['notifications'] }),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Best effort
    }
    setUser(null);
    setError(null);
    queryClient.clear();
  };

  const updateProfile = async (updates: {
    name?: string;
    email?: string;
    password?: string;
    preferences?: { defaultPriority?: TaskPriority; notificationEnabled?: boolean };
    hasOnboarded?: boolean;
  }): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await api.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user profile in MongoDB.';
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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

export { useAuth } from '../hooks/useAuth';
