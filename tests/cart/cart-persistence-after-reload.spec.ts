// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';

test.describe('Cart Operations', () => {
  test('cart-persistence-after-reload', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    // 1. Add "Nexus 6" to cart (open prod.html?idp_=3, click Add to cart, accept alert) then go to Cart
    await home.openProduct('Nexus 6');
    await expect(page).toHaveURL(/.*prod\.html\?idp_=3/);
    {
      const dialogPromise = page.waitForEvent('dialog');
      await product.addToCartLink.click();
      const dialog = await dialogPromise;
      expect(dialog.message()).toBe('Product added');
      await dialog.accept();
    }
    await home.goToCart();
    // expect: alert "Product added" accepted, cart shows "Nexus 6" with price "650"
    await cart.expectProductVisible('Nexus 6', '650');
    await cart.expectTotal('650');

    // 2. Reload the page
    await page.reload();
    // expect: cart still shows row "Nexus 6" and price "650", total "650" persists (localStorage)
    await cart.expectProductVisible('Nexus 6', '650');
    await cart.expectTotal('650');

    // 3. Click link "Home" then click link "Cart" again
    await home.goHome();
    await expect(home.productLink('Samsung galaxy s6')).toBeVisible();
    await home.goToCart();
    // expect: cart still shows "Nexus 6" (persistence across navigation)
    await cart.expectProductVisible('Nexus 6', '650');
  });
});
