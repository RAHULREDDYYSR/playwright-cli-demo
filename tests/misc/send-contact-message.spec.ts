// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { ContactModal } from '../../pages/Modals';

test.describe('Contact and About', () => {
  test('send-contact-message', async ({ page }) => {
    const home = new HomePage(page);
    const contact = new ContactModal(page);

    // 1. Click link "Contact" in navbar
    await home.openContact();
    // expect: dialog with heading "New message" visible, textboxes "Contact Email:", "Contact Name:", "Message:" visible, button "Send message" visible
    await contact.expectVisible();
    await expect(contact.emailInput).toBeVisible();
    await expect(contact.nameInput).toBeVisible();
    await expect(contact.messageInput).toBeVisible();
    await expect(contact.sendButton).toBeVisible();

    // 2. Type "test@example.com" into textbox "Contact Email:" and "Test User" into "Contact Name:" and "Hello from Playwright" into "Message:"
    await contact.emailInput.fill('test@example.com');
    await contact.nameInput.fill('Test User');
    await contact.messageInput.fill('Hello from Playwright');
    // expect: textboxes contain typed values
    await expect(contact.emailInput).toHaveValue('test@example.com');
    await expect(contact.nameInput).toHaveValue('Test User');
    await expect(contact.messageInput).toHaveValue('Hello from Playwright');

    // 3. Click button "Send message"
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Thanks for the message!!');
      await dialog.accept();
    });
    await contact.sendButton.click();
    // expect: native alert with message "Thanks for the message!!" appears

    // 4. Accept alert handled, expect dialog closes
    // expect: dialog closes, homepage grid still visible
    await expect(contact.modal).toBeHidden({ timeout: 5000 });
    await expect(home.productLink('Samsung galaxy s6')).toBeVisible();
  });
});
