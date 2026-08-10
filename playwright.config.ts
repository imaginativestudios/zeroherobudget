import { defineConfig, devices } from '@playwright/test';

// Specs whose results genuinely depend on viewport width. Only these run on the
// non-desktop projects; see the projects block below.
const VIEWPORT_SENSITIVE_SPECS = /(visual-regression|responsive|pwa)\.spec\.ts$/;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // TEMPORARY: 0 retries in CI while the suite is being triaged.
  //
  // Retries exist to absorb flakiness, but 82 of 143 tests currently fail
  // deterministically (missing snapshot baselines, no CI test account, broken
  // demo mode). Retrying a deterministic failure three times just triples the
  // wall-clock -- it is what pushed the job past its 60-minute timeout twice
  // without ever producing a complete failure list.
  //
  // Restore to 2 once the suite is green and retries are absorbing real
  // flakiness rather than masking a broken baseline.
  retries: 0,
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
    // ENGINE, NOT JUST WIDTH: these two projects run **WebKit**, not Chromium.
    // devices['iPad Mini'] and devices['Galaxy S III'] both carry
    // defaultBrowserType: 'webkit'. The names used to be 'Tablet' and 'Small
    // Mobile', which said nothing about the engine, so results and baselines
    // from them were being read as though they came from mobile Chrome. The
    // engine is in the name now, and therefore in every baseline filename.
    // Two consequences worth knowing before reading any result from them:
    //
    //   - Their visual baselines are WebKit renders. A pixel difference against
    //     Desktop/Mobile Chrome may be an engine difference, not a regression.
    //   - Keyboard behaviour differs. Safari does not Tab to every control by
    //     default, so a keyboard sweep here reports far fewer stops than
    //     Chromium and looks like a catastrophic a11y failure. It is not.
    //     Confirmed 2026-08-05 by running the same sweep in five configurations,
    //     including iPad Mini emulation forced into Chromium.
    //
    // The snapshot workflow installs both chromium and webkit for this reason.
    {
      name: 'Tablet WebKit',
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
    // Small Mobile WebKit (320px - Galaxy Fold, webkit engine)
    {
      name: 'Small Mobile WebKit',
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
