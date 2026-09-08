import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly addToCartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productTitle = page.locator('h2');
    this.productPrice = page.locator('h3.price-container');
    this.productDescription = page.locator('#more-information');
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
  }

  async expectLoaded(productName: string) {
    await expect(this.productTitle).toHaveText(productName);
    await expect(this.productPrice).toBeVisible();
    await expect(this.addToCartLink).toBeVisible();
  }

  async addToCartAndAcceptAlert(): Promise<string> {
    const dialogPromise = this.page.waitForEvent('dialog');
    await this.addToCartLink.click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    return message;
  }

  async addToCartExpectAlert(expectedMessage = 'Product added') {
    const message = await this.addToCartAndAcceptAlert();
    expect(message).toBe(expectedMessage);
  }
}
