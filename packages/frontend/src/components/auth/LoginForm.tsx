import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AxiosError } from 'axios';
import { Button, Input, Card } from '@/components/ui';
import { useLogin } from '@/hooks/use-auth';
import type { ApiError } from '@/types/api';

const loginSchema = z.object({
  email: z.string().min(1, 'validation:required').email('validation:invalidEmail'),
  password: z.string().min(1, 'validation:required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { t } = useTranslation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  const getErrorMessage = () => {
    if (!login.error) return null;
    const err = login.error as AxiosError<ApiError>;
    if (err.response?.status === 401) return t('auth:invalidCredentials');
    if (err.response?.status === 429) return t('auth:rateLimited');
    return t('unexpectedError');
  };

  return (
    <Card variant="elevated" className="p-8">
      <h2 className="mb-6 text-center text-xl font-semibold">{t('auth:signIn')}</h2>

      {login.error && (
        <div className="mb-4 rounded-[var(--radius-input)] bg-error-50 p-3 text-center text-sm text-error-500 dark:bg-error-400/10">
          {getErrorMessage()}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          error={errors.password ? t(errors.password.message!) : undefined}
          {...register('password')}
        />
        <Button type="submit" size="lg" isLoading={login.isPending} className="mt-2 w-full">
          {t('auth:signIn')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        {t('auth:noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary-400 hover:underline">
          {t('auth:signUp')}
        </Link>
      </p>
    </Card>
  );
}
