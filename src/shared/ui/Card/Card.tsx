import React from 'react';

import { cn } from '@/shared/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.memo(({ children, className }: CardProps) => {
  return <div className={cn('card', className)}>{children}</div>;
});

Card.displayName = 'Card';
