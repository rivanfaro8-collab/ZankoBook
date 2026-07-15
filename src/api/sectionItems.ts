import api from '@/lib/axios'
import type { CourseSectionItem, SectionItemFormValues } from '@/types/course'

export type PickedSectionFile = {
  uri: string
  name: string
  mimeType?: string | null
  size?: number | null
}

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

const unwrap = <T>(response: ApiResponse<T>, fallback: string): T => {
  if (!response.success) {
    throw new Error(response.message || fallback)
  }

  return response.data
}

const normalizeUrl = (url: string) => {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return trimmedUrl
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl
  }

  return `https://${trimmedUrl}`
}

export async function getSectionItems(
  sectionId: string | number,
): Promise<CourseSectionItem[]> {
  const response = await api.get<ApiResponse<CourseSectionItem[]>>(
    `/api/moodle/course-sections/${sectionId}/items`,
  )

  return unwrap(response.data, 'Could not retrieve section items.')
}

const toFormData = (
  values: SectionItemFormValues,
  file?: PickedSectionFile | null,
) => {
  const formData = new FormData()

  formData.append('title', values.title.trim())

  if (values.description.trim()) {
    formData.append('description', values.description.trim())
  }

  if (values.url?.trim()) {
    formData.append('url', normalizeUrl(values.url))
  }

  if (file) {
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as never)
  }

  return formData
}

export async function createSectionItem(
  sectionId: string | number,
  values: SectionItemFormValues,
  file?: PickedSectionFile | null,
): Promise<CourseSectionItem> {
  const response = await api.post<ApiResponse<CourseSectionItem>>(
    `/api/moodle/course-sections/${sectionId}/items`,
    toFormData(values, file),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return unwrap(response.data, 'Could not create the section item.')
}

export async function updateSectionItem(
  itemId: string | number,
  values: SectionItemFormValues,
  file?: PickedSectionFile | null,
): Promise<CourseSectionItem> {
  const response = await api.put<ApiResponse<CourseSectionItem>>(
    `/api/moodle/section-items/${itemId}`,
    toFormData(values, file),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return unwrap(response.data, 'Could not update the section item.')
}

export async function deleteSectionItem(itemId: string | number) {
  const response = await api.delete<ApiResponse<unknown>>(
    `/api/section-items/${itemId}`,
  )

  return unwrap(response.data, 'Could not delete the section item.')
}
