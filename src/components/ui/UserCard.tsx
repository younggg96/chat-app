import React from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';
import Avatar from './Avatar';

interface UserCardProps {
  id: string;
  name: string;
  online?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  online = false,
  active = false,
  onClick,
  className = '',
}) => {
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];

  return (
    <div 
      onClick={onClick}
      className={`
        p-3.5 rounded-xl cursor-pointer transition-all duration-250 
        ${
          active
            ? isDarkMode 
              ? `bg-gray-800/90 text-white border-l-4 border-${colorScheme}-500` 
              : `${colors.darkOpacity} text-gray-900 border-l-4 border-${colorScheme}-500`
            : isDarkMode
              ? 'hover:bg-gray-800/50 text-gray-200'
              : 'hover:bg-gray-50/80 text-gray-700'
        }
        ${className}
      `}
    >
      <div className="flex items-center">
        <Avatar 
          name={name} 
          isActive={active}
          src={`https://ui-avatars.com/api?name=${name}`}
        />
        
        <div className="ml-3">
          <p className="font-medium">{name}</p>
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCard; 