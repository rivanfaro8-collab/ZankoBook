import api from '@/lib/axios'
import type { Course, CourseTeacher } from '@/types/course'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export async function getStudentCourses(): Promise<Course[]> {
  const response = await api.get<ApiResponse<Course[]>>('/api/moodle/my-courses')
  const { success, message, data } = response.data

  if (!success) throw new Error(message)

  return data
}

export async function getLecturerCourses(): Promise<Course[]> {
  const response = await api.get<ApiResponse<Course[]>>(
    '/api/moodle/lecturer/courses',
  )
  const { success, message, data } = response.data

  if (!success) throw new Error(message)

  return data
}

export async function getLecturerCourseById(
  courseId: string | number,
): Promise<Course> {
  const response = await api.get<
    ApiResponse<{
      course: Course
    }>
  >(`/api/moodle/lecturer/courses/${courseId}`)
  const { success, message, data } = response.data

  if (!success) throw new Error(message)

  return data.course
}

export async function getCourseLecturers(
  courseId: string | number,
): Promise<CourseTeacher[]> {
  const response = await api.get<ApiResponse<CourseTeacher[]>>(
    `/api/moodle/courses/${courseId}/teachers`,
  )
  const { success, message, data } = response.data

  if (!success) throw new Error(message)

  return data
}
