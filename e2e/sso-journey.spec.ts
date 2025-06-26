import { test, expect } from '@playwright/test';

test.describe('Cross-Domain SSO Journey', () => {
  // Test credentials - should match your test database
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  test('should allow login on main app and stay authenticated on sub-apps', async ({ page }) => {
    // 1. Start at a sub-app (e.g., ReelCV) and expect a redirect
    await page.goto('http://localhost:5174'); // ReelCV
    
    // Should redirect to main app login page
    await expect(page).toHaveURL(/localhost:5173/);
    await expect(page.locator('text=/Sign in|Log in/i')).toBeVisible();

    // 2. Log in on the main app
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');

    // 3. Assert redirection back to the sub-app and authenticated state
    await expect(page).toHaveURL(/localhost:5174/);
    
    // Check for authenticated UI elements
    await expect(page.locator('text=/Welcome|Dashboard|Profile/i')).toBeVisible();
    
    // Ensure no login prompt is shown
    await expect(page.locator('text=/Sign in|Log in/i')).not.toBeVisible();

    // 4. Navigate to another sub-app and assert authenticated state
    await page.goto('http://localhost:5175'); // ReelHunter
    
    // Should remain authenticated without redirect
    await expect(page).toHaveURL(/localhost:5175/);
    await expect(page.locator('text=/Welcome|Dashboard|Profile/i')).toBeVisible();
    await expect(page.locator('text=/Sign in|Log in/i')).not.toBeVisible();
  });

  test('should handle logout across all apps', async ({ page }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // 2. Navigate to a sub-app
    await page.goto('http://localhost:5174'); // ReelCV
    await expect(page.locator('text=/Welcome|Dashboard|Profile/i')).toBeVisible();
    
    // 3. Logout from the sub-app
    await page.click('button:has-text("Logout"), button:has-text("Sign out")');
    
    // 4. Verify redirect to main app login
    await expect(page).toHaveURL(/localhost:5173/);
    await expect(page.locator('text=/Sign in|Log in/i')).toBeVisible();
    
    // 5. Navigate to another sub-app and verify not authenticated
    await page.goto('http://localhost:5175'); // ReelHunter
    await expect(page).toHaveURL(/localhost:5173/); // Should redirect to main app
    await expect(page.locator('text=/Sign in|Log in/i')).toBeVisible();
  });

  test('should persist authentication after page refresh', async ({ page }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // 2. Navigate to a sub-app
    await page.goto('http://localhost:5174'); // ReelCV
    await expect(page.locator('text=/Welcome|Dashboard|Profile/i')).toBeVisible();
    
    // 3. Refresh the page
    await page.reload();
    
    // 4. Should still be authenticated
    await expect(page).toHaveURL(/localhost:5174/);
    await expect(page.locator('text=/Welcome|Dashboard|Profile/i')).toBeVisible();
    await expect(page.locator('text=/Sign in|Log in/i')).not.toBeVisible();
  });

  test('should handle direct navigation to sub-app routes when authenticated', async ({ page }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // 2. Navigate directly to a specific route on a sub-app
    await page.goto('http://localhost:5174/dashboard'); // ReelCV dashboard
    
    // 3. Should remain authenticated and on the requested route
    await expect(page).toHaveURL(/localhost:5174\/dashboard/);
    await expect(page.locator('text=/Welcome|Dashboard|Profile/i')).toBeVisible();
    await expect(page.locator('text=/Sign in|Log in/i')).not.toBeVisible();
  });

  test('should handle expired sessions gracefully', async ({ page, context }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // 2. Clear session storage to simulate expired session
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // 3. Navigate to a sub-app
    await page.goto('http://localhost:5174'); // ReelCV
    
    // 4. Should redirect to main app login
    await expect(page).toHaveURL(/localhost:5173/);
    await expect(page.locator('text=/Sign in|Log in/i')).toBeVisible();
  });

  test('should handle multiple browser tabs with SSO', async ({ browser }) => {
    // Create two separate contexts (tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    try {
      // 1. Login in first tab on main app
      await page1.goto('http://localhost:5173');
      await page1.fill('input[type="email"]', testEmail);
      await page1.fill('input[type="password"]', testPassword);
      await page1.click('button[type="submit"]');
      
      await page1.waitForLoadState('networkidle');
      
      // 2. Open sub-app in second tab (should require login since different context)
      await page2.goto('http://localhost:5174'); // ReelCV
      
      // Should redirect to main app login
      await expect(page2).toHaveURL(/localhost:5173/);
      await expect(page2.locator('text=/Sign in|Log in/i')).toBeVisible();
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
}); 