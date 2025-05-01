import React, { ButtonHTMLAttributes } from 'react';
import { Button as ShadcnButton, buttonVariants } from './shadcn/button';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  ...props
}) => {
  return (
    <ShadcnButton
      type={type}
      variant={variant}
      size={size}
      className={cn(
        fullWidth && 'w-full',
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </ShadcnButton>
  );
};

export default Button; 