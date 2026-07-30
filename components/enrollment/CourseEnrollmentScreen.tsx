import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import {
  getAvailableCoursesToEnroll,
  submitCourseSelection,
} from '../../src/api/courseEnrollment'
import { useNetworkStore } from '../../src/store/networkStore'
import { useAppTheme } from '../../src/store/themeStore'
import type { AvailableCourse } from '../../src/types/courseEnrollment'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import EnrollmentReviewModal from './EnrollmentReviewModal'

const ACADEMIC_YEAR_ID = 1

export default function CourseEnrollmentScreen() {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const isOnline = useNetworkStore((state) => state.isOnline)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [reviewOpen, setReviewOpen] = useState(false)

  const coursesQuery = useQuery({
    queryKey: ['available-courses'],
    queryFn: getAvailableCoursesToEnroll,
  })

  const selectionMutation = useMutation({
    mutationKey: ['send-course-request'],
    mutationFn: () =>
      submitCourseSelection({
        academic_year_id: ACADEMIC_YEAR_ID,
        course_ids: Array.from(selectedIds),
      }),
    onSuccess: async (message) => {
      setReviewOpen(false)
      setSelectedIds(new Set())
      await queryClient.invalidateQueries({ queryKey: ['available-courses'] })
      Alert.alert('Request sent', message || 'Your course selection was submitted.')
    },
    onError: (error) => {
      Alert.alert(
        'Could not send request',
        error instanceof Error ? error.message : 'Something went wrong.',
      )
    },
  })

  const data = coursesQuery.data
  const courses = data?.courses ?? []
  const alreadyRequested = data?.is_requested === true
  const selectionDisabled = alreadyRequested || !isOnline

  const selectedCourses = useMemo(
    () => courses.filter((course) => selectedIds.has(course.id)),
    [courses, selectedIds],
  )

  const toggleCourse = (courseId: number) => {
    if (selectionDisabled) return
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }

  if (coursesQuery.isPending && !coursesQuery.data) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size='large' color={theme.primary} />
        <ThemedText style={styles.centerText}>Loading available courses...</ThemedText>
      </ThemedView>
    )
  }

  if (coursesQuery.isError && !coursesQuery.data) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name='alert-circle-outline' size={48} color={theme.text} />
        <ThemedText title style={styles.centerTitle}>Enrollment could not be loaded</ThemedText>
        <ThemedText style={styles.centerText}>
          {coursesQuery.error instanceof Error
            ? coursesQuery.error.message
            : 'Please try again later.'}
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(course) => String(course.id)}
        renderItem={({ item }) => (
          <EnrollmentCourseCard
            course={item}
            selected={selectedIds.has(item.id)}
            disabled={selectionDisabled}
            onPress={() => toggleCourse(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <ThemedText title style={styles.pageTitle}>Course Selection</ThemedText>
            <ThemedText style={styles.pageSubtitle}>
              Choose your courses for this semester and send them to the department for approval.
            </ThemedText>

            <View style={[styles.notice, { borderColor: theme.border, backgroundColor: theme.uiBackground }]}> 
              <Ionicons
                name={alreadyRequested ? 'time-outline' : 'calendar-outline'}
                size={24}
                color={theme.primary}
              />
              <View style={styles.noticeText}>
                <ThemedText title style={styles.noticeTitle}>
                  {alreadyRequested ? 'Request already submitted' : 'Course selection is open'}
                </ThemedText>
                <ThemedText style={styles.noticeBody}>
                  {alreadyRequested
                    ? 'Your choices were sent to the department. Selection is disabled while the request is being reviewed.'
                    : !isOnline
                      ? 'Saved course information is available offline, but you must reconnect to submit a selection.'
                      : 'Tap the courses you want, then review your choices before sending.'}
                </ThemedText>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name='book-outline' size={48} color={theme.text} />
            <ThemedText title style={styles.centerTitle}>No courses available</ThemedText>
            <ThemedText style={styles.centerText}>
              No courses are currently open for selection.
            </ThemedText>
          </View>
        }
        ListFooterComponent={<View style={{ height: courses.length > 0 ? 105 : 20 }} />}
      />

      {courses.length > 0 && !alreadyRequested && (
        <View style={[styles.actionBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}> 
          <View>
            <ThemedText title style={styles.selectedCount}>{selectedCourses.length}</ThemedText>
            <ThemedText style={styles.selectedLabel}>selected</ThemedText>
          </View>
          <Pressable
            onPress={() => setReviewOpen(true)}
            disabled={selectedIds.size === 0 || selectionMutation.isPending || !isOnline}
            style={({ pressed }) => [
              styles.reviewButton,
              { backgroundColor: theme.primary },
              (pressed || selectedIds.size === 0 || selectionMutation.isPending || !isOnline) && styles.disabled,
            ]}
          >
            <Ionicons name='send-outline' size={19} color='#FFFFFF' />
            <ThemedText style={styles.reviewText}>Review request</ThemedText>
          </Pressable>
        </View>
      )}

      <EnrollmentReviewModal
        visible={reviewOpen}
        courses={courses}
        selectedIds={selectedIds}
        isSubmitting={selectionMutation.isPending}
        onClose={() => setReviewOpen(false)}
        onConfirm={() => selectionMutation.mutate()}
      />
    </ThemedView>
  )
}

function EnrollmentCourseCard({
  course,
  selected,
  disabled,
  onPress,
}: {
  course: AvailableCourse
  selected: boolean
  disabled: boolean
  onPress: () => void
}) {
  const theme = useAppTheme()
  const teacherNames = course.teachers
    .map((teacher) => teacher.user?.name)
    .filter(Boolean)
    .join(', ')

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.uiBackground,
          borderColor: selected ? theme.primary : theme.border,
          opacity: disabled ? 0.72 : 1,
        },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.checkbox, { borderColor: selected ? theme.primary : theme.text, backgroundColor: selected ? theme.primary : 'transparent' }]}> 
          {selected && <Ionicons name='checkmark' size={17} color='#FFFFFF' />}
        </View>
        <View style={[styles.codeBadge, { backgroundColor: course.color || theme.primary }]}> 
          <ThemedText style={styles.codeText}>{course.code}</ThemedText>
        </View>
        <View style={[styles.typeBadge, { borderColor: theme.border }]}> 
          <ThemedText style={styles.typeText}>
            {course.type === 'mandatory' ? 'Mandatory' : 'Elective'}
          </ThemedText>
        </View>
      </View>

      <ThemedText title style={styles.courseTitle}>{course.name}</ThemedText>
      <ThemedText style={styles.metaText}>
        {course.credit_hours} credit{course.credit_hours === 1 ? '' : 's'} · {course.semester}
      </ThemedText>
      {!!teacherNames && (
        <ThemedText style={styles.teacherText} numberOfLines={2}>Teacher: {teacherNames}</ThemedText>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 18, paddingTop: 12, flexGrow: 1 },
  headerArea: { marginBottom: 18 },
  pageTitle: { fontSize: 26, fontWeight: '800' },
  pageSubtitle: { marginTop: 5, fontSize: 14, lineHeight: 20 },
  notice: { marginTop: 18, borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', gap: 13 },
  noticeText: { flex: 1 },
  noticeTitle: { fontSize: 16, fontWeight: '800' },
  noticeBody: { marginTop: 4, fontSize: 13, lineHeight: 19 },
  separator: { height: 13 },
  card: { borderWidth: 1.5, borderRadius: 20, padding: 17 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  codeBadge: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 5 },
  codeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  typeBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  typeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  courseTitle: { fontSize: 18, fontWeight: '800' },
  metaText: { marginTop: 6, fontSize: 13, textTransform: 'capitalize' },
  teacherText: { marginTop: 8, fontSize: 13, lineHeight: 18 },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 18 },
  selectedCount: { fontSize: 21, fontWeight: '900' },
  selectedLabel: { fontSize: 12 },
  reviewButton: { flex: 1, minHeight: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  reviewText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.82 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  centerTitle: { marginTop: 14, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  centerText: { marginTop: 8, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 80 },
})
