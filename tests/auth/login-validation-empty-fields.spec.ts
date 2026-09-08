// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { AuthModals } from '../../pages/Modals';

test.describe('Authentication Modals', () => {
  test('login-validation-empty-fields', async ({ page }) => {
    const home = new HomePage(page);
    const auth = new AuthModals(page);

    // 1. Click link "Log in" in navbar
    await home.openLogin();
    // expect: dialog with heading "Log in" visible, textboxes "Username:" and "Password:" visible
    await auth.expectLoginVisible();

    // 2. Click button "Log in" with empty fields
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please fill out Username and Password.');
      await dialog.accept();
    });
    await auth.loginButton.click();
    // expect: native alert with message "Please fill out Username and Password." appears

    // 3. Accept alert then click button "Close" (×) to dismiss modal
    // need to close modal after alert
    await auth.closeLogin();
    // expect: alert dismissed, after closing dialog is hidden, homepage grid visible
    await expect(auth.loginModal).toBeHidden({ timeout: 5000 });
    await expect(home.productLink('Samsung galaxy s6')).toBeVisible();
  });
});
