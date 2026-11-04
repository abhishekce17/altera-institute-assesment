import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-0 md:py-8 md:px-6 bg-white md:bg-slate-100/80 font-sans selection:bg-blue-100">
      {/* Responsive Shell: 100% full-screen on mobile, generous modern container on tablet/desktop */}
      <div className="relative w-full md:max-w-5xl min-h-screen md:min-h-[880px] bg-white md:rounded-3xl md:shadow-2xl md:border md:border-slate-200/80 flex flex-col overflow-hidden">
        {/* Screen Content */}
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
