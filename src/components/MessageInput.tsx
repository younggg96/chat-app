import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiHash } from 'react-icons/fi';
import { useChatStore } from '../store/chatStore';
import { useThemeStore, colorSchemes } from '../store/themeStore';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileUpload,
  isDisabled = false,
  placeholder = 'Type a message...'
}) => {
  const { colorScheme } = useThemeStore();
  const colors = colorSchemes[colorScheme];
  
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mentionMenuRef = useRef<HTMLDivElement>(null);
  
  // Get users for mention
  const users = useChatStore((state) => state.users);
  const currentUser = useChatStore((state) => state.currentUser);
  const activeChat = useChatStore((state) => state.activeChat);
  const activeType = useChatStore((state) => state.activeType);
  const ollamaIsGenerating = useChatStore((state) => state.ollamaIsGenerating);
  
  // Filter out current user from mentions
  const mentionableUsers = users.filter(user => user.id !== currentUser);
  
  // Add AI assistant to mentions for group chats
  if (activeType === 'room') {
    const aiAssistant = users.find(user => user.id === 'ai-assistant');
    if (aiAssistant && !mentionableUsers.some(user => user.id === 'ai-assistant')) {
      mentionableUsers.unshift(aiAssistant);
    }
  }
  
  // Filter users based on mention search
  const filteredMentions = mentionableUsers.filter(
    user => user.username.toLowerCase().includes(mentionSearch.toLowerCase())
  );
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
    }
  };
  
  // Handle textarea input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Check if user is typing @ for mentions
    const curPos = e.target.selectionStart || 0;
    setCursorPosition(curPos);
    
    // Find @ character before cursor position
    const textBeforeCursor = newValue.substring(0, curPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && 
        (atIndex === 0 || newValue[atIndex - 1] === ' ' || newValue[atIndex - 1] === '\n') && 
        curPos - atIndex <= 20) {
      // Get the text between @ and cursor
      const searchTerm = textBeforeCursor.substring(atIndex + 1);
      setMentionSearch(searchTerm);
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };
  
  // Handle key press in the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (unless Shift is pressed for newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    
    // Navigate through mention menu with arrow keys
    if (showMentionMenu && filteredMentions.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Tab') {
        e.preventDefault();
        // Logic for navigating through mention menu would go here
      } else if (e.key === 'Escape') {
        setShowMentionMenu(false);
      }
    }
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    const beforeCursor = message.substring(0, cursorPosition);
    const afterCursor = message.substring(cursorPosition);
    const newMessage = beforeCursor + emoji + afterCursor;
    
    setMessage(newMessage);
    setCursorPosition(cursorPosition + emoji.length);
    
    // Focus the input after selecting emoji
    if (inputRef.current) {
      inputRef.current.focus();
      // Set cursor position after emoji is inserted
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = cursorPosition + emoji.length;
          inputRef.current.selectionEnd = cursorPosition + emoji.length;
        }
      }, 0);
    }
    
    setShowEmojiPicker(false);
  };
  
  // Handle user mention selection
  const handleMentionSelect = (username: string) => {
    // Replace the @search text with @username
    const textBeforeCursor = message.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const beforeMention = message.substring(0, atIndex);
      const afterCursor = message.substring(cursorPosition);
      const newMessage = beforeMention + '@' + username + ' ' + afterCursor;
      
      setMessage(newMessage);
      setCursorPosition(atIndex + username.length + 2); // +2 for @ and space
      
      // Focus and set cursor position
      if (inputRef.current) {
        inputRef.current.focus();
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = atIndex + username.length + 2;
            inputRef.current.selectionEnd = atIndex + username.length + 2;
          }
        }, 0);
      }
    }
    
    setShowMentionMenu(false);
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (onFileUpload) {
        onFileUpload(files[0]);
      } else {
        alert('File upload functionality is not implemented yet');
      }
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      
      if (mentionMenuRef.current && !mentionMenuRef.current.contains(e.target as Node)) {
        setShowMentionMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Common emojis for quick access
  const commonEmojis = ['😊', '👍', '😂', '❤️', '🙏', '😍', '👏', '🔥', '🎉', '🤔'];
  
  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
      {/* Mention menu */}
      {showMentionMenu && filteredMentions.length > 0 && (
        <div 
          ref={mentionMenuRef}
          className="absolute bottom-[75px] left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10"
        >
          <div className="py-1">
            {filteredMentions.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleMentionSelect(user.username)}
                className="flex items-center w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${
                  user.id === 'ai-assistant' ? 'bg-purple-500' : 'bg-blue-500'
                } text-white`}>
                  {user.id === 'ai-assistant' ? 
                    <FiHash size={14} /> : 
                    user.username.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <span className={
                    user.id === 'ai-assistant' ? 
                    'font-medium text-purple-600 dark:text-purple-400' : 
                    'text-slate-800 dark:text-slate-200'
                  }>
                    {user.username}
                  </span>
                  {user.id === 'ai-assistant' && (
                    <span className="ml-2 text-xs py-0.5 px-1.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full">
                      AI
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-[75px] right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 z-10"
        >
          <div className="grid grid-cols-5 gap-1">
            {commonEmojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiSelect(emoji)}
                className="w-8 h-8 text-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Message input area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isDisabled ? 'AI is generating a response...' : placeholder}
            disabled={isDisabled || ollamaIsGenerating}
            className="w-full bg-transparent py-2 px-3 pr-12 max-h-32 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none resize-none"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          
          {/* Input actions */}
          <div className="absolute right-2 bottom-1.5 flex items-center gap-0.5">
            {/* At mention button */}
            <button
              type="button"
              onClick={() => {
                setMessage(message + '@');
                setCursorPosition(message.length + 1);
                
                // Focus the input after adding @
                if (inputRef.current) {
                  inputRef.current.focus();
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.selectionStart = message.length + 1;
                      inputRef.current.selectionEnd = message.length + 1;
                      
                      // Trigger mention search
                      setMentionSearch('');
                      setShowMentionMenu(true);
                    }
                  }, 0);
                }
              }}
              disabled={isDisabled || ollamaIsGenerating}
              className={`p-1.5 rounded-full ${
                isDisabled ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              } transition-colors`}
            >
              <FiHash size={18} />
            </button>
            
            {/* Emoji button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isDisabled || ollamaIsGenerating}
              className={`p-1.5 rounded-full ${
                isDisabled ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              } transition-colors`}
            >
              <FiSmile size={18} />
            </button>
            
            {/* File upload button */}
            <label
              htmlFor="file-upload"
              className={`p-1.5 rounded-full cursor-pointer ${
                isDisabled ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              } transition-colors`}
            >
              <FiPaperclip size={18} />
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isDisabled || ollamaIsGenerating}
              />
            </label>
          </div>
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || isDisabled || ollamaIsGenerating}
          className={`p-2 rounded-lg ${
            !message.trim() || isDisabled ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500' : `bg-gradient-to-r ${colors.primary} text-white`
          } transition-colors duration-200`}
        >
          <FiSend size={20} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput; 