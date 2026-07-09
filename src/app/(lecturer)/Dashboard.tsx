import { StyleSheet } from 'react-native'

import ThemedText from '../../../components/ThemedText'
import ThemedView from '../../../components/ThemedView'

export default function LecturerDashboard() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText title style={styles.title}>
        Dashboard
      </ThemedText>
      <ThemedText style={styles.subtitle}>Welcome back to your ZankoBook dashboard.</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
})
