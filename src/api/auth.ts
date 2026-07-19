import axios from 'axios'

import api from '@/lib/axios'
import type {
  LoginPayload,
  LoginResponse,
  LoginResult,
  UserRole,
} from '@/types/auth'

type LogoutResponse = {
  success: boolean
  message: string
}

type ChangePasswordResponse = {
  success: boolean
  message: string
}

type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

type ValidationErrorResponse = {
  message?: string
  errors?: Record<string, string[]>
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await api.post<LoginResponse>(
    '/api/auth/moodle/login',
    payload,
  )

  const result = response.data

  if (!result.success) {
    throw new Error(result.message || 'Login failed')
  }

  const backendRole = result.data.user.roles[0]?.name?.toLowerCase()

  if (backendRole !== 'student' && backendRole !== 'lecturer') {
    throw new Error('This account does not have a supported ZankoBook role.')
  }

  return {
    token: result.data.token,
    user: {
      ...result.data.user,
      role: backendRole as UserRole,
    },
  }
}

export async function logout(): Promise<void> {
  const response = await api.post<LogoutResponse>('/api/auth/logout')
  const result = response.data

  if (!result.success) {
    throw new Error(result.message || 'Logout failed')
  }
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  try {
    const response = await api.post<ChangePasswordResponse>(
      '/api/auth/change-password',
      {
        current_password: payload.currentPassword,
        password: payload.newPassword,
      },
    )

    const { success, message } = response.data

    if (!success) {
      throw new Error(message || 'Password change failed')
    }
  } catch (error) {
    if (axios.isAxiosError<ValidationErrorResponse>(error)) {
      const data = error.response?.data
      const validationMessage = data?.errors
        ? Object.values(data.errors).flat().filter(Boolean).join('\n')
        : undefined

      throw new Error(
        validationMessage ||
          data?.message ||
          'Unable to change the password. Check the entered passwords.',
      )
    }

    throw error
  }
}
