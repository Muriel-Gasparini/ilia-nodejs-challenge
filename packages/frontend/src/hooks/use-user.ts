import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import type { User, UpdateUserRequest } from '@/types/api';

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get<User>('/users/me');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const res = await api.patch<User>(`/users/${user!.id}`, data);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
