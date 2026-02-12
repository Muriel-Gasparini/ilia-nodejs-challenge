import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', labelKey: 'dashboard:title', icon: DashboardIcon },
  { to: '/transactions', labelKey: 'transactions:title', icon: TransactionsIcon },
  { to: '/profile', labelKey: 'profile:title', icon: ProfileIcon },
];

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
          <item.icon />
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
