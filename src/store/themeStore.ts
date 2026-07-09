import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

type ThemeStore = {
  themeMode: ThemeMode
  toggleTheme: () => void
  setThemeMode: (themeMode: ThemeMode) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: 'light',

  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
    })),

  setThemeMode: (themeMode) => set({ themeMode }),
}))
