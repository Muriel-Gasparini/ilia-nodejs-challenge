import { useTranslation } from 'react-i18next';
import { Card, Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { useTransactions } from '@/hooks/use-wallet';
import { TransactionItem } from './TransactionItem';
import type { TransactionType } from '@/types/api';

interface TransactionListProps {
  filter: string;
}

export function TransactionList({ filter }: TransactionListProps) {
  const { t } = useTranslation('transactions');
  const type = filter === 'ALL' ? undefined : (filter as TransactionType);
  const { data: transactions, isLoading, error, refetch } = useTransactions(type);

  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorState onRetry={() => refetch()} />
      </Card>
    );
  }

  if (!transactions?.length) {
    const emptyMessages: Record<string, string> = {
      ALL: t('noTransactions'),
      CREDIT: t('noCredits'),
      DEBIT: t('noDebits'),
    };

    return (
      <Card>
        <EmptyState title={emptyMessages[filter] || t('noTransactions')} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </Card>
  );
}
