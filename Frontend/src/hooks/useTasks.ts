import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import { getMondayOfDate, getTodayISO } from '../utils/date';
import { api } from '../services/api';

export function useTasks() {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pure dynamic state from MongoDB - no static or mock items
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from backend API connected to MongoDB Atlas
  const loadServerTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const serverTasks = await api.fetchTasks();
      setTasks(serverTasks || []);
      setIsOnline(true);
    } catch (err) {
      console.warn('[useTasks] Server sync notice:', err);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync with MongoDB on mount
  useEffect(() => {
    let ignore = false;

    async function initialSync() {
      try {
        const serverTasks = await api.fetchTasks();
        if (!ignore) {
          setTasks(serverTasks || []);
          setIsOnline(true);
        }
      } catch (err) {
        if (!ignore) {
          console.warn('[useTasks] Initial backend sync:', err);
          setIsOnline(false);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initialSync();

    return () => {
      ignore = true;
    };
  }, []);

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

  // Create Task in MongoDB
  const addTask = async (formData: TaskFormData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      _id: tempId,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      priority: formData.priority,
      status: 'pending',
      weekStart: getMondayOfDate(formData.date),
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const savedTask = await api.createTask(formData);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? savedTask : t)));
    } catch (err) {
      console.error('[API Create Failed, reverting]', err);
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
    }
  };

  // Update Task in MongoDB
  const updateTask = async (id: string, formData: TaskFormData) => {
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? {
              ...t,
              title: formData.title,
              description: formData.description,
              date: formData.date,
              startTime: formData.startTime,
              endTime: formData.endTime,
              priority: formData.priority,
              weekStart: getMondayOfDate(formData.date),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    try {
      const updated = await api.updateTask(id, formData);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      console.error('[API Update Failed, reverting]', err);
      setTasks(previous);
    }
  };

  // Toggle Task Status in MongoDB
  const toggleTaskStatus = async (id: string) => {
    const target = tasks.find((t) => t._id === id);
    if (!target) return;

    const previous = tasks;
    const newStatus = target.status === 'completed' ? 'pending' : 'completed';

    setTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? {
              ...t,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    try {
      await api.toggleTaskStatus(id, newStatus);
    } catch (err) {
      console.error('[API Toggle Failed, reverting]', err);
      setTasks(previous);
    }
  };

  // Delete Task from MongoDB
  const deleteTask = async (id: string) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await api.deleteTask(id);
    } catch (err) {
      console.error('[API Delete Failed, reverting]', err);
      setTasks(previous);
    }
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
    refreshTasks: loadServerTasks,
  };
}
