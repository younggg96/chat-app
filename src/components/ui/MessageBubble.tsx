import React from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';
import Avatar from './Avatar';

interface MessageBubbleProps {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  isCurrentUser: boolean;
  isLoading?: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  isCurrentUser,
  isLoading = false,
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
                  : `bg-gradient-to-br ${colors.primary}`
              } text-white shadow-md`
            : `rounded-2xl rounded-bl-sm ${
                isDarkMode
                  ? 'bg-gray-800/70 backdrop-blur-sm'
                  : 'bg-white border border-slate-200/80'
              } ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} shadow-sm`
        } transition-all duration-300 hover:shadow-md animate-fadeIn ${
          isCurrentUser ? 'animate-slideLeft' : 'animate-slideRight'
        } ${isLoading ? 'animate-pulse' : ''}`}
      >
        <p className="font-light">
          {content}
          {isLoading && (
            <span className="inline-block ml-1">
              <span className="animate-pulse">.</span>
              <span className="animate-pulse animation-delay-200">.</span>
              <span className="animate-pulse animation-delay-400">.</span>
            </span>
          )}
        </p>
        <span
          className={`block text-xs mt-1.5 ${
            isCurrentUser
              ? 'text-right text-white/90'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-slate-500'
          }`}
        >
          {isLoading ? 'AI正在回复中' : timestamp}
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