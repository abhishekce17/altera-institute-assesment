import React, { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { DayItem } from '../../types/task';
import { useAppStore } from '../../store/useAppStore';
import { useTasks } from '../../hooks/useTasks';
import { getScrollableDays, getTodayISO } from '../../utils/date';

interface DateStripProps {
  days?: DayItem[];
  onSelectDate?: (dateString: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ days, onSelectDate }) => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const { tasks } = useTasks();

  const today = getTodayISO();
  const handleSelectDate = onSelectDate || setSelectedDate;

  // Generate 60 days in past and 60 days in future from today for bi-directional scroll
  const activeDays = useMemo(() => {
    return days || getScrollableDays(selectedDate, 60, 60);
  }, [days, selectedDate]);

  // Set of dates that have tasks added
  const datesWithTasks = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(tasks)) {
      for (const t of tasks) {
        if (t.date) {
          set.add(t.date);
        }
      }
    }
    return set;
  }, [tasks]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const selectedButtonRef = useRef<HTMLButtonElement | null>(null);
  const isUserActionRef = useRef(false);

  // Instant scroll on initial layout before paint - zero visible sliding/rotation on refresh
  useLayoutEffect(() => {
    if (selectedButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = selectedButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const targetScrollLeft =
        container.scrollLeft +
        (buttonRect.left - containerRect.left) -
        containerRect.width / 2 +
        buttonRect.width / 2;
      container.scrollLeft = targetScrollLeft;
    }
  }, []);

  // Smooth scroll ONLY on direct user click/interaction
  useEffect(() => {
    if (isUserActionRef.current && selectedButtonRef.current) {
      selectedButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      isUserActionRef.current = false;
    }
  }, [selectedDate]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const handleJumpToToday = () => {
    isUserActionRef.current = true;
    handleSelectDate(today);
  };

  const handleDayClick = (dateString: string) => {
    isUserActionRef.current = true;
    handleSelectDate(dateString);
  };

  return (
    <div className="w-full py-1">
      {/* Top Strip Navigation Controls */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          {selectedDate !== today && (
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-[#3866F2] hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-2.5 h-2.5" />
              <span>Today</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Scroll to previous days"
            className="w-7 h-7 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Scroll to next days"
            className="w-7 h-7 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontally scrollable date strip */}
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Scrollable calendar strip"
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 touch-pan-x"
      >
        {activeDays.map((day) => {
          const isSelected = day.isSelected;
          const hasTasks = datesWithTasks.has(day.dateString);

          return (
            <button
              key={day.dateString}
              ref={isSelected ? selectedButtonRef : undefined}
              type="button"
              onClick={() => handleDayClick(day.dateString)}
              className={`shrink-0 w-[52px] h-[68px] flex flex-col items-center justify-center cursor-pointer transition-colors border-2 ${
                isSelected
                  ? day.isToday
                    ? 'bg-[#3866F2] text-white border-white ring-2 ring-[#3866F2]'
                    : 'bg-[#3866F2] text-white border-[#3866F2]'
                  : day.isToday
                  ? 'border-[#3866F2] bg-white text-slate-900 font-bold hover:bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200/80'
              }`}
            >
              {/* Day abbreviation (Mon, Tue, etc.) */}
              <span
                className={`text-[11px] font-semibold leading-none mb-1.5 ${
                  isSelected ? 'text-blue-100' : day.isToday ? 'text-[#3866F2]' : 'text-slate-400'
                }`}
              >
                {day.dayName}
              </span>

              {/* Day number (02, 05, etc.) */}
              <span
                className={`text-sm md:text-base font-bold leading-none ${
                  isSelected ? 'text-white' : day.isToday ? 'text-slate-900' : 'text-slate-800'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Task dot indicator: shows only when task(s) are added on this date */}
              <div className="h-1.5 mt-1.5 flex items-center justify-center">
                {hasTasks ? (
                  <span
                    className={`date-dot w-1.5 h-1.5 ${
                      isSelected ? 'bg-white' : 'bg-[#3866F2]'
                    } shrink-0`}
                    title="Has scheduled tasks"
                  />
                ) : (
                  <span className="w-1.5 h-1.5 invisible shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
