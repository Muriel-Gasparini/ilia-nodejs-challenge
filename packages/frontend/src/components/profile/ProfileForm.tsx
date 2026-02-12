import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Input, Card, useToast } from '@/components/ui';
import { useCurrentUser, useUpdateUser } from '@/hooks/use-user';

const profileSchema = z.object({
  first_name: z.string().min(1, 'validation:required'),
  last_name: z.string().min(1, 'validation:required'),
  email: z.string().min(1, 'validation:required').email('validation:invalidEmail'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const updateUser = useUpdateUser();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateUser.mutate(data, {
      onSuccess: () => {
        toast(t('profile:updateSuccess'), 'success');
        setEditing(false);
      },
      onError: () => {
        toast(t('unexpectedError'), 'error');
      },
    });
  };

  const onCancel = () => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
    setEditing(false);
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('profile:personalInfo')}</h3>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            {t('edit')}
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="first_name"
            label={t('auth:firstName')}
            disabled={!editing}
            error={errors.first_name ? t(errors.first_name.message!) : undefined}
            {...register('first_name')}
          />
          <Input
            id="last_name"
            label={t('auth:lastName')}
            disabled={!editing}
            error={errors.last_name ? t(errors.last_name.message!) : undefined}
            {...register('last_name')}
          />
        </div>
        <Input
          id="email"
          type="email"
          label={t('auth:email')}
          disabled={!editing}
          error={errors.email ? t(errors.email.message!) : undefined}
          {...register('email')}
        />

        {editing && (
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" isLoading={updateUser.isPending}>
              {t('save')}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
