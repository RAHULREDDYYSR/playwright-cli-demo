// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';

test.describe('Catalog and Navigation', () => {
  test('navigate-to-product-details', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);

    // 1. Click link "Samsung galaxy s6" on homepage
    await home.openProduct('Samsung galaxy s6');
    // expect: navigates to URL containing "prod.html?idp_=1", heading "Samsung galaxy s6" (level 2) visible
    await expect(page).toHaveURL(/.*prod\.html\?idp_=1/);
    await expect(product.productTitle).toHaveText('Samsung galaxy s6');
    // expect: heading "$360 *includes tax" visible, paragraph contains "1.5GHz octa-core Samsung Exynos 7420"
    await expect(product.productPrice).toContainText('$360');
    await expect(product.productPrice).toContainText('includes tax');
    await expect(page.locator('#more-information p')).toContainText('1.5GHz octa-core');
    // expect: link "Add to cart" visible
    await expect(product.addToCartLink).toBeVisible();

    // 2. Click link "Home" or browser back
    await page.goBack();
    // expect: navigates back to homepage with "CATEGORIES" and product grid visible
    await expect(home.categoriesHeader).toBeVisible();
    await expect(home.productLink('Samsung galaxy s6')).toBeVisible();
  });
});
