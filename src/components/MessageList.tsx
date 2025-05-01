import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { useThemeStore, colorSchemes } from "../store/themeStore";
import { FiUser, FiUsers, FiMessageSquare, FiBox, FiInfo, FiZap } from "react-icons/fi";

// Message type
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isLoading?: boolean;
  roomId?: string;
  isPrivate?: boolean;
  isSystemMessage?: boolean;
  status?: 'sending' | 'sent' | 'read';
  contentType?: 'text' | 'image';
}

// Message bubble component
interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  isSystemMessage?: boolean;
  isAI?: boolean;
  sender?: string;
  senderName?: string;
  isLoading?: boolean;
  mentionedUser?: boolean;
  status?: 'sending' | 'sent' | 'read';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content, 
  timestamp, 
  isCurrentUser,
  isSystemMessage,
  isAI,
  sender,
  senderName,
  isLoading,
  mentionedUser,
  status
}) => {
  const { colorScheme } = useThemeStore();
  const colors = colorSchemes[colorScheme];
  
  // Set styles based on message type
  const getBubbleStyle = () => {
    if (isSystemMessage) {
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
    
    if (isCurrentUser) {
      return `bg-gradient-to-r ${colors.primary} text-white shadow-sm`;
    }
    
    if (isAI) {
      return "bg-blue-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-blue-100 dark:border-slate-600 shadow-sm";
    }
    
    return "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm";
  };
  
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-3">
        <div className={`inline-block rounded-md px-4 py-2 text-xs text-center max-w-xs ${getBubbleStyle()}`}>
          <FiInfo className="inline mr-1" />
          {content}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex my-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for non-current users */}
      {!isCurrentUser && (
        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0 ${
          isAI ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-700'
        }`}>
          {isAI ? (
            <FiZap className="text-white" size={14} />
          ) : (
            <span className="text-white text-sm">{senderName?.charAt(0).toUpperCase() || "U"}</span>
          )}
          
          {/* AI badge */}
          {isAI && (
            <span className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 text-purple-500 dark:text-purple-400 text-[8px] font-bold px-1 rounded-full border border-purple-200 dark:border-purple-700">
              AI
            </span>
          )}
        </div>
      )}
      
      <div className={`relative rounded-lg px-4 py-2.5 max-w-sm ${getBubbleStyle()} ${isLoading ? 'animate-pulse' : ''} ${mentionedUser ? 'border-l-4 border-l-yellow-400' : ''}`}>
        {/* Display sender for non-current user */}
        {!isCurrentUser && !isSystemMessage && (
          <div className={`text-xs font-medium mb-1 ${isAI ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>
            {isAI ? 'AI Assistant' : senderName}
          </div>
        )}
        
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words">
          {isLoading ? (
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          ) : content}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs mt-1.5 flex items-center ${isCurrentUser ? 'text-blue-100' : isAI ? 'text-purple-400 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400'}`}>
          {formattedTime}
          
          {/* Message status indicator (only for current user's messages) */}
          {isCurrentUser && status && (
            <span className="ml-2 flex items-center">
              {status === 'sending' && (
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {status === 'sent' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              {status === 'read' && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 12.75l6 6 9-13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 8.75l6 6 9-13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
      
      {/* Avatar for current user */}
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
          <span className="text-white text-sm">{senderName?.charAt(0).toUpperCase() || "Y"}</span>
        </div>
      )}
    </div>
  );
};

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false, currentUserId }) => {
  const { colorScheme } = useThemeStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const users = useChatStore((state) => state.users);
  const ollamaIsGenerating = useChatStore((state) => state.ollamaIsGenerating);
  const activeChat = useChatStore((state) => state.activeChat);
  
  // Find username by ID
  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.username || userId;
  };
  
  // Check if message is from AI assistant
  const isAIMessage = (senderId: string) => {
    return senderId === 'ai-assistant';
  };
  
  // Check if message mentions user
  const checkForMention = (content: string) => {
    return content.includes(`@${getUserNameById(currentUserId)}`) || 
           content.includes('@AI') || 
           content.includes('@everyone');
  };
  
  // Scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <FiMessageSquare size={36} className="mb-3 opacity-20" />
            <p>No messages yet</p>
            <p className="text-xs mt-1">Send a message to start chatting</p>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            {/* System message when entering chat */}
            {activeChat && (
              <div className="flex justify-center my-3">
                <div className="inline-block rounded-md px-4 py-2 text-xs text-center max-w-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <FiInfo className="inline mr-1" />
                  {'You are now chatting with '}
                  {activeChat.hasOwnProperty('name') 
                    ? (activeChat as any).name 
                    : (activeChat as any).username}
                </div>
              </div>
            )}
            
            {messages.map((message) => {
              const isCurrentUser = message.sender === currentUserId;
              const hasMention = checkForMention(message.content);
              
              return (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  timestamp={message.timestamp}
                  isCurrentUser={isCurrentUser}
                  isSystemMessage={Boolean(message.isSystemMessage)}
                  isAI={isAIMessage(message.sender)}
                  sender={message.sender}
                  senderName={getUserNameById(message.sender)}
                  isLoading={message.isLoading}
                  mentionedUser={hasMention && !isCurrentUser}
                  status={(message as any).status}
                />
              );
            })}
            
            {/* AI is typing indicator */}
            {ollamaIsGenerating && messages.length > 0 && !messages[messages.length - 1].isLoading && (
              <MessageBubble
                content=""
                timestamp={new Date().toISOString()}
                isCurrentUser={false}
                isAI={true}
                senderName="AI Assistant"
                isLoading={true}
              />
            )}
          </div>
        )}
        
        {/* This element is used for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList; 