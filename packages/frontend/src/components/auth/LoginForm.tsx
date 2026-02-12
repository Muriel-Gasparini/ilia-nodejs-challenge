import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { Button, Input, Card, InlineFeedback } from '@/components/ui';
import { useLogin } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';

const loginSchema = z.object({
  email: z.string().min(1, 'validation:required').email('validation:invalidEmail'),
  password: z.string().min(1, 'validation:required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { t } = useTranslation();
  const login = useLogin();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: LoginFormData) => {
    if (sessionExpired) {
      setSearchParams({}, { replace: true });
    }
    login.mutate(data);
  };

  const errorMessage = login.error ? getErrorMessage(login.error) : null;

  return (
    <Card variant="elevated" className="p-8">
      <h2 className="mb-6 text-center text-xl font-semibold">{t('auth:signIn')}</h2>

      {sessionExpired && !login.error && (
        <InlineFeedback variant="warning" message={t('auth:sessionExpired')} className="mb-4" />
      )}

      {login.error && <InlineFeedback variant="error" message={errorMessage!} className="mb-4" />}

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
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          {t('auth:signUp')}
        </Link>
      </p>
    </Card>
  );
}
