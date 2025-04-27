import React from 'react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore, colorSchemes } from '../store/themeStore';

export default function Sidebar() {
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];
  const activeChat = useChatStore((state) => state.activeChat);
  const users = useChatStore((state) => state.users);
  const selectChat = useChatStore((state) => state.selectChat);

  return (
    <div className={`w-72 border-r flex-shrink-0 ${
      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100/70'
    }`}>
      <div className="p-5">
        <h2 className={`text-lg font-medium ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          聊天列表
        </h2>
        
        <div className="mt-5 space-y-3">
          {users.map(user => (
            <div 
              key={user.id}
              onClick={() => selectChat(user.id)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all duration-250 ${
                activeChat && activeChat.id === user.id
                  ? isDarkMode 
                    ? `bg-gray-800/90 text-white border-l-4 border-${colorScheme}-500` 
                    : `${colors.darkOpacity} text-gray-900 border-l-4 border-${colorScheme}-500`
                  : isDarkMode
                    ? 'hover:bg-gray-800/50 text-gray-200'
                    : 'hover:bg-gray-50/80 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  activeChat && activeChat.id === user.id
                    ? `bg-gradient-to-r ${colors.primary}`
                    : isDarkMode 
                      ? 'bg-gray-700/80' 
                      : 'bg-gray-100/80'
                }`}>
                  <span className={`font-medium ${
                    activeChat && activeChat.id === user.id
                      ? 'text-white'
                      : isDarkMode 
                        ? 'text-gray-300' 
                        : 'text-gray-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user.name}</p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user.online ? '在线' : '离线'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 