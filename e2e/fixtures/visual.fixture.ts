import { test as base, expect, Page } from '@playwright/test';

type VisualTestOptions = {
  waitForFonts?: boolean;
  hideSelectors?: string[];
  maskSelectors?: string[];
};

type VisualPage = Page & {
  compareScreenshot: (name: string, options?: VisualTestOptions) => Promise<void>;
  waitForPageReady: () => Promise<void>;
};

export const test = base.extend<{
  visualPage: VisualPage;
}>({
  visualPage: async ({ page }, use) => {
    const visualPage = page as VisualPage;

    // Wait for page to be fully ready (fonts, images, animations)
    visualPage.waitForPageReady = async () => {
      await page.waitForLoadState('networkidle');
      
      // Wait for fonts to load
      await page.evaluate(() => document.fonts.ready);
      
      // Wait for any Framer Motion animations to complete
      await page.waitForTimeout(500);
      
      // Disable CSS animations for consistency
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      });
    };

    // Take and compare screenshot
    visualPage.compareScreenshot = async (name: string, options: VisualTestOptions = {}) => {
      await visualPage.waitForPageReady();

      // Hide dynamic content (dates, times, random values)
      if (options.hideSelectors) {
        for (const selector of options.hideSelectors) {
          await page.locator(selector).evaluateAll((elements) => {
            elements.forEach((el) => ((el as HTMLElement).style.visibility = 'hidden'));
          });
        }
      }

      // Get project name for organizing screenshots
      const projectName = base.info().project.name.toLowerCase().replace(/\s+/g, '-');
      
      await expect(page).toHaveScreenshot(`${name}-${projectName}.png`, {
        fullPage: false,
        mask: options.maskSelectors?.map((s) => page.locator(s)) || [],
      });
    };

    await use(visualPage);
  },
});

export { expect };
