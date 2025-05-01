import React from 'react';
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from './shadcn/avatar';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  src?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  isActive = false,
  src,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const letter = name.charAt(0).toUpperCase();

  return (
    <ShadcnAvatar 
      className={cn(
        sizeClasses[size],
        isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        "transition-all duration-300 hover:scale-110",
        className
      )}
    >
      {src && <AvatarImage src={src} alt={`${name}'s avatar`} />}
      <AvatarFallback 
        className={cn(
          isActive && "bg-primary text-primary-foreground",
          "font-medium"
        )}
      >
        {letter}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};

export default Avatar; 