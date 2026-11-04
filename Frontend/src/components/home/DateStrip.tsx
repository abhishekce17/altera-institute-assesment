import React from 'react';
import type { DayItem } from '../../types/task';

interface DateStripProps {
  days: DayItem[];
  onSelectDate: (dateString: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ days, onSelectDate }) => {
  return (
    <div className="px-4 py-2 bg-white">
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
        {days.map((day) => {
          const isSelected = day.isSelected;
          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() => onSelectDate(day.dateString)}
              className={`flex-1 min-w-[42px] max-w-[48px] py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#3866F2] text-white shadow-md shadow-blue-500/25 scale-[1.03]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {/* Day abbreviation (Mon, Tue, etc.) */}
              <span
                className={`text-[11px] font-medium leading-none mb-1.5 ${
                  isSelected ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {day.dayName}
              </span>

              {/* Day number (12, 13, etc.) */}
              <span
                className={`text-sm font-bold leading-none ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Active selection dot indicator */}
              <div className="h-1.5 mt-1.5 flex items-center justify-center">
                {isSelected ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
