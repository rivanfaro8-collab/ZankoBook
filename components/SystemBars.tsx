import { NavigationBar } from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'

import { useAppTheme, useThemeStore } from '../src/store/themeStore'

export default function SystemBars() {
  const themeMode = useThemeStore((state) => state.themeMode)
  const theme = useAppTheme()
  const barStyle = themeMode === 'dark' ? 'light' : 'dark'

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.background)
  }, [theme.background])

  return (
    <>
      <StatusBar style={barStyle} animated />
      <NavigationBar hidden style={barStyle} />
    </>
  )
}
