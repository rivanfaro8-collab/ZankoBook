import * as SecureStore from 'expo-secure-store'

import type { User } from '../types/auth'

const TOKEN_KEY = 'zankobook_auth_token'
const USER_KEY = 'zankobook_auth_user'

export async function saveSession(token: string, user: User) {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ])
}

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getSavedSession(): Promise<{ token: string; user: User } | null> {
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ])
  if (!token || !rawUser) return null
  try {
    return { token, user: JSON.parse(rawUser) as User }
  } catch {
    return null
  }
}

export async function getSavedToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function removeSavedToken() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ])
}
