import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,

      retry: 1,
      retryDelay: (retryAttempt) => {
        // 指数退指数退避策略：1s, 2s, 4s...（避免过 10s）
        return Math.min(1000 * Math.pow(2, retryAttempt), 10000);
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      enabled: true,
      throwOnError: false,
      refetchInterval: false,
    },
    mutations: {
      retry: 1
    },
  },
  logger: {
    log: (message) => logger.info('TanStack Query:', message),
    warn: (message) => logger.warn('TanStack Query Warn:', message),
    error: (message) => logger.error('TanStack Query Error:', message),
  },
  // 缓存清理策略
  garbageCollectionInterval: 600 * 1000,
});

export default queryClient;
