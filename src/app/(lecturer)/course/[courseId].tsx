import { useLocalSearchParams } from 'expo-router'

import CoursePageShell from '../../../../components/CoursePageShell'

export default function LecturerCoursePage() {
  const { courseId, courseName, teacherRole } = useLocalSearchParams<{
    courseId?: string
    courseName?: string
    teacherRole?: string
  }>()

  return (
    <CoursePageShell
      courseId={Number(courseId) || 0}
      courseName={courseName ?? 'Course'}
      attendanceMode='lecturer'
      teacherRole={teacherRole}
    />
  )
}
