import React from 'react';
import { useChatStore } from '../store/chatStore';
import { UserCard } from './ui';

export default function Sidebar() {
  const activeChat = useChatStore((state) => state.activeChat);
  const users = useChatStore((state) => state.users);
  const selectChat = useChatStore((state) => state.selectChat);

  return (
    <div className="w-72 border-r flex-shrink-0 bg-white dark:bg-gray-900 border-slate-200/70 dark:border-gray-800 shadow-sm">
      <div className="p-5">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          Chats
        </h2>
        
        <div className="mt-5 space-y-3">
          {users.map(user => (
            <UserCard 
              key={user.id}
              id={user.id}
              name={user.name}
              online={user.online}
              active={activeChat ? activeChat.id === user.id : false}
              onClick={() => selectChat(user.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 