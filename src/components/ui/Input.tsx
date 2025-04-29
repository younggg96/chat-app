import React, { InputHTMLAttributes } from 'react';
import { useThemeStore } from '../../store/themeStore';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  label,
  helperText,
  error = false,
  fullWidth = false,
  ...props
}) => {
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={props.id}
          className={`block mb-2 text-sm font-medium ${
            error 
              ? 'text-red-500' 
              : isDarkMode 
                ? 'text-gray-300' 
                : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}
      
      <input
        className={`
          px-4 py-2.5 bg-white dark:bg-gray-800 
          border ${
            error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : isDarkMode 
                ? 'border-gray-700 focus:ring-blue-500 focus:border-blue-500' 
                : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
          }
          text-sm rounded-lg block w-full 
          focus:outline-none focus:ring-1
          ${isDarkMode ? 'text-white' : 'text-gray-800'}
          transition-colors duration-200
          shadow-sm hover:border-slate-400
          ${className}
        `}
        {...props}
      />
      
      {helperText && (
        <p className={`mt-1 text-xs ${
          error 
            ? 'text-red-500' 
            : isDarkMode 
              ? 'text-gray-400' 
              : 'text-gray-500'
        }`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 