import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100">
      <main className="flex-1 flex flex-col relative w-full">
        {children}
      </main>
    </div>
  );
};
