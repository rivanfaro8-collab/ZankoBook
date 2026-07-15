import api from '@/lib/axios'
import type {
  CourseSection,
  CourseSectionPayload,
  CourseSectionsApiResponse,
} from '@/types/course'

const unwrapSections = (response: CourseSectionsApiResponse): CourseSection[] => {
  if (!response.success) {
    throw new Error(response.message || 'Could not retrieve course sections.')
  }

  const payload = response.data

  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.data)) return payload.data

  throw new Error('The server returned an invalid course sections response.')
}

export async function getCourseSections(
  courseId: string | number,
): Promise<CourseSection[]> {
  const response = await api.get<CourseSectionsApiResponse>(
    `/api/moodle/courses/${courseId}/sections`,
  )

  return unwrapSections(response.data)
}

export async function addSection(
  courseId: string | number,
  payload: CourseSectionPayload,
): Promise<CourseSection> {
  const response = await api.post(
    `/api/moodle/courses/${courseId}/sections`,
    payload,
  )

  const { success, message, data } = response.data
  if (!success) throw new Error(message || 'Could not create the section.')

  return data
}

export async function updateSection(
  sectionId: string | number,
  payload: CourseSectionPayload,
): Promise<CourseSection> {
  const response = await api.put(
    `/api/moodle/course-sections/${sectionId}`,
    payload,
  )

  const { success, message, data } = response.data
  if (!success) throw new Error(message || 'Could not update the section.')

  return data
}

export async function deleteSection(
  sectionId: string | number,
): Promise<unknown> {
  const response = await api.delete(
    `/api/moodle/course-sections/${sectionId}`,
  )

  if (!response.data) return undefined

  const { success, message, data } = response.data
  if (!success) throw new Error(message || 'Could not delete the section.')

  return data
}
