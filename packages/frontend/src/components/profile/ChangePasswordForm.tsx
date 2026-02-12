import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Input, Card, useToast } from '@/components/ui';
import { useUpdateUser } from '@/hooks/use-user';

const passwordSchema = z
  .object({
    password: z.string().min(6, 'validation:minLength'),
    confirm_password: z.string().min(1, 'validation:required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'validation:passwordMismatch',
    path: ['confirm_password'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormData) => {
    updateUser.mutate(
      { password: data.password },
      {
        onSuccess: () => {
          toast(t('profile:passwordSuccess'), 'success');
          reset();
        },
        onError: () => {
          toast(t('unexpectedError'), 'error');
        },
      },
    );
  };

  return (
    <Card>
      <h3 className="mb-4 text-base font-semibold">{t('profile:changePassword')}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="new_password"
          type="password"
          label={t('profile:newPassword')}
          placeholder="••••••"
          error={errors.password ? t(errors.password.message!, { min: 6 }) : undefined}
          {...register('password')}
        />
        <Input
          id="confirm_new_password"
          type="password"
          label={t('profile:confirmNewPassword')}
          placeholder="••••••"
          error={errors.confirm_password ? t(errors.confirm_password.message!) : undefined}
          {...register('confirm_password')}
        />
        <div className="flex justify-end">
          <Button type="submit" isLoading={updateUser.isPending}>
            {t('profile:changePassword')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
