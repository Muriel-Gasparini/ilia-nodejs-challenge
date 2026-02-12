import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Card, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useTransactions } from '@/hooks/use-wallet';
import { formatCurrency, formatDate } from '@/lib/utils';

export function RecentTransactions() {
  const { t, i18n } = useTranslation('dashboard');
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
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
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
                className={`shrink-0 text-xs sm:text-sm font-semibold ${
                  tx.type === 'CREDIT'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-error-500 dark:text-error-400'
                }`}
              >
                {tx.type === 'CREDIT' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
