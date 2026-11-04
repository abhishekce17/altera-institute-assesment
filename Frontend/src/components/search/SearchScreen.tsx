import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import { useTasks } from '../../hooks/useTasks';
import { useAppStore } from '../../store/useAppStore';
import type { Task } from '../../types/task';

interface SearchScreenProps {
  tasks?: Task[];
  onBack?: () => void;
  onToggleStatus?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = (props) => {
  const navigate = useNavigate();
  const { tasks: storeTasks, toggleTaskStatus, deleteTask } = useTasks();
  const openEditTask = useAppStore((state) => state.openEditTask);

  const activeTasks = props.tasks ?? storeTasks;
  const handleBack = props.onBack || (() => navigate('/home'));
  const handleToggleStatus = props.onToggleStatus ?? toggleTaskStatus;
  const handleEdit = props.onEdit ?? openEditTask;
  const handleDelete = props.onDelete ?? deleteTask;

  const [query, setQuery] = useState<string>('');

  const filteredTasks = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return activeTasks;

    return activeTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(trimmed) ||
        (task.description && task.description.toLowerCase().includes(trimmed))
    );
  }, [activeTasks, query]);

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen md:min-h-[850px] p-5 md:p-8">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
        {/* Top Bar with Back Arrow */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to home"
            className="p-2 -ml-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
            <span className="hidden md:inline text-xs font-semibold text-slate-600">Back to Dashboard</span>
          </button>
          <h1 className="text-lg font-bold text-slate-900">Search Tasks</h1>
        </div>

        {/* Search Input Box */}
        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type task title or keyword (e.g., Wireframe, Meeting, Homework)..."
            className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200/90 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3866F2] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {query.trim() ? `Results (${filteredTasks.length})` : `All Tasks (${activeTasks.length})`}
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="py-20 text-center text-slate-400 bg-slate-50/60 border border-dashed border-slate-200">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">No matching tasks found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with another keyword or title phrase
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
