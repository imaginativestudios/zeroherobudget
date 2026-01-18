/**
 * Zero Hero Connector - Extension Code Constants
 * 
 * Shared module for browser extension code used by:
 * - ConnectorSetup page (user-facing setup instructions)
 * - ReleaseKit page (Chrome Web Store submission)
 * 
 * Chrome Web Store Ready - ActiveTab Architecture
 * No broad host permissions, programmatic injection only.
 */

// Production manifest for Chrome Web Store submission
export const MANIFEST_JSON_PROD = `{
  "manifest_version": 3,
  "name": "Zero Hero Connector: Privacy-First Bank Scout",
  "version": "1.0.0",
  "description": "A local-first data scout. Securely import bank transactions without sharing passwords.",
  "permissions": ["activeTab", "scripting", "clipboardWrite"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}`;

// Development manifest (simpler, for user setup)
export const MANIFEST_JSON_DEV = `{
  "manifest_version": 3,
  "name": "Zero Hero Connector",
  "version": "1.0",
  "description": "Scout your bank transactions for Zero Hero",
  "permissions": ["activeTab", "scripting", "clipboardWrite"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png"
    }
  }
}`;

// Safety check prevents duplicate listeners on multiple scans
export const CONTENT_JS = `// Zero Hero Connector - Content Script (Programmatic Injection)
if (!window.hasZeroHeroScout) {
  window.hasZeroHeroScout = true;
  
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "scout") {
      try {
        // Find all table rows on the page
        const rows = Array.from(document.querySelectorAll("tr, [role='row']"));
        
        const data = rows.map(row => {
          const text = row.innerText || row.textContent || "";
          
          // Heuristic patterns for dates and amounts
          const dateMatch = text.match(/\\d{1,2}[\\/\\-]\\d{1,2}(?:[\\/\\-]\\d{2,4})?/);
          const amountMatch = text.match(/-?\\$?[\\d,]+\\.\\d{2}/);
          
          if (dateMatch && amountMatch) {
            const amount = parseFloat(amountMatch[0].replace(/[^0-9.\\-]/g, ""));
            return {
              date: dateMatch[0],
              amount: amount,
              raw_text: text.trim().substring(0, 200)
            };
          }
          return null;
        }).filter(Boolean);
        
        // Remove duplicates
        const unique = data.filter((item, index, self) =>
          index === self.findIndex(t => 
            t.date === item.date && 
            t.amount === item.amount && 
            t.raw_text === item.raw_text
          )
        );
        
        sendResponse({ 
          status: "success", 
          data: unique,
          count: unique.length
        });
      } catch (error) {
        sendResponse({ 
          status: "error", 
          message: error.message 
        });
      }
    }
    return true; // Keep channel open for async response
  });
}`;

