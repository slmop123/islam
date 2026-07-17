import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, Scale, AlertTriangle, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'المعرض الشخصي', path: '/database.html', icon: Database },
    { name: 'محرك الاستنباط', path: '/engine.html', icon: Scale },
    { name: 'إعدادات API', path: '/settings.html', icon: Settings },
    { name: 'التبليغ عن خطأ', path: '/report.html', icon: AlertTriangle },
  ];

  return (
    <header className="w-full relative z-50 p-4 sm:p-6 pb-0 max-w-7xl mx-auto" dir="rtl">
      {/* Top Logo and Title Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-[100px] h-[100px] flex items-center justify-center transform scale-75 origin-right">
          <div className="loader">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <defs>
                <mask id="clipping">
                  <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                  <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                  <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                  <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                  <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                  <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                  <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                </mask>
              </defs>
            </svg>
            <div className="box"></div>
          </div>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-2xl font-sans" dir="ltr">
            SiteSec Islam
          </h1>
          <p className="text-blue-200/80 font-arabic text-sm mt-1">المنصة الذكية للاستنباط والبحث</p>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-arabic font-bold whitespace-nowrap transition-all duration-300 backdrop-blur-md border ${
                isActive
                  ? 'bg-violet-600/40 border-violet-500/50 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
