import React, { InputHTMLAttributes } from 'react';
import { Input as ShadcnInput } from './shadcn/input';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  label,
  helperText,
  error = false,
  fullWidth = false,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col space-y-2', fullWidth ? 'w-full' : '')}>
      {label && (
        <label 
          htmlFor={props.id}
          className={cn(
            "text-sm font-medium", 
            error ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </label>
      )}
      
      <ShadcnInput
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      
      {helperText && (
        <p className={cn(
          "text-xs", 
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 