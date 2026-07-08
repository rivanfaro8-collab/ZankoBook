import { create } from 'zustand'

import type { User } from '@/types/auth'

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

//creates shared storage for logged-in user and token
