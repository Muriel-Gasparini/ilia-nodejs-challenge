import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { useTransactions } from '@/hooks/use-wallet';
import { TransactionItem } from './TransactionItem';
import type { TransactionType, PaginationMeta } from '@/types/api';

interface TransactionListProps {
  filter: string;
}

const PAGE_SIZE = 20;

type PageDirection = 'next' | 'prev' | null;

function PaginationBar({
  meta,
  page,
  isFetching,
  direction,
  onPrev,
  onNext,
}: {
  meta: PaginationMeta;
  page: number;
  isFetching: boolean;
  direction: PageDirection;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation('transactions');

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--text-tertiary)]">
        {t('paginationInfo', {
          from: (meta.page - 1) * meta.limit + 1,
          to: Math.min(meta.page * meta.limit, meta.total),
          total: meta.total,
        })}
      </span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1 || isFetching}
          isLoading={isFetching && direction === 'prev'}
          onClick={onPrev}
        >
          {t('previous')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= meta.totalPages || isFetching}
          isLoading={isFetching && direction === 'next'}
          onClick={onNext}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
}

export function TransactionList({ filter }: TransactionListProps) {
  const { t } = useTranslation('transactions');
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<PageDirection>(null);
  const type = filter === 'ALL' ? undefined : (filter as TransactionType);
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useTransactions(type, page, PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter]);

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

  const transactions = response?.data;
  const meta = response?.meta;

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

  const hasPagination = meta && meta.totalPages > 1;
  const prevPage = () => {
    setDirection('prev');
    setPage((p) => p - 1);
  };
  const nextPage = () => {
    setDirection('next');
    setPage((p) => p + 1);
  };

  const slideClass =
    direction === 'next'
      ? 'animate-slide-in-right'
      : direction === 'prev'
        ? 'animate-slide-in-left'
        : '';

  return (
    <Card className="overflow-x-hidden">
      {hasPagination && (
        <div className="mb-4 border-b border-[var(--border-secondary)] pb-4">
          <PaginationBar
            meta={meta}
            page={page}
            isFetching={isFetching}
            direction={direction}
            onPrev={prevPage}
            onNext={nextPage}
          />
        </div>
      )}

      <div
        key={page}
        className={`flex flex-col divide-y divide-[var(--border-secondary)] ${slideClass}`}
      >
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>

      {hasPagination && (
        <div className="mt-4 border-t border-[var(--border-secondary)] pt-4">
          <PaginationBar
            meta={meta}
            page={page}
            isFetching={isFetching}
            direction={direction}
            onPrev={prevPage}
            onNext={nextPage}
          />
        </div>
      )}
    </Card>
  );
}
