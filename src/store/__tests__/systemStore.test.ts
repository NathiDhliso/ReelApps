import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSystemStore } from '../systemStore';

// Mock fetch
global.fetch = vi.fn();

describe('SystemStore', () => {
  beforeEach(() => {
    // Reset store state
    useSystemStore.setState({
      status: {
        pythonService: 'unknown',
        supabaseService: 'unknown',
        aiService: 'unknown',
        lastChecked: new Date().toISOString()
      },
      notifications: [],
      isOnboarding: false,
      onboardingStep: 0
    });
    
    vi.clearAllMocks();
  });

  describe('notifications', () => {
    it('should add a notification', () => {
      const { addNotification } = useSystemStore.getState();
      
      addNotification({
        type: 'success',
        title: 'Test Success',
        message: 'This is a test notification'
      });

      const state = useSystemStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].title).toBe('Test Success');
      expect(state.notifications[0].type).toBe('success');
      expect(state.notifications[0].dismissed).toBe(false);
    });

    it('should dismiss a notification', () => {
      const { addNotification, dismissNotification } = useSystemStore.getState();
      
      addNotification({
        type: 'info',
        title: 'Test Info',
        message: 'Test message'
      });

      const notificationId = useSystemStore.getState().notifications[0].id;
      
      dismissNotification(notificationId);

      const state = useSystemStore.getState();
      expect(state.notifications[0].dismissed).toBe(true);
    });

    it('should clear all notifications', () => {
      const { addNotification, clearNotifications } = useSystemStore.getState();
      
      addNotification({
        type: 'info',
        title: 'Test 1',
        message: 'Message 1'
      });
      
      addNotification({
        type: 'warning',
        title: 'Test 2',
        message: 'Message 2'
      });

      expect(useSystemStore.getState().notifications).toHaveLength(2);
      
      clearNotifications();

      expect(useSystemStore.getState().notifications).toHaveLength(0);
    });

    it('should limit notifications to 10', () => {
      const { addNotification } = useSystemStore.getState();
      
      // Add 12 notifications
      for (let i = 0; i < 12; i++) {
        addNotification({
          type: 'info',
          title: `Test ${i}`,
          message: `Message ${i}`
        });
      }

      const state = useSystemStore.getState();
      expect(state.notifications).toHaveLength(10);
    });
  });

  describe('onboarding', () => {
    it('should start onboarding', () => {
      const { startOnboarding } = useSystemStore.getState();
      
      startOnboarding();

      const state = useSystemStore.getState();
      expect(state.isOnboarding).toBe(true);
      expect(state.onboardingStep).toBe(0);
    });

    it('should advance onboarding step', () => {
      const { startOnboarding, nextOnboardingStep } = useSystemStore.getState();
      
      startOnboarding();
      nextOnboardingStep();

      const state = useSystemStore.getState();
      expect(state.onboardingStep).toBe(1);
    });

    it('should complete onboarding', () => {
      const { startOnboarding, completeOnboarding } = useSystemStore.getState();
      
      startOnboarding();
      completeOnboarding();

      const state = useSystemStore.getState();
      expect(state.isOnboarding).toBe(false);
      expect(state.onboardingStep).toBe(0);
    });

    it('should skip onboarding', () => {
      const { startOnboarding, skipOnboarding } = useSystemStore.getState();
      
      startOnboarding();
      skipOnboarding();

      const state = useSystemStore.getState();
      expect(state.isOnboarding).toBe(false);
      expect(state.onboardingStep).toBe(0);
    });
  });

  describe('system health', () => {
    it('should check system health successfully', async () => {
      // Mock successful responses
      (fetch as any)
        .mockResolvedValueOnce({ ok: true }) // Python service
        .mockResolvedValueOnce({ ok: true }); // Supabase check

      const { checkSystemHealth } = useSystemStore.getState();
      
      await checkSystemHealth();

      const state = useSystemStore.getState();
      expect(state.status.pythonService).toBe('healthy');
    });

    it('should handle service failures', async () => {
      // Mock failed responses
      (fetch as any)
        .mockRejectedValueOnce(new Error('Service unavailable')); // Python service fails

      const { checkSystemHealth } = useSystemStore.getState();
      
      await checkSystemHealth();

      const state = useSystemStore.getState();
      expect(state.status.pythonService).toBe('down');
    });

    it('should add notifications for service issues', async () => {
      // Mock failed Python service
      (fetch as any)
        .mockRejectedValueOnce(new Error('Service unavailable'));

      const { checkSystemHealth } = useSystemStore.getState();
      
      await checkSystemHealth();

      const state = useSystemStore.getState();
      const warningNotifications = state.notifications.filter(n => n.type === 'warning');
      expect(warningNotifications.length).toBeGreaterThan(0);
    });
  });
});