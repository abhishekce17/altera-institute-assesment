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

  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const justDraggedRef = useRef<boolean>(false);
  const isHorizontalRef = useRef<boolean | null>(null);

  const isCompleted = task.status === 'completed';

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore clicks on interactive buttons (checkbox, edit, delete)
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startOffsetRef.current = swipeOffset;
    hasDraggedRef.current = false;
    isHorizontalRef.current = null;
    isDraggingRef.current = true;
    setIsSwiping(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = startXRef.current - e.clientX;
    const deltaY = Math.abs(startYRef.current - e.clientY);

    // Lock direction on initial gesture
    if (isHorizontalRef.current === null) {
      if (Math.abs(deltaX) > 6 || deltaY > 6) {
        isHorizontalRef.current = Math.abs(deltaX) > deltaY;
      }
    }

    if (!isHorizontalRef.current) return;

    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
    }

    // Calculate target offset from initial offset
    const nextOffset = Math.max(0, Math.min(200, startOffsetRef.current + deltaX));
    setSwipeOffset(nextOffset);
  };

  const handlePointerEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsSwiping(false);

    if (hasDraggedRef.current) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 250);
    }

    // Full swipe (> 130px) triggers delete animation & deletion
    if (swipeOffset > 130) {
      setSwipeOffset(400);
      setTimeout(() => {
        onDelete(task._id);
      }, 180);
    } else if (swipeOffset > 35) {
      // Snap open cleanly to reveal the 80px delete button
      setSwipeOffset(80);
    } else {
      // Snap closed
      setSwipeOffset(0);
    }
  };

  const priorityStyles = {
    High: 'bg-red-50 text-red-600 border border-red-100',
    Medium: 'bg-blue-50 text-blue-600 border border-blue-100',
    Low: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  };

  return (
    <div className="relative overflow-hidden my-2 select-none group touch-pan-y">
      {/* Background Revealed Delete Trigger */}
      <div
        className="absolute inset-y-0 right-0 w-20 bg-red-600 flex items-center justify-center text-white"
        style={{ zIndex: 1 }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSwipeOffset(0);
            onDelete(task._id);
          }}
          className="w-full h-full flex flex-col items-center justify-center gap-1 text-white hover:bg-red-700 active:bg-red-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Delete</span>
        </button>
      </div>

      {/* Foreground Task Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDragStart={(e) => e.preventDefault()}
        onClick={() => {
          if (justDraggedRef.current) return;
          if (swipeOffset > 0) {
            setSwipeOffset(0);
          }
        }}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        className={`relative bg-white border border-slate-100/90 p-3.5 md:p-4 flex items-center justify-between gap-3 hover:border-slate-300/80 transition-colors z-10 ${
          swipeOffset > 0 ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Left: Checkbox & Task Information */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Custom Checkbox matching Figma */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(task._id);
            }}
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
              onClick={(e) => {
                e.stopPropagation();
                if (justDraggedRef.current) return;
                if (swipeOffset > 0) {
                  setSwipeOffset(0);
                } else {
                  onToggleStatus(task._id);
                }
              }}
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
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            aria-label="Edit task"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
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
