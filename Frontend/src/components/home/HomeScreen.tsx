import React from 'react';
import { Header } from './Header';
import { DateStrip } from './DateStrip';
import { SummaryCards } from './SummaryCards';
import { ProgressBar } from './ProgressBar';
import { TaskList } from '../tasks/TaskList';
import { SummaryCardsSkeleton, ProgressBarSkeleton } from '../ui/Skeleton';
import { useTasks } from '../../hooks/useTasks';
import { useAppStore } from '../../store/useAppStore';
import { getTodayISO, formatDisplayDate } from '../../utils/date';
import type { Task, WeeklyStats } from '../../types/task';
import { Calendar, CheckCircle2 } from 'lucide-react';

interface HomeScreenProps {
  tasks?: Task[];
  weeklyStats?: WeeklyStats;
  selectedDate?: string;
  showAllTasks?: boolean;
  isLoading?: boolean;
  onSelectDate?: (date: string) => void;
  onToggleShowAll?: () => void;
  onSearchClick?: () => void;
  onAddTaskClick?: () => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onToggleStatus?: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = (props) => {
  const {
    displayedTasks: storeTasks,
    weeklyStats: storeWeeklyStats,
    isLoading: storeIsLoading,
    toggleTaskStatus,
    deleteTask,
  } = useTasks();

  const today = getTodayISO();
  const selectedDate = props.selectedDate ?? useAppStore((state) => state.selectedDate);
  const showAllTasks = props.showAllTasks ?? useAppStore((state) => state.showAllTasks);
  const toggleShowAllTasks = props.onToggleShowAll ?? useAppStore((state) => state.toggleShowAllTasks);
  const openAddTask = props.onAddTaskClick ?? useAppStore((state) => state.openAddTask);
  const openEditTask = props.onEditTask ?? useAppStore((state) => state.openEditTask);

  const activeTasks = props.tasks ?? storeTasks;
  const activeWeeklyStats = props.weeklyStats ?? storeWeeklyStats;
  const isLoading = props.isLoading ?? storeIsLoading;
  const handleToggleStatus = props.onToggleStatus ?? toggleTaskStatus;
  const handleDeleteTask = props.onDeleteTask ?? deleteTask;

  const isPastSelected = !showAllTasks && selectedDate < today;
  const headingText = showAllTasks
    ? 'This Week’s Tasks'
    : selectedDate === today
    ? 'Tasks Today'
    : formatDisplayDate(selectedDate);

  return (
    <div className="flex-1 flex flex-col justify-between bg-white min-h-screen md:min-h-0 relative">
      <div>
        {/* Top Header - responsive across mobile & desktop */}
        <Header
          onSearchClick={props.onSearchClick}
          onAddTaskClick={openAddTask}
          onNotificationClick={props.onNotificationClick}
          onSettingsClick={props.onSettingsClick}
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
              <DateStrip onSelectDate={props.onSelectDate} />
            </div>

            {/* Weekly Overview Card */}
            <div className="bg-slate-50/70 border border-slate-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3866F2]" />
                  <h2 className="text-sm font-bold text-slate-800">Weekly Overview</h2>
                </div>
              </div>

              {isLoading ? (
                <>
                  <SummaryCardsSkeleton />
                  <ProgressBarSkeleton />
                </>
              ) : (
                <>
                  <SummaryCards
                    completedCount={activeWeeklyStats.completed}
                    pendingCount={activeWeeklyStats.open}
                    subtitle="This Week"
                  />
                  <ProgressBar percentage={activeWeeklyStats.progressPercentage} />
                </>
              )}
            </div>
          </div>

          {/* Right Column: Task List (7 cols) */}
          <div className="lg:col-span-7 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 min-h-[44px]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {headingText}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-[#3866F2]">
                  {isLoading ? '...' : activeTasks.length}
                </span>
                {isPastSelected && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                    Past Date
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={toggleShowAllTasks}
                className="text-xs font-semibold text-[#3866F2] hover:text-[#2B52D4] cursor-pointer hover:underline"
              >
                {showAllTasks ? 'Show Today' : 'View All'}
              </button>
            </div>

            {/* Interactive Task List with Skeleton Support */}
            <TaskList
              tasks={activeTasks}
              isLoading={isLoading}
              selectedDate={showAllTasks ? undefined : selectedDate}
              onToggleStatus={handleToggleStatus}
              onEdit={openEditTask}
              onDelete={handleDeleteTask}
              onAddTask={openAddTask}
              emptyMessage={showAllTasks ? 'No tasks this week' : undefined}
            />
          </div>
        </div>

        {/* Mobile / Tablet Layout (Single Column on < lg) */}
        <div className="lg:hidden space-y-1">
          {/* 7-Day Calendar Strip */}
          <DateStrip onSelectDate={props.onSelectDate} />

          {/* Weekly Metrics Summary Cards */}
          {isLoading ? (
            <>
              <SummaryCardsSkeleton />
              <ProgressBarSkeleton />
            </>
          ) : (
            <>
              <SummaryCards
                completedCount={activeWeeklyStats.completed}
                pendingCount={activeWeeklyStats.open}
                subtitle="This Week"
              />
              <ProgressBar percentage={activeWeeklyStats.progressPercentage} />
            </>
          )}

          {/* Tasks Section */}
          <section className="px-5 pt-3 pb-24">
            <div className="flex items-center justify-between mb-2 min-h-[32px]">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {headingText}
                </h2>
                {isPastSelected && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                    Past
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={toggleShowAllTasks}
                className="text-xs font-semibold text-[#3866F2] hover:text-[#2B52D4] cursor-pointer"
              >
                {showAllTasks ? 'Show Today' : 'View All'}
              </button>
            </div>

            {/* Interactive Task List with Swipe-to-Delete and Skeleton Loading */}
            <TaskList
              tasks={activeTasks}
              isLoading={isLoading}
              selectedDate={showAllTasks ? undefined : selectedDate}
              onToggleStatus={handleToggleStatus}
              onEdit={openEditTask}
              onDelete={handleDeleteTask}
              onAddTask={openAddTask}
              emptyMessage={showAllTasks ? 'No tasks this week' : undefined}
            />
          </section>
        </div>
      </div>
    </div>
  );
};
