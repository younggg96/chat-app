import React, { useState } from "react";
import { FiUser, FiUsers, FiSearch, FiPlus, FiMessageSquare, FiUserPlus, FiZap } from "react-icons/fi";
import { useChatStore } from "../store/chatStore";
import { useThemeStore, colorSchemes } from "../store/themeStore";
import Tab from "./ui/Tab";

export default function Sidebar() {
  const { colorScheme } = useThemeStore();
  const colors = colorSchemes[colorScheme];
  
  const [activeTab, setActiveTab] = useState<'contacts' | 'rooms' | 'ai'>('contacts');
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  
  // Chat state
  const currentUser = useChatStore((state) => state.currentUser);
  const activeChat = useChatStore((state) => state.activeChat);
  const users = useChatStore((state) => state.users);
  const rooms = useChatStore((state) => state.rooms);
  const selectChat = useChatStore((state) => state.selectChat);
  const createRoom = useChatStore((state) => state.createRoom);
  
  // Filter users/rooms based on search query
  const filteredUsers = users
    .filter(user => 
      // 排除AI助手和当前用户
      user.id !== 'ai-assistant' && 
      user.id !== currentUser && 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // 确保用户ID不重复，避免显示重复用户
    .filter((user, index, self) => 
      index === self.findIndex((u) => u.id === user.id)
    );
  
  const filteredRooms = rooms
    .filter(room => 
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // 确保房间ID不重复，避免显示重复房间
    .filter((room, index, self) => 
      index === self.findIndex((r) => r.id === room.id)
    );
  
  const aiAssistant = users.find(user => user.id === 'ai-assistant');
  
  // Create a new chat room
  const handleCreateRoom = () => {
    const roomName = prompt("Enter a name for the new chat room:");
    if (roomName) {
      createRoom(roomName);
      setShowCreateMenu(false);
    }
  };
  
  const handleCreateChat = (type: 'contact' | 'room' | 'ai') => {
    if (type === 'contact') {
      // Implementation for creating 1:1 chat
      const username = prompt("Enter username to chat with:");
      if (username) {
        // Logic to find or create user chat
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (user) {
          selectChat(user.id, 'user');
        } else {
          alert("User not found");
        }
      }
    } else if (type === 'room') {
      handleCreateRoom();
    } else if (type === 'ai') {
      // Select AI assistant chat
      if (aiAssistant) {
        selectChat(aiAssistant.id, 'user');
      }
    }
    
    setShowCreateMenu(false);
  };
  
  // Current user info
  const userInfo = users.find(user => user.id === currentUser);
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* User Profile Section */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
            {userInfo ? userInfo.username.charAt(0).toUpperCase() : "?"}
          </div>
        </div>
        <div className="ml-3 flex-1 overflow-hidden">
          <div className="font-medium text-slate-800 dark:text-white truncate">
            {userInfo ? userInfo.username : "Loading..."}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {userInfo?.online ? "Online" : "Offline"}
          </div>
        </div>
        
        {/* Create new chat button */}
        <div className="relative">
          <button 
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <FiPlus size={20} />
          </button>
          
          {/* Dropdown menu */}
          {showCreateMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleCreateChat('contact')}
                  className="flex items-center w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FiUser className="mr-2" />
                  New 1:1 Chat
                </button>
                <button
                  onClick={() => handleCreateChat('room')}
                  className="flex items-center w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FiUsers className="mr-2" />
                  New Group Chat
                </button>
                <button
                  onClick={() => handleCreateChat('ai')}
                  className="flex items-center w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FiZap className="mr-2" />
                  Chat with AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Search bar */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
          />
          <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Tab
          active={activeTab === 'contacts'}
          onClick={() => setActiveTab('contacts')}
          icon={<FiUser className="mr-1" />}
          label="Contacts"
          className="flex-1"
        />
        <Tab
          active={activeTab === 'rooms'}
          onClick={() => setActiveTab('rooms')}
          icon={<FiUsers className="mr-1" />}
          label="Groups"
          className="flex-1"
        />
        <Tab
          active={activeTab === 'ai'}
          onClick={() => setActiveTab('ai')}
          icon={<FiZap className="mr-1" />}
          label="AI"
          className="flex-1"
        />
      </div>
      
      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'contacts' && (
          <div className="px-2 py-2">
            {filteredUsers.length === 0 ? (
              <div className="py-4 px-2 text-center text-slate-500 dark:text-slate-400 text-sm">
                No contacts found
              </div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => selectChat(user.id, 'user')}
                  className={`flex items-center w-full px-3 py-3 rounded-lg mb-1 transition-colors ${
                    activeChat?.id === user.id 
                      ? `bg-gradient-to-r ${colors.primary} text-white` 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white'
                  }`}
                >
                  <div className="relative">
                    {/* User avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user.avatar || user.username.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Online indicator */}
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="ml-3 text-left">
                    <div className="font-medium truncate max-w-[140px]">{user.username}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'rooms' && (
          <div className="px-2 py-2">
            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              className="flex items-center w-full px-3 py-3 mb-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                <FiPlus size={18} />
              </div>
              <div className="ml-3 font-medium">New Group</div>
            </button>
            
            {/* Rooms list */}
            {filteredRooms.length === 0 ? (
              <div className="py-4 px-2 text-center text-slate-500 dark:text-slate-400 text-sm">
                No groups found
              </div>
            ) : (
              filteredRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => selectChat(room.id, 'room')}
                  className={`flex items-center w-full px-3 py-3 rounded-lg mb-1 transition-colors ${
                    activeChat?.id === room.id 
                      ? `bg-gradient-to-r ${colors.primary} text-white` 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
                    <FiUsers size={18} />
                  </div>
                  <div className="ml-3 text-left">
                    <div className="font-medium truncate max-w-[140px]">{room.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {room.membersCount || 0} members
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'ai' && (
          <div className="px-2 py-2">
            {aiAssistant ? (
              <button
                onClick={() => selectChat(aiAssistant.id, 'user')}
                className={`flex items-center w-full px-3 py-3 rounded-lg mb-1 transition-colors ${
                  activeChat?.id === aiAssistant.id 
                    ? `bg-gradient-to-r ${colors.primary} text-white` 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                  <FiZap size={18} />
                </div>
                <div className="ml-3 text-left">
                  <div className="font-medium truncate max-w-[140px]">AI Assistant</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Always online
                  </div>
                </div>
              </button>
            ) : (
              <div className="py-4 px-2 text-center text-slate-500 dark:text-slate-400 text-sm">
                AI assistant not available
              </div>
            )}
            
            <div className="mt-4 p-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="font-medium mb-1">AI Chat Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Ask questions about any topic</li>
                <li>Get help with coding, writing or research</li>
                <li>Create content or brainstorm ideas</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 