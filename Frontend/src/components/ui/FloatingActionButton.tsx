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
    <div className="fixed bottom-6 inset-x-0 flex justify-center pointer-events-none z-30 lg:hidden">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="fab-circle pointer-events-auto w-14 h-14 bg-[#3866F2] hover:bg-[#2B52D4] active:scale-95 text-white flex items-center justify-center transition-transform duration-150 cursor-pointer"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
