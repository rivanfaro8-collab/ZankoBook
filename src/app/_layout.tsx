import AppProviders from '@/providers/AppProviders'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
export default function RootLayout() {
  return (
    <>
      <AppProviders>
        <StatusBar style='auto' />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(auth)' />
          <Stack.Screen name='index' />
        </Stack>
      </AppProviders>
    </>
  )
}
