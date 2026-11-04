import React from 'react';
import onboardingBg from '../../assets/onboarding-bg.png';
import { CheckSquare, Calendar, TrendingUp, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="flex-1 flex flex-col md:flex-row bg-white h-full min-h-screen md:min-h-[850px] overflow-hidden">
      {/* Hero graphic section: Top on mobile, Left half on desktop */}
      <div className="relative w-full md:w-1/2 h-[55vh] md:h-auto overflow-hidden bg-[#3866F2] flex items-center justify-center">
        <img
          src={onboardingBg}
          alt="Onboarding Background"
          className="w-full h-full object-cover object-top select-none"
        />
        {/* Soft gradient blend for mobile */}
        <div className="md:hidden absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Information and Call-to-Action: Bottom on mobile, Right half on desktop */}
      <div className="flex-1 flex flex-col justify-between px-7 md:px-12 pt-4 md:py-16 pb-8 bg-white">
        <div className="space-y-6 pt-2 md:pt-8 max-w-md">
          {/* Desktop App Badge */}
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#3866F2] text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Task Manager & Weekly Planner</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Manage What To Do
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              The best way to manage what you have to do, don't forget your plans
            </p>
          </div>

          {/* Desktop Feature Highlights */}
          <div className="hidden md:grid grid-cols-1 gap-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3866F2] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Weekly Calendar Strip</h2>
                <p className="text-xs text-slate-400">Track tasks organized Monday to Sunday</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Visual Progress Metrics</h2>
                <p className="text-xs text-slate-400">Live completed vs pending task insights</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Intuitive Task Controls</h2>
                <p className="text-xs text-slate-400">Swipe to delete, quick edit & real-time search</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 md:pt-8 max-w-md">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full py-4 px-6 bg-[#3866F2] hover:bg-[#2B52D4] active:scale-[0.98] text-white font-semibold text-base rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
