import { dehydrate, hydrate, QueryClient } from '@tanstack/react-query'
import * as FileSystem from 'expo-file-system/legacy'

const CACHE_FILE = `${FileSystem.documentDirectory}zankobook-query-cache.json`
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 14
let saveTimer: ReturnType<typeof setTimeout> | null = null

export async function restoreQueryCache(queryClient: QueryClient) {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_FILE)
    if (!info.exists) return
    const raw = await FileSystem.readAsStringAsync(CACHE_FILE)
    const saved = JSON.parse(raw) as { timestamp: number; clientState: unknown }
    if (!saved.timestamp || Date.now() - saved.timestamp > CACHE_MAX_AGE) {
      await clearQueryCacheFile()
      return
    }
    hydrate(queryClient, saved.clientState as Parameters<typeof hydrate>[1])
  } catch {
    await clearQueryCacheFile()
  }
}

export function subscribeToQueryCache(queryClient: QueryClient) {
  return queryClient.getQueryCache().subscribe(() => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        const state = dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        })
        await FileSystem.writeAsStringAsync(
          CACHE_FILE,
          JSON.stringify({ timestamp: Date.now(), clientState: state }),
        )
      } catch {
        // Offline cache failure must never break the app.
      }
    }, 800)
  })
}

export async function clearQueryCacheFile() {
  try {
    await FileSystem.deleteAsync(CACHE_FILE, { idempotent: true })
  } catch {
    // Ignore cleanup failures.
  }
}
