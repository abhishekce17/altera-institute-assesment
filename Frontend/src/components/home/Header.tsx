import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, Bell, Plus, CheckSquare, LogIn, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  onSearchClick?: () => void;
  onAddTaskClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onAddTaskClick,
  onSettingsClick,
  onNotificationClick,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const openAddTask = useAppStore((state) => state.openAddTask);
  const openAuthModal = useAppStore((state) => state.openAuthModal);

  const handleSearch = onSearchClick || (() => navigate('/search'));
  const handleSettings = onSettingsClick || (() => navigate('/settings'));
  const handleNotifications = onNotificationClick || (() => navigate('/notifications'));
  const handleAddTask = onAddTaskClick || openAddTask;

  return (
    <header className="px-5 md:px-8 py-3 md:py-4 border-b border-slate-100 bg-white">
      {/* Desktop Top Bar (hidden on mobile) */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Brand / Logo & User Greeting */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-[#3866F2] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {isAuthenticated && user?.name ? (
              user.name.slice(0, 2).toUpperCase()
            ) : (
              <CheckSquare className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {isAuthenticated && user?.name ? `Hello, ${user.name}` : 'My Tasks'}
            </h1>
            <p className="text-xs text-slate-400">
              Weekly Planner & To-Do
            </p>
          </div>
        </div>

        {/* Center / Search bar trigger (Uniform h-10 height) */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="flex-1 max-w-md h-10 flex items-center justify-between px-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 cursor-pointer text-slate-400 transition-all"
        >
          <span className="text-xs text-slate-400 select-none">Search for a task...</span>
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
        </div>

        {/* Right action controls (All exactly h-10 height) */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoading ? (
            <div className="h-10 w-24 bg-slate-100 border border-slate-200 animate-pulse" />
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={handleSettings}
              className="h-10 px-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#3866F2]" />
              <span className="max-w-[120px] truncate">{user?.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="h-10 px-4 bg-[#3866F2] hover:bg-[#2b54d6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddTask}
            className="h-10 px-4 bg-[#3866F2] hover:bg-[#2B52D4] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>

          <button
            type="button"
            onClick={handleNotifications}
            aria-label="Notifications"
            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative border border-slate-200"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="notification-badge absolute top-2 right-2 w-2 h-2 bg-[#3866F2] ring-2 ring-white" />
            )}
          </button>

          <button
            type="button"
            onClick={handleSettings}
            aria-label="Settings"
            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
          >
            <Settings className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* Mobile Top Bar matching Figma Frame 2 exactly (hidden on md+) */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSettings}
              aria-label="Settings"
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5 stroke-[1.8]" />
            </button>
            {isAuthenticated && user && (
              <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                {user.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse" />
            ) : !isAuthenticated ? (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="h-8 px-3 text-xs font-bold bg-blue-50 text-[#3866F2] hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleNotifications}
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5 stroke-[1.8]" />
              {unreadCount > 0 && (
                <span className="notification-badge absolute top-2 right-2 w-2 h-2 bg-[#3866F2] ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              onClick={handleAddTask}
              aria-label="Add Task"
              className="w-9 h-9 flex items-center justify-center bg-[#3866F2] hover:bg-[#2B52D4] text-white transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Mobile Search trigger bar matching Figma Frame 2 */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="w-full h-11 flex items-center justify-between px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer text-slate-400 transition-all"
        >
          <span className="text-xs font-normal text-slate-400 select-none">Search for a task</span>
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      </div>
    </header>
  );
};
