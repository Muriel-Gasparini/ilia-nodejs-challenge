import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button, Input, Card, InlineFeedback } from '@/components/ui';
import { useRegister } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'validation:required'),
    last_name: z.string().min(1, 'validation:required'),
    email: z.string().min(1, 'validation:required').email('validation:invalidEmail'),
    password: z.string().min(6, 'validation:minLength'),
    confirm_password: z.string().min(1, 'validation:required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'validation:passwordMismatch',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { t } = useTranslation();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirm_password, ...payload } = data;
    registerMutation.mutate(payload);
  };

  const errorMessage = registerMutation.error ? getErrorMessage(registerMutation.error) : null;

  return (
    <Card variant="elevated" className="p-8">
      <h2 className="mb-6 text-center text-xl font-semibold">{t('auth:signUp')}</h2>

      {registerMutation.error && (
        <InlineFeedback variant="error" message={errorMessage!} className="mb-4" />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="first_name"
            label={t('auth:firstName')}
            error={errors.first_name ? t(errors.first_name.message!) : undefined}
            {...register('first_name')}
          />
          <Input
            id="last_name"
            label={t('auth:lastName')}
            error={errors.last_name ? t(errors.last_name.message!) : undefined}
            {...register('last_name')}
          />
        </div>
        <Input
          id="email"
          type="email"
          label={t('auth:email')}
          placeholder="email@example.com"
          error={errors.email ? t(errors.email.message!) : undefined}
          {...register('email')}
        />
        <Input
          id="password"
          type="password"
          label={t('auth:password')}
          placeholder="••••••"
          error={errors.password ? t(errors.password.message!, { min: 6 }) : undefined}
          {...register('password')}
        />
        <Input
          id="confirm_password"
          type="password"
          label={t('auth:confirmPassword')}
          placeholder="••••••"
          error={errors.confirm_password ? t(errors.confirm_password.message!) : undefined}
          {...register('confirm_password')}
        />
        <Button
          type="submit"
          size="lg"
          isLoading={registerMutation.isPending}
          className="mt-2 w-full"
        >
          {t('auth:signUp')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        {t('auth:hasAccount')}{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          {t('auth:signIn')}
        </Link>
      </p>
    </Card>
  );
}
