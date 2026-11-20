import './lib/storageFallback'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { AppErrorBoundary } from './components/AppErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </HelmetProvider>
  </AppErrorBoundary>
);
