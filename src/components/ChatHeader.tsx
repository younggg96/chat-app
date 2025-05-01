import React from 'react';
import { FiUser, FiSettings, FiTrash2, FiLogOut } from 'react-icons/fi';
import { IconButton } from './ui';
import { useThemeStore, colorSchemes } from "../store/themeStore";
import { ChatRoom, User } from "../services/chatService";
import { useAuthStore } from "../store/authStore";

interface ChatHeaderProps {
  activeChat: User | ChatRoom | null;
  activeType: 'user' | 'room' | null;
  showUserInfo: boolean;
  setShowUserInfo: (show: boolean) => void;
  setShowColorPicker: (show: boolean) => void;
  handleClearChat: () => void;
  handleLogout: () => void;
  userInfoRef: React.RefObject<HTMLDivElement>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChat,
  activeType,
  showUserInfo,
  setShowUserInfo,
  setShowColorPicker,
  handleClearChat,
  handleLogout,
  userInfoRef
}) => {
  const { colorScheme } = useThemeStore();
  const colors = colorSchemes[colorScheme];
  const { user: authUser } = useAuthStore();

  return (
    <header className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center">
        {activeChat && (
          <>
            <div className={`h-11 w-11 rounded-full flex items-center justify-center bg-gradient-to-r ${colors.primary} shadow-md`}>
              <span className="text-white font-medium">
                {activeType === 'user' 
                  ? (activeChat as User).username.charAt(0).toUpperCase()
                  : (activeChat as ChatRoom).name.charAt(0).toUpperCase()
                }
              </span>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold dark:text-white">
                {activeType === 'user' 
                  ? (activeChat as User).username
                  : (activeChat as ChatRoom).name
                }
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeType === 'user' 
                  ? ((activeChat as User).id === 'ai-assistant' 
                      ? 'AI Assistant' 
                      : ((activeChat as User).online ? 'Online' : 'Offline'))
                  : `${(activeChat as ChatRoom).membersCount || 0} members`
                }
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* User Profile */}
        <IconButton
          icon={<FiUser />}
          onClick={() => setShowUserInfo(!showUserInfo)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        />
        
        {/* Theme Settings */}
        <IconButton
          icon={<FiSettings />}
          onClick={() => setShowColorPicker(true)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        />
        
        {/* Clear Chat */}
        <IconButton
          icon={<FiTrash2 />}
          onClick={handleClearChat}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        />
        
        {/* Logout Button */}
        <IconButton
          icon={<FiLogOut />}
          onClick={handleLogout}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        />
      </div>
      
      {/* User Info Popup */}
      {showUserInfo && (
        <div 
          ref={userInfoRef}
          className="absolute top-16 right-5 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 w-64 z-30 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold mb-2">User Profile</h3>
          {authUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r ${colors.primary}`}>
                  <span className="text-white font-medium">
                    {authUser.avatar || authUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{authUser.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{authUser.email}</p>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">User ID:</span> {authUser.id}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Not logged in or user info not available</p>
          )}
        </div>
      )}
    </header>
  );
};

export default ChatHeader; 