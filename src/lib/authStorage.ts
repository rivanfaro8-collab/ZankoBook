import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'zankobook_auth_token'

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getSavedToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function removeSavedToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}
