import React from 'react';
import { Search, Settings, Bell } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onSettingsClick,
  onNotificationClick,
}) => {
  return (
    <header className="px-5 pt-4 pb-2 space-y-3 bg-white">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSettingsClick}
          aria-label="Settings"
          className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {/* Notification alert dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Search trigger bar matching Figma Frame 2 */}
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
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl cursor-pointer text-slate-400 transition-all shadow-sm"
      >
        <span className="text-sm font-normal text-slate-400 select-none">Search for a task</span>
        <Search className="w-4 h-4 text-slate-500" />
      </div>
    </header>
  );
};
