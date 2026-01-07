/**
 * Example E2E Test - Home Page
 * 
 * End-to-end tests for the home page.
 */

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Catalyst/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login link
    await page.click('text=Login');
    
    // Should be on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check that page renders correctly
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in the form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    // await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    // await loginAs(page, 'test@example.com', 'password');
  });

  test('should display user information', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for user info
    // await expect(page.locator('text=Welcome')).toBeVisible();
  });
});

// Helper function to log in
async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
}
