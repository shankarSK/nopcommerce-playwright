import { Page, expect } from '@playwright/test';

export interface CustomerCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class LoginPage {
  constructor(private readonly page: Page) {}

  /** Navigates to the login page and asserts all form elements are visible. */
  async verifyLoginPageLoaded(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.locator('input[name="Email"]')).toBeVisible();
    await expect(this.page.locator('input[name="Password"]')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Log in' })).toBeVisible();
  }

  /** Registers the account if it doesn't exist, then logs in. */
  async loginOrRegister(customer: CustomerCredentials): Promise<void> {
    await this._attemptLogin(customer);

    if (this.page.url().includes('/login')) {
      await this._register(customer);
      await this._attemptLogin(customer);
    }

    await expect(
      this.page.locator('.header-links a[href*="customer/info"]').first(),
    ).toBeVisible({ timeout: 10_000 });
  }

  private async _attemptLogin(customer: CustomerCredentials): Promise<void> {
    await this.page.goto('/login');
    await this.page.locator('input[name="Email"]').fill(customer.email);
    await this.page.locator('input[name="Password"]').fill(customer.password);
    await this.page.locator('button.login-button').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  private async _register(customer: CustomerCredentials): Promise<void> {
    await this.page.goto('/register');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('#FirstName').fill(customer.firstName);
    await this.page.locator('#LastName').fill(customer.lastName);
    await this.page.locator('#Email').fill(customer.email);
    await this.page.locator('#Password').fill(customer.password);
    await this.page.locator('#ConfirmPassword').fill(customer.password);
    await this.page.locator('button[name="register-button"]').click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
