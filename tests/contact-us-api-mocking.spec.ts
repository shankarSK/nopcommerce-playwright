import { test, expect } from '@playwright/test';

const SUCCESS_TEXT = 'Your enquiry has been successfully sent to the store owner.';

test('Contact us form submission (API mocked POST) shows success', async ({ page }) => {
  // Intercept the form POST and return a deterministic success HTML.
  // This keeps the test stable (no CAPTCHA/email sending required).
  await page.route('**/contactus*', async (route) => {
    const req = route.request();
    if (req.method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: `<!doctype html>
        <html>
          <head><title>Contact us</title></head>
          <body>
            <div class="result">${SUCCESS_TEXT}</div>
          </body>
        </html>`,
    });
  });

  await page.goto('/contactus');

  await page.locator('input.fullname').fill('Shankar');
  await page.locator('input.email').fill('shankar@example.com');

  // Subject is optional depending on store settings.
  const subject = page.locator('input.subject');
  if (await subject.isVisible()) {
    await subject.fill('Playwright E2E - Contact Us');
  }

  await page.locator('textarea.enquiry').fill('Interested in your QA automation services.');
  await page.locator('button.contact-us-button').click();

  await expect(page.locator('.result')).toContainText(SUCCESS_TEXT);
});

