import React, { useContext } from 'react';
import { ThemeContext } from '../contexts';
import { View } from '../types';

interface HeaderProps {
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onViewChange }) => {
  const { themeColors } = useContext(ThemeContext);

  return (
    <header className="p-4 flex justify-between items-center bg-slate-900 flex-shrink-0">
      <div className="relative">
        <h1 className="text-3xl font-bold text-slate-100">Nlingo</h1>
        <div className={`absolute -bottom-1 left-0 w-full h-1 ${themeColors.bg}`}></div>
      </div>
      <button 
        onClick={() => onViewChange(View.UPGRADE)}
        className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 px-5 rounded-lg shadow-md transition-colors duration-300"
      >
        الترقية إلى Pro
      </button>
    </header>
  );
};

export default Header;