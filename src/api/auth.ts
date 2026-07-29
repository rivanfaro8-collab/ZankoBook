import axios from 'axios'

import api from '@/lib/axios'
import type {
  LoginPayload,
  LoginResponse,
  LoginResult,
  GetProfileResponse,
  User,
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


type ForgotPasswordResponse = {
  success?: boolean
  message?: string
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await api.post<ForgotPasswordResponse>(
    '/api/auth/forget-password',
    { email },
  )

  const { success, message } = response.data

  if (success === false) {
    throw new Error(message || 'Unable to send the password reset request.')
  }

  return message || 'Password reset instructions have been sent to your email.'
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await api.post<LoginResponse>(
    '/api/auth/moodle/login',
    payload,
  )

  const { success, message, data } = response.data

  if (!success) throw new Error(message || 'Login failed')

  return data
}

export async function getProfile(): Promise<User> {
  const response = await api.get<GetProfileResponse>('/api/auth/me')
  const { success, message, data } = response.data

  if (!success) throw new Error(message)

  return data
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
