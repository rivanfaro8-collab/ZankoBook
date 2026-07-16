import api from '../lib/axios'
import type { CourseMarks, GetCourseMarksResponse } from '../types/grades'

export async function getMyGrades(courseId: number): Promise<CourseMarks> {
  const response = await api.get<GetCourseMarksResponse>(
    `/api/moodle/courses/${courseId}/my-marks`,
  )

  const { success, message, data } = response.data

  if (!success) throw new Error(message)

  return data
}
