import { useTranslation } from 'react-i18next';
import { Card, Skeleton } from '@/components/ui';
import { useBalance } from '@/hooks/use-wallet';
import { formatCurrency } from '@/lib/utils';

export function BalanceCard() {
  const { t } = useTranslation('dashboard');
  const { data, isLoading } = useBalance();

  return (
    <Card className="relative overflow-hidden bg-neutral-900 text-white dark:bg-neutral-800">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary-400/10" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-primary-400/5" />
      <div className="relative">
        <p className="text-sm font-medium text-neutral-400">{t('balance')}</p>
        {isLoading ? (
          <Skeleton className="mt-2 h-10 w-48 bg-white/10" />
        ) : (
          <p className="mt-1 text-[clamp(1.25rem,5.5vw,2.25rem)] font-bold tracking-tight text-primary-400">
            {formatCurrency(data?.balance ?? 0)}
          </p>
        )}
      </div>
    </Card>
  );
}
