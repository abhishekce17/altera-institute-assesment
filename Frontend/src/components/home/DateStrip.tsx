import React from 'react';
import type { DayItem } from '../../types/task';
import { useAppStore } from '../../store/useAppStore';
import { getWeekDays } from '../../utils/date';

interface DateStripProps {
  days?: DayItem[];
  onSelectDate?: (dateString: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ days, onSelectDate }) => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);

  const activeDays = days || getWeekDays(selectedDate, selectedDate);
  const handleSelectDate = onSelectDate || setSelectedDate;

  return (
    <div className="px-4 md:px-0 py-2">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full py-1">
        {activeDays.map((day) => {
          const isSelected = day.isSelected;
          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() => handleSelectDate(day.dateString)}
              className={`w-full h-[68px] flex flex-col items-center justify-center cursor-pointer transition-colors border ${
                isSelected
                  ? 'bg-[#3866F2] text-white border-[#3866F2]'
                  : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent hover:border-slate-200/60'
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

              {/* Current date indicator dot (only displayed on today's date box) */}
              <div className="h-1.5 mt-1.5 flex items-center justify-center">
                {day.isToday ? (
                  <span
                    className={`date-dot w-1.5 h-1.5 ${
                      isSelected ? 'bg-white' : 'bg-[#3866F2]'
                    }`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 invisible" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
