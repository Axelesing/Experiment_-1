import React from 'react';

import { cn } from '@/shared/lib/utils';
import type { BaseComponentProps } from '@/shared/types';

/**
 * Button variant types
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Button size types
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props
 */
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BaseComponentProps {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  /** Button content */
  children: React.ReactNode;
}

/**
 * Button variant styles
 */
const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
  ghost: 'glass hover:bg-white/20',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

/**
 * Button size styles
 */
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Reusable Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = React.memo(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    ...props
  }: ButtonProps) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          'font-medium rounded-lg transition-colors duration-200 flex flex-row items-center justify-center gap-2',
          'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        disabled={isDisabled}
        aria-label={typeof children === 'string' ? children : undefined}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div
            className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            aria-hidden="true"
          />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
