import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post<AuthResponse>('/auth', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await api.post('/users', data);
      return res.data;
    },
    onSuccess: () => {
      navigate('/login');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    navigate('/login');
  };
}
