import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define available themes
export type ThemeMode = 'dark' | 'light';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'pink' | 'amber';

// Color scheme definitions
export const colorSchemes = {
  blue: {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-blue-400 to-blue-500',
    lighter: 'from-blue-400 to-blue-500',
    darker: 'from-blue-600 to-blue-700',
    hover: 'bg-blue-600',
    lighterHover: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    darkOpacity: 'bg-blue-500/10',
    darkOpacityHover: 'hover:bg-blue-500/20',
  },
  purple: {
    primary: 'from-purple-500 to-purple-600',
    secondary: 'from-purple-400 to-purple-500',
    lighter: 'from-purple-400 to-purple-500',
    darker: 'from-purple-600 to-purple-700',
    hover: 'bg-purple-600',
    lighterHover: 'bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
    darkOpacity: 'bg-purple-500/10',
    darkOpacityHover: 'hover:bg-purple-500/20',
  },
  green: {
    primary: 'from-emerald-500 to-emerald-600',
    secondary: 'from-emerald-400 to-emerald-500',
    lighter: 'from-emerald-400 to-emerald-500',
    darker: 'from-emerald-600 to-emerald-700',
    hover: 'bg-emerald-600',
    lighterHover: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    darkOpacity: 'bg-emerald-500/10',
    darkOpacityHover: 'hover:bg-emerald-500/20',
  },
  pink: {
    primary: 'from-pink-500 to-pink-600',
    secondary: 'from-pink-400 to-pink-500',
    lighter: 'from-pink-400 to-pink-500',
    darker: 'from-pink-600 to-pink-700',
    hover: 'bg-pink-600',
    lighterHover: 'bg-pink-500',
    text: 'text-pink-500',
    border: 'border-pink-500',
    darkOpacity: 'bg-pink-500/10',
    darkOpacityHover: 'hover:bg-pink-500/20',
  },
  amber: {
    primary: 'from-amber-500 to-amber-600',
    secondary: 'from-amber-400 to-amber-500',
    lighter: 'from-amber-400 to-amber-500',
    darker: 'from-amber-600 to-amber-700',
    hover: 'bg-amber-600',
    lighterHover: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    darkOpacity: 'bg-amber-500/10',
    darkOpacityHover: 'hover:bg-amber-500/20',
  },
};

interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  toggleMode: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      colorScheme: 'blue',
      toggleMode: () => set((state) => ({ 
        mode: state.mode === 'light' ? 'dark' : 'light' 
      })),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    {
      name: "theme-storage",
    }
  )
); 