import { useLocalSearchParams } from 'expo-router'

import CourseTeachersScreen from '../../../../../components/course/CourseTeachersScreen'

export default function StudentCourseTeachersPage() {
  const { courseId, courseName } = useLocalSearchParams<{
    courseId?: string
    courseName?: string
  }>()

  return (
    <CourseTeachersScreen
      courseId={Number(courseId) || 0}
      courseName={courseName ?? 'Course'}
    />
  )
}
