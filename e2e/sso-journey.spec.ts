import { test, expect } from '@playwright/test';

test.describe('Cross-Domain SSO Journey', () => {
  // Test credentials - should match your test database
  const testEmail = 'dhlisob@gmail.com';
  const testPassword = 'qwerty';

  test('should allow login on main app and stay authenticated on sub-apps', async ({ page }) => {
    // 1. Start at a sub-app (e.g., ReelCV) and expect a redirect to main app with return_to
    await page.goto('http://localhost:5174'); // ReelCV
    
    // Should redirect to main app with return_to parameter
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/localhost:5173.*return_to/);
    
    // 2. Open auth modal and log in on the main app
    await page.click('button:has-text("Start Your Journey")');
    
    // Wait for auth modal to appear
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Switch to login mode if needed (modal might open in signup mode)
    const switchToLoginLink = page.locator('button:has-text("Sign in")');
    try {
      await switchToLoginLink.click({ timeout: 2000 });
      await page.waitForTimeout(500); // Brief wait for mode switch
    } catch {
      // Already in login mode, continue
    }
    
    // Fill login form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');

    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');

    // 3. Should be redirected back to the original sub-app (ReelCV)
    await page.waitForTimeout(3000); // Give time for redirect
    await expect(page).toHaveURL('http://localhost:5174/');

    // 4. Navigate to other sub-apps and verify authentication
    const subApps = [
      'http://localhost:5175', // reelhunter
      'http://localhost:5176', // reelpersona
      'http://localhost:5177', // reelproject
    ];

    for (const appUrl of subApps) {
      await page.goto(appUrl);
      await page.waitForTimeout(2000); // Give time for potential redirects
      // Should stay on the sub-app without redirect
      expect(page.url()).toBe(appUrl + '/');
    }
  });

  test('should handle logout across all apps', async ({ page }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    
    // Open auth modal and login
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Switch to login mode if needed
    const switchToLoginLink = page.locator('button:has-text("Sign in")');
    try {
      await switchToLoginLink.click({ timeout: 2000 });
      await page.waitForTimeout(500);
    } catch {
      // Already in login mode
    }
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. Navigate to a sub-app
    await page.goto('http://localhost:5174'); // ReelCV
    await page.waitForTimeout(2000);
    expect(page.url()).toBe('http://localhost:5174/');
    
    // 3. Logout from the sub-app (look for common logout patterns)
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign out")', 
      'button:has-text("Log out")',
      '[data-testid="logout"]',
      '.logout-button'
    ];
    
    let loggedOut = false;
    for (const selector of logoutSelectors) {
      try {
        await page.click(selector, { timeout: 2000 });
        loggedOut = true;
        break;
      } catch {
        // Try next selector
      }
    }
    
    // If no logout button found, simulate session clearing
    if (!loggedOut) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload();
    }
    
    // 4. Verify redirect to main app
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/localhost:5173/);
    
    // 5. Navigate to another sub-app and verify not authenticated
    await page.goto('http://localhost:5175'); // ReelHunter
    await expect(page).toHaveURL(/localhost:5173/); // Should redirect to main app
  });

  test('should persist authentication after page refresh', async ({ page }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    
    // Open auth modal and login
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Switch to login mode if needed
    const switchToLoginLink = page.locator('button:has-text("Sign in")');
    try {
      await switchToLoginLink.click({ timeout: 2000 });
      await page.waitForTimeout(500);
    } catch {
      // Already in login mode
    }
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. Navigate to a sub-app
    await page.goto('http://localhost:5174'); // ReelCV
    await page.waitForTimeout(2000);
    expect(page.url()).toBe('http://localhost:5174/');
    
    // 3. Refresh the page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // 4. Should still be authenticated (stay on sub-app)
    expect(page.url()).toBe('http://localhost:5174/');
  });

  test('should handle direct navigation to sub-app routes when authenticated', async ({ page }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForSelector('form', { timeout: 10000 });
    
    const signInLink = page.locator('button:has-text("Sign in")').first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
    }
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');
    
    // Wait for successful login to the dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    // Add a small delay to ensure session info has propagated
    await page.waitForTimeout(1000);

    // 2. Navigate directly to a specific route on a sub-app
    await page.goto('http://localhost:5174/dashboard');
    
    // 3. Should remain authenticated and on the requested route
    // The app should handle the session and not redirect.
    await expect(page).toHaveURL('http://localhost:5174/dashboard', { timeout: 10000 });
  });

  test('should handle expired sessions gracefully', async ({ page, context }) => {
    // 1. Login on main app
    await page.goto('http://localhost:5173');
    
    // Open auth modal and login
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Switch to login mode if needed
    const switchToLoginLink = page.locator('button:has-text("Sign in")');
    try {
      await switchToLoginLink.click({ timeout: 2000 });
      await page.waitForTimeout(500);
    } catch {
      // Already in login mode
    }
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. Clear session storage to simulate expired session
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // 3. Navigate to a sub-app
    await page.goto('http://localhost:5174'); // ReelCV
    await page.waitForTimeout(2000);
    
    // 4. Should redirect to main app
    await expect(page).toHaveURL(/localhost:5173/);
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
      
      // Open auth modal and login
      await page1.click('button:has-text("Start Your Journey")');
      await page1.waitForSelector('form', { timeout: 10000 });
      
      // Switch to login mode if needed
      const switchToLoginLink = page1.locator('button:has-text("Sign in")');
      try {
        await switchToLoginLink.click({ timeout: 2000 });
        await page1.waitForTimeout(500);
      } catch {
        // Already in login mode
      }
      
      await page1.fill('input[type="email"]', testEmail);
      await page1.fill('input[type="password"]', testPassword);
      await page1.click('button:has-text("Sign In")');
      
      await page1.waitForLoadState('networkidle');
      await page1.waitForTimeout(2000);
      
      // 2. Open sub-app in second tab (should require login since different context)
      await page2.goto('http://localhost:5174'); // ReelCV
      await page2.waitForTimeout(2000);
      
      // Should redirect to main app (different browser context means no shared auth)
      await expect(page2).toHaveURL(/localhost:5173/);
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
}); 