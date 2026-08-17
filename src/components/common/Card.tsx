import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'accent';
  accentColor?: 'red' | 'amber' | 'emerald' | 'blue' | 'purple';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  accentColor,
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-200 overflow-hidden';
  
  const variants = {
    default: 'bg-slate-900 border border-slate-800 text-slate-100 shadow-lg',
    glass: 'bg-slate-900/80 backdrop-blur-md border border-slate-800/80 text-slate-100 shadow-xl hover:border-slate-700/80',
    bordered: 'bg-slate-950 border border-slate-700 text-slate-100',
    accent: 'bg-slate-900 border-l-4 text-slate-100 shadow-lg'
  };

  const borderAccents = {
    red: 'border-l-red-500 border-y border-r border-slate-800',
    amber: 'border-l-amber-500 border-y border-r border-slate-800',
    emerald: 'border-l-emerald-500 border-y border-r border-slate-800',
    blue: 'border-l-blue-500 border-y border-r border-slate-800',
    purple: 'border-l-purple-500 border-y border-r border-slate-800'
  };

  return (
    <div
      className={clsx(
        baseStyles,
        variant === 'accent' && accentColor ? borderAccents[accentColor] : variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={clsx('px-5 py-4 border-b border-slate-800/80 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={clsx('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={clsx('px-5 py-3.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-sm', className)} {...props}>
    {children}
  </div>
);
