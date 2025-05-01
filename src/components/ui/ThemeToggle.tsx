import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { IconButton } from './shadcn/icon-button';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { mode, toggleMode } = useThemeStore();
  const isDarkMode = mode === 'dark';

  return (
    <IconButton
      className={cn("transition-all duration-300", className)}
      onClick={toggleMode}
      tooltip={isDarkMode ? 'Light mode' : 'Dark mode'}
      variant="ghost"
      icon={
        isDarkMode ? (
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        ) : (
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        )
      }
    />
  );
};

export default ThemeToggle; 