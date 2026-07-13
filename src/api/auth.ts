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
