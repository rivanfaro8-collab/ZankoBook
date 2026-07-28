import api from '@/lib/axios'
import type { Course, CourseTeacher, CoursesApiResponse } from '@/types/course'

const ensureCoursesArray = (
  response: CoursesApiResponse,
  fallbackMessage: string,
): Course[] => {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage)
  }

  /*
   * React Query does not allow query functions to return undefined.
   * Both new endpoints return the courses array directly inside `data`.
   */
  if (!Array.isArray(response.data)) {
    throw new Error('The server returned an invalid courses response.')
  }

  return response.data
}

export async function getStudentCourses(): Promise<Course[]> {
  const response = await api.get<CoursesApiResponse>('/api/moodle/my-courses')

  return ensureCoursesArray(
    response.data,
    'Could not retrieve student courses.',
  )
}

export async function getLecturerCourses(): Promise<Course[]> {
  const response = await api.get<CoursesApiResponse>(
    '/api/moodle/lecturer/courses',
  )

  return ensureCoursesArray(
    response.data,
    'Could not retrieve lecturer courses.',
  )
}

export async function getCourseLecturers(
  courseId: string | number,
): Promise<CourseTeacher[]> {
  const response = await api.get<{
    success: boolean
    message: string
    data: CourseTeacher[]
  }>(`/api/moodle/courses/${courseId}/teachers`)

  const { success, message, data } = response.data

  if (!success) throw new Error(message)
  if (!Array.isArray(data)) {
    throw new Error('The server returned an invalid teachers response.')
  }

  return data
}
