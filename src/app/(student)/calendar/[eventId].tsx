import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import ThemedText from '../../../../components/ThemedText'
import ThemedView from '../../../../components/ThemedView'
import { formatLongDate, formatTime } from '../../../../components/calendar/calendarUtils'
import { getAssignmentDetails } from '../../../api/calendar'
import { useAppTheme } from '../../../store/themeStore'

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function AssignmentDetailsPage() {
  const theme = useAppTheme()
  const params = useLocalSearchParams<{ eventId: string }>()
  const eventId = Number(params.eventId)
  const query = useQuery({
    queryKey: ['assignment-details', eventId],
    queryFn: () => getAssignmentDetails(eventId),
    enabled: Number.isFinite(eventId),
  })

  return (
    <ThemedView safe style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.uiBackground }]}>
          <Ionicons name='arrow-back' size={23} color={theme.title} />
        </Pressable>
        <ThemedText title style={styles.headerTitle}>Assignment details</ThemedText>
        <View style={styles.backButton} />
      </View>

      {query.isLoading ? (
        <View style={styles.center}><ActivityIndicator size='large' color={theme.primary} /></View>
      ) : query.isError || !query.data ? (
        <View style={styles.center}>
          <Ionicons name='alert-circle-outline' size={44} color={theme.danger} />
          <ThemedText title style={styles.errorTitle}>Could not load assignment</ThemedText>
          <ThemedText style={styles.errorText}>{(query.error as Error)?.message}</ThemedText>
          <Pressable onPress={() => query.refetch()} style={[styles.retry, { backgroundColor: theme.primary }]}><ThemedText style={styles.retryText}>Try again</ThemedText></Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.hero, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary }]}><Ionicons name='document-text-outline' size={27} color='#FFFFFF' /></View>
            <ThemedText title style={styles.title}>{query.data.course_assessment.title}</ThemedText>
            <View style={styles.dueRow}><Ionicons name='time-outline' size={18} color={theme.text} /><ThemedText>{formatLongDate(query.data.course_assessment.due_at)} · {formatTime(query.data.course_assessment.due_at)}</ThemedText></View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
            <ThemedText title style={styles.sectionTitle}>Overview</ThemedText>
            <View style={styles.statsRow}>
              <View style={styles.stat}><ThemedText style={styles.statLabel}>Maximum mark</ThemedText><ThemedText title style={styles.statValue}>{query.data.course_assessment.max_mark}</ThemedText></View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.stat}><ThemedText style={styles.statLabel}>Weight</ThemedText><ThemedText title style={styles.statValue}>{query.data.course_assessment.weight}%</ThemedText></View>
            </View>
            <View style={[styles.sectionPill, { borderColor: theme.border }]}><Ionicons name='layers-outline' size={17} color={theme.primary} /><ThemedText style={styles.sectionText}>{query.data.section.title}</ThemedText></View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
            <ThemedText title style={styles.sectionTitle}>Description</ThemedText>
            <ThemedText style={styles.description}>{query.data.description || 'No description provided.'}</ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
            <ThemedText title style={styles.sectionTitle}>Attachments</ThemedText>
            {query.data.attachments.length === 0 ? (
              <ThemedText>No attachments.</ThemedText>
            ) : query.data.attachments.map((attachment) => (
              <Pressable key={attachment.id} onPress={() => Linking.openURL(attachment.file_url)} style={({ pressed }) => [styles.attachment, { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
                <View style={[styles.fileIcon, { backgroundColor: theme.primary }]}><Ionicons name='attach' size={20} color='#FFFFFF' /></View>
                <View style={styles.fileText}><ThemedText title style={styles.fileName} numberOfLines={1}>{attachment.file_name}</ThemedText><ThemedText style={styles.fileMeta}>{attachment.file_type} · {formatFileSize(attachment.file_size)}</ThemedText></View>
                <Ionicons name='open-outline' size={20} color={theme.text} />
              </Pressable>
            ))}
          </View>

          <View style={[styles.notice, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
            <Ionicons name='information-circle-outline' size={21} color={theme.primary} />
            <ThemedText style={styles.noticeText}>Submission actions will be available here once the submission API is ready.</ThemedText>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  errorTitle: { fontSize: 19 }, errorText: { textAlign: 'center' },
  retry: { marginTop: 8, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 12 }, retryText: { color: '#FFFFFF', fontWeight: '800' },
  content: { padding: 16, gap: 14, paddingBottom: 34 },
  hero: { borderWidth: 1, borderRadius: 25, padding: 20 },
  iconBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '900', lineHeight: 31 },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  card: { borderWidth: 1, borderRadius: 22, padding: 17 },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 12 }, statValue: { fontSize: 21, fontWeight: '900' },
  divider: { width: 1, height: 45 },
  sectionPill: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, borderWidth: 1, borderRadius: 14, padding: 12 },
  sectionText: { flex: 1, fontSize: 13, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 23 },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 16, padding: 11, marginTop: 9 },
  fileIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1 }, fileName: { fontSize: 14, fontWeight: '800' }, fileMeta: { fontSize: 11, marginTop: 3 },
  notice: { flexDirection: 'row', gap: 9, borderWidth: 1, borderRadius: 18, padding: 14 }, noticeText: { flex: 1, fontSize: 13, lineHeight: 19 },
})
