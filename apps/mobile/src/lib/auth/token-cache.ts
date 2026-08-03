import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY_PREFIX = 'clerk-token:'

export const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(`${TOKEN_KEY_PREFIX}${key}`)
    } catch {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    await SecureStore.setItemAsync(`${TOKEN_KEY_PREFIX}${key}`, value)
  },
}
