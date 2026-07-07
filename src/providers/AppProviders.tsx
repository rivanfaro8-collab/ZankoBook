import { QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'

import { queryClient } from '../lib/queryClient'

//make reqact query avil to the whole app

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
