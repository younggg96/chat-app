import React, { ButtonHTMLAttributes } from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4',
    lg: 'py-3.5 px-5 text-lg',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `bg-gradient-to-r ${colors.primary} text-white hover:opacity-90`;
      case 'secondary':
        return `${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`;
      case 'outline':
        return `border ${colors.border} ${colors.text} bg-transparent hover:bg-opacity-10 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`;
      case 'link':
        return `bg-transparent ${colors.text} hover:underline p-0`;
      default:
        return `bg-gradient-to-r ${colors.primary} text-white hover:opacity-90`;
    }
  };

  const baseClasses = `
    font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    ${variant !== 'link' ? sizeClasses[size] : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
    ${getVariantClasses()}
  `;

  return (
    <button
      type={type}
      className={`${baseClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 