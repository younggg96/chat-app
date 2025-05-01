import React, { ButtonHTMLAttributes } from 'react';
import { IconButton as ShadcnIconButton } from './shadcn/icon-button';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon: React.ReactNode;
  tooltip?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

export const IconButton: React.FC<IconButtonProps> = ({
  className = '',
  variant = 'ghost',
  size = 'icon',
  icon,
  tooltip,
  tooltipSide = 'top',
  disabled = false,
  type = 'button',
  ...props
}) => {
  return (
    <ShadcnIconButton
      type={type}
      variant={variant}
      size={size}
      icon={icon}
      tooltip={tooltip}
      tooltipSide={tooltipSide}
      className={className}
      disabled={disabled}
      {...props}
    />
  );
};

export default IconButton; 