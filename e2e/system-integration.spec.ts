import { test, expect } from '@playwright/test';

test.describe('System Integration Tests', () => {
  test('system status dashboard shows service health', async ({ page }) => {
    await page.goto('/');
    
    // Check if system status is visible on dashboard
    await expect(page.locator('text=System Status')).toBeVisible();
    
    // Check service indicators
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=AI Engine')).toBeVisible();
    
    // Test refresh functionality
    await page.click('text=Refresh Status');
    
    // Verify last checked time updates
    await expect(page.locator('text=Last checked:')).toBeVisible();
  });

  test('error handling displays user-friendly messages', async ({ page }) => {
    // Test with network offline to simulate service failures
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Try to perform an action that requires network
    await page.click('text=Get Started');
    
    // Should show appropriate error message
    await expect(page.locator('text=connection')).toBeVisible();
    
    // Restore network
    await page.context().setOffline(false);
  });

  test('responsive design works across device sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Navigation should be horizontal
    await expect(page.locator('nav')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Navigation might be collapsed on mobile
    // Content should still be accessible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('authentication flow works end-to-end', async ({ page }) => {
    await page.goto('/');
    
    // Start with unauthenticated state
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Sign up
    await page.click('text=Get Started');
    await page.check('input[value="candidate"]');
    await page.fill('input[placeholder="Enter your first name"]', 'Test');
    await page.fill('input[placeholder="Enter your last name"]', 'User');
    await page.fill('input[placeholder="Enter your email"]', 'test@example.com');
    await page.fill('input[placeholder="Create a password (min. 6 characters)"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should be authenticated now
    await expect(page.locator('text=Sign Out')).toBeVisible();
    
    // Sign out
    await page.click('text=Sign Out');
    
    // Should be back to unauthenticated state
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('data persistence across page reloads', async ({ page }) => {
    // This test would verify that user data persists
    // In a real implementation, this would test actual data persistence
    await page.goto('/reelskills');
    
    // Add some data
    await page.click('text=Add Skill');
    await page.fill('input[placeholder="e.g., React, Leadership, Spanish"]', 'Test Skill');
    await page.click('text=Add Skill');
    
    // Reload page
    await page.reload();
    
    // Data should still be there
    await expect(page.locator('text=Test Skill')).toBeVisible();
  });
});