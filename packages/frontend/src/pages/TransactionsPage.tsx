import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { TransactionFilters, TransactionList, CreateTransactionDialog } from '@/components/transactions';

export default function TransactionsPage() {
  const { t } = useTranslation('transactions');
  const [filter, setFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={() => setDialogOpen(true)}>{t('newTransaction')}</Button>
      </div>
      <TransactionFilters value={filter} onChange={setFilter} />
      <TransactionList filter={filter} />
      <CreateTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType="CREDIT"
      />
    </div>
  );
}
