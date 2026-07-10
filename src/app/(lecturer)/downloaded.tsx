import { StyleSheet } from 'react-native'

import SimpleBackHeader from '../../../components/SimpleBackHeader'
import ThemedText from '../../../components/ThemedText'
import ThemedView from '../../../components/ThemedView'

export default function LecturerDownloaded() {
  return (
    <ThemedView style={styles.screen}>
      <SimpleBackHeader />
      <ThemedView style={styles.content}>
        <ThemedText title style={styles.title}>Recently Downloaded</ThemedText>
        <ThemedText style={styles.body}>Your downloaded lecturer files will appear here.</ThemedText>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, padding: 22 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  body: { fontSize: 16, lineHeight: 24 },
})
