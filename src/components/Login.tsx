import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useThemeStore, colorSchemes } from '../store/themeStore';
import { FiSettings } from 'react-icons/fi';
import ColorPicker from './ColorPicker';

export default function Login() {
  const navigate = useNavigate();
  const { mode, colorScheme, toggleMode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const [username, setUsername] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const login = useChatStore((state) => state.login);
  const selectChat = useChatStore((state) => state.selectChat);
  const users = useChatStore((state) => state.users);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      
      // Select first user as default chat after login
      if (users.length > 0) {
        selectChat(users[0].id);
      }
      
      navigate('/chat');
    }
  };

  // Outside click detection for color picker
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

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
    } transition-colors duration-300`}>
      <div className={`max-w-md w-full mx-auto p-8 rounded-xl shadow-md ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } transition-colors duration-300`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium">Messenger</h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sign in to continue to your conversations
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-lg focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-600 border-gray-700' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-blue-500 border-transparent'
              } transition-all border`}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
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
                {showColorPicker && <div className="absolute bottom-full mb-2">
                  <ColorPicker onClose={() => setShowColorPicker(false)} />
                </div>}
              </div>
              <span className={`ml-2 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Theme</span>
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
          </div>
          
          <button
            type="submit"
            disabled={!username.trim()}
            className={`w-full py-3.5 px-4 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              username.trim() 
                ? isDarkMode 
                  ? `bg-gradient-to-r ${colorSchemes[colorScheme].primary} hover:opacity-90` 
                  : `bg-gradient-to-r ${colorSchemes[colorScheme].primary} hover:opacity-90`
                : 'bg-gray-400 cursor-not-allowed'
            } transition-all duration-200`}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
} 