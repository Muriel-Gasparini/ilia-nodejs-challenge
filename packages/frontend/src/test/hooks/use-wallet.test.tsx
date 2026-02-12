import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { useBalance, useTransactions } from '@/hooks/use-wallet';
import { useAuthStore } from '@/stores/auth.store';
import { ToastProvider } from '@/components/ui';
import type { ReactNode } from 'react';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('useBalance', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth('mock-token', mockUser);
  });

  it('fetches balance for authenticated user', async () => {
    const { result } = renderHook(() => useBalance(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.balance).toBe(1500.5);
    expect(result.current.data?.user_id).toBe(mockUser.id);
  });
});

describe('useTransactions', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth('mock-token', mockUser);
  });

  it('fetches all transactions', async () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
  });

  it('filters transactions by type', async () => {
    const { result } = renderHook(() => useTransactions('CREDIT'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.every((t) => t.type === 'CREDIT')).toBe(true);
  });
});
