import { QueryClient } from '@tanstack/react-query'
//prepare react queryy
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
})
