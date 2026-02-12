import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { TransactionType } from '@/types/api';

interface TransactionResultProps {
  status: 'success' | 'error';
  amount?: number;
  type: TransactionType;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function TransactionResult({
  status,
  amount,
  type,
  errorMessage,
  onClose,
  onRetry,
}: TransactionResultProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 animate-scale-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-400/15">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-primary-600 dark:text-primary-400"
          >
            <path
              d="M9 17L14 22L23 11"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              className="animate-check-draw"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-[var(--text-primary)]">
          {t(`transactions:${type.toLowerCase()}Success`)}
        </p>
        {amount != null && (
          <p className="text-sm text-[var(--text-secondary)]">
            {t(`transactions:${type.toLowerCase()}SuccessDetail`, {
              amount: formatCurrency(amount),
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 animate-shake">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-50 dark:bg-error-400/15">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="text-error-500 dark:text-error-400"
        >
          <path
            d="M11 11L21 21M21 11L11 21"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-[var(--text-primary)]">
          {t(`transactions:${type.toLowerCase()}Error`)}
        </p>
        {errorMessage && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{errorMessage}</p>
        )}
      </div>
      <div className="flex gap-3">
        {onRetry && (
          <Button variant="ghost" onClick={onRetry}>
            {t('tryAgain')}
          </Button>
        )}
        <Button onClick={onClose}>{t('close')}</Button>
      </div>
    </div>
  );
}
