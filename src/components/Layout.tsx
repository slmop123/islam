import React from 'react';
import { Header } from './Header';
import { FlyingLetters } from './FlyingLetters';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-slate-900 to-violet-900 flex flex-col relative overflow-hidden" dir="rtl">
      <FlyingLetters />
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none mix-blend-screen z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none mix-blend-screen z-0" />
      
      <Header />
      
      <main className="flex-grow flex flex-col items-center relative z-10">
        {children}
      </main>
      
      <footer className="relative z-10 mt-8 mb-4 text-center text-blue-200/50 font-arabic text-sm tracking-wide">
        هذا من تاسيس سليم الجعد طالب في في الثانية اعدادي
      </footer>
    </div>
  );
};
