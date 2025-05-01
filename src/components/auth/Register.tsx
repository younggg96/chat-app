import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { FiUser, FiLock, FiMail } from 'react-icons/fi';
import { Form, Input, Button, FormError } from '../ui';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, isAuthenticated, clearError, user } = useAuthStore();
  const { login: chatLogin, selectChat } = useChatStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmPassword: ''
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear related field errors
    if (name === 'password' || name === 'confirmPassword') {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validate passwords
  const validatePasswords = () => {
    let isValid = true;
    const errors = {
      password: '',
      confirmPassword: ''
    };
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatePasswords()) {
      await register(formData.username, formData.email, formData.password);
    }
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
        type="text"
        id="username"
        name="username"
        label="Username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Enter your username"
        required
      />
      
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
        error={formErrors.password !== ''}
        helperText={formErrors.password}
        required
      />
      
      <Input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Re-enter your password"
        error={formErrors.confirmPassword !== ''}
        helperText={formErrors.confirmPassword}
        required
      />
      
      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
      >
        Register
      </Button>
    </Form>
  );
} 