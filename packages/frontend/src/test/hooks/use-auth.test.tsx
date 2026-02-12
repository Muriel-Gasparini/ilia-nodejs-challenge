import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { useLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('useLogin', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('stores token and user on successful login', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'john@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const state = useAuthStore.getState();
    expect(state.token).toBe('mock-jwt-token');
    expect(state.user?.email).toBe('john@example.com');
    expect(state.isAuthenticated).toBe(true);
  });

  it('fails with invalid credentials', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'wrong@example.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });
});
