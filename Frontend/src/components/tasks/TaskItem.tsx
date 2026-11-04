import React, { useState, useRef } from 'react';
import { Check, Trash2, Edit3 } from 'lucide-react';
import type { Task } from '../../types/task';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const isCompleted = task.status === 'completed';

  // Touch event handlers for mobile swipe-to-delete
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = touchStartXRef.current - e.touches[0].clientX;
    const deltaY = Math.abs(touchStartYRef.current - e.touches[0].clientY);

    // Detect if this is horizontal swipe vs vertical page scroll
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 8 || deltaY > 8) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > deltaY;
      }
    }

    if (!isHorizontalSwipeRef.current) return;

    // Only allow swiping left (deltaX > 0)
    if (deltaX > 0) {
      const clamped = Math.min(80, deltaX);
      setSwipeOffset(clamped);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeOffset > 40) {
      setSwipeOffset(76); // Snap open to reveal delete action
    } else {
      setSwipeOffset(0); // Snap closed
    }
  };

  const priorityStyles = {
    High: 'bg-red-50 text-red-600 border border-red-100',
    Medium: 'bg-blue-50 text-blue-600 border border-blue-100',
    Low: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  };

  return (
    <div className="relative overflow-hidden my-2 select-none group">
      {/* Background Revealed Delete Trigger */}
      <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center text-white font-medium text-xs">
        <button
          type="button"
          onClick={() => {
            setSwipeOffset(0);
            onDelete(task._id);
          }}
          className="w-full h-full flex flex-col items-center justify-center gap-1 text-white active:bg-red-600 transition-colors cursor-pointer"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">Delete</span>
        </button>
      </div>

      {/* Foreground Task Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative bg-white border border-slate-100/90 p-3.5 md:p-4 flex items-center justify-between gap-3 hover:border-slate-300/80 transition-all z-10"
      >
        {/* Left: Checkbox & Task Information */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Custom Checkbox matching Figma */}
          <button
            type="button"
            onClick={() => onToggleStatus(task._id)}
            aria-label={isCompleted ? 'Mark task as pending' : 'Mark task as completed'}
            className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isCompleted
                ? 'bg-[#3866F2] text-white'
                : 'border-2 border-slate-300 hover:border-[#3866F2] bg-white'
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 stroke-[2.8]" />}
          </button>

          {/* Task Info */}
          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onToggleStatus(task._id)}
              className={`text-sm font-semibold tracking-tight truncate cursor-pointer transition-colors ${
                isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-800'
              }`}
            >
              {task.title}
            </h3>

            {/* Time range & priority tag */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-medium text-slate-400">
                {task.startTime} - {task.endTime}
              </span>
              {task.priority && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 ${
                    priorityStyles[task.priority] || priorityStyles.Medium
                  }`}
                >
                  {task.priority}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions (Edit & Delete buttons) */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            aria-label="Delete task"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

