import React, { useContext } from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { ThemeContext } from '../contexts';

interface NavGridProps {
  onViewChange: (view: View) => void;
}

const NavGrid: React.FC<NavGridProps> = ({ onViewChange }) => {
  const { themeColors } = useContext(ThemeContext);
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.view)}
          className="bg-slate-800 rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center aspect-square hover:bg-slate-700 transition-colors duration-300"
        >
          <div className={`p-4 rounded-xl ${themeColors.bg}`}>
            <item.icon className="w-8 h-8 text-white" />
          </div>
          <span className="mt-3 font-semibold text-slate-200">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default NavGrid;
