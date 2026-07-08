export type UserRole = 'student' | 'lecturer'

export type LoginPayload = {
  email: string
  password: string
}

export type UserScope = {
  id: number
  scope_type: string
  scope_id: number
  scope: {
    id: number
    name: string
    faculty?: {
      id: number
      name: string
      university?: {
        id: number
        name: string
      }
    }
  }
}

export type User = {
  id: number
  name: string
  email: string
  phone: string
  is_active: number
  is_two_factor_enabled: number
  role: UserRole
  scopes: UserScope[]
}

type ApiRole = {
  id: number
  name: string
}

type LoginApiUser = Omit<User, 'role'> & {
  roles: ApiRole[]
}

export type LoginResponse = {
  success: boolean
  message: string
  data: {
    token: string
    user: LoginApiUser
  }
}

export type LoginResult = {
  token: string
  user: User
}
