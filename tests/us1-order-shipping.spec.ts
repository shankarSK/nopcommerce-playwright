import { test, expect } from '@playwright/test';
import {
  TEST_CUSTOMER,
  TEST_ADDRESS,
  US1_TEST_SCENARIOS,
} from './test-data/us1-order-shipping.data';
import { LoginPage } from './pages/LoginPage';
import { CartPage } from './pages/CartPage';
import { CategoryPage } from './pages/CategoryPage';
import { CheckoutPage } from './pages/CheckoutPage';

test.describe('US1: Order Products with Different Shipping Methods', () => {
  // Serial — all scenarios share the same demo account and cart
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginOrRegister(TEST_CUSTOMER);
    await new CartPage(page).clear();
  });

  for (const { shippingMethod, products } of US1_TEST_SCENARIOS) {
    const productNames = products.map((p) => p.name).join(', ');

    test(`[${shippingMethod.name}] ${productNames}`, async ({ page }) => {
      const categoryPage = new CategoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      // ── Add all products to cart ────────────────────────────────────────
      for (const product of products) {
        await categoryPage.addProductToCart(product);
      }

      // ── Capture the cart sub-total before entering checkout ─────────────
      const cartSubtotal = await cartPage.getSubtotal();
      expect(cartSubtotal, 'Cart subtotal should be greater than 0').toBeGreaterThan(0);

      // ── Navigate through checkout to the shipping method step ────────────
      await cartPage.proceedToCheckout();
      await checkoutPage.advanceThroughAddressSteps(TEST_ADDRESS);

      // ── Select the target shipping method and verify its displayed fee ───
      const displayedFee = await checkoutPage.selectShippingMethod(shippingMethod);

      expect(
        displayedFee,
        `Displayed fee for "${shippingMethod.name}" should be $${shippingMethod.fee}`,
      ).toBe(shippingMethod.fee);

      // ── Verify checkout sub-total matches what we read from the cart ─────
      const displayedSubtotal = await checkoutPage.getSubtotal();

      expect(
        displayedSubtotal,
        `Checkout sub-total ($${displayedSubtotal}) should match cart sub-total ($${cartSubtotal})`,
      ).toBeCloseTo(cartSubtotal, 2);
    });
  }
});
