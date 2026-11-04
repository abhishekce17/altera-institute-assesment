import React from 'react';
import { Search, Settings, Bell, Plus, CheckSquare } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onAddTaskClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: () => void;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onAddTaskClick,
  onSettingsClick,
  onNotificationClick,
  isOnline = false,
}) => {
  return (
    <header className="px-5 md:px-8 pt-4 md:pt-6 pb-2 md:pb-4 border-b border-slate-100 bg-white">
      {/* Desktop Top Bar (hidden on mobile) */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3866F2] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">My Tasks</h1>
            <p className="text-xs text-slate-400">Weekly Planner & To-Do</p>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 select-none ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {isOnline ? 'API Live' : 'Demo Mode'}
          </div>
        </div>

        {/* Center / Search bar trigger */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSearchClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSearchClick();
            }
          }}
          className="flex-1 max-w-md flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-xl cursor-pointer text-slate-400 transition-all shadow-xs"
        >
          <span className="text-sm text-slate-400 select-none">Search for a task...</span>
          <Search className="w-4 h-4 text-slate-500" />
        </div>

        {/* Right action controls + Desktop Add Button */}
        <div className="flex items-center gap-2">
          {onAddTaskClick && (
            <button
              type="button"
              onClick={onAddTaskClick}
              className="px-4 py-2 bg-[#3866F2] hover:bg-[#2B52D4] active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#3866F2] rounded-full ring-2 ring-white" />
          </button>

          <button
            type="button"
            onClick={onSettingsClick}
            aria-label="Settings"
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* Mobile Top Bar matching Figma Frame 2 exactly (hidden on md+) */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSettingsClick}
              aria-label="Settings"
              className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Connection Status Badge */}
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 select-none ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/80'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isOnline ? 'API Live' : 'Demo Mode'}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onNotificationClick}
              aria-label="Notifications"
              className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#3866F2] rounded-full ring-2 ring-white" />
            </button>
          </div>
        </div>

        {/* Mobile Search trigger bar matching Figma Frame 2 */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSearchClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSearchClick();
            }
          }}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl cursor-pointer text-slate-400 transition-all shadow-xs"
        >
          <span className="text-sm font-normal text-slate-400 select-none">Search for a task</span>
          <Search className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
};
