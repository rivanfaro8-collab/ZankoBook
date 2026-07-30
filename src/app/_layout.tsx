import '../i18n'
import AppProviders from '@/providers/AppProviders'
import { Stack } from 'expo-router'

import SystemBars from '../../components/SystemBars'

export default function RootLayout() {
  return (
    <AppProviders>
      <SystemBars />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(auth)' />
        <Stack.Screen name='index' />
      </Stack>
    </AppProviders>
  )
}
