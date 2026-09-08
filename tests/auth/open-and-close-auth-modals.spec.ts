// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { AuthModals } from '../../pages/Modals';

test.describe('Authentication Modals', () => {
  test('open-and-close-auth-modals', async ({ page }) => {
    const home = new HomePage(page);
    const auth = new AuthModals(page);

    // 1. Click link "Log in"
    await home.openLogin();
    // expect: dialog "Log in" visible
    await auth.expectLoginVisible();

    // 2. Click button "Close" in Log in modal
    await auth.closeLogin();
    // expect: dialog hidden, link "Log in" still visible in navbar
    await expect(auth.loginModal).toBeHidden({ timeout: 5000 });
    await expect(home.loginLink).toBeVisible();

    // 3. Click link "Sign up"
    await home.openSignup();
    // expect: dialog "Sign up" visible
    await auth.expectSignUpVisible();

    // 4. Click button "Close" (×) in Sign up modal header
    await auth.closeSignUp();
    // expect: dialog hidden, homepage content visible
    await expect(auth.signUpModal).toBeHidden({ timeout: 5000 });
    await expect(home.categoriesHeader).toBeVisible();
  });
});
