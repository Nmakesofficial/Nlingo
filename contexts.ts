import React from 'react';
import { Theme } from './types';
import { getTheme, ThemeColors } from './theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeColors: ThemeColors;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'indigo',
  setTheme: () => {},
  themeColors: getTheme('indigo'),
});
