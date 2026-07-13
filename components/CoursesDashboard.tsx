import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'

import ThemedText from './ThemedText'
import ThemedView from './ThemedView'
import { getLecturerCourses, getStudentCourses } from '../src/api/courses'
import { useCoursePinsStore } from '../src/store/coursePinsStore'
import { useAppTheme } from '../src/store/themeStore'
import { useUserStore } from '../src/store/userStore'
import type { UserRole } from '../src/types/auth'
import type { Course } from '../src/types/course'

import CourseCard from './CourseCard'

type CoursesDashboardProps = {
  role: UserRole
}

export default function CoursesDashboard({ role }: CoursesDashboardProps) {
  const theme = useAppTheme()
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const pinnedByScope = useCoursePinsStore((state) => state.pinnedByScope)
  const loadedScopes = useCoursePinsStore((state) => state.loadedScopes)
  const loadPins = useCoursePinsStore((state) => state.loadPins)
  const togglePin = useCoursePinsStore((state) => state.togglePin)

  const scopeKey = `${user?.id ?? 'guest'}:${role}`
  const pinnedIds = pinnedByScope[scopeKey] ?? []
  const pinsLoaded = loadedScopes[scopeKey] ?? false

  useEffect(() => {
    void loadPins(scopeKey)
  }, [loadPins, scopeKey])

  const coursesQuery = useQuery({
    queryKey: ['dashboard-courses', role, user?.id],
    queryFn: role === 'lecturer' ? getLecturerCourses : getStudentCourses,
  })

  const sortedCourses = useMemo(() => {
    const courses = coursesQuery.data ?? []
    const pinnedSet = new Set(pinnedIds)

    return [...courses].sort((first, second) => {
      const firstPinned = pinnedSet.has(first.id)
      const secondPinned = pinnedSet.has(second.id)

      if (firstPinned !== secondPinned) {
        return firstPinned ? -1 : 1
      }

      return first.name.localeCompare(second.name, undefined, {
        sensitivity: 'base',
      })
    })
  }, [coursesQuery.data, pinnedIds])

  const renderCourse = ({ item }: { item: Course }) => (
    <CourseCard
      course={item}
      pinned={pinnedIds.includes(item.id)}
      onPress={() =>
        router.push({
          pathname:
            role === 'lecturer'
              ? '/(lecturer)/course/[courseId]'
              : '/(student)/course/[courseId]',
          params: {
            courseId: String(item.id),
            courseName: item.name,
          },
        })
      }
      onTogglePin={() => void togglePin(scopeKey, item.id)}
    />
  )

  if (coursesQuery.isPending || !pinsLoaded) {
    return (
      <ThemedView style={styles.centeredState}>
        <ActivityIndicator size='large' color={theme.primary} />
        <ThemedText style={styles.stateText}>Loading your courses...</ThemedText>
      </ThemedView>
    )
  }

  if (coursesQuery.isError) {
    return (
      <ThemedView style={styles.centeredState}>
        <Ionicons name='cloud-offline-outline' size={46} color={theme.text} />
        <ThemedText title style={styles.stateTitle}>
          Courses could not be loaded
        </ThemedText>
        <ThemedText style={styles.stateText}>
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
        data={sortedCourses}
        keyExtractor={(course) => String(course.id)}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText title style={styles.title}>
              My Courses
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Pin important courses to keep them at the top.
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name='book-outline' size={48} color={theme.text} />
            <ThemedText title style={styles.stateTitle}>
              No courses yet
            </ThemedText>
            <ThemedText style={styles.stateText}>
              Your assigned courses will appear here.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    flexGrow: 1,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  separator: {
    height: 16,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 70,
  },
  stateTitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 14,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
})
