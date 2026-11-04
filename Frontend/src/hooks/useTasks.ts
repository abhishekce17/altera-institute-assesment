import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import { getMondayOfDate } from '../utils/date';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';

export function useTasks() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Pull active calendar date & showAllTasks filter from Zustand store
  const {
    selectedDate,
    showAllTasks,
    setSelectedDate,
    setShowAllTasks,
  } = useAppStore();

  // Query tasks from MongoDB Atlas for the authenticated user
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      if (!isAuthenticated) return [];
      const data = await api.fetchTasks();
      return data || [];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30s fresh
  });

  const tasks = isAuthenticated ? tasksQuery.data || [] : [];
  const isLoading = tasksQuery.isLoading;
  const isOnline = !tasksQuery.isError;

  // Active week start (Monday)
  const activeWeekStart = useMemo(() => getMondayOfDate(selectedDate), [selectedDate]);

  // Tasks belonging to the active week
  const weekTasks = useMemo(() => {
    return tasks.filter((t) => t.weekStart === activeWeekStart);
  }, [tasks, activeWeekStart]);

  // Tasks for the selected day or all tasks for the week
  const displayedTasks = useMemo(() => {
    if (showAllTasks) {
      return weekTasks;
    }
    return tasks.filter((t) => t.date === selectedDate);
  }, [tasks, selectedDate, showAllTasks, weekTasks]);

  // Dynamically calculated weekly statistics
  const weeklyStats: WeeklyStats = useMemo(() => {
    const completed = weekTasks.filter((t) => t.status === 'completed').length;
    const open = weekTasks.filter((t) => t.status === 'pending').length;
    const total = completed + open;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      weekStart: activeWeekStart,
      weekEnd: '',
      completed,
      open,
      total,
      progressPercentage,
    };
  }, [weekTasks, activeWeekStart]);

  // TanStack Mutation: Create Task in MongoDB Atlas
  const addTaskMutation = useMutation({
    mutationFn: (formData: TaskFormData) => api.createTask(formData),
    onSuccess: (savedTask) => {
      queryClient.setQueryData<Task[]>(['tasks'], (prev = []) => [savedTask, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // TanStack Mutation: Update Task in MongoDB Atlas
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: TaskFormData }) =>
      api.updateTask(id, formData),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(['tasks'], (prev = []) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // TanStack Mutation: Toggle Task Status in MongoDB Atlas with optimistic update
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status?: 'pending' | 'completed' }) =>
      api.patchTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (prev = []) =>
        prev.map((t) => {
          if (t._id !== id) return t;
          const targetStatus = status || (t.status === 'completed' ? 'pending' : 'completed');
          return {
            ...t,
            status: targetStatus,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // TanStack Mutation: Delete Task from MongoDB Atlas with optimistic update
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (prev = []) =>
        prev.filter((t) => t._id !== id)
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const addTask = async (formData: TaskFormData) => {
    return addTaskMutation.mutateAsync(formData);
  };

  const updateTask = async (id: string, formData: TaskFormData) => {
    return updateTaskMutation.mutateAsync({ id, formData });
  };

  const toggleTaskStatus = async (id: string) => {
    const target = tasks.find((t) => t._id === id);
    const newStatus = target && target.status === 'completed' ? 'pending' : 'completed';
    return toggleStatusMutation.mutateAsync({ id, status: newStatus });
  };

  const deleteTask = async (id: string) => {
    return deleteTaskMutation.mutateAsync(id);
  };

  const refreshTasks = async () => {
    await tasksQuery.refetch();
  };

  return {
    tasks,
    displayedTasks,
    weeklyStats,
    selectedDate,
    showAllTasks,
    isOnline,
    isLoading,
    setSelectedDate,
    setShowAllTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    refreshTasks,
  };
}
