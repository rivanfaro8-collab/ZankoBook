import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'

import { getCourseStudents } from '@/api/attendance'
import { useAppTheme } from '@/store/themeStore'
import type { CourseStudent } from '@/types/attendance'
import SimpleBackHeader from '../SimpleBackHeader'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function capitalize(value?: string | null) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type Props = { courseId: number; courseName: string }

export default function CourseStudentsScreen({ courseId, courseName }: Props) {
  const theme = useAppTheme()
  const query = useQuery({
    queryKey: ['course-students', courseId],
    queryFn: () => getCourseStudents(courseId),
    enabled: courseId > 0,
  })
  const students = query.data ?? []

  return (
    <ThemedView style={styles.screen}>
      <SimpleBackHeader />
      <View style={styles.heading}>
        <ThemedText title style={styles.title}>Students</ThemedText>
        <ThemedText style={styles.subtitle}>{courseName}</ThemedText>
      </View>

      {query.isLoading ? (
        <State icon='hourglass-outline' title='Loading students...' />
      ) : query.isError ? (
        <State
          icon='cloud-offline-outline'
          title='Could not load students'
          message={query.error instanceof Error ? query.error.message : 'Please try again.'}
          onRetry={() => query.refetch()}
        />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <StudentCard student={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<State icon='people-outline' title='No students found' message='Students enrolled in this course will appear here.' />}
          contentContainerStyle={[styles.list, students.length === 0 && styles.emptyList]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.primary} colors={[theme.primary]} />}
        />
      )}
    </ThemedView>
  )
}

function StudentCard({ student }: { student: CourseStudent }) {
  const theme = useAppTheme()
  return (
    <View style={[styles.card, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
      <View style={styles.identityRow}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.avatarText}>{student.user.name.slice(0, 2).toUpperCase()}</ThemedText>
        </View>
        <View style={styles.identityText}>
          <ThemedText title style={styles.name} numberOfLines={1}>{student.user.name}</ThemedText>
          <ThemedText style={styles.email} numberOfLines={1}>{student.user.email ?? 'No email'}</ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText title style={[styles.badgeText, { color: theme.primary }]}>{capitalize(student.status)}</ThemedText>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.grid}>
        <Detail label='Student no.' value={student.student_number || '—'} />
        <Detail label='Stage' value={student.stage == null ? '—' : String(student.stage)} />
        <Detail label='Enrollment' value={capitalize(student.enrollment_type)} />
        <Detail label='Joined' value={formatDate(student.created_at)} />
      </View>
    </View>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><ThemedText style={styles.detailLabel}>{label}</ThemedText><ThemedText title style={styles.detailValue} numberOfLines={1}>{value}</ThemedText></View>
}

function State({ icon, title, message, onRetry }: { icon: keyof typeof Ionicons.glyphMap; title: string; message?: string; onRetry?: () => void }) {
  const theme = useAppTheme()
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, { backgroundColor: theme.uiBackground }]}><Ionicons name={icon} size={34} color={theme.primary} /></View>
      <ThemedText title style={styles.stateTitle}>{title}</ThemedText>
      {message ? <ThemedText style={styles.stateMessage}>{message}</ThemedText> : null}
      {onRetry ? <Pressable onPress={onRetry} style={({ pressed }) => [styles.retry, { borderColor: theme.primary }, pressed && styles.pressed]}><Ionicons name='refresh-outline' size={19} color={theme.primary} /><ThemedText title style={[styles.retryText, { color: theme.primary }]}>Try again</ThemedText></Pressable> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, heading: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }, title: { fontSize: 27, fontWeight: '800' }, subtitle: { marginTop: 4, fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 32 }, emptyList: { flexGrow: 1 }, separator: { height: 13 }, card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }, identityText: { flex: 1, minWidth: 0 }, name: { fontSize: 16, fontWeight: '800' }, email: { marginTop: 3, fontSize: 12 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, badgeText: { fontSize: 11, fontWeight: '800' }, divider: { height: 1, marginVertical: 15 }, grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 }, detail: { width: '50%', paddingRight: 10 }, detailLabel: { fontSize: 11, marginBottom: 4 }, detailValue: { fontSize: 13, fontWeight: '700' },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 70 }, stateIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, stateTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' }, stateMessage: { marginTop: 7, fontSize: 13, lineHeight: 19, textAlign: 'center' }, retry: { marginTop: 18, minHeight: 44, borderWidth: 1, borderRadius: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7 }, retryText: { fontSize: 14, fontWeight: '800' }, pressed: { opacity: 0.65 },
})
