// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';

test.describe('Catalog and Navigation', () => {
  test('filter-by-laptop-category', async ({ page }) => {
    const home = new HomePage(page);

    // 1. Click link "Laptops" in categories sidebar
    await home.filterByCategory('Laptops');
    // expect: grid shows "Sony vaio i5", "Sony vaio i7", "MacBook air", "Dell i7 8gb"
    await expect(home.productLink('Sony vaio i5')).toBeVisible();
    await expect(home.productLink('Sony vaio i7')).toBeVisible();
    await expect(home.productLink('MacBook air')).toBeVisible();
    await expect(home.productLink('Dell i7 8gb')).toBeVisible();
    // expect: heading "$1100" with link "MacBook Pro" visible
    await expect(home.productPrice('$1100')).toBeVisible();
    await expect(home.productLink('MacBook Pro')).toBeVisible();

    // 2. Click link "Home" in navbar to reset filter
    await home.goHome();
    // expect: page URL is "https://www.demoblaze.com/index.html" or "/", category filter cleared, "Samsung galaxy s6" visible again
    await expect(page).toHaveURL(/.*index\.html|.*\/$/);
    await expect(home.productLink('Samsung galaxy s6')).toBeVisible();
  });
});
