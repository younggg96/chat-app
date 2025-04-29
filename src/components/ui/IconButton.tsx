import React, { ButtonHTMLAttributes } from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'transparent';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  className = '',
  variant = 'secondary',
  size = 'md',
  icon,
  tooltip,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `bg-gradient-to-r ${colors.primary} text-white shadow-md hover:shadow-lg hover:opacity-90`;
      case 'secondary':
        return `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-slate-200 shadow-sm hover:shadow'}`;
      case 'outline':
        return `border ${colors.border} ${colors.text} bg-transparent shadow-sm hover:shadow hover:bg-opacity-10 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`;
      case 'transparent':
        return `bg-transparent ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-opacity-10`;
      default:
        return `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-slate-200 shadow-sm hover:shadow'}`;
    }
  };

  return (
    <button
      type={type}
      className={`
        rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95 transition-transform'}
        ${className}
      `}
      disabled={disabled}
      aria-label={tooltip}
      title={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton; 