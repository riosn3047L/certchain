import React from 'react';
import './Button.css';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading = false,
  disabled,
  ...props 
}) {
  return (
    <button 
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        isLoading && 'btn-loading',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="spinner" viewBox="0 0 24 24">
          <circle className="path" cx="12" cy="12" r="10" fill="none" strokeWidth="3"></circle>
        </svg>
      ) : null}
      <span className={cn('btn-content', isLoading && 'invisible')}>
        {children}
      </span>
    </button>
  );
}
