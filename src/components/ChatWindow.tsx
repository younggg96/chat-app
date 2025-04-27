import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { useThemeStore, colorSchemes } from "../store/themeStore";
import { FiSend, FiLogOut, FiSettings } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import ColorPicker from '../components/ColorPicker';

export default function ChatWindow() {
  const { mode, colorScheme, toggleMode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];

  const [messageText, setMessageText] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Chat state
  const currentUser = useChatStore((state) => state.currentUser);
  const activeChat = useChatStore((state) => state.activeChat);
  const messages = useChatStore((state) => {
    if (!activeChat) return [];
    return state.messages[activeChat.id] || [];
  });
  const sendMessage = useChatStore((state) => state.sendMessage);
  const chatLogout = useChatStore((state) => state.logout);
  
  // Auth state
  const { logout: authLogout } = useAuthStore();
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive or active chat changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Outside click detection
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText("");
    }
  };

  const handleLogout = () => {
    // Logout from chat
    chatLogout();
    // Logout from auth
    authLogout();
    // Navigate to login page
    navigate("/");
  };

  // If user is not logged in or no active chat, show loading state
  if (!currentUser || !activeChat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${
      isDarkMode 
        ? 'bg-gray-950 text-white' 
        : 'bg-gray-50 text-gray-900'
    } transition-colors duration-300`}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className={`flex items-center justify-between px-5 py-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white border-b border-gray-100'
        }`}>
          <div className="flex items-center">
            {activeChat && (
              <>
                <div className={`h-11 w-11 rounded-full flex items-center justify-center ${
                  `bg-gradient-to-r ${colors.primary}`
                }`}>
                  <span className="text-white font-medium">
                    {activeChat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <h2 className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{activeChat.name}</h2>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{messages.length} messages</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative" ref={colorPickerRef}>
              <button 
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                } transition-colors duration-200`}
                aria-label="Change theme color"
              >
                <FiSettings className="w-5 h-5" />
              </button>
              {showColorPicker && (
                <div className="absolute right-0 top-full mt-2">
                  <ColorPicker onClose={() => setShowColorPicker(false)} />
                </div>
              )}
            </div>
            
            <button 
              type="button"
              onClick={toggleMode}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleLogout}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-red-400' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-600'
              } transition-colors duration-200`}
              aria-label="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        {/* Messages */}
        <MessageList messages={messages} />
        
        {/* Message Input */}
        <form 
          onSubmit={handleSubmit}
          className={`p-4 ${
            isDarkMode ? 'bg-gray-900' : 'bg-white border-t border-gray-100'
          }`}
        >
          <div className="flex items-center">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className={`flex-1 p-3.5 rounded-full focus:outline-none ${
                isDarkMode 
                  ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              } transition-colors duration-200`}
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className={`ml-2 p-3.5 rounded-full ${
                messageText.trim() 
                  ? `${isDarkMode ? 'bg-gradient-to-r' : 'bg-gradient-to-r'} ${colors.primary} text-white`
                  : `${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-500'}`
              } transition-colors duration-200`}
              disabled={!messageText.trim()}
            >
              <FiSend className={messageText.trim() ? '' : 'opacity-50'} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
