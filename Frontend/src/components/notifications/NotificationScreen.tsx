import React, { useMemo, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import type { Task } from '../../types/task';
import { getTodayISO } from '../../utils/date';

interface NotificationScreenProps {
  tasks?: Task[];
  onBack: () => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ tasks = [], onBack }) => {
  const [cleared, setCleared] = useState(false);
  const today = getTodayISO();

  // Generate dynamic notification items from live MongoDB tasks
  const notifications = useMemo(() => {
    if (cleared) return [];

    const items: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      type: 'reminder' | 'progress' | 'completed';
      isRead: boolean;
    }> = [];

    // Filter today's tasks
    const todayTasks = tasks.filter((t) => t.date === today);
    const completedToday = todayTasks.filter((t) => t.status === 'completed');
    const pendingToday = todayTasks.filter((t) => t.status === 'pending');

    // Add notification for upcoming today tasks
    pendingToday.forEach((t) => {
      items.push({
        id: `remind-${t._id}`,
        title: 'Task Reminder',
        message: `${t.title} is scheduled for ${t.startTime}`,
        time: t.startTime,
        type: 'reminder',
        isRead: false,
      });
    });

    // Add progress summary if tasks exist
    if (todayTasks.length > 0) {
      items.push({
        id: 'progress-today',
        title: 'Daily Progress',
        message: `You completed ${completedToday.length} of ${todayTasks.length} tasks scheduled for today.`,
        time: 'Today',
        type: 'progress',
        isRead: completedToday.length > 0,
      });
    }

    // Add completed task notices
    completedToday.forEach((t) => {
      items.push({
        id: `done-${t._id}`,
        title: 'Task Completed',
        message: `Marked "${t.title}" as complete.`,
        time: t.endTime,
        type: 'completed',
        isRead: true,
      });
    });

    return items;
  }, [tasks, today, cleared]);

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen md:min-h-[850px] p-5 md:p-8">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to home"
              className="p-2 -ml-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
              <span className="hidden md:inline text-xs font-semibold text-slate-600">Back to Dashboard</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setCleared(true)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {notifications.length === 0 ? (
            <div className="py-20 text-center text-slate-400 bg-slate-50/60 border border-dashed border-slate-200">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up with your schedule</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 border transition-colors flex items-start gap-3.5 ${
                  item.isRead
                    ? 'bg-white border-slate-100'
                    : 'bg-blue-50/40 border-blue-100'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                    item.type === 'completed'
                      ? 'bg-emerald-100 text-emerald-600'
                      : item.type === 'progress'
                      ? 'bg-blue-100 text-[#3866F2]'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {item.type === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.type === 'progress' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
