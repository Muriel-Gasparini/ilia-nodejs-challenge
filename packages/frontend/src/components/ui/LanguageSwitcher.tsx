import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'pt-BR' ? 'en-US' : 'pt-BR';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="flex h-9 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
      title="Change language"
    >
      {i18n.language === 'pt-BR' ? 'PT' : 'EN'}
    </button>
  );
}
