// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { AuthModals } from '../../pages/Modals';

test.describe('Authentication Modals', () => {
  test('signup-validation-empty-fields', async ({ page }) => {
    const home = new HomePage(page);
    const auth = new AuthModals(page);

    // 1. Click link "Sign up" in navbar
    await home.openSignup();
    // expect: dialog with heading "Sign up" visible, textboxes "Username:" and "Password:" visible, button "Sign up" visible
    await auth.expectSignUpVisible();

    // 2. Click button "Sign up" without filling fields
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please fill out Username and Password.');
      await dialog.accept();
    });
    await auth.signUpButton.click();
    // expect: native alert with message "Please fill out Username and Password." appears - handled above

    // 3. Accept alert handled, expect dialog remains open
    // expect: dialog "Sign up" remains open, no navigation
    await expect(auth.signUpModal).toBeVisible();
    await expect(page).toHaveURL(/.*index\.html|.*demoblaze\.com\/?.*/);
  });
});
