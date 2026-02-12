import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Card, Skeleton, EmptyState } from '@/components/ui';
import { TransactionItem } from '@/components/transactions';
import { useTransactions } from '@/hooks/use-wallet';

export function RecentTransactions() {
  const { t } = useTranslation('dashboard');
  const { data: response, isLoading } = useTransactions(undefined, 1, 5);

  const recent = response?.data;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('recentTransactions')}</h3>
        <Link
          to="/transactions"
          className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          {t('viewAll')}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : !recent?.length ? (
        <EmptyState title={t('noTransactions')} description={t('noTransactionsDescription')} />
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
          {recent.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} size="sm" />
          ))}
        </div>
      )}
    </Card>
  );
}
