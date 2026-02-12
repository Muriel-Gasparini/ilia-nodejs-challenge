import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ThemeToggle, LanguageSwitcher } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';

export function Header() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border-secondary)] bg-[var(--bg-secondary)] px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#49cc68" />
          <text x="16" y="22" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18" fill="white">W</text>
        </svg>
        <span className="text-lg font-bold">{t('appName')}</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-400/15 dark:text-primary-400">
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{user?.first_name}</span>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[160px] rounded-[var(--radius-input)] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-1 shadow-lg"
              sideOffset={4}
              align="end"
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none data-[highlighted]:bg-[var(--bg-tertiary)]"
                onSelect={() => (window.location.href = '/profile')}
              >
                {t('profile:title')}
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-secondary)]" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded-[var(--radius-sm)] px-3 py-2 text-sm text-error-400 outline-none data-[highlighted]:bg-error-50 dark:data-[highlighted]:bg-error-400/10"
                onSelect={logout}
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
