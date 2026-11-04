import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import { queryClient } from '../../services/queryClient';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSuccess,
  initialMode = 'login',
  subtitle: propSubtitle,
}) => {
  const { login, register } = useAuth();
  const storeIsOpen = useAppStore((s) => s.isAuthModalOpen);
  const storeSubtitle = useAppStore((s) => s.authModalSubtitle);
  const closeAuthModal = useAppStore((s) => s.closeAuthModal);
  const closeTaskModal = useAppStore((s) => s.closeTaskModal);
  const pendingTaskSubmission = useAppStore((s) => s.pendingTaskSubmission);
  const clearPendingTaskSubmission = useAppStore((s) => s.clearPendingTaskSubmission);

  const isOpen = propIsOpen ?? storeIsOpen;
  const subtitle = propSubtitle ?? storeSubtitle;
  const handleClose = propOnClose ?? closeAuthModal;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSeedInvigilator = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await api.seedInvigilatorData();
      await login({ email: data.credentials.email, password: data.credentials.password });
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to seed invigilator data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({ name: name.trim(), email: email.trim(), password });
      }

      // Automatically execute pending task submission if one was preserved
      if (pendingTaskSubmission) {
        const { formData, isEditing, taskId } = pendingTaskSubmission;
        try {
          if (isEditing && taskId) {
            await api.updateTask(taskId, formData);
          } else {
            await api.createTask(formData);
          }
        } catch (err) {
          console.error('[AuthModal] Failed to auto-save pending task post-login:', err);
        } finally {
          clearPendingTaskSubmission();
          closeTaskModal();
        }
      }

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['tasks'] }),
        queryClient.refetchQueries({ queryKey: ['notifications'] }),
      ]);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3866F2] text-white flex items-center justify-center font-bold text-sm">
              TD
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-sm font-bold text-slate-900">
                {mode === 'login' ? 'Sign In to To-Do' : 'Create Account'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {subtitle ||
                  (mode === 'login'
                    ? 'Access your saved tasks & preferences'
                    : 'Start syncing tasks directly to MongoDB')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setConfirmPassword('');
            }}
            className={`py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-[#3866F2] text-[#3866F2] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setConfirmPassword('');
            }}
            className={`py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-[#3866F2] text-[#3866F2] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content & Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter password'}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-slate-50/50"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-[#3866F2] bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#3866F2] hover:bg-[#2b54d6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo User Seed Trigger */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSeedInvigilator}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#3866F2] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 border border-blue-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Seed & Demo Login</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Prepopulates past, present & future tasks into MongoDB Atlas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

