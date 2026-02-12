import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import {
  TransactionFilters,
  TransactionList,
  CreateTransactionDialog,
} from '@/components/transactions';
import { useBalance } from '@/hooks/use-wallet';
import type { TransactionType } from '@/types/api';

const FILTER_ORDER = ['ALL', 'CREDIT', 'DEBIT'];

export default function TransactionsPage() {
  const { t } = useTranslation('transactions');
  const { data: balanceData } = useBalance();
  const [filter, setFilter] = useState('ALL');
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const prevFilter = useRef(filter);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TransactionType>('CREDIT');
  const hasBalance = (balanceData?.balance ?? 0) > 0;

  const openDialog = (type: TransactionType) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleFilterChange = (next: string) => {
    const oldIdx = FILTER_ORDER.indexOf(prevFilter.current);
    const newIdx = FILTER_ORDER.indexOf(next);
    setSlideDir(newIdx > oldIdx ? 'right' : 'left');
    prevFilter.current = next;
    setFilter(next);
  };

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasBalance}
            onClick={() => openDialog('DEBIT')}
          >
            {t('dashboard:sendMoney')}
          </Button>
          <Button size="sm" onClick={() => openDialog('CREDIT')}>
            {t('dashboard:addFunds')}
          </Button>
        </div>
      </div>
      <TransactionFilters value={filter} onChange={handleFilterChange} />
      <div
        key={filter}
        className={slideDir === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
      >
        <TransactionList filter={filter} />
      </div>
      <CreateTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType={dialogType}
      />
    </div>
  );
}
