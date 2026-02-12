import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', labelKey: 'dashboard:title', icon: DashboardIcon },
  { to: '/transactions', labelKey: 'transactions:title', icon: TransactionsIcon },
  { to: '/profile', labelKey: 'profile:title', icon: ProfileIcon },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--border-secondary)] bg-[var(--bg-secondary)] lg:block">
      <div className="flex h-16 items-center gap-2 px-6">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#49cc68" />
          <text x="16" y="22" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18" fill="white">W</text>
        </svg>
        <span className="text-lg font-bold">{t('appName')}</span>
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

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
