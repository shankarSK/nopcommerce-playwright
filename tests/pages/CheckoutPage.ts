import { Page, expect } from '@playwright/test';
import { ShippingMethod } from '../test-data/us1-order-shipping.data';
import { parseCurrencyText } from './utils';

export interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  zipCode: string;
  phoneNumber: string;
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  /**
   * Fills the billing address form (if the new-address form is visible),
   * then advances past billing and shipping address steps via the nopCommerce
   * OPC JavaScript API. Waits until the shipping method list is visible.
   */
  async advanceThroughAddressSteps(address: BillingAddress): Promise<void> {
    await this._fillBillingIfRequired(address);

    await this.page.evaluate(() => (window as any).Billing.save());
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

    const shippingStep = this.page.locator('#checkout-step-shipping');
    if (await shippingStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await this.page.evaluate(() => (window as any).Shipping.save());
      await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    }

    const methodList = this.page.locator('.method-list');
    const isVisible = await methodList.isVisible({ timeout: 15_000 }).catch(() => false);

    if (!isVisible) {
      // Debug: dump the current URL and the checkout step HTML
      const url = this.page.url();
      const stepShippingMethod = await this.page.locator('#checkout-step-shipping-method').innerHTML().catch(() => '(not found)');
      const stepBilling = await this.page.locator('#checkout-step-billing').innerHTML().catch(() => '(not found)');
      const stepShipping = await this.page.locator('#checkout-step-shipping').innerHTML().catch(() => '(not found)');
      console.error(`[DEBUG] URL: ${url}`);
      console.error(`[DEBUG] billing step: ${stepBilling.slice(0, 500)}`);
      console.error(`[DEBUG] shipping step: ${stepShipping.slice(0, 500)}`);
      console.error(`[DEBUG] shipping-method step: ${stepShippingMethod.slice(0, 1000)}`);
    }

    await expect(methodList).toBeVisible({ timeout: 0 });
  }

  /**
   * Finds the shipping method whose name matches, selects its radio button,
   * and returns the fee parsed from the label (e.g. "Ground ($0.00)" → 0).
   */
  async selectShippingMethod(method: ShippingMethod): Promise<number> {
    const options = this.page.locator('.method-list li');
    const count = await options.count();
    let matchedIndex = -1;

    for (let i = 0; i < count; i++) {
      const text = (await options.nth(i).textContent()) ?? '';
      if (text.toLowerCase().includes(method.name.toLowerCase())) {
        matchedIndex = i;
        break;
      }
    }

    expect(
      matchedIndex,
      `Shipping method "${method.name}" should be listed on the page`,
    ).toBeGreaterThanOrEqual(0);

    const matched = options.nth(matchedIndex);
    await matched.locator('input[type="radio"]').check();

    const labelText = (await matched.locator('label').textContent()) ?? '';
    return parseCurrencyText(labelText);
  }

  /**
   * Returns the sub-total shown in the checkout order summary.
   * (On the shipping-method step, only the sub-total is displayed.)
   */
  async getSubtotal(): Promise<number> {
    const text = (await this.page.locator('.totals').textContent()) ?? '';
    return parseCurrencyText(text);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async _fillBillingIfRequired(address: BillingAddress): Promise<void> {
    const dropdown = this.page.locator('#billing-address-select');
    if (await dropdown.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const options = await dropdown.locator('option').allTextContents();
      const existingIdx = options.findIndex(
        (t) => t.trim() !== '' && !t.includes('New Address') && !t.includes('Select'),
      );
      await dropdown.selectOption(
        existingIdx >= 0 ? { index: existingIdx } : { label: 'New Address' },
      );
      await this.page.waitForTimeout(800);
    }

    const firstNameInput = this.page.locator('#BillingNewAddress_FirstName');
    if (!(await firstNameInput.isVisible({ timeout: 2_000 }).catch(() => false))) return;

    await firstNameInput.fill(address.firstName);
    await this.page.locator('#BillingNewAddress_LastName').fill(address.lastName);
    await this.page.locator('#BillingNewAddress_Email').fill(address.email);
    await this.page.locator('#BillingNewAddress_CountryId').selectOption({ label: 'United States of America' });
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await this.page.locator('#BillingNewAddress_StateProvinceId').selectOption({ label: 'New York' });
    await this.page.locator('#BillingNewAddress_City').fill(address.city);
    await this.page.locator('#BillingNewAddress_Address1').fill(address.address1);
    await this.page.locator('#BillingNewAddress_ZipPostalCode').fill(address.zipCode);
    await this.page.locator('#BillingNewAddress_PhoneNumber').fill(address.phoneNumber);
  }
}
