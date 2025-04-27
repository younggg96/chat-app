import React, { useState } from 'react';
import { Button } from '../ui';
import Login from './Login';
import Register from './Register';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-md w-full mx-auto p-8 rounded-xl shadow-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium">Chat App</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {isLogin ? 'Sign in to continue your conversations' : 'Create an account to join chat'}
          </p>
        </div>

        {isLogin ? (
          <Login />
        ) : (
          <Register />
        )}

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin ? 'No account? Register' : 'Already have an account? Login'}
          </Button>
        </div>
      </div>
    </div>
  );
} 