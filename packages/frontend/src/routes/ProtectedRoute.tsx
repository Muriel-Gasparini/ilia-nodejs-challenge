import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { AppLayout } from '@/components/layout';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}
