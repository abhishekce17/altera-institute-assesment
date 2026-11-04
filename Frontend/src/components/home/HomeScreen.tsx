import React from 'react';
import { Header } from './Header';
import { DateStrip } from './DateStrip';
import { SummaryCards } from './SummaryCards';
import { ProgressBar } from './ProgressBar';
import { TaskList } from '../tasks/TaskList';
import { FloatingActionButton } from '../ui/FloatingActionButton';
import { getWeekDays } from '../../utils/date';
import type { Task, WeeklyStats } from '../../types/task';

interface HomeScreenProps {
  tasks: Task[];
  weeklyStats: WeeklyStats;
  selectedDate: string;
  showAllTasks: boolean;
  isOnline?: boolean;
  onSelectDate: (date: string) => void;
  onToggleShowAll: () => void;
  onSearchClick: () => void;
  onAddTaskClick: () => void;
  onToggleStatus: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  weeklyStats,
  selectedDate,
  showAllTasks,
  isOnline,
  onSelectDate,
  onToggleShowAll,
  onSearchClick,
  onAddTaskClick,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}) => {
  // Generate 7-day strip based on selected date
  const weekDays = getWeekDays(selectedDate, selectedDate);

  return (
    <div className="flex-1 flex flex-col justify-between bg-white min-h-screen sm:min-h-[850px]">
      <div className="space-y-1">
        {/* Top Header */}
        <Header onSearchClick={onSearchClick} isOnline={isOnline} />

        {/* 7-Day Calendar Strip */}
        <DateStrip days={weekDays} onSelectDate={onSelectDate} />

        {/* Weekly Metrics Summary Cards */}
        <SummaryCards
          completedCount={weeklyStats.completed}
          pendingCount={weeklyStats.open}
          subtitle="This Week"
        />

        {/* Weekly Progress Bar */}
        <ProgressBar percentage={weeklyStats.progressPercentage} />

        {/* Tasks Section */}
        <section className="px-5 pt-3 pb-20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900">
              {showAllTasks ? 'This Week’s Tasks' : 'Tasks Today'}
            </h2>
            <button
              type="button"
              onClick={onToggleShowAll}
              className="text-xs font-semibold text-[#3866F2] hover:text-[#2B52D4] cursor-pointer"
            >
              {showAllTasks ? 'Show Today' : 'View All'}
            </button>
          </div>

          {/* Interactive Task List with Swipe-to-Delete */}
          <TaskList
            tasks={tasks}
            onToggleStatus={onToggleStatus}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onAddTask={onAddTaskClick}
            emptyMessage={showAllTasks ? 'No tasks this week' : 'No tasks scheduled for today'}
          />
        </section>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onAddTaskClick} />
    </div>
  );
};
