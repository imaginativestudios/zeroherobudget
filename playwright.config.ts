import { defineConfig, devices } from '@playwright/test';

// Specs whose results genuinely depend on viewport width. Only these run on the
// non-desktop projects; see the projects block below.
const VIEWPORT_SENSITIVE_SPECS = /(visual-regression|responsive|pwa)\.spec\.ts$/;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // Visual regression settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    // Desktop Chrome runs the full suite -- it is the reference project.
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // The remaining viewports run ONLY the specs whose assertions actually
    // depend on viewport size. Previously every project ran every spec, so 412
    // of 572 runs re-executed identical non-visual assertions (auth, Stripe,
    // API, persistence) at four widths and proved nothing the desktop run had
    // not. That is what pushed the job past its 60-minute timeout.
    //
    // Total runs: 572 -> 263. Add a spec here only if its result can differ by
    // viewport; visual-regression snapshots remain per-project either way.
    {
      name: 'Tablet',
      testMatch: VIEWPORT_SENSITIVE_SPECS,
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
    // Mobile (375px)
    {
      name: 'Mobile Chrome',
      testMatch: VIEWPORT_SENSITIVE_SPECS,
      use: { ...devices['Pixel 5'] },
    },
    // Small Mobile (320px - Galaxy Fold)
    {
      name: 'Small Mobile',
      testMatch: VIEWPORT_SENSITIVE_SPECS,
      use: {
        ...devices['Galaxy S III'],
        viewport: { width: 320, height: 658 },
      },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
