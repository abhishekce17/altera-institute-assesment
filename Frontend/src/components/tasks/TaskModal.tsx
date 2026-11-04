import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import type { Task, TaskPriority } from '../../types/task';
import { formatDisplayDate, getTodayISO } from '../../utils/date';

export interface TaskFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: TaskPriority;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  initialTask?: Task | null;
  defaultDate?: string;
}

interface TaskModalContentProps {
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  initialTask?: Task | null;
  defaultDate?: string;
}

const TaskModalContent: React.FC<TaskModalContentProps> = ({
  onClose,
  onSubmit,
  initialTask,
  defaultDate,
}) => {
  const isEditing = Boolean(initialTask);
  const today = getTodayISO();

  const [title, setTitle] = useState<string>(initialTask ? initialTask.title : '');
  const [description, setDescription] = useState<string>(initialTask?.description || '');
  const [date, setDate] = useState<string>(initialTask ? initialTask.date : defaultDate || today);
  const [startTime, setStartTime] = useState<string>(initialTask ? initialTask.startTime : '09:00 AM');
  const [endTime, setEndTime] = useState<string>(initialTask ? initialTask.endTime : '10:30 AM');
  const [priority, setPriority] = useState<TaskPriority>(initialTask ? initialTask.priority : 'Medium');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!date) {
      setError('Date is required');
      return;
    }

    if (!startTime.trim() || !endTime.trim()) {
      setError('Start and end times are required');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      priority,
    });

    onClose();
  };

  const priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Content: Bottom sheet on mobile, centered dialog on desktop */}
      <div className="relative w-full sm:max-w-lg md:max-w-xl bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[92vh] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Task Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-bold text-slate-700 mb-1.5">
              Task title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Doing Homework"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3866F2] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Set Time (Start & End Time side-by-side) */}
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Set Time</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00 AM"
                  aria-label="Start Time"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#3866F2] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="10:30 AM"
                  aria-label="End Time"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#3866F2] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Set Date */}
          <div>
            <label htmlFor="task-date" className="block text-xs font-bold text-slate-700 mb-1.5">
              Set Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#3866F2] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium cursor-pointer"
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
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      isSelected
                        ? opt === 'High'
                          ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                          : opt === 'Medium'
                          ? 'bg-[#3866F2] text-white border-[#3866F2] shadow-sm shadow-blue-500/20'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
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
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add Description"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3866F2] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-[#3866F2] hover:bg-[#2B52D4] active:scale-[0.98] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition-all cursor-pointer flex items-center justify-center"
            >
              {isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultDate,
}) => {
  if (!isOpen) return null;

  return (
    <TaskModalContent
      key={initialTask ? initialTask._id : 'new-task'}
      onClose={onClose}
      onSubmit={onSubmit}
      initialTask={initialTask}
      defaultDate={defaultDate}
    />
  );
};
