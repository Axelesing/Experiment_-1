import React from 'react';

import { cn } from '@/shared/lib/utils';
import type { BaseComponentProps } from '@/shared/types';

/**
 * Card component props
 */
interface CardProps extends BaseComponentProps {
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Card header content */
  header?: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Whether card is interactive (clickable) */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

/**
 * Reusable Card component with header, body, and footer sections
 *
 * @example
 * ```tsx
 * <Card title="My Card" description="Card description">
 *   Card content
 * </Card>
 * ```
 */
export const Card = React.memo(
  ({
    title,
    description,
    header,
    footer,
    interactive = false,
    onClick,
    className,
    children,
  }: CardProps) => {
    // Memoize header content to prevent unnecessary re-renders
    const headerContent = React.useMemo(() => {
      if (header) return header;

      if (!title && !description) return null;

      return (
        <>
          {title && (
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-white/70 text-sm">{description}</p>
          )}
        </>
      );
    }, [header, title, description]);

    // Memoize wrapper props
    const wrapperProps = React.useMemo(() => {
      const baseProps = {
        className: cn(
          'card',
          interactive &&
            'cursor-pointer hover:scale-[1.02] transition-transform duration-200',
          className
        ),
      };

      if (interactive) {
        return {
          ...baseProps,
          onClick,
          role: 'button' as const,
          tabIndex: 0,
          'aria-label': title || undefined,
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClick?.();
            }
          },
        };
      }

      return baseProps;
    }, [interactive, onClick, title, className]);

    if (interactive) {
      return (
        <button {...wrapperProps}>
          {headerContent && <div className="card-header">{headerContent}</div>}
          <div className="card-body">{children}</div>
          {footer && <div className="card-footer">{footer}</div>}
        </button>
      );
    }

    return (
      <div {...wrapperProps}>
        {headerContent && <div className="card-header">{headerContent}</div>}
        <div className="card-body">{children}</div>
        {footer && <div className="card-footer">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = 'Card';
