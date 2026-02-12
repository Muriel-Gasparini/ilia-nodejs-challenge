import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#49cc68" />
            <text x="16" y="22" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18" fill="white">W</text>
          </svg>
          <h1 className="text-2xl font-bold">ilia Wallet</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
