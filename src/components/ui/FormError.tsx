import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { useThemeStore } from '../../store/themeStore';

interface FormErrorProps {
  message: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ 
  message,
  className = ''
}) => {
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';

  if (!message) return null;

  return (
    <div 
      className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
        isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-600'
      } ${className}`}
    >
      <FiAlertCircle className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default FormError; 