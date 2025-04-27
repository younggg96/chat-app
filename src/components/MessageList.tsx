import React, { useRef, useEffect } from 'react';
import { useThemeStore, colorSchemes } from '../store/themeStore';
import { useChatStore } from '../store/chatStore';
import { format } from 'date-fns';

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { mode, colorScheme } = useThemeStore();
  const colors = colorSchemes[colorScheme];
  const isDarkMode = mode === 'dark';
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = useChatStore((state) => state.currentUser);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      <div className="mx-auto space-y-5">
        {messages.map((message) => {
          const isCurrentUser = message.sender === currentUser;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {!isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api?name=${message.sender}`} 
                    alt={`${message.sender}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
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
                <p className="font-light">{message.content}</p>
                <span
                  className={`block text-xs mt-1.5 ${
                    isCurrentUser
                      ? 'text-right text-white/80'
                      : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              {isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${currentUser}`} 
                    alt="Your avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
} 