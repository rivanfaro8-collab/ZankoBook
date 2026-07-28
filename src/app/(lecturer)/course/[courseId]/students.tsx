import { useLocalSearchParams } from 'expo-router'

import CourseStudentsScreen from '../../../../../components/course/CourseStudentsScreen'

export default function LecturerCourseStudentsPage() {
  const { courseId, courseName } = useLocalSearchParams<{
    courseId?: string
    courseName?: string
  }>()

  return (
    <CourseStudentsScreen
      courseId={Number(courseId) || 0}
      courseName={courseName ?? 'Course'}
    />
  )
}
