import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { queryClient } from '@/lib/query-client';
import { ToastProvider } from '@/components/ui';
import { AppRoutes } from '@/routes';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
