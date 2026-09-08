import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly table: Locator;
  readonly totalHeading: Locator;
  readonly placeOrderButton: Locator;
  readonly deleteLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('#tbodyid');
    this.totalHeading = page.locator('#totalp');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.deleteLinks = page.getByRole('link', { name: 'Delete' });
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/.*cart\.html/);
    await expect(this.placeOrderButton).toBeVisible();
  }

  productRow(productName: string): Locator {
    return this.page.locator('#tbodyid tr', { hasText: productName });
  }

  async expectProductVisible(productName: string, price?: string) {
    await expect(this.productRow(productName)).toBeVisible();
    if (price) {
      await expect(this.productRow(productName)).toContainText(price);
    }
  }

  async expectEmpty() {
    await expect(this.table).not.toContainText('Samsung');
    await expect(this.table).not.toContainText('Nexus');
    await expect(this.table).not.toContainText('Apple');
  }

  async deleteProduct(productName: string) {
    await this.productRow(productName).getByRole('link', { name: 'Delete' }).click();
  }

  async expectTotal(expected: string) {
    await expect(this.totalHeading).toHaveText(expected);
  }

  async expectTotalEmpty() {
    // After delete, total is empty string
    await expect(this.totalHeading).toBeEmpty();
  }
}
