import React from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  src?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  isActive = false,
  src,
  className = '',
}) => {
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-11 w-11 text-lg',
  };

  const letter = name.charAt(0).toUpperCase();

  return (
    <div
      className={`
        rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
        ${sizeClasses[size]}
        ${
          isActive
            ? `bg-gradient-to-r ${colors.primary}`
            : isDarkMode 
              ? 'bg-gray-700/80' 
              : 'bg-gray-100/80'
        }
        ${className}
      `}
    >
      {src ? (
        <img 
          src={src}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`font-medium ${
          isActive
            ? 'text-white'
            : isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-600'
        }`}>
          {letter}
        </span>
      )}
    </div>
  );
};

export default Avatar; 