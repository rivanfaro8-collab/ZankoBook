import { create } from 'zustand'
//creates shared storage for logged-in user and token
type User = {
  id: number
  name: string
  email: string
  role: string
}

type UserStore = {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}))
