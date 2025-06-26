import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import { getSupabaseClient } from '@reelapps/supabase';

// Mock Supabase
vi.mock('@reelapps/supabase', () => ({
  getSupabaseClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    }))
  }))
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };
      
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'candidate'
      };

      // Mock successful auth response
      (getSupabaseClient().auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock profile fetch
      (getSupabaseClient().from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const { login } = useAuthStore.getState();
      
      await login('test@example.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.profile).toEqual(mockProfile);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      
      (getSupabaseClient().auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const { login } = useAuthStore.getState();
      
      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during login', async () => {
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });

      (getSupabaseClient().auth.signInWithPassword as any).mockReturnValue(loginPromise);

      const { login } = useAuthStore.getState();
      
      // Start login
      const loginCall = login('test@example.com', 'password123');
      
      // Check loading state
      expect(useAuthStore.getState().isLoading).toBe(true);
      
      // Resolve login
      resolveLogin!({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      });
      
      await loginCall;
      
      // Check final state
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'newuser@example.com'
      };
      
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'candidate'
      };

      // Mock successful signup
      (getSupabaseClient().auth.signUp as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock profile creation
      (getSupabaseClient().from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const { signup } = useAuthStore.getState();
      
      await signup('newuser@example.com', 'password123', 'Jane', 'Smith', 'candidate');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.profile).toEqual(mockProfile);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle signup errors', async () => {
      const mockError = new Error('Email already exists');
      
      (getSupabaseClient().auth.signUp as any).mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const { signup } = useAuthStore.getState();
      
      await expect(
        signup('existing@example.com', 'password123', 'John', 'Doe')
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should successfully log out user', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: 'user-123', email: 'test@example.com' },
        profile: { id: 'profile-123', user_id: 'user-123', first_name: 'John', last_name: 'Doe', role: 'candidate' },
        isAuthenticated: true
      });

      (getSupabaseClient().auth.signOut as any).mockResolvedValue({
        error: null
      });

      const { logout } = useAuthStore.getState();
      
      await logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize with existing session', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };
      
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'candidate'
      };

      (getSupabaseClient().auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      (getSupabaseClient().from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const { initialize } = useAuthStore.getState();
      
      await initialize();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.profile).toEqual(mockProfile);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle no existing session', async () => {
      (getSupabaseClient().auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { initialize } = useAuthStore.getState();
      
      await initialize();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});