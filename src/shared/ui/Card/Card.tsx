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
    const CardWrapper = interactive ? 'button' : 'div';

    return (
      <CardWrapper
        className={cn(
          'card',
          interactive &&
            'cursor-pointer hover:scale-[1.02] transition-transform duration-200',
          className
        )}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive && title ? title : undefined}
      >
        {(title || description || header) && (
          <div className="card-header">
            {header || (
              <>
                {title && (
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-white/70 text-sm">{description}</p>
                )}
              </>
            )}
          </div>
        )}

        <div className="card-body">{children}</div>

        {footer && <div className="card-footer">{footer}</div>}
      </CardWrapper>
    );
  }
);

Card.displayName = 'Card';
