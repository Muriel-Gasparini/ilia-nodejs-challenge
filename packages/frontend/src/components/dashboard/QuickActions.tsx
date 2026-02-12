import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@/components/ui';
import { CreateTransactionDialog } from '@/components/transactions/CreateTransactionDialog';
import type { TransactionType } from '@/types/api';

export function QuickActions() {
  const { t } = useTranslation('dashboard');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<TransactionType>('CREDIT');

  const openDialog = (type: TransactionType) => {
    setDefaultType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <h3 className="mb-4 text-base font-semibold">{t('quickActions')}</h3>
        <div className="flex gap-3">
          <Button variant="primary" className="flex-1" onClick={() => openDialog('CREDIT')}>
            {t('addFunds')}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => openDialog('DEBIT')}>
            {t('sendMoney')}
          </Button>
        </div>
      </Card>

      <CreateTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType={defaultType}
      />
    </>
  );
}
