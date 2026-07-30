import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'

import { useNetworkStore } from '../src/store/networkStore'
import ThemedText from './ThemedText'

export default function OfflineBanner() {
  const isOnline = useNetworkStore((state) => state.isOnline)
  if (isOnline) return null

  return (
    <View style={styles.banner}>
      <Ionicons name='cloud-offline-outline' size={17} color='#FFFFFF' />
      <ThemedText title style={styles.text}>Offline mode — showing saved data</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 34,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#8A5A00',
  },
  text: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
})
