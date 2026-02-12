import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import type {
  BalanceResponse,
  Transaction,
  TransactionType,
  CreateTransactionRequest,
  PaginatedResponse,
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

export function useTransactions(type?: TransactionType, page = 1, limit = 20) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['transactions', user?.id, type, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await api.get<PaginatedResponse<Transaction>>(
        `/users/${user!.id}/wallet/transactions?${params.toString()}`,
      );
      return res.data;
    },
    enabled: !!user,
    placeholderData: keepPreviousData,
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
