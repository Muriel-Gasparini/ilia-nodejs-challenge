import { cn } from '@/lib/utils';
import { transactionTypeStyles } from '@/lib/transaction-styles';
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
        transactionTypeStyles[type].iconBg,
      )}
    >
      {label}
    </span>
  );
}
