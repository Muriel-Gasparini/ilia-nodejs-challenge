import type { TransactionType } from '@/types/api';

interface TypeStyle {
  iconBg: string;
  amountColor: string;
  prefix: string;
  arrow: string;
}

export const transactionTypeStyles: Record<TransactionType, TypeStyle> = {
  CREDIT: {
    iconBg: 'bg-primary-100 text-primary-700 dark:bg-primary-400/15 dark:text-primary-400',
    amountColor: 'text-primary-600 dark:text-primary-400',
    prefix: '+',
    arrow: '↑',
  },
  DEBIT: {
    iconBg: 'bg-error-50 text-error-500 dark:bg-error-400/15 dark:text-error-400',
    amountColor: 'text-error-500 dark:text-error-400',
    prefix: '-',
    arrow: '↓',
  },
};
