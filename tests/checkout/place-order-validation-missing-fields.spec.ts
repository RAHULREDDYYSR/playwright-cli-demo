// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';
import { PlaceOrderModal } from '../../pages/Modals';

test.describe('Checkout', () => {
  test('place-order-validation-missing-fields', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);

    // 1. Add "Apple monitor 24" to cart (open prod.html?idp_=10, click Add to cart, accept alert) and go to Cart and click "Place Order"
    // Apple monitor 24 is on Monitors category / pagination, filter first
    await home.filterByCategory('Monitors');
    await expect(home.productLink('Apple monitor 24')).toBeVisible();
    await home.openProduct('Apple monitor 24');
    {
      const dialogPromise = page.waitForEvent('dialog');
      await product.addToCartLink.click();
      const dialog = await dialogPromise;
      expect(dialog.message()).toBe('Product added');
      await dialog.accept();
    }
    await home.goToCart();
    await cart.expectProductVisible('Apple monitor 24');
    await cart.placeOrderButton.click();
    // expect: dialog "Place order" visible with Total "400"
    await order.expectVisible('400');

    // 2. Leave "Name:" and "Credit card:" empty, click button "Purchase"
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Please fill out Name and Creditcard.');
      await dialog.accept();
    });
    await order.purchaseButton.click();
    // expect: native alert with message "Please fill out Name and Creditcard." appears

    // 3. Accept alert handled, expect dialog remains open
    // expect: dialog "Place order" remains open, Purchase button still visible
    await expect(order.modal).toBeVisible();
    await expect(order.purchaseButton).toBeVisible();

    // 4. Click button "Close" in Place order modal
    await order.closeButton.click();
    // expect: dialog hidden, cart still shows "Apple monitor 24" and total "400"
    await expect(order.modal).toBeHidden({ timeout: 5000 });
    await cart.expectProductVisible('Apple monitor 24');
    await cart.expectTotal('400');
  });
});
