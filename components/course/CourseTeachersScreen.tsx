import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'

import { getCourseLecturers } from '@/api/courses'
import { useAppTheme } from '@/store/themeStore'
import type { CourseTeacher } from '@/types/course'
import SimpleBackHeader from '../SimpleBackHeader'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'

const avatarColors = ['#F97316', '#008080', '#3B82F6', '#EC4899']
type Props = { courseId: number; courseName: string }

export default function CourseTeachersScreen({ courseId, courseName }: Props) {
  const theme = useAppTheme()
  const query = useQuery({ queryKey: ['course-teachers', courseId], queryFn: () => getCourseLecturers(courseId), enabled: courseId > 0 })
  const teachers = query.data ?? []

  return (
    <ThemedView style={styles.screen}>
      <SimpleBackHeader />
      <View style={styles.heading}><ThemedText title style={styles.title}>Course teachers</ThemedText><ThemedText style={styles.subtitle}>{courseName}</ThemedText></View>
      {query.isLoading ? <State icon='hourglass-outline' title='Loading teachers...' /> : query.isError ? (
        <State icon='cloud-offline-outline' title='Could not load teachers' message={query.error instanceof Error ? query.error.message : 'Please try again.'} onRetry={() => query.refetch()} />
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => <TeacherCard teacher={item} color={avatarColors[index % avatarColors.length]} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<State icon='people-outline' title='No teachers for this course' message='Teachers assigned to this course will appear here.' />}
          contentContainerStyle={[styles.list, teachers.length === 0 && styles.emptyList]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.primary} colors={[theme.primary]} />}
        />
      )}
    </ThemedView>
  )
}

function TeacherCard({ teacher, color }: { teacher: CourseTeacher; color: string }) {
  const theme = useAppTheme()
  return (
    <View style={[styles.card, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
      <View style={[styles.avatar, { backgroundColor: color }]}><ThemedText style={styles.avatarText}>{teacher.user.name.slice(0, 2).toUpperCase()}</ThemedText></View>
      <View style={styles.info}>
        <ThemedText title style={styles.name} numberOfLines={1}>{teacher.user.name}</ThemedText>
        <View style={styles.emailRow}><Ionicons name='mail-outline' size={15} color={theme.text} /><ThemedText style={styles.email} numberOfLines={1}>{teacher.user.email ?? 'No email'}</ThemedText></View>
        {teacher.title || teacher.speciality ? <ThemedText style={styles.meta} numberOfLines={1}>{[teacher.title, teacher.speciality].filter(Boolean).join(' · ')}</ThemedText> : null}
      </View>
    </View>
  )
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
  screen: { flex: 1 }, heading: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }, title: { fontSize: 27, fontWeight: '800' }, subtitle: { marginTop: 4, fontSize: 14 }, list: { paddingHorizontal: 20, paddingBottom: 32 }, emptyList: { flexGrow: 1 }, separator: { height: 13 },
  card: { minHeight: 92, borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }, avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' }, info: { flex: 1, minWidth: 0 }, name: { fontSize: 17, fontWeight: '800' }, emailRow: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 6 }, email: { flex: 1, fontSize: 13 }, meta: { marginTop: 6, fontSize: 12 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 70 }, stateIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, stateTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' }, stateMessage: { marginTop: 7, fontSize: 13, lineHeight: 19, textAlign: 'center' }, retry: { marginTop: 18, minHeight: 44, borderWidth: 1, borderRadius: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7 }, retryText: { fontSize: 14, fontWeight: '800' }, pressed: { opacity: 0.65 },
})
