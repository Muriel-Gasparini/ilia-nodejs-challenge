import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '@/components/ui';
import { CreateTransactionDialog } from '@/components/transactions/CreateTransactionDialog';

export function WelcomeCTA() {
  const { t } = useTranslation('dashboard');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <h2 className="text-xl font-bold">{t('welcomeTitle')}</h2>
        <p className="max-w-sm text-[var(--text-secondary)]">{t('welcomeDescription')}</p>
        <Button size="lg" onClick={() => setDialogOpen(true)}>
          {t('welcomeCta')}
        </Button>
      </Card>

      <CreateTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType="CREDIT"
      />
    </>
  );
}
