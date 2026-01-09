import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Extend the base test to include coverage collection
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      // Initialize coverage storage
      (window as any).__coverage__ = (window as any).__coverage__ || {};
    });
    
    await use(context);
  },
  
  page: async ({ page }, use) => {
    await use(page);
    
    // Collect coverage after each test
    if (process.env.COVERAGE === 'true') {
      const coverage = await page.evaluate(() => (window as any).__coverage__);
      
      if (coverage) {
        const coverageDir = path.join(process.cwd(), '.nyc_output');
        
        if (!fs.existsSync(coverageDir)) {
          fs.mkdirSync(coverageDir, { recursive: true });
        }
        
        const fileName = `coverage-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
        fs.writeFileSync(
          path.join(coverageDir, fileName),
          JSON.stringify(coverage)
        );
      }
    }
  },
});

export { expect };
