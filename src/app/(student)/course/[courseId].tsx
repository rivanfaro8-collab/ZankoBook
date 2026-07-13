import { useLocalSearchParams } from 'expo-router'

import CoursePageShell from '../../../../components/CoursePageShell'

export default function StudentCoursePage() {
  const { courseId, courseName } = useLocalSearchParams<{
    courseId?: string
    courseName?: string
  }>()

  return (
    <CoursePageShell
      courseId={Number(courseId) || 0}
      courseName={courseName ?? 'Course'}
      attendanceMode='student'
    />
  )
}
