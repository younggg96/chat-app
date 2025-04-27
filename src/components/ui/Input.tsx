import React, { InputHTMLAttributes, ReactNode } from 'react';
import { useThemeStore } from '../../store/themeStore';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  label,
  icon,
  error,
  fullWidth = true,
  id,
  ...props
}) => {
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const inputId = id || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      
      <div 
        className={`relative rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        } ${error ? 'ring-1 ring-red-500' : ''}`}
      >
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { 
              className: isDarkMode ? 'text-gray-400' : 'text-gray-500'
            })}
          </div>
        )}
        
        <input
          id={inputId}
          className={`block ${fullWidth ? 'w-full' : ''} ${
            icon ? 'pl-10' : 'pl-3'
          } pr-3 py-3.5 rounded-lg focus:outline-none focus:ring-2 ${
            isDarkMode 
              ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-600' 
              : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
          } transition-all border-transparent border ${error ? 'border-red-500' : ''}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input; 