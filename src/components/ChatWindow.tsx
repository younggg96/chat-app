import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { useThemeStore, colorSchemes } from "../store/themeStore";
import { FiSend, FiLogOut, FiSettings } from "react-icons/fi";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import ColorPicker from './ColorPicker';
import { Button, IconButton, Input, ThemeToggle } from './ui';

export default function ChatWindow() {
  const { colorScheme } = useThemeStore();
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            {activeChat && (
              <>
                <div className={`h-11 w-11 rounded-full flex items-center justify-center bg-gradient-to-r ${colors.primary}`}>
                  <span className="text-white font-medium">
                    {activeChat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <h2 className="font-medium text-gray-800 dark:text-white">{activeChat.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{messages.length} messages</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative" ref={colorPickerRef}>
              <IconButton 
                onClick={() => setShowColorPicker(!showColorPicker)}
                tooltip="Change theme color"
                icon={<FiSettings className="w-5 h-5" />}
              />
              {showColorPicker && (
                <div className="absolute right-0 top-full mt-2">
                  <ColorPicker onClose={() => setShowColorPicker(false)} />
                </div>
              )}
            </div>
            
            <ThemeToggle />
            
            <IconButton
              onClick={handleLogout}
              tooltip="Logout"
              icon={<FiLogOut className="w-5 h-5" />}
              className="hover:text-red-400"
            />
          </div>
        </header>
        
        {/* Messages */}
        <MessageList messages={messages} />
        
        {/* Message Input */}
        <form 
          onSubmit={handleSubmit}
          className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center">
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              fullWidth={false}
            />
            <IconButton
              type="submit"
              className="ml-2 p-3.5"
              disabled={!messageText.trim()}
              variant={messageText.trim() ? 'primary' : 'secondary'}
              icon={<FiSend className={messageText.trim() ? '' : 'opacity-50'} />}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
