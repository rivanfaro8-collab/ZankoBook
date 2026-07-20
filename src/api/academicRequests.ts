import axios from 'axios'

import api from '@/lib/axios'
import type {
  AcademicRequest,
  AcademicRequestPayload,
} from '@/types/academicRequests'

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

    const firstValidationError = data?.errors
      ? Object.values(data.errors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .find(Boolean)
      : undefined

    return firstValidationError || data?.message || fallback
  }

  return error instanceof Error ? error.message : fallback
}

const unwrap = <T>(response: ApiResponse<T>, fallback: string): T => {
  if (!response.success) {
    throw new Error(response.message || fallback)
  }

  return response.data
}

export async function makeAcademicRequest(
  payload: AcademicRequestPayload,
): Promise<AcademicRequest> {
  const formData = new FormData()

  formData.append('type', payload.type)
  formData.append('subject', payload.subject.trim())
  formData.append('description', payload.description.trim())

  if (payload.department_id !== undefined) {
    formData.append('department_id', String(payload.department_id))
  }

  payload.files?.forEach((file) => {
    formData.append('files[]', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as never)
  })

  try {
    const response = await api.post<ApiResponse<AcademicRequest>>(
      '/api/moodle/academic-requests',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return unwrap(response.data, 'Could not send the request.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not send the request.'))
  }
}

export async function getAcademicRequests(): Promise<AcademicRequest[]> {
  try {
    const response = await api.get<ApiResponse<AcademicRequest[]>>(
      '/api/moodle/academic-requests',
    )

    return unwrap(response.data, 'Could not retrieve requests.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not retrieve requests.'))
  }
}
