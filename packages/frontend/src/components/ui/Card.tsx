import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-6',
        variant === 'elevated' && 'shadow-lg',
        className,
      )}
      {...props}
    />
  );
}
