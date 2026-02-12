import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, Button, Input } from '@/components/ui';
import { useCreateTransaction, useBalance } from '@/hooks/use-wallet';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency } from '@/lib/utils';
import { TransactionResult } from './TransactionResult';
import type { TransactionType } from '@/types/api';

const transactionSchema = z.object({
  amount: z.coerce
    .number()
    .min(0.01, 'validation:minAmount')
    .max(999_999_999.99, 'validation:maxAmount'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;
type DialogState = 'form' | 'success' | 'error';

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType: TransactionType;
}

export function CreateTransactionDialog({
  open,
  onOpenChange,
  defaultType,
}: CreateTransactionDialogProps) {
  const { t } = useTranslation();
  const createTransaction = useCreateTransaction();
  const { data: balanceData } = useBalance();
  const [dialogState, setDialogState] = useState<DialogState>('form');
  const [lastAmount, setLastAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const balance = balanceData?.balance ?? 0;
  const isDebit = defaultType === 'DEBIT';
  const MAX_TRANSACTION = 999_999_999.99;
  const maxAmount = isDebit ? Math.min(balance, MAX_TRANSACTION) : MAX_TRANSACTION;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    mode: 'onChange',
  });

  const [limitReached, setLimitReached] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const prevValue = useRef('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cursorRef = useRef<number | null>(null);

  const formatNumber = (val: string): string => {
    if (!val) return '';
    const [int, dec] = val.split('.');
    const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec !== undefined ? `${formatted}.${dec}` : formatted;
  };

  useEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      cursorRef.current = null;
    }
  });

  register('amount');
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursor = input.selectionStart ?? 0;
    const raw = input.value.replace(/,/g, '');

    if (raw === '') {
      setDisplayValue('');
      prevValue.current = '';
      setLimitReached(false);
      cursorRef.current = 0;
      setValue('amount', '' as never, { shouldValidate: true });
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(raw)) {
      setDisplayValue(formatNumber(prevValue.current));
      return;
    }

    const val = parseFloat(raw);
    if (!isNaN(val) && val > maxAmount) {
      setDisplayValue(formatNumber(prevValue.current));
      setLimitReached(true);
      return;
    }

    const formatted = formatNumber(raw);

    const rawCursorPos = input.value.substring(0, cursor).replace(/,/g, '').length;
    let newCursor = 0;
    let rawCount = 0;
    for (const ch of formatted) {
      if (rawCount === rawCursorPos) break;
      newCursor++;
      if (ch !== ',') rawCount++;
    }
    cursorRef.current = newCursor;

    setDisplayValue(formatted);
    prevValue.current = raw;
    setLimitReached(false);
    setValue('amount', isNaN(val) ? ('' as never) : val, { shouldValidate: true });
  };

  const handleUseFullBalance = () => {
    const raw = String(balance);
    prevValue.current = raw;
    setValue('amount', balance, { shouldValidate: true });
    setDisplayValue(formatNumber(raw));
    setLimitReached(false);
  };

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      setDialogState('form');
      setErrorMessage('');
      setLimitReached(false);
      setDisplayValue('');
      prevValue.current = '';
      reset();
    }, 200);
  }, [onOpenChange, reset]);

  const onSubmit = (data: TransactionFormData) => {
    setLastAmount(data.amount);
    createTransaction.mutate(
      { amount: data.amount, type: defaultType },
      {
        onSuccess: () => {
          setDialogState('success');
        },
        onError: (error) => {
          setErrorMessage(getErrorMessage(error));
          setDialogState('error');
        },
      },
    );
  };

  const handleRetry = () => {
    setDialogState('form');
    setErrorMessage('');
  };

  const isResult = dialogState !== 'form';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        title={t(`transactions:${defaultType.toLowerCase()}Title`)}
        titleClassName={isResult ? 'sr-only' : undefined}
      >
        {dialogState === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              prefix="R$"
              label={t('transactions:amount')}
              placeholder="0.00"
              value={displayValue}
              error={
                limitReached && !(isDebit && balance <= MAX_TRANSACTION)
                  ? t('transactions:maxAmountLimit', {
                      amount: formatCurrency(maxAmount),
                    })
                  : !limitReached && errors.amount
                    ? t(errors.amount.message!)
                    : undefined
              }
              name="amount"
              onChange={handleAmountChange}
              ref={inputRef}
            />
            {limitReached && isDebit && balance <= MAX_TRANSACTION && (
              <button
                type="button"
                onClick={handleUseFullBalance}
                className="self-start text-sm font-medium text-error-500 underline underline-offset-2 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
              >
                {t('transactions:useFullBalance', {
                  balance: formatCurrency(balance),
                })}
              </button>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={!displayValue}
              isLoading={createTransaction.isPending}
              className="w-full"
            >
              {createTransaction.isPending
                ? t('transactions:confirming')
                : t('transactions:confirm')}
            </Button>
          </form>
        )}

        {dialogState === 'success' && (
          <TransactionResult
            status="success"
            amount={lastAmount}
            type={defaultType}
            onClose={handleClose}
          />
        )}

        {dialogState === 'error' && (
          <TransactionResult
            status="error"
            type={defaultType}
            errorMessage={errorMessage}
            onClose={handleClose}
            onRetry={handleRetry}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
