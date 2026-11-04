import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  User as UserIcon,
  Mail,
  Lock,
  Save,
  LogOut,
  LogIn,
  AlertCircle,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import type { TaskPriority } from '../../types/task';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';

interface SettingsScreenProps {
  onBack: () => void;
  onRefreshData?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onRefreshData }) => {
  const { user, isAuthenticated, logout, updateProfile, refreshProfile } = useAuth();

  // Local form state initialized from MongoDB user profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>(
    user?.preferences?.defaultPriority || 'Medium'
  );
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(
    user?.preferences?.notificationEnabled ?? true
  );

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync form state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setDefaultPriority(user.preferences?.defaultPriority || 'Medium');
      setNotificationEnabled(user.preferences?.notificationEnabled ?? true);
    }
  }, [user]);

  const showNotice = (msg: string) => {
    setFeedbackMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setFeedbackMessage(null);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handleSaveToMongoDB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!name.trim()) {
      showError('Please enter a valid name.');
      return;
    }

    if (!email.trim()) {
      showError('Please enter a valid email address.');
      return;
    }

    if (password.trim()) {
      if (password.trim().length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
      }
      if (password.trim() !== confirmPassword.trim()) {
        showError('Passwords do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() ? password.trim() : undefined,
        preferences: {
          defaultPriority,
          notificationEnabled,
        },
      });

      setPassword('');
      setConfirmPassword('');
      showNotice('Profile & preferences saved successfully!');
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      showError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
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
            <h1 className="text-lg font-bold text-slate-900">Account & Settings</h1>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="h-9 px-3 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-9 px-3.5 bg-[#3866F2] hover:bg-[#2b54d6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Error Alert Toast */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="border border-slate-200 p-8 text-center bg-slate-50/50 my-auto">
            <div className="w-12 h-12 bg-[#3866F2] text-white flex items-center justify-center mx-auto mb-3 font-bold text-base">
              <LogIn className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Sign In Required</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Please sign in or create an account to view and update your profile details and task preferences.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="py-2.5 px-6 bg-[#3866F2] hover:bg-[#2b54d6] text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        ) : (
          /* Main Settings Form for Authenticated User */
          <form onSubmit={handleSaveToMongoDB} className="space-y-6">
            {/* Section 1: User Profile Details */}
            <div className="border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    User Profile
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manage your name, email, and authentication credentials.
                  </p>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Update Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty to keep existing password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-white"
                  />
                </div>
              </div>

              {password.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: User Preferences */}
            <div className="border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Task Preferences
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Custom defaults saved to your account.
                  </p>
                </div>
                <Bell className="w-4 h-4 text-slate-500" />
              </div>

              {/* Default Priority Setting */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Default Priority for New Tasks
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => {
                    const isSelected = defaultPriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDefaultPriority(p)}
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
                <span className="block text-[11px] text-slate-400 mt-1.5">
                  New tasks created will automatically default to this priority level.
                </span>
              </div>

              {/* Notification Reminders Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-slate-800">
                    Task Reminders & Notifications
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Track schedule deadlines and weekly completion progress
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationEnabled(!notificationEnabled)}
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

            {/* Save Button */}
            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="py-3 px-6 bg-[#3866F2] hover:bg-[#2b54d6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Auth Modal for Login/Signup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          refreshProfile();
          if (onRefreshData) onRefreshData();
          showNotice('Signed in successfully!');
        }}
      />
    </div>
  );
};
