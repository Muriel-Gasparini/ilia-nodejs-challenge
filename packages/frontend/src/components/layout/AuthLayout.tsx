import type { ReactNode } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { LanguageSwitcher, ThemeToggle } from '@/components/ui';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex justify-center">
          <AppLogo size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
