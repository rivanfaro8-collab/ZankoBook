import { StyleSheet } from 'react-native'

import SimpleBackHeader from '../../../components/SimpleBackHeader'
import ThemedText from '../../../components/ThemedText'
import ThemedView from '../../../components/ThemedView'

export default function LecturerGuide() {
  return (
    <ThemedView style={styles.screen}>
      <SimpleBackHeader />
      <ThemedView style={styles.content}>
        <ThemedText title style={styles.title}>Lecturer Guide</ThemedText>
        <ThemedText style={styles.body}>Lecturer help and guide content will be added here.</ThemedText>
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
