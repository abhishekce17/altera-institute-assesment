import React, { useState } from 'react';
import { Search, Settings, Bell, Plus, CheckSquare, LogIn, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';

interface HeaderProps {
  onSearchClick: () => void;
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
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="px-5 md:px-8 pt-4 md:pt-6 pb-2 md:pb-4 border-b border-slate-100 bg-white">
      {/* Desktop Top Bar (hidden on mobile) */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Brand / Logo & User Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3866F2] flex items-center justify-center text-white font-bold text-sm">
            {isAuthenticated && user?.name ? user.name.slice(0, 2).toUpperCase() : <CheckSquare className="w-5 h-5 stroke-[2.2]" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {isAuthenticated && user?.name ? `Hello, ${user.name}` : 'My Tasks'}
            </h1>
            <p className="text-xs text-slate-400">
              {isAuthenticated && user?.email ? user.email : 'Weekly Planner & To-Do'}
            </p>
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
          className="flex-1 max-w-md flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 cursor-pointer text-slate-400 transition-all"
        >
          <span className="text-sm text-slate-400 select-none">Search for a task...</span>
          <Search className="w-4 h-4 text-slate-500" />
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onSettingsClick}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#3866F2]" />
              <span className="max-w-[120px] truncate">{user?.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 bg-[#3866F2] hover:bg-[#2b54d6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {onAddTaskClick && (
            <button
              type="button"
              onClick={onAddTaskClick}
              className="px-4 py-2 bg-[#3866F2] hover:bg-[#2B52D4] active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            <span className="notification-badge absolute top-2 right-2 w-2 h-2 bg-[#3866F2] ring-2 ring-white" />
          </button>

          <button
            type="button"
            onClick={onSettingsClick}
            aria-label="Settings"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
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
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5 stroke-[1.8]" />
            </button>
            {isAuthenticated && user && (
              <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                {user.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-2.5 py-1 text-xs font-bold text-[#3866F2] hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNotificationClick}
              aria-label="Notifications"
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5 stroke-[1.8]" />
              <span className="notification-badge absolute top-2 right-2 w-2 h-2 bg-[#3866F2] ring-2 ring-white" />
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
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer text-slate-400 transition-all"
        >
          <span className="text-sm font-normal text-slate-400 select-none">Search for a task</span>
          <Search className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Auth Modal for Quick Login / Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          refreshProfile();
        }}
      />
    </header>
  );
};
