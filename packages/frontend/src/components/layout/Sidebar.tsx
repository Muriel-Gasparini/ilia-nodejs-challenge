import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/ui/AppLogo';
import { navItems } from './nav-config';

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--border-secondary)] bg-[var(--bg-secondary)] lg:block">
      <div className="flex h-16 items-center px-6">
        <AppLogo />
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-400/10 dark:text-primary-400'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
              )
            }
          >
            <item.icon />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
