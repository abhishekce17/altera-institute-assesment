import React from 'react';
import { CheckCircle2, Plus, CalendarOff } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { TaskListSkeleton } from '../ui/Skeleton';
import { getTodayISO } from '../../utils/date';
import type { Task } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  selectedDate?: string;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddTask?: () => void;
  emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading = false,
  selectedDate,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddTask,
  emptyMessage,
}) => {
  const today = getTodayISO();
  const isPast = selectedDate ? selectedDate < today : false;

  if (isLoading) {
    return <TaskListSkeleton count={3} />;
  }

  if (tasks.length === 0) {
    return (
      <div className="py-12 px-4 border border-dashed border-slate-200/90 flex flex-col items-center justify-center text-center bg-slate-50/50 my-2">
        <div className="w-12 h-12 bg-blue-50 text-[#3866F2] flex items-center justify-center mb-3">
          {isPast ? (
            <CalendarOff className="w-6 h-6 stroke-[1.8] text-slate-400" />
          ) : (
            <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
          )}
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {emptyMessage || (isPast ? 'No tasks were scheduled for this day' : 'No tasks scheduled for today')}
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
          {isPast
            ? 'Past dates cannot have new tasks added.'
            : 'Stay organized and hit your weekly goals by adding your first to-do item.'}
        </p>
        {!isPast && onAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            className="mt-4 px-4 py-2 bg-[#3866F2] hover:bg-[#2B52D4] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
