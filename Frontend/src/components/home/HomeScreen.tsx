import React, { useState } from 'react';
import { Header } from './Header';
import { DateStrip } from './DateStrip';
import { SummaryCards } from './SummaryCards';
import { ProgressBar } from './ProgressBar';
import { FloatingActionButton } from '../ui/FloatingActionButton';
import { getTodayISO, getWeekDays } from '../../utils/date';

interface HomeScreenProps {
  onSearchClick: () => void;
  onAddTaskClick: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSearchClick,
  onAddTaskClick,
}) => {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);

  // Generate 7-day strip based on selected date
  const weekDays = getWeekDays(selectedDate, selectedDate);

  // Default preview metrics for Phase 2
  const completedCount = 50;
  const pendingCount = 8;
  const totalCount = completedCount + pendingCount;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex-1 flex flex-col justify-between bg-white min-h-screen sm:min-h-[850px]">
      <div className="space-y-1">
        {/* Top Header */}
        <Header onSearchClick={onSearchClick} />

        {/* 7-Day Calendar Strip */}
        <DateStrip days={weekDays} onSelectDate={(date) => setSelectedDate(date)} />

        {/* Weekly Metrics Summary Cards */}
        <SummaryCards
          completedCount={completedCount}
          pendingCount={pendingCount}
          subtitle="This Week"
        />

        {/* Weekly Progress Bar */}
        <ProgressBar percentage={progressPercentage} />

        {/* Tasks Today Section */}
        <section className="px-5 pt-3 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Tasks Today</h2>
            <button
              type="button"
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="text-xs font-semibold text-[#3866F2] hover:text-[#2B52D4] cursor-pointer"
            >
              {showAllTasks ? 'Show Today' : 'View All'}
            </button>
          </div>

          {/* Placeholder preview for Phase 3 task items */}
          <div className="py-6 px-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-medium text-slate-400">
              Selected: <span className="text-slate-700 font-semibold">{selectedDate}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Task list and interactive gestures will be active in Phase 3.
            </p>
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onAddTaskClick} />
    </div>
  );
};
