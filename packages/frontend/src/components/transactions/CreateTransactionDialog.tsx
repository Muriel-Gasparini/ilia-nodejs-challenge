import { useState, useCallback, useRef } from 'react';
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
  const { t, i18n } = useTranslation();
  const createTransaction = useCreateTransaction();
  const { data: balanceData } = useBalance();
  const [dialogState, setDialogState] = useState<DialogState>('form');
  const [lastAmount, setLastAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const balance = balanceData?.balance ?? 0;
  const isDebit = defaultType === 'DEBIT';
  const maxAmount = isDebit ? balance : 999_999_999.99;

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
  const prevValue = useRef('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { onChange: rhfOnChange, ref: rhfRef, ...amountRest } = register('amount');
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (e.target.value !== '' && !isNaN(val) && val > maxAmount) {
      e.target.value = prevValue.current;
      setLimitReached(true);
      return;
    }
    prevValue.current = e.target.value;
    setLimitReached(false);
    rhfOnChange(e);
  };

  const handleUseFullBalance = () => {
    const val = String(balance);
    prevValue.current = val;
    setValue('amount', balance, { shouldValidate: true });
    if (inputRef.current) inputRef.current.value = val;
    setLimitReached(false);
  };

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      setDialogState('form');
      setErrorMessage('');
      setLimitReached(false);
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
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              label={t('transactions:amount')}
              placeholder="0.00"
              error={
                limitReached && !isDebit
                  ? t('transactions:maxAmountLimit', {
                      amount: formatCurrency(maxAmount, i18n.language),
                    })
                  : !limitReached && errors.amount
                    ? t(errors.amount.message!)
                    : undefined
              }
              onChange={handleAmountChange}
              ref={(el) => {
                rhfRef(el);
                inputRef.current = el;
              }}
              {...amountRest}
            />
            {limitReached && isDebit && (
              <button
                type="button"
                onClick={handleUseFullBalance}
                className="self-start text-sm font-medium text-error-500 underline underline-offset-2 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
              >
                {t('transactions:useFullBalance', {
                  balance: formatCurrency(balance, i18n.language),
                })}
              </button>
            )}

            <Button
              type="submit"
              size="lg"
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
