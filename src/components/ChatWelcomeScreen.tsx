import React from "react";
import { FiMessageSquare, FiUsers } from "react-icons/fi";
import { Button } from "./ui";
import { useChatStore } from "../store/chatStore";
import { useThemeStore, colorSchemes } from "../store/themeStore";

interface ChatWelcomeScreenProps {
  createRoom: (roomName: string) => void;
}

const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({ createRoom }) => {
  const { colorScheme } = useThemeStore();
  const colors = colorSchemes[colorScheme];
  
  const users = useChatStore((state) => state.users);
  const rooms = useChatStore((state) => state.rooms);
  const currentUser = useChatStore((state) => state.currentUser);
  const selectChat = useChatStore((state) => state.selectChat);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-md px-4">
        <FiMessageSquare className="w-16 h-16 mx-auto mb-6 text-indigo-500 opacity-80" />
        <h2 className="text-xl font-semibold mb-2">Welcome to Chat App</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Select a conversation from the sidebar or start a new chat.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={() => {
              // Find AI assistant and select it
              const aiAssistant = users.find(u => u.id === 'ai-assistant');
              if (aiAssistant) {
                selectChat(aiAssistant.id, 'user');
              }
            }}
            variant="default"
            className="flex items-center justify-center"
          >
            <FiMessageSquare className="mr-2" />
            Chat with AI
          </Button>
          <Button 
            onClick={() => {
              // Create new chat room
              const roomName = prompt("Enter name for the new chat room:");
              if (roomName) {
                createRoom(roomName);
              }
            }}
            variant="default"
            className="flex items-center justify-center"
          >
            <FiUsers className="mr-2" />
            Create Group
          </Button>
        </div>
        
        {/* Quick chat selection area */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-medium mb-4">Quick Start Chat</h3>
          
          <div className="flex flex-col space-y-2">
            {users.filter(u => u.id !== currentUser && u.id !== 'ai-assistant').slice(0, 3).map(user => (
              <div 
                key={user.id}
                onClick={() => selectChat(user.id, 'user')}
                className="flex items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r ${colors.primary}`}>
                  <span className="text-white font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
            
            {rooms.slice(0, 2).map(room => (
              <div 
                key={room.id}
                onClick={() => selectChat(room.id, 'room')}
                className="flex items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r ${colors.secondary}`}>
                  <span className="text-white font-medium">
                    {room.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{room.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {room.membersCount || 0} members
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcomeScreen; 