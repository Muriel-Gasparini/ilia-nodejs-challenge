import { useTranslation } from 'react-i18next';
import { BalanceCard, RecentTransactions, QuickActions, WelcomeCTA } from '@/components/dashboard';
import { useBalance, useTransactions } from '@/hooks/use-wallet';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { data: balanceData, isLoading: balanceLoading } = useBalance();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(
    undefined,
    1,
    1,
  );

  const isNewAccount =
    !balanceLoading &&
    !transactionsLoading &&
    (balanceData?.balance ?? 0) === 0 &&
    (transactionsData?.meta.total ?? 0) === 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <BalanceCard />
      {isNewAccount ? (
        <WelcomeCTA />
      ) : (
        <>
          <QuickActions />
          <RecentTransactions />
        </>
      )}
    </div>
  );
}
