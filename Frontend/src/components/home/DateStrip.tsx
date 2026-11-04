import React, { useRef, useLayoutEffect, useMemo } from 'react';
import type { DayItem } from '../../types/task';
import { useAppStore } from '../../store/useAppStore';
import { useTasks } from '../../hooks/useTasks';
import { getScrollableDays, getMondayOfDate } from '../../utils/date';

interface DateStripProps {
  days?: DayItem[];
  onSelectDate?: (dateString: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ days, onSelectDate }) => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const { tasks } = useTasks();

  const handleSelectDate = onSelectDate || setSelectedDate;

  // Generate 8 weeks past and 8 weeks future, aligned to full Monday-to-Sunday weeks
  const activeDays = useMemo(() => {
    return days || getScrollableDays(selectedDate, 8, 8);
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

  const activeMondayStr = useMemo(() => getMondayOfDate(selectedDate), [selectedDate]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const mondayButtonRef = useRef<HTMLButtonElement | null>(null);

  // Mouse drag-to-scroll refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Instant scroll on initial layout before paint — perfectly aligns the 7-day week with zero visible sliding
  useLayoutEffect(() => {
    if (mondayButtonRef.current && scrollRef.current) {
      scrollRef.current.scrollLeft = mondayButtonRef.current.offsetLeft;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="px-4 md:px-0 py-2">
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Scrollable calendar strip"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1 touch-pan-x w-full select-none cursor-grab active:cursor-grabbing"
      >
        {activeDays.map((day) => {
          const isSelected = day.isSelected;
          const hasTasks = datesWithTasks.has(day.dateString);
          const isMondayOfSelectedWeek = day.dateString === activeMondayStr;

          return (
            <button
              key={day.dateString}
              ref={isMondayOfSelectedWeek ? mondayButtonRef : undefined}
              type="button"
              onClick={() => {
                if (hasDraggedRef.current) return;
                handleSelectDate(day.dateString);
              }}
              className={`date-strip-item shrink-0 h-[68px] flex flex-col items-center justify-center cursor-pointer transition-colors border-2 ${
                isSelected
                  ? 'bg-[#3866F2] text-white border-[#3866F2]'
                  : day.isToday
                  ? 'border-[#3866F2] bg-white text-slate-900 font-bold hover:bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200/80'
              }`}
            >
              {/* Day abbreviation (Mon, Tue, etc.) */}
              <span
                className={`text-[11px] md:text-xs font-semibold leading-none mb-1.5 ${
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
