import { defineConfig, devices } from '@playwright/test';

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
    // Desktop Chrome (1280px)
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // Tablet (768px)
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
    // Mobile (375px)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    // Small Mobile (320px - Galaxy Fold)
    {
      name: 'Small Mobile',
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
