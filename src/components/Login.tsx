import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { FiSettings } from 'react-icons/fi';
import ColorPicker from './ColorPicker';
import { Button, Input, Form, IconButton, ThemeToggle } from './ui';

export default function Login() {
  const navigate = useNavigate();
  const { colorScheme } = useThemeStore();
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-md w-full mx-auto p-8 rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300 border border-slate-200/80 dark:border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium">Messenger</h1>
          <p className="mt-2 text-slate-500 dark:text-gray-400">
            Sign in to continue your conversations
          </p>
        </div>
        
        <Form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative" ref={colorPickerRef}>
                <IconButton 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  tooltip="Change theme color"
                  icon={<FiSettings className="w-5 h-5" />}
                />
                {showColorPicker && <div className="absolute bottom-full mb-2">
                  <ColorPicker onClose={() => setShowColorPicker(false)} />
                </div>}
              </div>
              <span className="ml-2 text-sm text-slate-600 dark:text-gray-300">Theme</span>
            </div>
            
            <ThemeToggle />
          </div>
          
          <Button
            type="submit"
            fullWidth
            disabled={!username.trim()}
            variant={username.trim() ? 'primary' : 'secondary'}
          >
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
} 