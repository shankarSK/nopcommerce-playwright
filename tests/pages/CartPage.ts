import { Page } from '@playwright/test';
import { parseCurrencyText } from './utils';

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Removes all items from the cart. */
  async clear(): Promise<void> {
    await this.goto();
    let removeBtn = this.page.locator('button.remove-btn').first();
    while (await removeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await removeBtn.click();
      await this.page.waitForLoadState('domcontentloaded');
      removeBtn = this.page.locator('button.remove-btn').first();
    }
  }

  /** Returns the cart sub-total as a number. */
  async getSubtotal(): Promise<number> {
    await this.goto();
    const subtotalCell = this.page
      .locator('.cart-total tr')
      .filter({ hasText: /Sub-?Total/i })
      .locator('td')
      .last();
    const text = (await subtotalCell.textContent()) ?? '0';
    return parseCurrencyText(text);
  }

  /** Accepts the terms of service (if shown) and clicks "Proceed to checkout". */
  async proceedToCheckout(): Promise<void> {
    await this.goto();
    const terms = this.page.locator('#termsofservice');
    if (await terms.isVisible()) {
      await terms.check();
    }
    await this.page.locator('.checkout-button').click();
    await this.page.waitForURL(/checkout/, { timeout: 15_000 });
  }
}
