import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const storageService = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to get token', e);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to set token', e);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to get user', e);
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem(USER_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to set user', e);
    }
  },

  async clearAuth(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
        console.error('Failed to clear auth', e);
    }
  }
};
