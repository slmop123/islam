import React from 'react';
import { Key } from 'lucide-react';

interface GlowingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GlowingInput: React.FC<GlowingInputProps> = ({ label, ...props }) => {
  return (
    <div className="w-full flex flex-col gap-2 font-sans" dir="ltr">
      {label && (
        <label className="text-blue-200 font-arabic font-semibold text-sm px-2 text-right w-full" dir="rtl">
          {label}
        </label>
      )}
      <div className="poda-container relative w-full h-[60px] flex items-center justify-center rounded-[12px] z-10">
        <div className="glow"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>

        <div className="white"></div>
        <div className="border"></div>

        <div className="main-input relative w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-[10px] overflow-hidden z-10 bg-[#010201]">
          <input 
            {...props} 
            dir="auto"
            className={`custom-input w-full h-full bg-transparent text-white border-none outline-none px-4 pl-12 pr-4 text-lg rounded-[10px] ${props.className || ''}`} 
          />
          <div className="input-mask absolute w-[100px] h-[20px] bg-gradient-to-r from-transparent to-black top-[18px] left-[70px] pointer-events-none"></div>
          <div className="pink-mask absolute w-[30px] h-[20px] bg-[#cf30aa] blur-[20px] opacity-80 top-[10px] left-[5px] pointer-events-none transition-all duration-2000"></div>
          
          <div className="search-icon absolute left-[15px] top-[18px] text-[#b6a9b7] pointer-events-none">
            <Key size={20} className="text-violet-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
