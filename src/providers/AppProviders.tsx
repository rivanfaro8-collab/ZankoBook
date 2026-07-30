import { QueryClientProvider } from '@tanstack/react-query'
import * as Network from 'expo-network'
import { PropsWithChildren, useEffect, useState } from 'react'
import { AppState, StyleSheet, View } from 'react-native'

import OfflineBanner from '../../components/OfflineBanner'
import { loadSavedLanguage } from '../i18n'
import { syncAttendanceQueue } from '../lib/offlineAttendanceQueue'
import { queryClient } from '../lib/queryClient'
import { restoreQueryCache, subscribeToQueryCache } from '../lib/queryPersistence'
import { useNetworkStore } from '../store/networkStore'
import { useUserStore } from '../store/userStore'

export default function AppProviders({ children }: PropsWithChildren) {
  const [restored, setRestored] = useState(false)
  const token = useUserStore((state) => state.token)
  const setNetworkState = useNetworkStore((state) => state.setNetworkState)

  useEffect(() => {
    void loadSavedLanguage()
  }, [])

  useEffect(() => {
    let mounted = true
    let unsubscribe = () => {}

    restoreQueryCache(queryClient).finally(() => {
      if (!mounted) return
      unsubscribe = subscribeToQueryCache(queryClient)
      setRestored(true)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let interval: ReturnType<typeof setInterval> | null = null

    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync()
        const online = state.isConnected === true && state.isInternetReachable !== false
        if (!mounted) return
        setNetworkState(online)
        if (online && token) {
          await syncAttendanceQueue()
          await queryClient.invalidateQueries({ queryKey: ['attendance-weeks'] })
          await queryClient.invalidateQueries({ queryKey: ['attendance-records'] })
        }
      } catch {
        if (mounted) setNetworkState(false)
      }
    }

    check()
    interval = setInterval(check, 12000)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check()
    })

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
      subscription.remove()
    }
  }, [setNetworkState, token])

  if (!restored) return null

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.root}>
        <OfflineBanner />
        <View style={styles.content}>{children}</View>
      </View>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
})
