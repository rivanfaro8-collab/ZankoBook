import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'

import { useAppTheme } from '../src/store/themeStore'
import type { Course } from '../src/types/course'
import { getCourseColor } from '../src/utils/courseColors'
import ThemedText from './ThemedText'

type CourseCardProps = {
  course: Course
  pinned: boolean
  onPress: () => void
  onTogglePin: () => void
}

const getCourseNameFontSize = (name: string) => {
  const length = name.trim().length

  if (length > 52) return 16
  if (length > 38) return 18
  if (length > 26) return 20

  return 23
}


const formatTeacherRole = (role: Course['role']) => {
  if (!role) return null
  if (role === 'primary_lecturer') return 'Primary lecturer'
  if (role === 'assistant_lecturer') return 'Assistant lecturer'
  return 'Lab instructor'
}

const getCourseCodeFontSize = (code: string) => {
  const length = code.trim().length

  if (length > 18) return 10
  if (length > 14) return 11
  if (length > 10) return 12

  return 14
}

export default function CourseCard({
  course,
  pinned,
  onPress,
  onTogglePin,
}: CourseCardProps) {
  const theme = useAppTheme()
  const courseColor = getCourseColor(course)
  const creditLabel = course.credit_hours === 1 ? 'credit' : 'credits'
  const studentLabel = course.students_count === 1 ? 'student' : 'students'
  const teacherRoleLabel = formatTeacherRole(course.role)

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={`Open ${course.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.uiBackground,
          borderColor: theme.border,
          opacity: pressed ? 0.96 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
      ]}
    >
      <View style={[styles.accentRail, { backgroundColor: courseColor }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.codeBadge, { backgroundColor: courseColor }]}>
            <ThemedText
              style={[
                styles.codeText,
                { fontSize: getCourseCodeFontSize(course.code) },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              ellipsizeMode='clip'
            >
              {course.code}
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole='button'
            accessibilityState={{ selected: pinned }}
            accessibilityLabel={
              pinned ? `Unpin ${course.name}` : `Pin ${course.name}`
            }
            onPress={(event) => {
              event.stopPropagation()
              onTogglePin()
            }}
            hitSlop={10}
            style={({ pressed }) => [
              styles.pinButton,
              {
                backgroundColor: pinned ? courseColor : theme.background,
                borderColor: pinned ? courseColor : theme.border,
                shadowOpacity: pinned ? 0.22 : 0.1,
                opacity: pressed ? 0.78 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons
              name={pinned ? 'pin' : 'pin-outline'}
              size={24}
              color={pinned ? '#FFFFFF' : theme.text}
            />
          </Pressable>
        </View>

        <View style={styles.nameContainer}>
          <ThemedText
            title
            style={[
              styles.courseName,
              { fontSize: getCourseNameFontSize(course.name) },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.68}
            ellipsizeMode='clip'
          >
            {course.name}
          </ThemedText>
        </View>

        {teacherRoleLabel && (
          <View style={[styles.roleBadge, { borderColor: courseColor }]}>
            <Ionicons name='person-outline' size={14} color={courseColor} />
            <ThemedText title style={[styles.roleText, { color: courseColor }]}>
              {teacherRoleLabel}
            </ThemedText>
          </View>
        )}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name='people-outline' size={22} color={theme.text} />
            <ThemedText style={styles.detailText}>
              {course.students_count} {studentLabel}
            </ThemedText>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name='bar-chart-outline' size={22} color={theme.text} />
            <ThemedText style={styles.detailText}>
              {course.credit_hours} {creditLabel}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 198,
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 7,
  },
  accentRail: {
    width: 17,
  },
  content: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 17,
    paddingVertical: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  codeBadge: {
    minWidth: 112,
    maxWidth: '70%',
    minHeight: 34,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.35,
    textAlign: 'center',
  },
  pinButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  nameContainer: {
    minHeight: 66,
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 4,
  },
  courseName: {
    lineHeight: 29,
    fontWeight: '800',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  roleText: { fontSize: 12, fontWeight: '800' },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
