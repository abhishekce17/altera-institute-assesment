import { useState, useMemo } from 'react';
import type { Task, WeeklyStats } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import { getMondayOfDate, getTodayISO } from '../utils/date';

export function useTasks() {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);

  // Initial sample tasks matching Figma designs
  const [tasks, setTasks] = useState<Task[]>(() => [
    {
      _id: '1',
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
      _id: '2',
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
      _id: '3',
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
      _id: '4',
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

  // Action handlers
  const addTask = (formData: TaskFormData) => {
    const newTask: Task = {
      _id: `task-${Date.now()}`,
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
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, formData: TaskFormData) => {
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
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return {
    tasks,
    displayedTasks,
    weeklyStats,
    selectedDate,
    showAllTasks,
    setSelectedDate,
    setShowAllTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  };
}
