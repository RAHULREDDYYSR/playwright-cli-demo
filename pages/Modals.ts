import { Page, Locator, expect } from '@playwright/test';

export class AuthModals {
  constructor(private page: Page) {}

  // Sign up modal: #signInModal
  get signUpModal(): Locator {
    return this.page.locator('#signInModal');
  }
  get signUpUsername(): Locator {
    return this.page.locator('#sign-username');
  }
  get signUpPassword(): Locator {
    return this.page.locator('#sign-password');
  }
  get signUpButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign up' });
  }

  // Log in modal: #logInModal
  get loginModal(): Locator {
    return this.page.locator('#logInModal');
  }
  get loginUsername(): Locator {
    return this.page.locator('#loginusername');
  }
  get loginPassword(): Locator {
    return this.page.locator('#loginpassword');
  }
  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Log in' }).last();
  }

  async expectSignUpVisible() {
    await expect(this.signUpModal).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
    await expect(this.signUpButton).toBeVisible();
  }

  async expectLoginVisible() {
    await expect(this.loginModal).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async closeSignUp() {
    await this.signUpModal.getByLabel('Close').click().catch(async () => {
      await this.page.locator('#signInModal .close').first().click();
    });
  }

  async closeLogin() {
    await this.loginModal.getByLabel('Close').click().catch(async () => {
      await this.page.locator('#logInModal .close').first().click();
    });
  }
}

export class ContactModal {
  constructor(private page: Page) {}
  get modal(): Locator {
    return this.page.locator('#exampleModal');
  }
  get emailInput(): Locator {
    return this.page.locator('#recipient-email');
  }
  get nameInput(): Locator {
    return this.page.locator('#recipient-name');
  }
  get messageInput(): Locator {
    return this.page.locator('#message-text');
  }
  get sendButton(): Locator {
    return this.page.getByRole('button', { name: 'Send message' });
  }

  async expectVisible() {
    await expect(this.modal).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'New message' })).toBeVisible();
  }
}

export class AboutUsModal {
  constructor(private page: Page) {}
  get modal(): Locator {
    return this.page.locator('#videoModal');
  }
  get playButton(): Locator {
    return this.page.getByRole('button', { name: 'Play Video' });
  }
  get closeButton(): Locator {
    return this.modal.getByRole('button', { name: 'Close', exact: true }).last();
  }

  async expectVisible() {
    await expect(this.modal).toBeVisible();
    await expect(this.modal.getByRole('heading', { name: 'About us', exact: true })).toBeVisible();
  }
}

export class PlaceOrderModal {
  constructor(private page: Page) {}
  get modal(): Locator {
    return this.page.locator('#orderModal');
  }
  get nameInput(): Locator {
    return this.page.locator('#name');
  }
  get countryInput(): Locator {
    return this.page.locator('#country');
  }
  get cityInput(): Locator {
    return this.page.locator('#city');
  }
  get cardInput(): Locator {
    return this.page.locator('#card');
  }
  get monthInput(): Locator {
    return this.page.locator('#month');
  }
  get yearInput(): Locator {
    return this.page.locator('#year');
  }
  get purchaseButton(): Locator {
    return this.page.getByRole('button', { name: 'Purchase' });
  }
  get closeButton(): Locator {
    return this.modal.getByRole('button', { name: 'Close', exact: true }).last();
  }
  get totalLabel(): Locator {
    // Text like "Total: 360"
    return this.page.locator('#orderModal').getByText(/Total:/);
  }
  get successModal(): Locator {
    return this.page.locator('.sweet-alert');
  }

  async expectVisible(expectedTotal?: string) {
    await expect(this.modal).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Place order' })).toBeVisible();
    if (expectedTotal) {
      await expect(this.totalLabel).toContainText(expectedTotal);
    }
  }

  async fillOrder(data: { name: string; country: string; city: string; card: string; month: string; year: string }) {
    await this.nameInput.fill(data.name);
    await this.countryInput.fill(data.country);
    await this.cityInput.fill(data.city);
    await this.cardInput.fill(data.card);
    await this.monthInput.fill(data.month);
    await this.yearInput.fill(data.year);
  }

  async expectSuccessVisible(expected: { amount: string; card: string; name: string }) {
    await expect(this.successModal).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Thank you for your purchase!' })).toBeVisible();
    await expect(this.successModal).toContainText(`Amount: ${expected.amount} USD`);
    await expect(this.successModal).toContainText(`Card Number: ${expected.card}`);
    await expect(this.successModal).toContainText(`Name: ${expected.name}`);
  }
}
