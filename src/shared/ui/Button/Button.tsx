import React from 'react';

import { cn } from '@/shared/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'glass hover:bg-white/20',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const Button = React.memo(
  ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
  }: ButtonProps) => {
    return (
      <button
        className={cn(
          'font-medium rounded-lg transition-colors duration-200 flex items-center gap-2',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        aria-label={typeof children === 'string' ? children : undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
