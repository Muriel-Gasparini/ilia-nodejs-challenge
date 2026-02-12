import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/api';

interface BadgeProps {
  type: TransactionType;
  label: string;
}

export function Badge({ type, label }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-pill)] px-2 py-0.5 text-[0.65rem] leading-tight sm:px-3 sm:py-1 sm:text-xs font-semibold',
        type === 'CREDIT'
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-400/15 dark:text-primary-400'
          : 'bg-error-50 text-error-500 dark:bg-error-400/15 dark:text-error-400',
      )}
    >
      {label}
    </span>
  );
}
