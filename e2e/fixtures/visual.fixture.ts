import { test as base, expect, Page } from '@playwright/test';

type VisualTestOptions = {
  waitForFonts?: boolean;
  hideSelectors?: string[];
  maskSelectors?: string[];
};

type VisualPage = Page & {
  compareScreenshot: (name: string, options?: VisualTestOptions) => Promise<void>;
  waitForPageReady: () => Promise<void>;
  gotoApp: (path: string) => Promise<void>;
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

    // Navigate to a route that lives behind Layout.tsx's demo/auth gate, and
    // refuse to continue if the app bounced us to /auth.
    //
    // Without this check a gated route silently renders the sign-in modal, the
    // screenshot succeeds, and --update-snapshots writes that modal in as the
    // approved appearance of the page. That is not hypothetical: the first
    // batch of Linux baselines contained 69 files that were the same four
    // pictures of this modal, because the spec navigated to /explore-demo --
    // a route that does not exist -- and never noticed.
    //
    // Fail loudly here so the mistake can never reach a baseline again.
    visualPage.gotoApp = async (path: string) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const { pathname, search } = new URL(page.url());
      if (pathname.startsWith('/auth')) {
        throw new Error(
          `gotoApp("${path}") ended up at ${pathname}${search}. The app redirected to auth, ` +
            `which means demo mode was not active for this test. Call seedDemoData(page) in a ` +
            `beforeEach before navigating to gated routes. Screenshotting from here would bake ` +
            `a login modal into the baseline for "${path}".`
        );
      }
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
