import React, { useContext } from 'react';
import { ThemeContext } from '../contexts';
import { themes } from '../theme';
import { Theme } from '../types';

interface ThemeSelectorProps {
  showLabel?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ showLabel = true }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const themeEntries = Object.entries(themes);

  return (
    <div>
      {showLabel && <label className="block mb-2 font-semibold text-slate-300 text-center">اختر لون المظهر</label>}
      <div className="flex justify-center items-center space-x-3 bg-slate-800 p-2 rounded-full">
        {themeEntries.map(([themeName, themeColors]) => (
          <button
            key={themeName}
            onClick={() => setTheme(themeName as Theme)}
            className={`w-8 h-8 rounded-full transition-transform duration-200 ${themeColors.bg} ${
              theme === themeName ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : ''
            }`}
            aria-label={`Select ${themeName} theme`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
