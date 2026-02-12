import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import {
  TransactionFilters,
  TransactionList,
  CreateTransactionDialog,
} from '@/components/transactions';
import type { TransactionType } from '@/types/api';

export default function TransactionsPage() {
  const { t } = useTranslation('transactions');
  const [filter, setFilter] = useState('ALL');
  const [dialogType, setDialogType] = useState<TransactionType | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDialogType('DEBIT')}>
            {t('dashboard:sendMoney')}
          </Button>
          <Button size="sm" onClick={() => setDialogType('CREDIT')}>
            {t('dashboard:addFunds')}
          </Button>
        </div>
      </div>
      <TransactionFilters value={filter} onChange={setFilter} />
      <TransactionList filter={filter} />
      {dialogType && (
        <CreateTransactionDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialogType(null);
          }}
          defaultType={dialogType}
        />
      )}
    </div>
  );
}
