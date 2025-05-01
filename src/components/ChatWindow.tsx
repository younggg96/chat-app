import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { useThemeStore, colorSchemes } from "../store/themeStore";
import { 
  FiMessageSquare, 
  FiChevronLeft, 
  FiMenu
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ColorPicker from './ColorPicker';
import { Button } from './ui';
import { ChatRoom, User } from "../services/chatService";
import chatService from "../services/chatService";

// Import extracted components
import { 
  createNotification, 
  addMessageStatusIndicators, 
  setupOfflineMessageQueue, 
  requestNotificationPermission, 
  MessageExtended,
  detectAIMention,
  initializeChatMockData,
  handleImageUpload
} from './services';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import ChatHeader from './ChatHeader';

export default function ChatWindow() {
  const { colorScheme } = useThemeStore();
  const colors = colorSchemes[colorScheme];

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const userInfoRef = useRef<HTMLDivElement>(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const initialized = useRef(false);
  
  // Chat state
  const currentUser = useChatStore((state) => state.currentUser);
  const activeChat = useChatStore((state) => state.activeChat);
  const activeType = useChatStore((state) => state.activeType);
  const users = useChatStore((state) => state.users);
  const rooms = useChatStore((state) => state.rooms);
  const login = useChatStore((state) => state.login);
  const selectChat = useChatStore((state) => state.selectChat);
  const createRoom = useChatStore((state) => state.createRoom);
  const messages = useChatStore((state) => {
    if (!activeChat) return [];
    const chatId = activeType === 'user' 
      ? (activeChat as User).id 
      : (activeChat as ChatRoom).id;
    return state.messages[chatId] || [];
  });
  const sendMessage = useChatStore((state) => state.sendMessage);
  const chatLogout = useChatStore((state) => state.logout);
  const clearChatHistory = useChatStore((state) => state.clearChatHistory);
  const setMessages = useChatStore((state) => state.setMessages);
  
  // Ollama state
  const ollamaIsGenerating = useChatStore((state) => state.ollamaIsGenerating);
  const setOllamaIsGenerating = useChatStore((state) => state.setOllamaIsGenerating);
  
  // Auth state
  const { logout: authLogout, user: authUser } = useAuthStore();
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevActiveChatRef = useRef<string | null>(null);
  
  // Initialize notification system
  useEffect(() => {
    // Only initialize on first component load
    if (!initialized.current) {
      initializeFeatures();
      initialized.current = true;
    }
    
    // Mark messages as read when window gets focus
    const handleFocus = () => {
      if (activeChat) {
        const chatId = activeType === 'user' 
          ? (activeChat as User).id 
          : (activeChat as ChatRoom).id;
          
        // Mark all received messages in current active chat as read
        const chatMessages = messages;
        const updatedMessages = chatMessages.map(msg => {
          if (msg.sender !== currentUser) {
            return { ...msg, status: 'read' };
          }
          return msg;
        });
        
        setMessages(chatId, updatedMessages);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Listen for new messages and create notifications for those not in the active chat
    const unsubscribe = useChatStore.subscribe((state) => {
      const { messages, activeChat, activeType, currentUser } = state;
      if (!currentUser || !activeChat) return;
      
      // Current active chat ID
      const activeChatId = activeType === 'user' 
        ? (activeChat as User).id 
        : (activeChat as ChatRoom).id;
      
      Object.entries(messages).forEach(([chatId, chatMessages]) => {
        if (chatId !== activeChatId && chatMessages.length > 0) {
          const lastMessage = chatMessages[chatMessages.length - 1];
          // Only process recently received messages (within 5 seconds) that weren't sent by current user
          const isRecent = new Date().getTime() - new Date(lastMessage.timestamp).getTime() < 5000;
          if (isRecent && lastMessage.sender !== currentUser) {
            // Find the chat name
            let chatName = "";
            if (chatId.startsWith("room-")) {
              const room = rooms.find(r => r.id === chatId);
              chatName = room ? room.name : "";
            } else {
              const user = users.find(u => u.id === chatId);
              chatName = user ? user.username : "";
            }
            createNotification(chatId, lastMessage as MessageExtended, chatName);
          }
        }
      });
    });
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
    };
  }, [activeChat, activeType, currentUser, messages, rooms, users, setMessages]);
  
  // Ensure some sample data exists
  useEffect(() => {
    // Check if we need to initialize sample data and no active chat exists
    if (!activeChat && users.length <= 1) {
      // Call custom initialization function
      initializeChatMockData(currentUser);
    }
  }, [activeChat, users.length, currentUser]);

  // Initialize features
  const initializeFeatures = () => {
    // Request notification permission
    requestNotificationPermission();
    
    // Enable message status indicators
    addMessageStatusIndicators(currentUser);
    
    // Setup offline message queue
    setupOfflineMessageQueue(chatService);
  };
  
  // Handle sending messages, including @mention handling and image upload
  const handleSendMessage = (messageContent: string) => {
    if (messageContent.trim()) {
      if (activeChat && activeType === 'room') {
        // Check for @AI mentions
        const roomId = (activeChat as ChatRoom).id;
        const hasMention = detectAIMention(messageContent, roomId);
        
        // If it's @AI, let detectAIMention handle it
        if (!hasMention) {
          sendMessage(messageContent);
        }
      } else {
        // Send regular message
        sendMessage(messageContent);
      }
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!activeChat || !currentUser) return;
    
    const chatId = activeType === 'user' 
      ? (activeChat as User).id 
      : (activeChat as ChatRoom).id;
    
    try {
      await handleImageUpload(file, chatId, currentUser);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  
  // Create default user if no current user exists
  useEffect(() => {
    if (!currentUser && !useChatStore.getState().currentUser) {
      if (authUser) {
        login(authUser.username, authUser.id);
      } else {
        login('Guest', 'guest-' + Math.random().toString(36).substr(2, 9));
      }
    }
  }, [currentUser, login, authUser]);
  
  // Auto-select the first user as default chat if no active chat
  useEffect(() => {
    if (currentUser && !activeChat && users.length > 0) {
      // Default select first user as chat target
      selectChat(users[0].id, 'user');
    }
  }, [currentUser, activeChat, users, selectChat]);
  
  // Detect chat switching, add loading state
  useEffect(() => {
    if (activeChat && prevActiveChatRef.current !== activeChat.id) {
      setIsMessagesLoading(true);
      
      // Record current active chat
      prevActiveChatRef.current = activeChat.id;
      
      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsMessagesLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [activeChat]);
  
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
      // Handle color picker outside clicks
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      
      // Handle user info outside clicks
      if (userInfoRef.current && !userInfoRef.current.contains(event.target as Node)) {
        setShowUserInfo(false);
      }
    }
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showColorPicker, showUserInfo]);
  
  const handleLogout = () => {
    // Logout from chat
    chatLogout();
    // Logout from auth
    authLogout();
    // Navigate to login page
    navigate("/");
  };
  
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearChatHistory();
    }
  };
  
  // Loading state, with auto-fix option
  if (!currentUser) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mb-2">
          <FiMessageSquare className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-medium">Loading chat...</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">If loading takes too long, you may need to log in again</p>
        <Button
          onClick={() => navigate("/")}
          variant="default"
          className="mt-2"
        >
          Return to Login
        </Button>
      </div>
    );
  }

  // If user is loaded but no active chat
  if (!activeChat) {
    return (
      <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
        {/* Sidebar toggle for mobile */}
        <div className="md:hidden fixed bottom-4 left-4 z-30">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-colors"
          >
            {showSidebar ? <FiChevronLeft /> : <FiMenu />}
          </button>
        </div>

        {/* Sidebar */}
        <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} transform md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-20 md:z-auto w-64 md:w-[460px] border-r border-slate-200 dark:border-slate-800 h-full`}>
          <Sidebar />
        </div>
        
        {/* Welcome screen when no chat is selected */}
        <ChatWelcomeScreen createRoom={createRoom} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
      {/* Sidebar toggle for mobile */}
      <div className="md:hidden fixed bottom-4 left-4 z-30">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-colors"
        >
          {showSidebar ? <FiChevronLeft /> : <FiMenu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} transform md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-20 md:z-auto w-64 md:w-[460px] border-r border-slate-200 dark:border-slate-800 h-full`}>
        <Sidebar />
      </div>
      
      {/* Main Chat Area */}
      <div className={`${showSidebar ? 'md:ml-0' : 'ml-0'} flex-1 flex flex-col h-full`}>
        {/* Header */}
        <ChatHeader
          activeChat={activeChat}
          activeType={activeType}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
          setShowColorPicker={setShowColorPicker}
          handleClearChat={handleClearChat}
          handleLogout={handleLogout}
          userInfoRef={userInfoRef}
        />
        
        {/* Color Theme Picker */}
        {showColorPicker && (
          <div 
            ref={colorPickerRef}
            className="absolute top-20 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50"
          >
            <ColorPicker onClose={() => setShowColorPicker(false)} />
          </div>
        )}
        
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <MessageList
            messages={messages}
            isLoading={isMessagesLoading}
            currentUserId={currentUser}
          />
          
          {/* Message Input */}
          <div className="relative">
            <MessageInput 
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isDisabled={ollamaIsGenerating}
              placeholder={
                activeType === 'user' && (activeChat as User).id === 'ai-assistant'
                  ? 'Ask AI anything...'
                  : activeType === 'room'
                  ? 'Send a message to the group... (use @AI to ask the AI)'
                  : 'Type a message...'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
