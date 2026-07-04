import React from 'react';
import { Search } from 'lucide-react';

interface GlowingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const GlowingTextarea: React.FC<GlowingTextareaProps> = (props) => {
  return (
    <div className="poda-container relative w-full h-[180px] flex items-center justify-center rounded-[12px] z-10 font-arabic">
      <div className="glow"></div>
      <div className="darkBorderBg"></div>
      <div className="darkBorderBg"></div>
      <div className="darkBorderBg"></div>

      <div className="white"></div>
      <div className="border"></div>

      <div className="main-input relative w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-[10px] overflow-hidden z-10 bg-[#010201]">
        <textarea 
          {...props} 
          dir="rtl"
          className={`custom-input w-full h-full bg-transparent text-white border-none outline-none px-4 pt-4 text-lg sm:text-2xl rounded-[10px] resize-none pr-12 ${props.className || ''}`} 
        />
        <div className="input-mask absolute w-[100px] h-[20px] bg-gradient-to-r from-transparent to-black top-[18px] left-[70px] pointer-events-none"></div>
        <div className="pink-mask absolute w-[30px] h-[20px] bg-[#cf30aa] blur-[20px] opacity-80 top-[10px] left-[5px] pointer-events-none transition-all duration-2000"></div>
        
        <div className="search-icon absolute right-[15px] top-[18px] text-[#b6a9b7] pointer-events-none">
          <Search size={28} className="text-violet-400" />
        </div>
      </div>
    </div>
  );
};
