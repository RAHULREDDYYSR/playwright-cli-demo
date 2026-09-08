// spec: specs/demoblaze.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { HomePage } from '../../pages/HomePage';
import { AboutUsModal } from '../../pages/Modals';

test.describe('Contact and About', () => {
  test('about-us-video-modal', async ({ page }) => {
    const home = new HomePage(page);
    const about = new AboutUsModal(page);

    // 1. Click link "About us" in navbar
    await home.openAboutUs();
    // expect: dialog with heading "About us" visible, region "Video Player" visible, button "Play Video" visible, button "Close" visible
    await about.expectVisible();
    await expect(about.playButton).toBeVisible();
    await expect(about.closeButton).toBeVisible();

    // 2. Click button "Play Video"
    await about.playButton.click();
    // expect: video playback starts (modal stays visible, video element present)
    await expect(about.modal).toBeVisible();

    // 3. Click button "Close" in About us modal
    await about.closeButton.click();
    // expect: dialog hidden, homepage visible, navbar links still interactable
    await expect(about.modal).toBeHidden({ timeout: 5000 });
    await expect(home.productLink('Samsung galaxy s6')).toBeVisible();
    await expect(home.loginLink).toBeVisible();
  });
});
