import { Theme } from './types';

export interface ThemeColors {
  name: Theme;
  accent: string;
  accentHover: string;
  accentFocus: string;
  bg: string;
  bgHover: string;
  chatBubbleUser: string;
  activeButton: string;
}

export const themes: Record<Theme, ThemeColors> = {
  indigo: {
    name: 'indigo',
    accent: 'text-indigo-400',
    accentHover: 'hover:text-indigo-400',
    accentFocus: 'focus:ring-indigo-500',
    bg: 'bg-indigo-500',
    bgHover: 'hover:bg-indigo-600',
    chatBubbleUser: 'bg-indigo-600',
    activeButton: 'bg-indigo-600 text-white',
  },
  teal: {
    name: 'teal',
    accent: 'text-teal-400',
    accentHover: 'hover:text-teal-400',
    accentFocus: 'focus:ring-teal-500',
    bg: 'bg-teal-500',
    bgHover: 'hover:bg-teal-600',
    chatBubbleUser: 'bg-teal-600',
    activeButton: 'bg-teal-600 text-white',
  },
  rose: {
    name: 'rose',
    accent: 'text-rose-400',
    accentHover: 'hover:text-rose-400',
    accentFocus: 'focus:ring-rose-500',
    bg: 'bg-rose-500',
    bgHover: 'hover:bg-rose-600',
    chatBubbleUser: 'bg-rose-600',
    activeButton: 'bg-rose-600 text-white',
  },
  amber: {
    name: 'amber',
    accent: 'text-amber-400',
    accentHover: 'hover:text-amber-400',
    accentFocus: 'focus:ring-amber-500',
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    chatBubbleUser: 'bg-amber-600',
    activeButton: 'bg-amber-600 text-white',
  },
};

export const getTheme = (themeName: Theme): ThemeColors => {
  return themes[themeName] || themes.indigo;
};
