import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/types/api';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction: tx }: TransactionItemProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
            tx.type === 'CREDIT'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-400/15 dark:text-primary-400'
              : 'bg-error-50 text-error-500 dark:bg-error-400/15 dark:text-error-400'
          }`}
        >
          {tx.type === 'CREDIT' ? '↑' : '↓'}
        </div>
        <div>
          <Badge type={tx.type} label={t(`transactions:${tx.type.toLowerCase()}`)} />
          <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
            {formatDate(tx.created_at, i18n.language)}
          </p>
        </div>
      </div>
      <span
        className={`shrink-0 text-xs sm:text-base font-semibold ${
          tx.type === 'CREDIT'
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-error-500 dark:text-error-400'
        }`}
      >
        {tx.type === 'CREDIT' ? '+' : '-'}
        {formatCurrency(tx.amount, i18n.language)}
      </span>
    </div>
  );
}