export const POPUP_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 280px;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0d7377 0%, #14919b 100%);
      color: white;
      margin: 0;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
    }
    .logo span { color: #ff6b35; }
    h1 {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }
    .status {
      background: rgba(255,255,255,0.15);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .count {
      font-size: 24px;
      font-weight: bold;
      color: #4ade80;
    }
    button {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .scan-btn {
      background: white;
      color: #0d7377;
      margin-bottom: 8px;
    }
    .scan-btn:hover { transform: scale(1.02); }
    .copy-btn {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .copy-btn:hover { background: rgba(255,255,255,0.3); }
    .copy-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .footer {
      margin-top: 12px;
      font-size: 11px;
      opacity: 0.8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Zer<span>o</span></div>
    <h1>Hero Connector</h1>
  </div>
  
  <div class="status">
    <div>Transactions found:</div>
    <div class="count" id="count">—</div>
  </div>
  
  <button class="scan-btn" id="scan">🔍 Scan This Page</button>
  <button class="copy-btn" id="copy" disabled>📋 Copy to Clipboard</button>
  
  <div class="footer">
    Navigate to your bank's transaction page, then scan.
  </div>

  <script>
    let scannedData = null;
    
    document.getElementById('scan').addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Step 1: Inject the Scout Script dynamically (Chrome Web Store compliant)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        // Script may already be injected, continue anyway
      }

      // Step 2: Send the scout command
      chrome.tabs.sendMessage(tab.id, { action: "scout" }, (response) => {
        if (response && response.status === "success") {
          scannedData = response.data;
          document.getElementById('count').textContent = response.count;
          document.getElementById('copy').disabled = response.count === 0;
        } else {
          document.getElementById('count').textContent = "Error";
        }
      });
    });
    
    document.getElementById('copy').addEventListener('click', async () => {
      if (scannedData) {
        await navigator.clipboard.writeText(JSON.stringify(scannedData));
        document.getElementById('copy').textContent = "✓ Copied!";
        setTimeout(() => {
          document.getElementById('copy').textContent = "📋 Copy to Clipboard";
        }, 2000);
      }
    });
  </script>
</body>
</html>`;

// README for icon placeholder in ZIP
export const ICON_README = `Zero Hero Connector - Icon Files Required
==========================================

Please add the following icon files to this folder before submitting to Chrome Web Store:

Required Icons:
- icon16.png  (16x16 pixels)
- icon48.png  (48x48 pixels)  
- icon128.png (128x128 pixels)

Design Guidelines:
- Use teal (#0D7377) as the primary background color
- Orange (#ff6b35) accent for the "o" in the logo
- Simple, recognizable design that works at small sizes
- PNG format with transparency support

These icons will appear in:
- Chrome toolbar (16px)
- Chrome extensions page (48px)
- Chrome Web Store listing (128px)
`;

// Store listing copy
export const STORE_LISTING = {
  name: "Zero Hero Connector: Privacy-First Bank Scout",
  shortDescription: "A local-first data scout. Securely import bank transactions into your Zero Hero Fortress without sharing passwords or data.",
  longDescription: `YOUR DATA NEVER LEAVES YOUR DEVICE

Unlike traditional bank aggregators like Plaid or Yodlee, Zero Hero Connector operates entirely within your browser. No servers. No third-party access. No passwords shared. Your financial data stays exactly where it belongs — on your machine, under your control.

HEROIC CONTROL OVER YOUR FINANCES

You decide what gets imported. The Connector scans transaction tables on your banking page only when you explicitly click the Scan button. Each transaction is displayed for your review before being copied to your clipboard. Nothing is automatic. Nothing is hidden. You are the hero of your own financial journey.

TRANSPARENT AND SECURE BY DESIGN

Zero Hero Connector is built with privacy as a first principle. The code is minimal, auditable, and uses only the permissions absolutely necessary: activeTab (to read the current page when you click), scripting (to run the scanner), and clipboardWrite (to copy your data). No background processes. No remote code execution. Just a simple, focused tool for privacy-conscious users.`,
  permissionJustification: `This extension uses the "activeTab" permission to access the DOM of the user's current banking tab only when explicitly triggered by the user via the extension popup. This is required to parse transaction tables for local export to the clipboard. No data is accessed without direct user interaction, and no data is transmitted to external servers.

The "scripting" permission is used to programmatically inject the content script into the active tab when the user clicks "Scan". This approach was chosen over declarative content_scripts to avoid requesting broad host permissions, ensuring the extension only operates on the specific tab the user has chosen.

The "clipboardWrite" permission allows the extension to copy parsed transaction data to the user's clipboard for pasting into the Zero Hero web application.`,
};

// Visual asset requirements
export const VISUAL_ASSETS = [
  { name: "Store Icon", dimensions: "128x128px", format: "PNG", notes: "Required. Must match extension icon." },
  { name: "Small Promo Tile", dimensions: "440x280px", format: "JPG/PNG", notes: "Displayed in store listings." },
  { name: "Marquee Promo", dimensions: "1280x800px", format: "JPG/PNG", notes: "Featured placement. No text on edges." },
  { name: "Screenshot 1", dimensions: "1280x800px", format: "JPG/PNG", notes: "Show popup on banking page." },
  { name: "Screenshot 2", dimensions: "1280x800px", format: "JPG/PNG", notes: "Show Zero Hero import modal." },
  { name: "Extension Icon 16", dimensions: "16x16px", format: "PNG", notes: "Toolbar icon." },
  { name: "Extension Icon 48", dimensions: "48x48px", format: "PNG", notes: "Extensions page icon." },
  { name: "Extension Icon 128", dimensions: "128x128px", format: "PNG", notes: "Store listing icon." },
];
