import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import { getMondayOfDate, getTodayISO } from '../utils/date';
import { api } from '../services/api';

export function useTasks() {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initial fallback mock tasks from Figma mockups
  const [tasks, setTasks] = useState<Task[]>(() => [
    {
      _id: 'sample-1',
      title: 'Finishing Wireframe',
      description: 'High-fidelity wireframes in Figma',
      date: today,
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      priority: 'High',
      status: 'pending',
      weekStart: getMondayOfDate(today),
    },
    {
      _id: 'sample-2',
      title: 'Meeting with team',
      description: 'Sprint planning and architecture review',
      date: today,
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      priority: 'Medium',
      status: 'pending',
      weekStart: getMondayOfDate(today),
    },
    {
      _id: 'sample-3',
      title: 'Buy a cat food',
      description: 'Salmon pouches from the pet market',
      date: today,
      startTime: '01:00 PM',
      endTime: '01:30 PM',
      priority: 'Low',
      status: 'completed',
      weekStart: getMondayOfDate(today),
    },
    {
      _id: 'sample-4',
      title: 'Finishing daily commission',
      description: 'Deliver the client illustrations and exports',
      date: today,
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      priority: 'High',
      status: 'completed',
      weekStart: getMondayOfDate(today),
    },
  ]);

  // Load tasks from backend API when available
  const loadServerTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const healthy = await api.checkHealth();
      setIsOnline(healthy);

      if (healthy) {
        const serverTasks = await api.fetchTasks();
        if (serverTasks && serverTasks.length > 0) {
          setTasks(serverTasks);
        }
      }
    } catch (err) {
      console.warn('[useTasks] Server sync notice:', err);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Async effect for initial backend sync
  useEffect(() => {
    let ignore = false;

    async function initialSync() {
      try {
        const healthy = await api.checkHealth();
        if (ignore) return;
        setIsOnline(healthy);

        if (healthy) {
          const serverTasks = await api.fetchTasks();
          if (ignore) return;
          if (serverTasks && serverTasks.length > 0) {
            setTasks(serverTasks);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.warn('[useTasks] Initial backend sync:', err);
          setIsOnline(false);
        }
      }
    }

    initialSync();

    return () => {
      ignore = true;
    };
  }, []);

  // Active week start
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

  // Optimistic Create
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

    if (isOnline) {
      try {
        const savedTask = await api.createTask(formData);
        setTasks((prev) => prev.map((t) => (t._id === tempId ? savedTask : t)));
      } catch (err) {
        console.error('[API Create Failed, using local copy]', err);
      }
    }
  };

  // Optimistic Update
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

    if (isOnline) {
      try {
        const updated = await api.updateTask(id, formData);
        setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      } catch (err) {
        console.error('[API Update Failed, reverting]', err);
        setTasks(previous);
      }
    }
  };

  // Optimistic Status Toggle
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

    if (isOnline) {
      try {
        await api.toggleTaskStatus(id, newStatus);
      } catch (err) {
        console.error('[API Toggle Failed, reverting]', err);
        setTasks(previous);
      }
    }
  };

  // Optimistic Delete
  const deleteTask = async (id: string) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));

    if (isOnline) {
      try {
        await api.deleteTask(id);
      } catch (err) {
        console.error('[API Delete Failed, reverting]', err);
        setTasks(previous);
      }
    }
  };

  // Reset tasks to initial demo state
  const resetTasks = () => {
    setTasks([
      {
        _id: 'sample-1',
        title: 'Finishing Wireframe',
        description: 'High-fidelity wireframes in Figma',
        date: today,
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        priority: 'High',
        status: 'pending',
        weekStart: getMondayOfDate(today),
      },
      {
        _id: 'sample-2',
        title: 'Meeting with team',
        description: 'Sprint planning and architecture review',
        date: today,
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        priority: 'Medium',
        status: 'pending',
        weekStart: getMondayOfDate(today),
      },
      {
        _id: 'sample-3',
        title: 'Buy a cat food',
        description: 'Salmon pouches from the pet market',
        date: today,
        startTime: '01:00 PM',
        endTime: '01:30 PM',
        priority: 'Low',
        status: 'completed',
        weekStart: getMondayOfDate(today),
      },
      {
        _id: 'sample-4',
        title: 'Finishing daily commission',
        description: 'Deliver the client illustrations and exports',
        date: today,
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        priority: 'High',
        status: 'completed',
        weekStart: getMondayOfDate(today),
      },
    ]);
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
    resetTasks,
  };
}
