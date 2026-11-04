import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="px-5 md:px-0 py-3 md:py-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-slate-900">Weekly Progress</h2>
        <span className="text-xs font-semibold text-slate-500">{safePercentage}%</span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 md:h-3.5 bg-[#EBF2FE] overflow-hidden p-0.5">
        <div
          className="h-full bg-[#2B52D4] transition-all duration-500 ease-out"
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
};
