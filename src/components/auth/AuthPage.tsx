import React, { useState } from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';
import Login from './Login';
import Register from './Register';

export default function AuthPage() {
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
    } transition-colors duration-300`}>
      <div className={`max-w-md w-full mx-auto p-8 rounded-xl shadow-md ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } transition-colors duration-300`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium">Chat App</h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isLogin ? 'Sign in to continue your conversations' : 'Create an account to join chat'}
          </p>
        </div>

        {isLogin ? (
          <Login />
        ) : (
          <Register />
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className={`text-sm ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            {isLogin ? 'No account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
} 