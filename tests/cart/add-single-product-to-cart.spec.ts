// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';

test.describe('Cart Operations', () => {
  test('add-single-product-to-cart', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    // 1. Click link "Samsung galaxy s6" on homepage
    await home.openProduct('Samsung galaxy s6');
    // expect: page URL contains "prod.html?idp_=1"
    await expect(page).toHaveURL(/.*prod\.html\?idp_=1/);

    // 2. Click link "Add to cart"
    // expect: native alert dialog appears with message "Product added"
    const dialogPromise = page.waitForEvent('dialog');
    await product.addToCartLink.click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Product added');
    await dialog.accept();

    // 3. Accept alert dialog - handled above, verify remains on product page
    // expect: alert dismissed, remains on product page "prod.html?idp_=1"
    await expect(page).toHaveURL(/.*prod\.html\?idp_=1/);

    // 4. Click link "Cart" in navbar
    await home.goToCart();
    // expect: navigates to "cart.html", table shows row with cell "Samsung galaxy s6" and cell "360", heading "360" under "Total" visible
    await cart.expectLoaded();
    await cart.expectProductVisible('Samsung galaxy s6', '360');
    await cart.expectTotal('360');
  });
});
