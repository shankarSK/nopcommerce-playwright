import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('Open nopCommerce and navigate to login page', async ({ page }) => {
  await new LoginPage(page).verifyLoginPageLoaded();
});
