import { create } from 'zustand'

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

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: 'light',
  themeName: 'teal',

  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
    })),

  setThemeMode: (themeMode) => set({ themeMode }),
  setThemeName: (themeName) => {
    set({ themeName })
    syncAppIcon(themeName)
  },
}))

export const getAppTheme = (themeName: ThemeName, themeMode: ThemeMode): AppTheme =>
  Colors.themes[themeName][themeMode]

export const useAppTheme = () => {
  const themeMode = useThemeStore((state) => state.themeMode)
  const themeName = useThemeStore((state) => state.themeName)

  return getAppTheme(themeName, themeMode)
}
