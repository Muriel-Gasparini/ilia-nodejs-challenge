import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const els = document.querySelectorAll('h1,h2,h3,p,span,a,button,label,th,td,li');
    const before = new Map<Element, string>();
    els.forEach((el) => before.set(el, el.textContent ?? ''));

    i18n.changeLanguage(i18n.language === 'pt-BR' ? 'en-US' : 'pt-BR');

    setTimeout(() => {
      before.forEach((old, el) => {
        if (el.isConnected && el.textContent !== old) {
          el.classList.add('lang-settle');
          el.addEventListener('animationend', () => el.classList.remove('lang-settle'), {
            once: true,
          });
        }
      });
    }, 50);
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
