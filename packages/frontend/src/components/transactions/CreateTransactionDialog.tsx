import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { Dialog, DialogContent, Button, Input, useToast } from '@/components/ui';
import { useCreateTransaction } from '@/hooks/use-wallet';
import type { TransactionType, ApiError } from '@/types/api';

const transactionSchema = z.object({
  amount: z.coerce.number().min(0.01, 'validation:minAmount'),
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
          const err = error as AxiosError<ApiError>;
          if (err.response?.status === 400) {
            toast(t('transactions:insufficientFunds'), 'error');
          } else {
            toast(t('unexpectedError'), 'error');
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('transactions:newTransaction')}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2 rounded-[var(--radius-input)] bg-[var(--bg-tertiary)] py-2">
            <span
              className={`rounded-[var(--radius-pill)] px-4 py-1.5 text-sm font-semibold ${
                defaultType === 'CREDIT'
                  ? 'bg-primary-400 text-white'
                  : 'bg-error-400 text-white'
              }`}
            >
              {t(`transactions:${defaultType.toLowerCase()}`)}
            </span>
          </div>

          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
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
            {createTransaction.isPending
              ? t('transactions:creating')
              : t('transactions:create')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
