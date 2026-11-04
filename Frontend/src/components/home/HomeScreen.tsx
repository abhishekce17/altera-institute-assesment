import React from 'react';
import { Header } from './Header';
import { DateStrip } from './DateStrip';
import { SummaryCards } from './SummaryCards';
import { ProgressBar } from './ProgressBar';
import { TaskList } from '../tasks/TaskList';
import { getWeekDays } from '../../utils/date';
import type { Task, WeeklyStats } from '../../types/task';
import { Calendar, CheckCircle2 } from 'lucide-react';

interface HomeScreenProps {
  tasks: Task[];
  weeklyStats: WeeklyStats;
  selectedDate: string;
  showAllTasks: boolean;
  onSelectDate: (date: string) => void;
  onToggleShowAll: () => void;
  onSearchClick: () => void;
  onAddTaskClick: () => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onToggleStatus: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  weeklyStats,
  selectedDate,
  showAllTasks,
  onSelectDate,
  onToggleShowAll,
  onSearchClick,
  onAddTaskClick,
  onNotificationClick,
  onSettingsClick,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}) => {
  // Generate 7-day strip based on selected date
  const weekDays = getWeekDays(selectedDate, selectedDate);

  return (
    <div className="flex-1 flex flex-col justify-between bg-white min-h-screen md:min-h-0 relative">
      <div>
        {/* Top Header - responsive across mobile & desktop */}
        <Header
          onSearchClick={onSearchClick}
          onAddTaskClick={onAddTaskClick}
          onNotificationClick={onNotificationClick}
          onSettingsClick={onSettingsClick}
        />

        {/* Desktop Layout (2-Column Grid on lg+) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 px-8 py-6">
          {/* Left Column: Weekly Schedule & Stats Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Calendar Card */}
            <div className="bg-slate-50/70 border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#3866F2]" />
                <h2 className="text-sm font-bold text-slate-800">Weekly Schedule</h2>
              </div>
              <DateStrip days={weekDays} onSelectDate={onSelectDate} />
            </div>

            {/* Weekly Overview Card */}
            <div className="bg-slate-50/70 border border-slate-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3866F2]" />
                  <h2 className="text-sm font-bold text-slate-800">Weekly Overview</h2>
                </div>
              </div>

              <SummaryCards
                completedCount={weeklyStats.completed}
                pendingCount={weeklyStats.open}
                subtitle="This Week"
              />

              <ProgressBar percentage={weeklyStats.progressPercentage} />
            </div>
          </div>

          {/* Right Column: Task List (7 cols) */}
          <div className="lg:col-span-7 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {showAllTasks ? 'This Week’s Tasks' : 'Tasks Today'}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-[#3866F2]">
                  {tasks.length}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleShowAll}
                className="text-xs font-semibold text-[#3866F2] hover:text-[#2B52D4] cursor-pointer hover:underline"
              >
                {showAllTasks ? 'Show Today' : 'View All'}
              </button>
            </div>

            {/* Interactive Task List */}
            <TaskList
              tasks={tasks}
              onToggleStatus={onToggleStatus}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onAddTask={onAddTaskClick}
              emptyMessage={showAllTasks ? 'No tasks this week' : 'No tasks scheduled for today'}
            />
          </div>
        </div>

        {/* Mobile / Tablet Layout (Single Column on < lg) */}
        <div className="lg:hidden space-y-1">
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
          <section className="px-5 pt-3 pb-24">
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
      </div>
    </div>
  );
};
