import React from 'react';
import { cn } from '@/utils/cn';

const Alert = ({ variant = 'default', className, children, ...props }) => {
  const variants = {
    default: 'bg-white border-slate-200',
    destructive: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDescription = ({ className, ...props }) => {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
};

export { Alert, AlertDescription };



