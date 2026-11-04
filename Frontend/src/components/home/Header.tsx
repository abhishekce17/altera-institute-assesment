import React from 'react';
import { Search, Settings, Bell } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: () => void;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onSettingsClick,
  onNotificationClick,
  isOnline = false,
}) => {
  return (
    <header className="px-5 pt-4 pb-2 space-y-3 bg-white">
      {/* Top action row */}
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

          {/* Backend Connection Status Badge */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 transition-all select-none ${
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
            {/* Notification alert dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#3866F2] rounded-full ring-2 ring-white" />
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
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl cursor-pointer text-slate-400 transition-all shadow-xs"
      >
        <span className="text-sm font-normal text-slate-400 select-none">Search for a task</span>
        <Search className="w-4 h-4 text-slate-500" />
      </div>
    </header>
  );
};
