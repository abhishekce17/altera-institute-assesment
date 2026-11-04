import React, { useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'reminder' | 'progress' | 'system';
  isRead: boolean;
}

interface NotificationScreenProps {
  onBack: () => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Task Reminder',
      message: 'Finishing Wireframe starts at 09:00 AM',
      time: '15m ago',
      type: 'reminder',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Weekly Progress Update',
      message: 'You have completed 50% of your scheduled tasks this week',
      time: '2h ago',
      type: 'progress',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Daily Task Summary',
      message: '4 tasks are scheduled for today',
      time: 'Today, 08:00 AM',
      type: 'reminder',
      isRead: true,
    },
    {
      id: 'notif-4',
      title: 'New Week Started',
      message: 'Monday to Sunday weekly schedule initialized',
      time: '2 days ago',
      type: 'system',
      isRead: true,
    },
  ]);

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

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
              onClick={handleClearAll}
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
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-4 border flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                  notif.isRead
                    ? 'bg-white border-slate-100 text-slate-500'
                    : 'bg-blue-50/30 border-blue-100/80 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                      notif.type === 'progress'
                        ? 'bg-emerald-50 text-emerald-600'
                        : notif.type === 'reminder'
                        ? 'bg-blue-50 text-[#3866F2]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {notif.type === 'progress' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                        {notif.title}
                      </h2>
                      {!notif.isRead && (
                        <span className="notification-badge w-2 h-2 bg-[#3866F2]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                  {notif.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

