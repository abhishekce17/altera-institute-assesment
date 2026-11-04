import React from 'react';
import type { DayItem } from '../../types/task';

interface DateStripProps {
  days: DayItem[];
  onSelectDate: (dateString: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ days, onSelectDate }) => {
  return (
    <div className="px-4 md:px-0 py-2">
      <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
        {days.map((day) => {
          const isSelected = day.isSelected;
          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() => onSelectDate(day.dateString)}
              className={`flex-1 min-w-[42px] max-w-[48px] md:max-w-none py-2.5 md:py-3 px-1 md:px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#3866F2] text-white scale-[1.03]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200/60'
              }`}
            >
              {/* Day abbreviation (Mon, Tue, etc.) */}
              <span
                className={`text-[11px] md:text-xs font-medium leading-none mb-1.5 ${
                  isSelected ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {day.dayName}
              </span>

              {/* Day number (12, 13, etc.) */}
              <span
                className={`text-sm md:text-base font-bold leading-none ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Active selection dot indicator */}
              <div className="h-1.5 mt-1.5 flex items-center justify-center">
                {isSelected ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
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
