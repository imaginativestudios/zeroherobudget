import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Scroll, Image, Copy, Check, Download, Package, FileText, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import JSZip from 'jszip';
import {
  MANIFEST_JSON_PROD,
  CONTENT_JS,
  POPUP_HTML,
  ICON_README,
  STORE_LISTING,
  VISUAL_ASSETS,
} from '@/lib/extensionCode';

function CopyField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7">
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
      {multiline ? (
        <pre className="p-4 rounded-xl bg-slate-950 text-slate-50 text-xs font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
          {value}
        </pre>
      ) : (
        <div className="p-3 rounded-xl bg-muted/50 border text-sm font-mono break-all">
          {value}
        </div>
      )}
    </div>
  );
}

export default function ReleaseKit() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateZip = async () => {
    setIsGenerating(true);
    
    try {
      const zip = new JSZip();
      
      // Add extension files
      zip.file('manifest.json', MANIFEST_JSON_PROD);
      zip.file('content.js', CONTENT_JS);
      zip.file('popup.html', POPUP_HTML);
      zip.file('README-ICONS.txt', ICON_README);
      
      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zero-hero-connector-v1.0.0.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Production ZIP generated successfully!');
    } catch (error) {
      toast.error('Failed to generate ZIP file');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-8 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chrome Web Store Release Kit</h1>
            <p className="text-muted-foreground">Everything needed for submission</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <Shield className="h-3 w-3 mr-1" />
            ActiveTab Compliant
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Check className="h-3 w-3 mr-1" />
            Minimal Permissions
          </Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent-dark border-accent/30">
            v1.0.0
          </Badge>
        </div>
      </motion.div>

      {/* Section A: Forging the Artifact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card variant="glass" className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Hammer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Forging the Artifact</CardTitle>
                <CardDescription>Generate a production-ready extension bundle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/30 border space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Bundle Contents
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-success" />
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">manifest.json</code> — Production manifest v1.0.0
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-success" />
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">content.js</code> — Programmatic injection script
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-success" />
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">popup.html</code> — Extension popup UI
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">README-ICONS.txt</code> — Icon requirements (add manually)
                </li>
              </ul>
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-semibold"
              onClick={generateZip}
              disabled={isGenerating}
            >
              <Download className="h-5 w-5 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Production .ZIP'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section B: Scribe's Scrolls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <Scroll className="h-6 w-6 text-accent-dark" />
              </div>
              <div>
                <CardTitle className="text-xl">Scribe's Scrolls</CardTitle>
                <CardDescription>Pre-written copy for Chrome Web Store fields</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <CopyField 
              label="Extension Name (45 chars max)" 
              value={STORE_LISTING.name} 
            />
            
            <Separator />
            
            <CopyField 
              label="Short Description (132 chars max)" 
              value={STORE_LISTING.shortDescription} 
            />
            
            <Separator />
            
            <CopyField 
              label="Long Description" 
              value={STORE_LISTING.longDescription} 
              multiline 
            />
            
            <Separator />
            
            <CopyField 
              label="Permission Justification (for Google Review)" 
              value={STORE_LISTING.permissionJustification} 
              multiline 
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section C: Visual Assets Required */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <Image className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-xl">Visual Assets Required</CardTitle>
                <CardDescription>Exact dimensions for Chrome Web Store submission</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Asset</th>
                    <th className="text-left p-3 font-medium">Dimensions</th>
                    <th className="text-left p-3 font-medium">Format</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {VISUAL_ASSETS.map((asset, index) => (
                    <tr key={asset.name} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-3 font-medium">{asset.name}</td>
                      <td className="p-3 font-mono text-xs">{asset.dimensions}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {asset.format}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden sm:table-cell">
                        {asset.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border">
              <h4 className="font-medium mb-2">Design Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use teal (#0D7377) as the primary brand color</li>
                <li>• Orange accent (#ff6b35) for the "o" in logo</li>
                <li>• Clean, minimal style — avoid busy backgrounds</li>
                <li>• Ensure text is legible at small sizes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
