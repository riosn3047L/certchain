import React, { forwardRef } from 'react';
import './Input.css';
import { cn } from './Button.jsx';

const Input = forwardRef(({ label, error, helperText, className, id, ...props }, ref) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={cn('input-group', className)}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn('input', error ? 'input-error' : '')}
        {...props}
      />
      {(error || helperText) && (
        <span className={cn('input-helper', error && 'text-danger')}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
