import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

import { Colors, type AppTheme, type ThemeName } from '../../constants/Colors'
import { syncAppIcon } from '../lib/appIcon'

export type ThemeMode = 'light' | 'dark'

type ThemeStore = {
  themeMode: ThemeMode
  themeName: ThemeName
  toggleTheme: () => void
  setThemeMode: (themeMode: ThemeMode) => void
  setThemeName: (themeName: ThemeName) => void
}

const THEME_STORAGE_KEY = 'zankobook-theme-settings'

const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeMode: 'light',
      themeName: 'teal',

      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
        })),

      setThemeMode: (themeMode) => set({ themeMode }),
      setThemeName: (themeName) => {
        set({ themeName })
        void syncAppIcon(themeName)
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        themeName: state.themeName,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.themeName) void syncAppIcon(state.themeName)
      },
    },
  ),
)

export const getAppTheme = (themeName: ThemeName, themeMode: ThemeMode): AppTheme =>
  Colors.themes[themeName][themeMode]

export const useAppTheme = () => {
  const themeMode = useThemeStore((state) => state.themeMode)
  const themeName = useThemeStore((state) => state.themeName)

  return getAppTheme(themeName, themeMode)
}
