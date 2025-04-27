import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useThemeStore, colorSchemes } from '../../store/themeStore';
import { FiUser, FiLock, FiMail, FiAlertCircle } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const chatLogin = useChatStore((state) => state.login);
  const selectChat = useChatStore((state) => state.selectChat);
  const users = useChatStore((state) => state.users);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };
  
  // Redirect to chat page when authentication is successful
  useEffect(() => {
    if (isAuthenticated) {
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        // Login to chat system
        chatLogin(authUser.username);
        
        // Select first user as default chat
        if (users.length > 0) {
          selectChat(users[0].id);
        }
        
        navigate('/chat');
      }
    }
  }, [isAuthenticated, navigate, chatLogin, selectChat, users]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
          isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-600'
        }`}>
          <FiAlertCircle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Email
        </label>
        <div className={`relative rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-3.5 rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-600' 
                : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
            } transition-all border-transparent border`}
            placeholder="Enter your email"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Password
        </label>
        <div className={`relative rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-3.5 rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-blue-600' 
                : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
            } transition-all border-transparent border`}
            placeholder="Enter your password"
            required
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !formData.email || !formData.password}
        className={`w-full py-3.5 px-4 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          !isLoading && formData.email && formData.password
            ? isDarkMode 
              ? `bg-gradient-to-r ${colorSchemes[colorScheme].primary} hover:opacity-90` 
              : `bg-gradient-to-r ${colorSchemes[colorScheme].primary} hover:opacity-90`
            : 'bg-gray-400 cursor-not-allowed'
        } transition-all duration-200 flex justify-center`}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : 'Login'}
      </button>
    </form>
  );
} 