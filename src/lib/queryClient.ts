import { QueryClient, onlineManager } from '@tanstack/react-query'

import { useNetworkStore } from '../store/networkStore'

onlineManager.setEventListener((setOnline) =>
  useNetworkStore.subscribe((state) => setOnline(state.isOnline)),
)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      networkMode: 'offlineFirst',
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 14,
    },
    mutations: {
      networkMode: 'online',
    },
  },
})
