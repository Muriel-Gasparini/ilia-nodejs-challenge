import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { getErrorMessage } from '@/lib/errors';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { isAuthenticated, logout } = useAuthStore.getState();
      if (isAuthenticated) {
        const message = getErrorMessage(error);
        window.dispatchEvent(
          new CustomEvent('app:toast', { detail: { message, variant: 'error' } }),
        );
        logout();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
