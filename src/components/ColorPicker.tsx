import React from 'react';
import { useThemeStore, colorSchemes, ColorScheme } from '../store/themeStore';
import { IconButton } from './ui';

interface ColorPickerProps {
  onClose?: () => void;
}

export default function ColorPicker({ onClose }: ColorPickerProps) {
  const { colorScheme, setColorScheme } = useThemeStore();

  return (
    <div className="p-5 rounded-lg shadow-lg z-10 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 animate-fadeIn" 
         style={{ width: '240px' }}>
      <div className="mb-4 pb-2 border-b border-slate-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Appearance
        </h3>
      </div>
      
      {/* Color selection grid */}
      <div className="grid grid-cols-5 gap-3">
        {(Object.keys(colorSchemes) as ColorScheme[]).map((color, index) => (
          <button
            key={color}
            onClick={() => {
              setColorScheme(color);
              if (onClose) onClose();
            }}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorSchemes[color].primary} ${
              colorScheme === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-gray-600 shadow-md' : 'shadow-sm'
            } transition-all hover:scale-110 animate-fadeIn hover:shadow-md`}
            aria-label={`Set color to ${color}`}
          />
        ))}
      </div>
    </div>
  );
} 