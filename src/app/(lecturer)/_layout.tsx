import { Tabs } from 'expo-router'

export default function StudentLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name='Letters' options={{ title: 'Requests' }} />
      <Tabs.Screen name='Dashboard' options={{ title: 'Dashboard' }} />
      <Tabs.Screen name='Profile' options={{ title: 'profile' }} />
    </Tabs>
  )
}
