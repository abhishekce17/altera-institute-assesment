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
    <div className="px-5 py-3 grid grid-cols-2 gap-3.5 bg-white">
      {/* Complete Tasks Card */}
      <div className="bg-[#EBF2FE] rounded-2xl p-4 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#3866F2] flex items-center justify-center text-white shadow-sm">
            <CheckSquare className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold text-slate-800">Task Complete</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCount(completedCount)}
          </span>
          <span className="text-[11px] font-medium text-slate-500">{subtitle}</span>
        </div>
      </div>

      {/* Pending Tasks Card */}
      <div className="bg-[#FDEBEB] rounded-2xl p-4 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F87171] flex items-center justify-center text-white shadow-sm">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold text-slate-800">Task Pending</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCount(pendingCount)}
          </span>
          <span className="text-[11px] font-medium text-slate-500">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};
