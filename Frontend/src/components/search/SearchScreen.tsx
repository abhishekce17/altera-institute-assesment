import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import type { Task } from '../../types/task';

interface SearchScreenProps {
  tasks: Task[];
  onBack: () => void;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  tasks,
  onBack,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const [query, setQuery] = useState<string>('');

  const filteredTasks = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return tasks;

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(trimmed) ||
        (task.description && task.description.toLowerCase().includes(trimmed))
    );
  }, [tasks, query]);

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen sm:min-h-[850px] p-5">
      {/* Top Bar with Back Arrow matching Figma Frame 9 */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Search Tasks</h1>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Finish"
          className="w-full pl-4 pr-10 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:border-[#3866F2] focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {query.trim() ? `Results (${filteredTasks.length})` : `All Tasks (${tasks.length})`}
        </span>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
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
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

