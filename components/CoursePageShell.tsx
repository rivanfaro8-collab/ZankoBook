import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { useAppTheme } from '../src/store/themeStore'
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'
import LecturerAttendanceSection from './attendance/LecturerAttendanceSection'
import StudentAttendanceSection from './attendance/StudentAttendanceSection'
import CourseContentSection from './content/CourseContentSection'
import LecturerGradesSection from './grades/LecturerGradesSection'
import StudentGradesSection from './grades/StudentGradesSection'

type CourseSection = 'content' | 'attendance' | 'grades'

type CoursePageShellProps = {
  courseId: number
  courseName: string
  attendanceMode?: 'lecturer' | 'student'
}

const sections: Array<{ key: CourseSection; label: string }> = [
  { key: 'content', label: 'Content' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'grades', label: 'Grades' },
]

const getCourseTitleFontSize = (name: string) => {
  const length = name.trim().length

  if (length > 44) return 15
  if (length > 30) return 17
  if (length > 20) return 19

  return 21
}

export default function CoursePageShell({
  courseId,
  courseName,
  attendanceMode = 'student',
}: CoursePageShellProps) {
  const router = useRouter()
  const theme = useAppTheme()
  const isGoingBack = useRef(false)
  const [activeSection, setActiveSection] = useState<CourseSection>('content')

  const handleBack = () => {
    if (isGoingBack.current || !router.canGoBack()) return

    isGoingBack.current = true
    router.back()

    setTimeout(() => {
      isGoingBack.current = false
    }, 500)
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back to dashboard'
          hitSlop={10}
          onPress={handleBack}
          style={({ pressed }) => [
            styles.headerButton,
            {
              backgroundColor: theme.uiBackground,
              borderColor: theme.border,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <Ionicons name='arrow-back' size={24} color={theme.title} />
        </Pressable>

        <ThemedText
          title
          style={[
            styles.courseTitle,
            { fontSize: getCourseTitleFontSize(courseName) },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          ellipsizeMode='clip'
        >
          {courseName}
        </ThemedText>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Course information'
          hitSlop={10}
          onPress={() => undefined}
          style={({ pressed }) => [
            styles.infoButton,
            { opacity: pressed ? 0.65 : 1 },
          ]}
        >
          <Ionicons name='information-circle-outline' size={30} color={theme.title} />
        </Pressable>
      </View>

      <View
        style={[
          styles.sectionBar,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {sections.map((section) => {
          const active = section.key === activeSection

          return (
            <Pressable
              key={section.key}
              accessibilityRole='tab'
              accessibilityState={{ selected: active }}
              onPress={() => setActiveSection(section.key)}
              style={({ pressed }) => [
                styles.sectionButton,
                {
                  borderBottomColor: active ? theme.primary : 'transparent',
                  backgroundColor: pressed ? theme.uiBackground : theme.background,
                },
              ]}
            >
              <ThemedText
                title={active}
                style={[
                  styles.sectionLabel,
                  { color: active ? theme.primary : theme.text },
                ]}
              >
                {section.label}
              </ThemedText>
            </Pressable>
          )
        })}
      </View>

      {activeSection === 'content' ? (
        <CourseContentSection courseId={courseId} mode={attendanceMode} />
      ) : activeSection === 'attendance' ? (
        attendanceMode === 'lecturer' ? (
          <LecturerAttendanceSection courseId={courseId} />
        ) : (
          <StudentAttendanceSection courseId={courseId} courseName={courseName} />
        )
      ) : attendanceMode === 'lecturer' ? (
        <LecturerGradesSection courseId={courseId} />
      ) : (
        <StudentGradesSection courseId={courseId} courseName={courseName} />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 12,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 25,
  },
  infoButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBar: {
    height: 58,
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  sectionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  pageContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
})
