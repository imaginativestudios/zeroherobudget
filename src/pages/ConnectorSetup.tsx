import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, Check, ChevronRight, Code2, FileJson, FileCode, Globe, Zap, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Extension code blocks
// Chrome Web Store Ready - No broad host permissions
const MANIFEST_JSON = `{
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
const CONTENT_JS = `// Zero Hero Connector - Content Script (Programmatic Injection)
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

const POPUP_HTML = `<!DOCTYPE html>
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

function CodeBlock({ code, filename, icon: Icon }: { code: string; filename: string; icon: React.ElementType }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${filename} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm font-medium">{filename}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="h-8"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1 text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[300px] bg-slate-950 text-slate-50">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ConnectorSetup() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="pt-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Build Your Connector</h1>
            <p className="text-muted-foreground">
              Your personal data scout — no third-party aggregators
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">The Hero's Privacy Oath</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unlike other budgeting apps that use services like Plaid, we believe <strong>your bank data should never touch external servers</strong>. 
                  The Zero Hero Connector is a simple browser extension you control — it reads transaction tables from your bank's website 
                  and copies them directly to your clipboard. No middle-men, no data sharing, no API calls to third parties.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <Lock className="h-3 w-3 mr-1" />
                    100% Local
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    <Code2 className="h-3 w-3 mr-1" />
                    Open Source
                  </Badge>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    <Zap className="h-3 w-3 mr-1" />
                    You Control It
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Setup Instructions
          </CardTitle>
          <CardDescription>
            Follow these steps to create your personal Connector extension
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="font-semibold">Create a new folder</h4>
              <p className="text-sm text-muted-foreground">
                Create a folder on your computer called <code className="bg-muted px-1.5 py-0.5 rounded text-xs">zero-hero-connector</code>
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="font-semibold">Save these three files</h4>
                <p className="text-sm text-muted-foreground">
                  Copy each file below and save it with the exact filename shown
                </p>
              </div>
              
              <Tabs defaultValue="manifest" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="manifest" className="text-xs">
                    <FileJson className="h-3 w-3 mr-1" />
                    manifest.json
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-xs">
                    <FileCode className="h-3 w-3 mr-1" />
                    content.js
                  </TabsTrigger>
                  <TabsTrigger value="popup" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    popup.html
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="manifest" className="mt-4">
                  <CodeBlock code={MANIFEST_JSON} filename="manifest.json" icon={FileJson} />
                </TabsContent>
                
                <TabsContent value="content" className="mt-4">
                  <CodeBlock code={CONTENT_JS} filename="content.js" icon={FileCode} />
                </TabsContent>
                
                <TabsContent value="popup" className="mt-4">
                  <CodeBlock code={POPUP_HTML} filename="popup.html" icon={Globe} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Load in Chrome</h4>
                <p className="text-sm text-muted-foreground">
                  Install your extension in Chrome Developer Mode
                </p>
              </div>
              <ol className="text-sm space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Open Chrome and go to <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Enable <strong>Developer mode</strong> (toggle in top-right)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Click <strong>Load unpacked</strong> and select your folder</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <h4 className="font-semibold">Ready to Scout!</h4>
              <p className="text-sm text-muted-foreground">
                Navigate to your bank's transaction page, click the extension icon, 
                scan the page, then paste into Zero Hero's <strong>Quest Log</strong> using "Paste from Connector"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-sm">1. Scan</h4>
              <p className="text-xs text-muted-foreground mt-1">
                The extension reads tables on your bank's page
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Copy className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-sm">2. Copy</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Transactions are copied to your clipboard as JSON
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <h4 className="font-semibold text-sm">3. Paste</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Import into Zero Hero with duplicate detection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
