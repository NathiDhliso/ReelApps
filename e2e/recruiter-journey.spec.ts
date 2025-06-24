import { test, expect } from '@playwright/test';

test.describe('Recruiter User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete recruiter signup and job posting flow', async ({ page }) => {
    // Step 1: Navigate to signup
    await page.click('text=Get Started');
    
    // Step 2: Fill out recruiter signup form
    await page.check('input[value="recruiter"]'); // Select recruiter role
    await page.fill('input[placeholder="Enter your first name"]', 'Jane');
    await page.fill('input[placeholder="Enter your last name"]', 'Smith');
    await page.fill('input[placeholder="Enter your email"]', 'jane.smith@company.com');
    await page.fill('input[placeholder="Create a password (min. 6 characters)"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Step 3: Complete recruiter onboarding
    await expect(page.locator('text=Welcome to ReelHunter!')).toBeVisible();
    
    await page.click('text=Next');
    await page.click('text=Next');
    await page.click('text=Next');
    await page.click('text=Get Started');
    
    // Step 4: Navigate to ReelHunter
    await page.click('text=ReelHunter');
    
    // Verify we're on the ReelHunter page
    await expect(page.locator('h1')).toContainText('ReelHunter');
    
    // Step 5: Create a job posting
    await page.click('text=Post New Job');
    
    // Fill out job posting form
    await page.fill('input[placeholder="e.g., Senior React Developer"]', 'Senior Python Developer');
    await page.fill('input[placeholder="Company name"]', 'Tech Innovations Inc');
    await page.fill('textarea[placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."]', 
      'We are seeking a senior Python developer to join our growing team. You will be responsible for building scalable web applications and mentoring junior developers.');
    
    // Add requirements
    await page.fill('input[placeholder="e.g., 3+ years of React experience"]', 'Python');
    await page.click('text=Add Requirement');
    await page.fill('input[placeholder="e.g., 3+ years of React experience"]:last-of-type', 'Django');
    
    await page.fill('input[placeholder="e.g., San Francisco, CA or Remote"]', 'San Francisco, CA');
    await page.fill('input[placeholder="80000"]', '120000');
    await page.fill('input[placeholder="120000"]', '160000');
    
    // Step 6: Analyze job with AI
    await page.click('text=Analyze with AI');
    
    // Wait for analysis to complete
    await expect(page.locator('text=AI Job Analysis')).toBeVisible();
    
    // Step 7: Create the job posting
    await page.click('text=Create Job Posting');
    
    // Verify job was created and we can see candidate matches
    await expect(page.locator('text=Candidate Matches')).toBeVisible();
  });

  test('recruiter can filter and sort candidates', async ({ page }) => {
    // Assume recruiter is logged in and has a job with candidates
    await page.goto('/reelhunter');
    
    // Switch to candidates tab
    await page.click('text=Candidate Pool');
    
    // Test filtering by location
    await page.fill('input[placeholder="Filter by location..."]', 'San Francisco');
    
    // Test sorting by different criteria
    await page.selectOption('select', 'skills_match');
    
    // Verify candidates are displayed
    await expect(page.locator('[data-testid="candidate-card"]')).toBeVisible();
    
    // Test viewing a candidate's ReelCV
    await page.click('text=View ReelCV', { first: true });
    
    // Should open in new tab/window - verify URL contains /reelcv/
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('text=View ReelCV', { first: true })
    ]);
    
    expect(newPage.url()).toContain('/reelcv/');
  });

  test('job posting AI analysis provides feedback', async ({ page }) => {
    await page.goto('/reelhunter');
    await page.click('text=Post New Job');
    
    // Fill out minimal job info
    await page.fill('input[placeholder="e.g., Senior React Developer"]', 'Developer');
    await page.fill('textarea[placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."]', 
      'Looking for a developer.');
    await page.fill('input[placeholder="e.g., 3+ years of React experience"]', 'Programming');
    
    // Trigger AI analysis
    await page.click('text=Analyze with AI');
    
    // Wait for analysis results
    await expect(page.locator('text=AI Job Analysis')).toBeVisible();
    
    // Check that scores are displayed
    await expect(page.locator('text=Clarity')).toBeVisible();
    await expect(page.locator('text=Realism')).toBeVisible();
    await expect(page.locator('text=Inclusivity')).toBeVisible();
    
    // Check that suggestions are provided
    await expect(page.locator('text=Suggestions for Improvement')).toBeVisible();
  });
});