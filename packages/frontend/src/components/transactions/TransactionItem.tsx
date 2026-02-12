import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { transactionTypeStyles } from '@/lib/transaction-styles';
import type { Transaction } from '@/types/api';

interface TransactionItemProps {
  transaction: Transaction;
  size?: 'sm' | 'md';
}

export function TransactionItem({ transaction: tx, size = 'md' }: TransactionItemProps) {
  const { t, i18n } = useTranslation();
  const style = transactionTypeStyles[tx.type];

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center rounded-full text-lg',
            size === 'sm' ? 'h-9 w-9' : 'h-10 w-10',
            style.iconBg,
          )}
        >
          {style.arrow}
        </div>
        <div>
          <Badge type={tx.type} label={t(`transactions:${tx.type.toLowerCase()}`)} />
          <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
            {formatDate(tx.created_at, i18n.language)}
          </p>
        </div>
      </div>
      <span
        className={cn(
          'shrink-0 text-xs font-semibold',
          size === 'sm' ? 'sm:text-sm' : 'sm:text-base',
          style.amountColor,
        )}
      >
        {style.prefix}
        {formatCurrency(tx.amount)}
      </span>
    </div>
  );
}
