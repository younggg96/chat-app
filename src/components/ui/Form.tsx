import React, { FormHTMLAttributes } from 'react';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ 
  children, 
  className = '',
  ...props
}) => {
  return (
    <form className={`space-y-5 ${className}`} {...props}>
      {children}
    </form>
  );
};

export default Form; 