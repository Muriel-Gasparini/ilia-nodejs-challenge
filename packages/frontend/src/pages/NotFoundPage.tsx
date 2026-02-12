import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-[var(--text-tertiary)]">404</h1>
      <p className="text-lg text-[var(--text-secondary)]">{t('pageNotFound')}</p>
      <Link
        to="/dashboard"
        className="rounded-[var(--radius-pill)] bg-primary-600 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-400 dark:text-neutral-950 dark:hover:bg-primary-500"
      >
        {t('goHome')}
      </Link>
    </div>
  );
}
