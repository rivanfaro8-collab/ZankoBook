import api from '../lib/axios'
import type {
  AvailableCoursesData,
  StudentCourseSelectionRequest,
} from '../types/courseEnrollment'

export async function getAvailableCoursesToEnroll(): Promise<AvailableCoursesData> {
  const response = await api.get('/api/students/available-courses')
  const { success, message, data } = response.data

  if (!success) throw new Error(message)

  return data
}

export async function submitCourseSelection(
  payload: StudentCourseSelectionRequest,
): Promise<string> {
  const response = await api.post('/api/students/course-selection', payload)
  const { success, message } = response.data

  if (success === false) throw new Error(message)

  return message
}
