import React from 'react';
import onboardingBg from '../../assets/onboarding-bg.png';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-white h-full min-h-screen sm:min-h-[800px]">
      {/* Hero graphic section */}
      <div className="relative w-full h-[58%] overflow-hidden bg-[#3866F2]">
        <img
          src={onboardingBg}
          alt="Onboarding Background"
          className="w-full h-full object-cover object-top select-none"
        />
        {/* Soft gradient blend into bottom white sheet */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Information and Call-to-Action */}
      <div className="flex-1 flex flex-col justify-between px-7 pt-4 pb-8 bg-white">
        <div className="space-y-3 pt-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Manage What To Do
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
            The best way to manage what you have to do, don't forget your plans
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-6">
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
