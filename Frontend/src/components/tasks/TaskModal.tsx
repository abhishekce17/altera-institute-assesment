import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import type { Task, TaskPriority } from '../../types/task';
import {
  formatDisplayDate,
  getTodayISO,
  timeToMinutes,
  to24HourInput,
  to12HourDisplay,
} from '../../utils/date';
import { useAuth } from '../../context/AuthContext';

import { useAppStore } from '../../store/useAppStore';
import { useTasks } from '../../hooks/useTasks';

export interface TaskFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: TaskPriority;
}

interface TaskModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: TaskFormData) => boolean | Promise<boolean> | void;
  initialTask?: Task | null;
  initialFormData?: TaskFormData | null;
  defaultDate?: string;
}

interface TaskModalContentProps {
  onClose: () => void;
  onSubmit: (data: TaskFormData) => boolean | Promise<boolean> | void;
  initialTask?: Task | null;
  initialFormData?: TaskFormData | null;
  defaultDate?: string;
}

const TaskModalContent: React.FC<TaskModalContentProps> = ({
  onClose,
  onSubmit,
  initialTask,
  initialFormData,
  defaultDate,
}) => {
  const isEditing = Boolean(initialTask);
  const today = getTodayISO();
  const safeDefaultDate = defaultDate && defaultDate >= today ? defaultDate : today;

  const [title, setTitle] = useState<string>(
    initialFormData?.title ?? (initialTask ? initialTask.title : '')
  );
  const [description, setDescription] = useState<string>(
    initialFormData?.description ?? (initialTask?.description || '')
  );
  const [date, setDate] = useState<string>(
    initialFormData?.date ?? (initialTask ? initialTask.date : safeDefaultDate)
  );
  const [startTime, setStartTime] = useState<string>(
    initialFormData?.startTime ?? (initialTask ? initialTask.startTime : '09:00 AM')
  );
  const [endTime, setEndTime] = useState<string>(
    initialFormData?.endTime ?? (initialTask ? initialTask.endTime : '10:30 AM')
  );
  const { user } = useAuth();
  const defaultPriority = user?.preferences?.defaultPriority || 'Medium';
  const [priority, setPriority] = useState<TaskPriority>(
    initialFormData?.priority ?? (initialTask ? initialTask.priority : defaultPriority)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = isEditing
    ? title.trim() !== (initialTask?.title || '').trim() ||
      description.trim() !== (initialTask?.description || '').trim() ||
      date !== initialTask?.date ||
      to12HourDisplay(startTime) !== to12HourDisplay(initialTask?.startTime || '') ||
      to12HourDisplay(endTime) !== to12HourDisplay(initialTask?.endTime || '') ||
      priority !== initialTask?.priority
    : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    // Validation 1: Title required & length restrictions
    if (!title.trim()) {
      setError('Task title is mandatory.');
      return;
    }
    if (title.trim().length > 200) {
      setError('Task title cannot exceed 200 characters.');
      return;
    }

    // Validation 2: Date required & cannot be in the past
    if (!date) {
      setError('Task date is mandatory.');
      return;
    }
    if (date < today) {
      setError('Cannot schedule tasks on past dates. Please select today or a future date.');
      return;
    }

    // Validation 3: Time format and order restrictions
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (startMin === null || endMin === null) {
      setError('Please select valid start and end times.');
      return;
    }

    if (endMin <= startMin) {
      setError('End time must be later than start time.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSubmit({
        title: title.trim(),
        description: description.trim(),
        date,
        startTime: to12HourDisplay(startTime),
        endTime: to12HourDisplay(endTime),
        priority,
      });

      // If submission succeeded (or wasn't intercepted by auth requirement), close modal
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full sm:max-w-lg md:max-w-xl bg-white border border-slate-200/80 p-6 md:p-8 z-10 max-h-[92vh] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Task Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-bold text-slate-700 mb-1.5">
              Task title *
            </label>
            <input
              id="task-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Doing Homework"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3866F2] outline-none transition-all font-medium"
            />
          </div>

          {/* Set Time (Native restricted time picker to prevent garbage input) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-xs font-bold text-slate-700">Set Time *</span>
              <span className="text-[11px] text-slate-400 font-medium">
                {to12HourDisplay(startTime)} – {to12HourDisplay(endTime)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="time"
                    required
                    value={to24HourInput(startTime)}
                    onChange={(e) => {
                      setStartTime(to12HourDisplay(e.target.value));
                      if (error) setError(null);
                    }}
                    aria-label="Start Time"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#3866F2] outline-none transition-all font-semibold cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="time"
                    required
                    value={to24HourInput(endTime)}
                    onChange={(e) => {
                      setEndTime(to12HourDisplay(e.target.value));
                      if (error) setError(null);
                    }}
                    aria-label="End Time"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#3866F2] outline-none transition-all font-semibold cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Set Date */}
          <div>
            <label htmlFor="task-date" className="block text-xs font-bold text-slate-700 mb-1.5">
              Set Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="task-date"
                type="date"
                required
                min={today}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#3866F2] outline-none transition-all font-semibold cursor-pointer"
              />
            </div>
            {date && (
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {formatDisplayDate(date)}
              </p>
            )}
          </div>

          {/* Priority Selection */}
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Priority</span>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPriority(opt)}
                    className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer text-center ${
                      isSelected
                        ? opt === 'High'
                          ? 'bg-red-500 text-white border-red-500'
                          : opt === 'Medium'
                          ? 'bg-[#3866F2] text-white border-[#3866F2]'
                          : 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-bold text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="task-description"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or sprint objectives..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3866F2] outline-none transition-all resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isEditing && !hasChanges)}
              className={`px-6 py-2.5 text-xs font-bold transition-all ${
                isSubmitting || (isEditing && !hasChanges)
                  ? 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed select-none'
                  : 'bg-[#3866F2] hover:bg-[#2B52D4] text-white cursor-pointer active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TaskModal: React.FC<TaskModalProps> = (props) => {
  const { isAuthenticated } = useAuth();
  const { addTask, updateTask } = useTasks();
  const storeIsOpen = useAppStore((s) => s.isTaskModalOpen);
  const storeEditingTask = useAppStore((s) => s.editingTask);
  const storePending = useAppStore((s) => s.pendingTaskSubmission);
  const storeSelectedDate = useAppStore((s) => s.selectedDate);
  const closeTaskModal = useAppStore((s) => s.closeTaskModal);
  const setPendingTaskSubmission = useAppStore((s) => s.setPendingTaskSubmission);
  const openAuthModal = useAppStore((s) => s.openAuthModal);

  const isOpen = props.isOpen ?? storeIsOpen;
  if (!isOpen) return null;

  const editingTask = props.initialTask !== undefined ? props.initialTask : storeEditingTask;
  const initialFormData = props.initialFormData !== undefined ? props.initialFormData : storePending?.formData;
  const today = getTodayISO();
  const rawDate = props.defaultDate ?? storeSelectedDate;
  const defaultDate = rawDate && rawDate >= today ? rawDate : today;
  const onClose = props.onClose ?? closeTaskModal;

  const handleSubmit = props.onSubmit || (async (formData: TaskFormData): Promise<boolean> => {
    if (!isAuthenticated) {
      setPendingTaskSubmission({
        formData,
        isEditing: Boolean(editingTask),
        taskId: editingTask?._id,
      });
      openAuthModal('Sign in or create an account to save and create your task');
      return false;
    }

    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await addTask(formData);
    }
    closeTaskModal();
    return true;
  });

  return (
    <TaskModalContent
      onClose={onClose}
      onSubmit={handleSubmit}
      initialTask={editingTask}
      initialFormData={initialFormData}
      defaultDate={defaultDate}
    />
  );
};
