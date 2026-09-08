// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';

test.describe('Cart Operations', () => {
  test('remove-product-from-cart', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    // 1. Add "Samsung galaxy s6" to cart (open prod.html?idp_=1, click Add to cart, accept "Product added" alert)
    await home.openProduct('Samsung galaxy s6');
    {
      const dialogPromise = page.waitForEvent('dialog');
      await product.addToCartLink.click();
      const dialog = await dialogPromise;
      expect(dialog.message()).toBe('Product added');
      await dialog.accept();
    }
    await expect(page).toHaveURL(/.*prod\.html\?idp_=1/);

    // 2. Click link "Cart"
    await home.goToCart();
    // expect: row "Samsung galaxy s6" with "Delete" link visible, total "360"
    await cart.expectProductVisible('Samsung galaxy s6');
    await expect(cart.productRow('Samsung galaxy s6').getByRole('link', { name: 'Delete' })).toBeVisible();
    await cart.expectTotal('360');

    // 3. Click link "Delete" in the product row
    await cart.deleteProduct('Samsung galaxy s6');
    // expect: row "Samsung galaxy s6" is removed from table, cart table body empty
    await expect(cart.productRow('Samsung galaxy s6')).toBeHidden({ timeout: 10000 });
    // expect: total heading no longer shows "360" (empty or 0)
    await expect(cart.totalHeading).not.toHaveText('360');
  });
});
