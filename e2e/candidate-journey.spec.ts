import { test, expect } from '@playwright/test';

test.describe('Candidate User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete candidate signup and profile creation flow', async ({ page }) => {
    // Step 1: Navigate to signup
    await page.click('text=Get Started');
    
    // Verify we're on the signup form
    await expect(page.locator('h1')).toContainText('Create Your Account');
    
    // Step 2: Fill out signup form
    await page.check('input[value="candidate"]'); // Select candidate role
    await page.fill('input[placeholder="Enter your first name"]', 'John');
    await page.fill('input[placeholder="Enter your last name"]', 'Doe');
    await page.fill('input[placeholder="Enter your email"]', 'john.doe@example.com');
    await page.fill('input[placeholder="Create a password (min. 6 characters)"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    
    // Submit signup form
    await page.click('button[type="submit"]');
    
    // Step 3: Verify onboarding starts
    await expect(page.locator('text=Welcome to ReelCV!')).toBeVisible();
    
    // Complete onboarding
    await page.click('text=Next');
    await page.click('text=Next');
    await page.click('text=Next');
    await page.click('text=Get Started');
    
    // Step 4: Navigate to skills management
    await page.click('text=ReelSkills');
    
    // Verify we're on the skills page
    await expect(page.locator('h1')).toContainText('ReelSkills');
    
    // Step 5: Add a skill
    await page.click('text=Add Skill');
    
    await page.fill('input[placeholder="e.g., React, Leadership, Spanish"]', 'React');
    await page.selectOption('select', 'technical');
    await page.fill('input[type="number"]', '3');
    await page.fill('textarea[placeholder="Describe your experience with this skill..."]', 'Frontend development with React and Redux');
    
    await page.click('text=Add Skill');
    
    // Verify skill was added
    await expect(page.locator('text=React')).toBeVisible();
    await expect(page.locator('text=3 years experience')).toBeVisible();
    
    // Step 6: View ReelCV showcase
    // This would typically be accessed via a direct URL
    // For testing, we'll simulate the URL structure
    const candidateId = 'test-candidate-id'; // In real test, this would be dynamic
    await page.goto(`/reelcv/${candidateId}`);
    
    // Verify ReelCV page loads (even if data is mock)
    await expect(page.locator('text=ReelCV')).toBeVisible();
  });

  test('candidate can manage skills', async ({ page }) => {
    // Assume user is already logged in (setup in beforeEach or separate test)
    await page.goto('/reelskills');
    
    // Add a skill
    await page.click('text=Add Skill');
    await page.fill('input[placeholder="e.g., React, Leadership, Spanish"]', 'Python');
    await page.selectOption('select', 'technical');
    await page.fill('input[type="number"]', '5');
    await page.click('text=Add Skill');
    
    // Verify skill appears
    await expect(page.locator('text=Python')).toBeVisible();
    
    // Edit the skill
    await page.click('text=Edit', { first: true });
    await page.fill('input[type="number"]', '6');
    await page.click('text=Update Skill');
    
    // Verify update
    await expect(page.locator('text=6 years experience')).toBeVisible();
    
    // Delete the skill
    await page.click('text=Delete', { first: true });
    
    // Confirm deletion in dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Verify skill is removed
    await expect(page.locator('text=Python')).not.toBeVisible();
  });

  test('candidate profile completion tracking', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check initial completion score
    const completionElement = page.locator('[data-testid="completion-score"]');
    const initialScore = await completionElement.textContent();
    
    // Add skills to improve completion
    await page.goto('/reelskills');
    await page.click('text=Add Skill');
    await page.fill('input[placeholder="e.g., React, Leadership, Spanish"]', 'JavaScript');
    await page.selectOption('select', 'technical');
    await page.click('text=Add Skill');
    
    // Return to dashboard and check improved score
    await page.goto('/dashboard');
    const newScore = await completionElement.textContent();
    
    // Score should have improved (this is a basic check)
    expect(newScore).not.toBe(initialScore);
  });
});