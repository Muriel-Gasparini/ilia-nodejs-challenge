import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import type {
  BalanceResponse,
  Transaction,
  TransactionType,
  CreateTransactionRequest,
} from '@/types/api';

export function useBalance() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['balance', user?.id],
    queryFn: async () => {
      const res = await api.get<BalanceResponse>(`/users/${user!.id}/wallet/balance`);
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

export function useTransactions(type?: TransactionType) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['transactions', user?.id, type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : '';
      const res = await api.get<Transaction[]>(`/users/${user!.id}/wallet/transactions${params}`);
      return res.data;
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (data: Omit<CreateTransactionRequest, 'idempotency_key'>) => {
      const payload: CreateTransactionRequest = {
        ...data,
        idempotency_key: uuidv4(),
      };
      const res = await api.post(`/users/${user!.id}/wallet/transactions`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });
}
