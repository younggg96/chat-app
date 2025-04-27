import React from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';
import Avatar from './Avatar';

interface MessageBubbleProps {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  isCurrentUser: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  isCurrentUser,
  className = '',
}) => {
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end gap-2 ${className}`}
    >
      {!isCurrentUser && (
        <Avatar 
          name={sender}
          size="sm"
          src={`https://ui-avatars.com/api?name=${sender}`}
        />
      )}
      
      <div
        className={`relative max-w-[85%] px-4 py-3 ${
          isCurrentUser
            ? `rounded-2xl rounded-br-sm ${
                isDarkMode
                  ? `bg-gradient-to-r ${colors.primary}`
                  : `bg-gradient-to-r ${colors.primary}`
              } text-white`
            : `rounded-2xl rounded-bl-sm ${
                isDarkMode
                  ? 'bg-gray-800/70 backdrop-blur-sm'
                  : 'bg-gray-100/80'
              } ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`
        } shadow-sm transition-all duration-200 hover:shadow-md`}
      >
        <p className="font-light">{content}</p>
        <span
          className={`block text-xs mt-1.5 ${
            isCurrentUser
              ? 'text-right text-white/80'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-500'
          }`}
        >
          {timestamp}
        </span>
      </div>
      
      {isCurrentUser && (
        <Avatar 
          name={sender}
          size="sm"
          src={`https://ui-avatars.com/api?name=${sender}`}
        />
      )}
    </div>
  );
};

export default MessageBubble; 