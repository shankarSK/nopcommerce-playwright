import { test, expect } from '@playwright/test';

test('Contact us page loads and shows the form', async ({ page }) => {
  await page.goto('/contactus');

  // The form input classes are defined in the view (ContactUs.cshtml).
  await expect(page.locator('input.fullname')).toBeVisible();
  await expect(page.locator('input.email')).toBeVisible();
  await expect(page.locator('textarea.enquiry')).toBeVisible();
  await expect(page.locator('button.contact-us-button')).toBeVisible();
});

