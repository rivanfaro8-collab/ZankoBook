import { useLocalSearchParams } from 'expo-router'

import CoursePageShell from '../../../../components/CoursePageShell'

export default function LecturerCoursePage() {
  const { courseId, courseName } = useLocalSearchParams<{
    courseId?: string
    courseName?: string
  }>()

  return (
    <CoursePageShell
      courseId={Number(courseId) || 0}
      courseName={courseName ?? 'Course'}
      attendanceMode='lecturer'
    />
  )
}
