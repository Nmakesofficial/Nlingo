import React, { useContext } from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { ThemeContext } from '../contexts';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
    const { themeColors } = useContext(ThemeContext);

    const bottomNavMapping = {
        [View.DASHBOARD]: View.DASHBOARD,
        [View.VOICE_CHAT]: View.VOICE_CHAT,
        [View.TEXT_CHAT]: View.TEXT_CHAT,
        [View.QUIZZES]: View.QUIZZES,
        [View.ROADMAP]: View.ROADMAP,
    }

  return (
    <nav className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 flex-shrink-0">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = bottomNavMapping[currentView] === item.view;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.view)}
              className={`flex flex-col items-center justify-center w-full transition-colors duration-300 ${
                isActive ? themeColors.accent : `text-slate-400 ${themeColors.accentHover}`
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
