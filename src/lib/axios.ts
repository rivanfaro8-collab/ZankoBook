import axios from 'axios'

import { useUserStore } from '../store/userStore'

type ApiErrorResponse = {
  message?: unknown
  error?: unknown
  errors?: unknown
}

const collectMessages = (value: unknown): string[] => {
  if (typeof value === 'string') {
    const message = value.trim()
    return message ? [message] : []
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectMessages)
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectMessages)
  }

  return []
}

const getBackendErrorMessage = (data: unknown): string | undefined => {
  if (!data || typeof data !== 'object') return undefined

  const response = data as ApiErrorResponse
  const validationMessages = collectMessages(response.errors)

  if (validationMessages.length > 0) {
    return validationMessages.join('\n')
  }

  return (
    collectMessages(response.message)[0] ?? collectMessages(response.error)[0]
  )
}

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const backendMessage = getBackendErrorMessage(error.response?.data)

      if (backendMessage) {
        error.message = backendMessage
      } else if (!error.response) {
        error.message =
          'Unable to connect to the server. Check your internet connection and try again.'
      }
    }

    return Promise.reject(error)
  },
)

export default api
