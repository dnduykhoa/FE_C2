import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if ([400, 401, 403, 404, 422].includes(status)) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 4000),
      refetchOnWindowFocus: false
    }
  }
});

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '1px solid var(--line)',
            color: 'var(--text-main)',
            background: 'var(--bg-soft)'
          }
        }}
      />
    </QueryClientProvider>
  );
}
