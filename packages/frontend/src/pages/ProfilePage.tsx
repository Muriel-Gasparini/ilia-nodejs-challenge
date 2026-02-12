import { useTranslation } from 'react-i18next';
import { ProfileForm, ChangePasswordForm } from '@/components/profile';

export default function ProfilePage() {
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
