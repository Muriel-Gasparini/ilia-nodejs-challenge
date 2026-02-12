import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { navItems } from './nav-config';

export function MobileNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)] py-2 lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
              isActive ? 'text-primary-600 dark:text-primary-400' : 'text-[var(--text-tertiary)]',
            )
          }
        >
          <item.icon size={22} />
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
