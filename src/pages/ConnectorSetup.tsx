import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, Check, ChevronRight, Code2, FileJson, FileCode, Globe, Zap, Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MANIFEST_JSON_DEV, CONTENT_JS, POPUP_HTML } from '@/lib/extensionCode';

// Use the dev manifest for user-facing setup (simpler)
const MANIFEST_JSON = MANIFEST_JSON_DEV;

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
        <Card className="border-primary/20">
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
        <Card>
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