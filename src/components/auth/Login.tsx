import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { FiMail, FiLock } from 'react-icons/fi';
import { Form, Input, Button, FormError } from '../ui';

export default function Login() {
  const navigate = useNavigate();
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
    <Form onSubmit={handleSubmit}>
      {error && <FormError message={error} />}
      
      <Input
        type="email"
        id="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        icon={<FiMail />}
        placeholder="Enter your email"
        required
      />
      
      <Input
        type="password"
        id="password"
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        icon={<FiLock />}
        placeholder="Enter your password"
        required
      />
      
      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading || !formData.email || !formData.password}
      >
        Login
      </Button>
    </Form>
  );
} 