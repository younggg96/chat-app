import React from 'react';
import { useChatStore } from '../store/chatStore';
import { UserCard } from './ui';

export default function Sidebar() {
  const activeChat = useChatStore((state) => state.activeChat);
  const users = useChatStore((state) => state.users);
  const selectChat = useChatStore((state) => state.selectChat);

  return (
    <div className="w-72 border-r flex-shrink-0 bg-white dark:bg-gray-900 border-gray-100/70 dark:border-gray-800">
      <div className="p-5">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
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