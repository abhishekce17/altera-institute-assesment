import { create } from 'zustand';
import type { Task } from '../types/task';
import type { TaskFormData } from '../components/tasks/TaskModal';
import { getTodayISO } from '../utils/date';

interface PendingTaskSubmission {
  formData: TaskFormData;
  isEditing: boolean;
  taskId?: string;
}

interface AppStoreState {
  // Calendar & Task Filtering State
  selectedDate: string;
  showAllTasks: boolean;

  // Task Modal State
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  pendingTaskSubmission: PendingTaskSubmission | null;

  // Auth Modal State
  isAuthModalOpen: boolean;
  authModalSubtitle?: string;

  // Actions
  setSelectedDate: (date: string) => void;
  setShowAllTasks: (show: boolean) => void;
  toggleShowAllTasks: () => void;
  openAddTask: () => void;
  openEditTask: (task: Task) => void;
  closeTaskModal: () => void;
  openAuthModal: (subtitle?: string) => void;
  closeAuthModal: () => void;
  setPendingTaskSubmission: (submission: PendingTaskSubmission | null) => void;
  clearPendingTaskSubmission: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  selectedDate: getTodayISO(),
  showAllTasks: false,

  isTaskModalOpen: false,
  editingTask: null,
  pendingTaskSubmission: null,

  isAuthModalOpen: false,
  authModalSubtitle: undefined,

  setSelectedDate: (date: string) => set({ selectedDate: date }),
  setShowAllTasks: (show: boolean) => set({ showAllTasks: show }),
  toggleShowAllTasks: () => set((state) => ({ showAllTasks: !state.showAllTasks })),

  openAddTask: () =>
    set({
      isTaskModalOpen: true,
      editingTask: null,
    }),

  openEditTask: (task: Task) =>
    set({
      isTaskModalOpen: true,
      editingTask: task,
    }),

  closeTaskModal: () =>
    set({
      isTaskModalOpen: false,
      editingTask: null,
      pendingTaskSubmission: null,
    }),

  openAuthModal: (subtitle?: string) =>
    set({
      isAuthModalOpen: true,
      authModalSubtitle: subtitle,
    }),

  closeAuthModal: () =>
    set({
      isAuthModalOpen: false,
      authModalSubtitle: undefined,
    }),

  setPendingTaskSubmission: (submission) =>
    set({
      pendingTaskSubmission: submission,
    }),

  clearPendingTaskSubmission: () =>
    set({
      pendingTaskSubmission: null,
    }),
}));

