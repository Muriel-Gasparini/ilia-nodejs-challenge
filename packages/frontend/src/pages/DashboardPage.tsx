import { useTranslation } from 'react-i18next';
import { BalanceCard, RecentTransactions, QuickActions } from '@/components/dashboard';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <BalanceCard />
      <QuickActions />
      <RecentTransactions />
    </div>
  );
}
