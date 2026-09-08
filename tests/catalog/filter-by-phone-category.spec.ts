// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';

test.describe('Catalog and Navigation', () => {
  test('filter-by-phone-category', async ({ page }) => {
    const home = new HomePage(page);

    // 1. Click link "Phones" in categories sidebar
    await home.filterByCategory('Phones');
    // expect: product grid shows only phone products including "Samsung galaxy s6", "Nokia lumia 1520", "Nexus 6"
    await expect(home.productLink('Samsung galaxy s6')).toBeVisible();
    await expect(home.productLink('Nokia lumia 1520')).toBeVisible();
    await expect(home.productLink('Nexus 6')).toBeVisible();
    // expect: heading "$360" and "Samsung galaxy s6" link visible, heading "$820" for "Nokia lumia 1520" visible
    await expect(home.productPrice('$360')).toBeVisible();
    await expect(home.productPrice('$820')).toBeVisible();

    // 2. Click link "Monitors" in categories sidebar
    await home.filterByCategory('Monitors');
    // expect: grid shows only "Apple monitor 24" ($400) and "ASUS Full HD" ($230)
    await expect(home.productLink('Apple monitor 24')).toBeVisible();
    await expect(home.productLink('ASUS Full HD')).toBeVisible();
    await expect(home.productPrice('$400')).toBeVisible();
    await expect(home.productPrice('$230')).toBeVisible();
    // expect: phone product "Samsung galaxy s6" is no longer visible
    await expect(home.productLink('Samsung galaxy s6')).toBeHidden();
  });
});
