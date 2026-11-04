import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  ariaLabel = 'Add New Task',
}) => {
  return (
    <div className="sticky bottom-6 inset-x-0 flex justify-center lg:justify-end lg:pr-8 pointer-events-none z-30">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="pointer-events-auto w-14 h-14 bg-[#3866F2] hover:bg-[#2B52D4] active:scale-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer group"
      >
        <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
      </button>
    </div>
  );
};
