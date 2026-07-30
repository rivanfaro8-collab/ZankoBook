import { Ionicons } from '@expo/vector-icons'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import type { AvailableCourse } from '../../src/types/courseEnrollment'
import { useAppTheme } from '../../src/store/themeStore'
import ThemedText from '../ThemedText'

interface EnrollmentReviewModalProps {
  visible: boolean
  courses: AvailableCourse[]
  selectedIds: Set<number>
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function EnrollmentReviewModal({
  visible,
  courses,
  selectedIds,
  isSubmitting,
  onClose,
  onConfirm,
}: EnrollmentReviewModalProps) {
  const theme = useAppTheme()
  const selected = courses.filter((course) => selectedIds.has(course.id))
  const notSelected = courses.filter((course) => !selectedIds.has(course.id))

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}> 
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText title style={styles.title}>Review your selection</ThemedText>
              <ThemedText style={styles.subtitle}>
                Confirm the courses you want to send to your department.
              </ThemedText>
            </View>
            <Pressable
              onPress={onClose}
              disabled={isSubmitting}
              style={[styles.closeButton, { backgroundColor: theme.uiBackground }]}
            >
              <Ionicons name='close' size={22} color={theme.title} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {selected.length > 0 && (
              <CourseGroup title={`Selected · ${selected.length}`} selected courses={selected} />
            )}
            {notSelected.length > 0 && (
              <CourseGroup title={`Not selected · ${notSelected.length}`} courses={notSelected} />
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}> 
            <Pressable
              onPress={onConfirm}
              disabled={isSubmitting || selected.length === 0}
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: theme.primary },
                (pressed || isSubmitting || selected.length === 0) && styles.disabled,
              ]}
            >
              <Ionicons name='send' size={18} color='#FFFFFF' />
              <ThemedText style={styles.confirmText}>
                {isSubmitting ? 'Sending...' : 'Confirm & send'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function CourseGroup({
  title,
  courses,
  selected = false,
}: {
  title: string
  courses: AvailableCourse[]
  selected?: boolean
}) {
  const theme = useAppTheme()

  return (
    <View style={styles.group}>
      <ThemedText title style={styles.groupTitle}>{title}</ThemedText>
      {courses.map((course) => (
        <View
          key={course.id}
          style={[
            styles.row,
            {
              borderColor: theme.border,
              backgroundColor: selected ? theme.background : theme.uiBackground,
              opacity: selected ? 1 : 0.58,
            },
          ]}
        >
          <View style={[styles.colorBar, { backgroundColor: course.color || theme.primary }]} />
          <View style={styles.rowText}>
            <ThemedText title style={styles.courseName} numberOfLines={1}>{course.name}</ThemedText>
            <ThemedText style={styles.courseCode}>{course.code}</ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.uiBackground }]}> 
            <ThemedText style={styles.badgeText}>
              {course.type === 'mandatory' ? 'Mandatory' : 'Elective'}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.48)' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  header: { flexDirection: 'row', gap: 12, padding: 22, paddingBottom: 14 },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { marginTop: 5, fontSize: 14, lineHeight: 20 },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingBottom: 18, gap: 22 },
  group: { gap: 9 },
  groupTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12 },
  colorBar: { width: 5, alignSelf: 'stretch', borderRadius: 4 },
  rowText: { flex: 1, minWidth: 0 },
  courseName: { fontSize: 15, fontWeight: '700' },
  courseCode: { marginTop: 3, fontSize: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  footer: { borderTopWidth: 1, padding: 18, paddingBottom: 24 },
  confirmButton: { minHeight: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  confirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.5 },
})
