// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';
import { PlaceOrderModal } from '../../pages/Modals';

test.describe('Checkout', () => {
  test('place-order-success-flow', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);

    // 1. Add "Samsung galaxy s6" to cart (open prod.html?idp_=1, click Add to cart, accept "Product added") and go to Cart
    await home.openProduct('Samsung galaxy s6');
    {
      const dialogPromise = page.waitForEvent('dialog');
      await product.addToCartLink.click();
      const dialog = await dialogPromise;
      expect(dialog.message()).toBe('Product added');
      await dialog.accept();
    }
    await home.goToCart();
    // expect: cart shows "Samsung galaxy s6" and total "360", button "Place Order" visible
    await cart.expectProductVisible('Samsung galaxy s6', '360');
    await cart.expectTotal('360');
    await expect(cart.placeOrderButton).toBeVisible();

    // 2. Click button "Place Order"
    await cart.placeOrderButton.click();
    // expect: dialog "Place order" visible with text "Total: 360", textboxes "Name:", "Country:", "City:", "Credit card:", "Month:", "Year:" visible
    await order.expectVisible('360');
    await expect(order.nameInput).toBeVisible();
    await expect(order.countryInput).toBeVisible();
    await expect(order.cityInput).toBeVisible();
    await expect(order.cardInput).toBeVisible();
    await expect(order.monthInput).toBeVisible();
    await expect(order.yearInput).toBeVisible();
    await expect(order.purchaseButton).toBeVisible();

    // 3. Type "Test User" into textbox "Name:", "USA" into "Country:", "NYC" into "City:", "1234567890123456" into "Credit card:", "12" into "Month:", "2026" into "Year:"
    await order.fillOrder({
      name: 'Test User',
      country: 'USA',
      city: 'NYC',
      card: '1234567890123456',
      month: '12',
      year: '2026',
    });
    // expect: textboxes contain typed values
    await expect(order.nameInput).toHaveValue('Test User');
    await expect(order.countryInput).toHaveValue('USA');
    await expect(order.cardInput).toHaveValue('1234567890123456');

    // 4. Click button "Purchase"
    await order.purchaseButton.click();
    // expect: success modal with heading "Thank you for your purchase!" visible, paragraph contains "Amount: 360 USD" and "Card Number: 1234567890123456" and "Name: Test User", button "OK" visible
    await order.expectSuccessVisible({ amount: '360', card: '1234567890123456', name: 'Test User' });
    await expect(page.getByRole('button', { name: 'OK' })).toBeVisible();

    // 5. Click button "OK"
    await page.getByRole('button', { name: 'OK' }).click();
    // expect: success modal closes, redirects to index.html, cart table empty on next visit to cart.html
    await expect(order.successModal).toBeHidden({ timeout: 5000 });
    await cart.goto();
    await expect(cart.table).not.toContainText('Samsung galaxy s6');
  });
});
