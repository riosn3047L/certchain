import React from 'react';
import './Badge.css';
import { cn } from './Button.jsx';
import { CheckCircle2, XCircle, Clock, SearchX, AlertCircle } from 'lucide-react';

export default function Badge({ variant = 'pending', children, className, ...props }) {
  // variants: verified (success), revoked (danger), not-found (muted), pending (warning)
  
  const getIcon = () => {
    switch(variant) {
      case 'verified': return <CheckCircle2 size={14} className="badge-icon" />;
      case 'revoked': return <XCircle size={14} className="badge-icon" />;
      case 'not-found': return <SearchX size={14} className="badge-icon" />;
      case 'danger': return <AlertCircle size={14} className="badge-icon" />;
      case 'pending':
      default: return <Clock size={14} className="badge-icon" />;
    }
  };

  return (
    <span className={cn('badge', `badge-${variant}`, className)} {...props}>
      {getIcon()}
      <span className="badge-text">{children}</span>
    </span>
  );
}
