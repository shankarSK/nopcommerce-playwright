import { Page, expect } from '@playwright/test';
import { Product } from '../test-data/us1-order-shipping.data';
import { parseCurrencyText } from './utils';

/** Maps product.category to the nopCommerce leaf-category URL that lists actual products. */
const CATEGORY_URLS: Record<string, string> = {
  Computers: '/notebooks',
  Electronics: '/cell-phones',
  Apparel: '/clothing',
  Books: '/books',
  'Digital downloads': '/digital-downloads',
};

export class CategoryPage {
  constructor(private readonly page: Page) {}

  /**
   * Navigates to the product's category, selects the best matching item
   * (by name first, then first simple product), and adds it to the cart
   * via the quick-add button.
   *
   * Returns the unit price of the product added.
   */
  async addProductToCart(product: Product): Promise<number> {
    const url = CATEGORY_URLS[product.category] ?? `/${product.category.toLowerCase()}`;
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');

    const items = this.page.locator('.product-item');
    await expect(items.first()).toBeVisible({ timeout: 10_000 });
    const count = await items.count();

    let chosenIdx = await this._findByName(items, count, product.name);

    if (chosenIdx < 0) {
      chosenIdx = await this._findFirstSimple(items, count);
    }

    expect(
      chosenIdx,
      `Could not find an addable product in category "${product.category}"`,
    ).toBeGreaterThanOrEqual(0);

    const chosen = items.nth(chosenIdx);
    const priceText = (await chosen.locator('.price.actual-price').textContent()) ?? '0';
    const unitPrice = parseCurrencyText(priceText);

    await chosen.locator('.product-box-add-to-cart-button').click();
    await this._dismissNotification();

    return unitPrice;
  }

  private async _findByName(items: ReturnType<Page['locator']>, count: number, name: string): Promise<number> {
    const keyword = name.split(' ')[0].toLowerCase();
    for (let i = 0; i < count; i++) {
      const title = (await items.nth(i).locator('.product-title a').textContent()) ?? '';
      if (title.toLowerCase().includes(keyword)) return i;
    }
    return -1;
  }

  private async _findFirstSimple(items: ReturnType<Page['locator']>, count: number): Promise<number> {
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const priceText = ((await item.locator('.price.actual-price').textContent()) ?? '').trim();
      const hasQuickAdd = (await item.locator('.product-box-add-to-cart-button').count()) > 0;
      if (hasQuickAdd && priceText && !priceText.toLowerCase().startsWith('from')) {
        return i;
      }
    }
    return -1;
  }

  private async _dismissNotification(): Promise<void> {
    const closeBtn = this.page.locator('.bar-notification .close');
    await closeBtn.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }
}
