import { create } from 'zustand'

type NetworkStore = {
  isOnline: boolean
  isChecking: boolean
  setNetworkState: (isOnline: boolean, isChecking?: boolean) => void
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  isOnline: true,
  isChecking: true,
  setNetworkState: (isOnline, isChecking = false) => set({ isOnline, isChecking }),
}))
