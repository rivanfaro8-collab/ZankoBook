import axios from 'axios'

import api from '@/lib/axios'
import type {
  SectionSubmission,
  SectionSubmissionFormValues,
} from '@/types/course'
import type { PickedSectionFile } from './sectionItems'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string
          errors?: Record<string, string[] | string>
        }
      | undefined

    const validationMessages = data?.errors
      ? Object.values(data.errors).flatMap((value) =>
          Array.isArray(value) ? value : [value],
        )
      : []

    const readableMessages = validationMessages.filter(
      (message): message is string => Boolean(message),
    )

    if (readableMessages.length > 0) {
      return readableMessages.join('\n')
    }

    return data?.message || fallback
  }

  return error instanceof Error ? error.message : fallback
}

const unwrap = <T>(response: ApiResponse<T>, fallback: string): T => {
  if (!response.success) {
    throw new Error(response.message || fallback)
  }

  return response.data
}

const toFormData = (
  values: SectionSubmissionFormValues,
  files: PickedSectionFile[] = [],
) => {
  const formData = new FormData()

  formData.append('title', values.title.trim())
  formData.append('description', values.description.trim())
  formData.append('weight', String(values.weight))
  formData.append('max_mark', String(values.maxMark))
  formData.append('due_at', values.dueAt)

  files.forEach((file) => {
    formData.append('files[]', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as never)
  })

  return formData
}

export async function getSectionSubmissions(
  sectionId: string | number,
): Promise<SectionSubmission[]> {
  const response = await api.get<ApiResponse<SectionSubmission[]>>(
    `/api/moodle/course-sections/${sectionId}/submissions`,
  )

  return unwrap(response.data, 'Could not retrieve assignments.')
}

export async function getSectionSubmission(
  assignmentId: string | number,
): Promise<SectionSubmission> {
  const response = await api.get<ApiResponse<SectionSubmission>>(
    `/api/moodle/section-submissions/${assignmentId}`,
  )

  return unwrap(response.data, 'Could not retrieve the assignment.')
}

export async function createSectionSubmission(
  sectionId: string | number,
  values: SectionSubmissionFormValues,
  files: PickedSectionFile[] = [],
): Promise<SectionSubmission> {
  try {
    const response = await api.post<ApiResponse<SectionSubmission>>(
      `/api/moodle/course-sections/${sectionId}/submissions`,
      toFormData(values, files),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )

    return unwrap(response.data, 'Could not create the assignment.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not create the assignment.'))
  }
}

export async function updateSectionSubmission(
  assignmentId: string | number,
  values: SectionSubmissionFormValues,
  files: PickedSectionFile[] = [],
): Promise<SectionSubmission> {
  try {
    const response = await api.put<ApiResponse<SectionSubmission>>(
      `/api/moodle/section-submissions/${assignmentId}`,
      toFormData(values, files),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )

    return unwrap(response.data, 'Could not update the assignment.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not update the assignment.'))
  }
}

export async function deleteSectionSubmission(assignmentId: string | number) {
  const response = await api.delete<ApiResponse<unknown>>(
    `/api/moodle/section-submissions/${assignmentId}`,
  )

  return unwrap(response.data, 'Could not delete the assignment.')
}

export async function deleteSectionSubmissionAttachment(
  attachmentId: string | number,
) {
  const response = await api.delete<ApiResponse<unknown>>(
    `/api/moodle/section-submission-attachments/${attachmentId}`,
  )

  return unwrap(response.data, 'Could not delete the attachment.')
}
