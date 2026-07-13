import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'

const STORAGE_KEY = 'zankobook_course_pins'

type PinnedCoursesByScope = Record<string, number[]>

type CoursePinsStore = {
  pinnedByScope: PinnedCoursesByScope
  loadedScopes: Record<string, boolean>
  loadPins: (scopeKey: string) => Promise<void>
  togglePin: (scopeKey: string, courseId: number) => Promise<void>
  isPinned: (scopeKey: string, courseId: number) => boolean
}

async function savePins(pinnedByScope: PinnedCoursesByScope) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(pinnedByScope))
}

export const useCoursePinsStore = create<CoursePinsStore>((set, get) => ({
  pinnedByScope: {},
  loadedScopes: {},

  loadPins: async (scopeKey) => {
    if (get().loadedScopes[scopeKey]) return

    try {
      const storedValue = await SecureStore.getItemAsync(STORAGE_KEY)
      const storedPins = storedValue
        ? (JSON.parse(storedValue) as PinnedCoursesByScope)
        : {}

      set((state) => ({
        pinnedByScope: {
          ...storedPins,
          ...state.pinnedByScope,
        },
        loadedScopes: {
          ...state.loadedScopes,
          [scopeKey]: true,
        },
      }))
    } catch {
      set((state) => ({
        loadedScopes: {
          ...state.loadedScopes,
          [scopeKey]: true,
        },
      }))
    }
  },

  togglePin: async (scopeKey, courseId) => {
    const currentPins = get().pinnedByScope[scopeKey] ?? []
    const nextPins = currentPins.includes(courseId)
      ? currentPins.filter((id) => id !== courseId)
      : [...currentPins, courseId]

    const nextPinnedByScope = {
      ...get().pinnedByScope,
      [scopeKey]: nextPins,
    }

    set({ pinnedByScope: nextPinnedByScope })

    try {
      await savePins(nextPinnedByScope)
    } catch {
      // Keep the optimistic UI state even if device storage temporarily fails.
    }
  },

  isPinned: (scopeKey, courseId) =>
    (get().pinnedByScope[scopeKey] ?? []).includes(courseId),
}))
