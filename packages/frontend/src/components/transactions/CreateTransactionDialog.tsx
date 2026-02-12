import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, Button, Input, useToast } from '@/components/ui';
import { useCreateTransaction } from '@/hooks/use-wallet';
import { getErrorMessage } from '@/lib/errors';
import type { TransactionType } from '@/types/api';

const transactionSchema = z.object({
  amount: z.coerce
    .number()
    .min(0.01, 'validation:minAmount')
    .max(999_999_999.99, 'validation:maxAmount'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

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
  const { toast } = useToast();
  const createTransaction = useCreateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = (data: TransactionFormData) => {
    createTransaction.mutate(
      { amount: data.amount, type: defaultType },
      {
        onSuccess: () => {
          toast(t('transactions:success'), 'success');
          reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toast(getErrorMessage(error), 'error');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={
          <span className="flex items-center gap-2">
            {t('transactions:newTransaction')}
            <span
              className={`rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-semibold ${
                defaultType === 'CREDIT'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-400/15 dark:text-primary-400'
                  : 'bg-error-50 text-error-600 dark:bg-error-400/15 dark:text-error-400'
              }`}
            >
              {t(`transactions:${defaultType.toLowerCase()}`)}
            </span>
          </span>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max="999999999.99"
            label={t('transactions:amount')}
            placeholder="0.00"
            error={errors.amount ? t(errors.amount.message!) : undefined}
            {...register('amount')}
          />

          <Button
            type="submit"
            size="lg"
            isLoading={createTransaction.isPending}
            className="w-full"
          >
            {createTransaction.isPending ? t('transactions:creating') : t('transactions:create')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
