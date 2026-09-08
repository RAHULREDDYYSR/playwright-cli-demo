import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly brandLink: Locator;
  readonly homeLink: Locator;
  readonly contactLink: Locator;
  readonly aboutUsLink: Locator;
  readonly cartLink: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly categoriesHeader: Locator;
  readonly phonesLink: Locator;
  readonly laptopsLink: Locator;
  readonly monitorsLink: Locator;
  readonly carouselNextButton: Locator;
  readonly carouselPrevButton: Locator;
  readonly carouselImages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandLink = page.getByRole('link', { name: 'PRODUCT STORE' });
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.contactLink = page.getByRole('link', { name: 'Contact', exact: true });
    this.aboutUsLink = page.getByRole('link', { name: 'About us', exact: true });
    this.cartLink = page.getByRole('link', { name: 'Cart', exact: true });
    this.loginLink = page.getByRole('link', { name: 'Log in', exact: true });
    this.signupLink = page.getByRole('link', { name: 'Sign up', exact: true });
    this.categoriesHeader = page.getByText('CATEGORIES');
    this.phonesLink = page.getByRole('link', { name: 'Phones', exact: true });
    this.laptopsLink = page.getByRole('link', { name: 'Laptops', exact: true });
    this.monitorsLink = page.getByRole('link', { name: 'Monitors', exact: true });
    this.carouselNextButton = page.locator('#carouselExampleIndicators').getByRole('button', { name: 'Next' });
    this.carouselPrevButton = page.locator('#carouselExampleIndicators').getByRole('button', { name: 'Previous' });
    this.carouselImages = page.locator('#carouselExampleIndicators img');
  }

  async goto() {
    await this.page.goto('/');
  }

  async filterByCategory(category: 'Phones' | 'Laptops' | 'Monitors') {
    await this.page.getByRole('link', { name: category, exact: true }).click();
  }

  async openProduct(productName: string) {
    await this.page.getByRole('link', { name: productName, exact: true }).click();
  }

  productLink(productName: string): Locator {
    return this.page.getByRole('link', { name: productName, exact: true });
  }

  productPrice(price: string): Locator {
    return this.page.getByRole('heading', { name: price });
  }

  async goHome() {
    await this.homeLink.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async openContact() {
    await this.contactLink.click();
  }

  async openAboutUs() {
    await this.aboutUsLink.click();
  }

  async openLogin() {
    await this.loginLink.click();
  }

  async openSignup() {
    await this.signupLink.click();
  }

  async expectLoaded() {
    await expect(this.categoriesHeader).toBeVisible();
    await expect(this.page.locator('#tbodyid')).toBeVisible();
  }
}
