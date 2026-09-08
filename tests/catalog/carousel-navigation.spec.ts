// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';

test.describe('Catalog and Navigation', () => {
  test('carousel-navigation', async ({ page }) => {
    const home = new HomePage(page);

    // 1. Verify carousel image "First slide" is visible on load
    await expect(page.getByRole('img', { name: 'First slide' })).toBeVisible();
    await expect(home.carouselNextButton).toBeVisible();
    await expect(home.carouselPrevButton).toBeVisible();

    // 2. Click button "Next" in carousel
    await home.carouselNextButton.click();
    // expect: image with alt "Second slide" becomes visible (or "Third slide" after second click)
    // carousel uses active class on .carousel-item, check second slide visible
    await expect(page.getByRole('img', { name: 'Second slide' })).toBeVisible();

    // 3. Click button "Previous" in carousel
    await home.carouselPrevButton.click();
    // expect: image with alt "First slide" visible again
    await expect(page.getByRole('img', { name: 'First slide' })).toBeVisible();
  });
});
