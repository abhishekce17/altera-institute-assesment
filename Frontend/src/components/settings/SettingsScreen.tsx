import React, { useState } from 'react';
import { ArrowLeft, Check, RefreshCw, RotateCcw, Info } from 'lucide-react';
import type { TaskPriority } from '../../types/task';

interface SettingsScreenProps {
  onBack: () => void;
  onRefreshData?: () => void;
  onResetData?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onRefreshData,
  onResetData,
}) => {
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>(() => {
    return (localStorage.getItem('todo_default_priority') as TaskPriority) || 'Medium';
  });

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('todo_notifications') !== 'false';
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handlePriorityChange = (p: TaskPriority) => {
    setDefaultPriority(p);
    localStorage.setItem('todo_default_priority', p);
    showNotice(`Default priority set to ${p}`);
  };

  const handleToggleNotifications = () => {
    const next = !notificationEnabled;
    setNotificationEnabled(next);
    localStorage.setItem('todo_notifications', String(next));
    showNotice(next ? 'Notifications enabled' : 'Notifications disabled');
  };

  const showNotice = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleReset = () => {
    if (onResetData) {
      onResetData();
      showNotice('Tasks reset to default seed list');
    }
  };

  const handleRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
      showNotice('Syncing data from server...');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen md:min-h-[850px] p-5 md:p-8">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
        {/* Header */}
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
            <h1 className="text-lg font-bold text-slate-900">Settings</h1>
          </div>
        </div>

        {/* Feedback notification toast */}
        {feedbackMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-xs font-semibold text-[#3866F2] flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Section 1: Task Preferences */}
          <div className="border border-slate-100 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              Task Preferences
            </h2>

            {/* Default Priority */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                Default Priority for New Tasks
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => {
                  const isSelected = defaultPriority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePriorityChange(p)}
                      className={`py-2 px-3 text-xs font-bold border transition-colors cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#3866F2] text-white border-[#3866F2]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-800">
                  Task Reminders
                </span>
                <span className="text-[11px] text-slate-400">
                  Receive schedule and progress updates
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                  notificationEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}
              >
                {notificationEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Section 2: Data Management */}
          <div className="border border-slate-100 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              Data & Sync
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Fetch from Server</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 px-4 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                <span>Reset Demo Tasks</span>
              </button>
            </div>
          </div>

          {/* Section 3: About */}
          <div className="border border-slate-100 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#3866F2]" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                About Application
              </h2>
            </div>
            <div className="text-xs text-slate-500 space-y-1 pt-1">
              <p><strong className="text-slate-700">Project:</strong> To-Do List Application</p>
              <p><strong className="text-slate-700">Assessment:</strong> SDE-1 (MERN Stack)</p>
              <p><strong className="text-slate-700">Version:</strong> 1.0.0</p>
              <p><strong className="text-slate-700">Week Organization:</strong> Monday to Sunday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
