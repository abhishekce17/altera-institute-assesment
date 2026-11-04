import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';

interface SummaryCardsProps {
  completedCount: number;
  pendingCount: number;
  subtitle?: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  completedCount,
  pendingCount,
  subtitle = 'This Week',
}) => {
  // Pad with leading zero if single digit (e.g. 8 -> "08", 50 -> "50")
  const formatCount = (count: number) => {
    return count < 10 && count >= 0 ? `0${count}` : `${count}`;
  };

  return (
    <div className="px-5 md:px-0 py-3 md:py-2 grid grid-cols-2 gap-3.5 sm:gap-4">
      {/* Complete Tasks Card */}
      <div className="bg-[#EBF2FE] rounded-2xl p-4 md:p-5 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01] border border-blue-100/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#3866F2] flex items-center justify-center text-white shadow-sm">
            <CheckSquare className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-xs md:text-sm font-bold text-slate-800">Task Complete</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {formatCount(completedCount)}
          </span>
          <span className="text-[11px] md:text-xs font-medium text-slate-500">{subtitle}</span>
        </div>
      </div>

      {/* Pending Tasks Card */}
      <div className="bg-[#FDEBEB] rounded-2xl p-4 md:p-5 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01] border border-red-100/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#F87171] flex items-center justify-center text-white shadow-sm">
            <Clock className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-xs md:text-sm font-bold text-slate-800">Task Pending</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {formatCount(pendingCount)}
          </span>
          <span className="text-[11px] md:text-xs font-medium text-slate-500">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};
