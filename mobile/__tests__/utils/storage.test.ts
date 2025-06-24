import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage utility functions
export const StorageUtils = {
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  },

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  },

  async setUserEmail(email: string): Promise<void> {
    await AsyncStorage.setItem('userEmail', email);
  },

  async getUserEmail(): Promise<string | null> {
    return await AsyncStorage.getItem('userEmail');
  },

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'userEmail']);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
};

describe('StorageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthToken', () => {
    it('stores auth token correctly', async () => {
      await StorageUtils.setAuthToken('test-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
    });
  });

  describe('getAuthToken', () => {
    it('retrieves auth token correctly', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-token');
      
      const token = await StorageUtils.getAuthToken();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(token).toBe('test-token');
    });

    it('returns null when no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const token = await StorageUtils.getAuthToken();
      
      expect(token).toBeNull();
    });
  });

  describe('setUserEmail', () => {
    it('stores user email correctly', async () => {
      await StorageUtils.setUserEmail('test@example.com');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
    });
  });

  describe('getUserEmail', () => {
    it('retrieves user email correctly', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test@example.com');
      
      const email = await StorageUtils.getUserEmail();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userEmail');
      expect(email).toBe('test@example.com');
    });
  });

  describe('clearAuthData', () => {
    it('clears all auth data', async () => {
      await StorageUtils.clearAuthData();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['authToken', 'userEmail']);
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-token');
      
      const isAuth = await StorageUtils.isAuthenticated();
      
      expect(isAuth).toBe(true);
    });

    it('returns false when no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const isAuth = await StorageUtils.isAuthenticated();
      
      expect(isAuth).toBe(false);
    });
  });
});