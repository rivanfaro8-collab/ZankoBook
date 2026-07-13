import { useLocalSearchParams } from 'expo-router'

import CoursePageShell from '../../../../components/CoursePageShell'

export default function StudentCoursePage() {
  const { courseName } = useLocalSearchParams<{ courseName?: string }>()

  return <CoursePageShell courseName={courseName ?? 'Course'} />
}
