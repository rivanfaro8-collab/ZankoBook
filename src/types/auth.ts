export type UserRole = 'student' | 'lecturer'

export type LoginPayload = {
  email: string
  password: string
}

export type ApiRole = {
  id: number
  name: UserRole
}

export type UserScope = {
  id: number
  role: ApiRole
  scope_type: 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT'
  scope_id: number | null
  scope?: {
    id: number
    name: string
    is_open?: boolean
    course_selection_starts_at?: string
    course_selection_ends_at?: string
    faculty?: {
      id: number
      name: string
      university?: {
        id: number
        name: string
      }
    }
  } | null
}

export type User = {
  id: number
  name: string
  email: string
  phone: string
  is_active: number
  is_two_factor_enabled: number
  roles: ApiRole[]
  scopes: UserScope[]
  created_at?: string
  updated_at?: string
}

export type LoginResponse = {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export type GetProfileResponse = {
  success: boolean
  message: string
  data: User
}

export type LoginResult = {
  token: string
  user: User
}
