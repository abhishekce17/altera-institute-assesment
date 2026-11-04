import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-0 sm:py-8 sm:px-4 bg-slate-100 font-sans selection:bg-blue-100">
      {/* Mobile container preview on desktop, native viewport on mobile */}
      <div className="relative w-full sm:max-w-[420px] min-h-screen sm:min-h-[850px] sm:max-h-[920px] bg-white sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-slate-200/80 flex flex-col overflow-hidden">
        {/* Screen Content */}
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
};
