import React from 'react';
import './Card.css';
import { cn } from './Button.jsx';

export default function Card({ children, className, hoverable = false, ...props }) {
  return (
    <div 
      className={cn('card', hoverable && 'card-hoverable', className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('card-header', className)}>{children}</div>;
}

export function CardBody({ children, className }) {
  return <div className={cn('card-body', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={cn('card-footer', className)}>{children}</div>;
}
