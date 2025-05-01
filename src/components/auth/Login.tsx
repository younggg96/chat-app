import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { FiMail, FiLock } from 'react-icons/fi';
import { Form, Input, Button, FormError } from '../ui';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError, user } = useAuthStore();
  const { login: chatLogin } = useChatStore();
  
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
    if (isAuthenticated && user) {
      // Login to chat system using user ID and username
      chatLogin(user.username, user.id)
        .then(() => {
          // 登录成功后重定向到聊天页面
          navigate('/chat');
        })
        .catch(err => {
          console.error('Failed to connect to chat service:', err);
        });
    }
  }, [isAuthenticated, user, navigate, chatLogin]);
  
  return (
    <Form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}
      
      <Input
        type="email"
        id="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
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