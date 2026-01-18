import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, Check, ChevronRight, Code2, FileJson, FileCode, Globe, Zap, Lock, Sparkles } from 'lucide-react';
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
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm font-medium">{filename}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="h-8 rounded-lg"
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
      <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[280px] bg-slate-950 text-slate-50">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ConnectorSetup() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      {/* Hero Section - Centered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-8 space-y-6"
      >
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mx-auto">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Build Your Connector
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your personal data scout — no third-party aggregators, ever.
          </p>
        </div>
        
        {/* Massive CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto rounded-xl font-semibold"
            onClick={() => document.getElementById('setup-steps')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Forge Your Connector
          </Button>
        </motion.div>
      </motion.div>

      {/* Privacy Oath - Simplified to bullets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card variant="glass" className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="font-semibold text-lg">The Hero's Privacy Oath</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Data never leaves your browser</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>No Plaid, no third-party aggregators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>You control everything via clipboard</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <Lock className="h-3 w-3 mr-1" />
                    100% Local
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    <Code2 className="h-3 w-3 mr-1" />
                    Open Source
                  </Badge>
                  <Badge variant="outline" className="bg-accent/10 text-accent-dark border-accent/30">
                    <Zap className="h-3 w-3 mr-1" />
                    You Control It
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How It Works - Visual Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card variant="glass">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">1. Scan</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reads tables on your bank's page
                  </p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Copy className="h-7 w-7 text-accent-dark" />
                </div>
                <div>
                  <h4 className="font-semibold">2. Copy</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Data goes to your clipboard
                  </p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-success/10 flex items-center justify-center">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold">3. Paste</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Import with duplicate detection
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Setup Steps - Streamlined */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        id="setup-steps"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              Create your personal Connector in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Create a new folder</h4>
                <p className="text-sm text-muted-foreground">
                  Name it <code className="bg-muted px-2 py-1 rounded-lg text-xs font-mono">zero-hero-connector</code>
                </p>
              </div>
            </div>

            {/* Step 2 - File Tabs */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Save these three files</h4>
                  <p className="text-sm text-muted-foreground">
                    Copy each file and save with the exact filename
                  </p>
                </div>
                
                <Tabs defaultValue="manifest" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full rounded-xl">
                    <TabsTrigger value="manifest" className="text-xs rounded-lg">
                      <FileJson className="h-3 w-3 mr-1" />
                      manifest
                    </TabsTrigger>
                    <TabsTrigger value="content" className="text-xs rounded-lg">
                      <FileCode className="h-3 w-3 mr-1" />
                      content
                    </TabsTrigger>
                    <TabsTrigger value="popup" className="text-xs rounded-lg">
                      <Globe className="h-3 w-3 mr-1" />
                      popup
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
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">Load in Chrome</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable Developer Mode and load your extension
                  </p>
                </div>
                <ol className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Go to <code className="bg-muted px-2 py-0.5 rounded-lg text-xs">chrome://extensions</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Enable <strong>Developer mode</strong> (top-right)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Click <strong>Load unpacked</strong> → select folder</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Success State */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-success text-success-foreground flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-semibold mb-1">Ready to Scout!</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate to your bank, click the extension, scan, then paste into <strong>Journey Log</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}