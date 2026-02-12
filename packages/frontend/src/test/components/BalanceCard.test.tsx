import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { BalanceCard } from '@/components/dashboard';
import { useAuthStore } from '@/stores/auth.store';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('BalanceCard', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth('mock-token', mockUser);
  });

  it('displays formatted balance after loading', async () => {
    renderWithProviders(<BalanceCard />);

    await waitFor(() => {
      const text = screen.getByText(/1[.,]500[.,]50|1\.500,50/);
      expect(text).toBeInTheDocument();
    });
  });
});
