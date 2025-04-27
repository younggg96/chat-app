import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义主题类型
export type ThemeMode = 'light' | 'dark';
export type ColorScheme = 'indigo' | 'teal' | 'amber' | 'rose' | 'blue';

// 主题状态接口
interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  toggleMode: () => void;
  setColorScheme: (color: ColorScheme) => void;
}

// 导出颜色方案配置
export const colorSchemes = {
  indigo: {
    primary: 'from-indigo-500 to-purple-500',
    lighter: 'bg-indigo-500',
    darker: 'bg-indigo-600',
    hover: 'hover:bg-indigo-600',
    lighterHover: 'hover:bg-indigo-400',
    text: 'text-indigo-500',
    border: 'border-indigo-500',
    darkOpacity: 'bg-indigo-500/20',
    darkOpacityHover: 'hover:bg-indigo-500/30'
  },
  teal: {
    primary: 'from-teal-500 to-emerald-500',
    lighter: 'bg-teal-500',
    darker: 'bg-teal-600',
    hover: 'hover:bg-teal-600',
    lighterHover: 'hover:bg-teal-400',
    text: 'text-teal-500',
    border: 'border-teal-500',
    darkOpacity: 'bg-teal-500/20',
    darkOpacityHover: 'hover:bg-teal-500/30'
  },
  amber: {
    primary: 'from-amber-500 to-orange-500',
    lighter: 'bg-amber-500',
    darker: 'bg-amber-600',
    hover: 'hover:bg-amber-600',
    lighterHover: 'hover:bg-amber-400',
    text: 'text-amber-500',
    border: 'border-amber-500',
    darkOpacity: 'bg-amber-500/20',
    darkOpacityHover: 'hover:bg-amber-500/30'
  },
  rose: {
    primary: 'from-rose-500 to-pink-500',
    lighter: 'bg-rose-500',
    darker: 'bg-rose-600',
    hover: 'hover:bg-rose-600',
    lighterHover: 'hover:bg-rose-400',
    text: 'text-rose-500',
    border: 'border-rose-500',
    darkOpacity: 'bg-rose-500/20',
    darkOpacityHover: 'hover:bg-rose-500/30'
  },
  blue: {
    primary: 'from-blue-500 to-sky-500',
    lighter: 'bg-blue-500',
    darker: 'bg-blue-600',
    hover: 'hover:bg-blue-600',
    lighterHover: 'hover:bg-blue-400',
    text: 'text-blue-500',
    border: 'border-blue-500',
    darkOpacity: 'bg-blue-500/20',
    darkOpacityHover: 'hover:bg-blue-500/30'
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      colorScheme: 'indigo',
      toggleMode: () => set((state) => ({ 
        mode: state.mode === 'light' ? 'dark' : 'light' 
      })),
      setColorScheme: (color) => set(() => ({ colorScheme: color })),
    }),
    {
      name: "theme-storage",
    }
  )
); 