import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Scroll, ImageIcon, Copy, Check, Download, Package, FileText, Shield, AlertCircle, Wand2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import connectorShieldSvg from '@/assets/connector-shield.svg';
import {
  MANIFEST_JSON_PROD,
  CONTENT_JS,
  POPUP_HTML,
  STORE_LISTING,
  VISUAL_ASSETS,
} from '@/lib/extensionCode';

type ImageType = 'small-tile' | 'marquee';

interface GeneratedImage {
  type: ImageType;
  imageData: string;
  dimensions: { width: number; height: number };
}

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
  const [generatingType, setGeneratingType] = useState<ImageType | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<ImageType, GeneratedImage | null>>({
    'small-tile': null,
    'marquee': null
  });

  // Convert SVG to PNG at specified size
  const svgToPng = (svgUrl: string, size: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = svgUrl;
    });
  };

  const generateImage = async (type: ImageType) => {
    setGeneratingType(type);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-store-images', {
        body: { type }
      });

      if (error) throw error;

      if (data?.success && data?.imageData) {
        setGeneratedImages(prev => ({
          ...prev,
          [type]: {
            type,
            imageData: data.imageData,
            dimensions: data.dimensions
          }
        }));
        toast.success(`${type} image conjured successfully!`);
      } else {
        throw new Error(data?.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(`Failed to conjure ${type} image`);
    } finally {
      setGeneratingType(null);
    }
  };

  const downloadImage = (image: GeneratedImage, filename: string) => {
    const link = document.createElement('a');
    link.href = image.imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} downloaded!`);
  };

  // Convert base64 data URL to Blob
  const base64ToBlob = (base64: string): Blob => {
    const base64Data = base64.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'image/png' });
  };


  const generateZip = async () => {
    setIsGenerating(true);
    
    try {
      const zip = new JSZip();
      
      // Add extension files
      zip.file('manifest.json', MANIFEST_JSON_PROD);
      zip.file('content.js', CONTENT_JS);
      zip.file('popup.html', POPUP_HTML);
      
      // Always generate icons from SVG asset
      const icon128Blob = await svgToPng(connectorShieldSvg, 128);
      const icon48Blob = await svgToPng(connectorShieldSvg, 48);
      const icon16Blob = await svgToPng(connectorShieldSvg, 16);
      
      zip.file('icon128.png', icon128Blob);
      zip.file('icon48.png', icon48Blob);
      zip.file('icon16.png', icon16Blob);
      
      // Add promotional images to store-assets folder
      const storeAssetsFolder = zip.folder('store-assets');
      const smallTile = generatedImages['small-tile'];
      const marquee = generatedImages['marquee'];
      
      if (smallTile) {
        const smallTileBlob = base64ToBlob(smallTile.imageData);
        storeAssetsFolder?.file('promo-small-440x280.png', smallTileBlob);
      }
      
      if (marquee) {
        const marqueeBlob = base64ToBlob(marquee.imageData);
        storeAssetsFolder?.file('promo-marquee-1280x800.png', marqueeBlob);
      }
      
      // If no store assets, add a README
      if (!smallTile && !marquee) {
        storeAssetsFolder?.file('README.txt', 
          'Generate promotional images using the "Conjure the Visuals" section on the Release Kit page.\n\n' +
          'Required assets:\n' +
          '- Small Promo Tile: 440x280px (PNG)\n' +
          '- Marquee Promo: 1280x800px (PNG)\n'
        );
      }
      
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
      
      // Count generated promotional assets
      const promoCount = [smallTile, marquee].filter(Boolean).length;
      toast.success(`Production ZIP generated with shield icons + ${promoCount} promo asset(s)!`);
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
                  <Check className="h-3 w-3 text-success" />
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">icon16.png, icon48.png, icon128.png</code> — Shield icons (auto-generated from SVG)
                </li>
                
                {/* Store Assets Folder */}
                <li className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">store-assets/</span>
                </li>
                <li className="flex items-center gap-2 pl-4">
                  {generatedImages['small-tile'] ? (
                    <>
                      <Check className="h-3 w-3 text-success" />
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">promo-small-440x280.png</code>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">small tile</code> — Generate below
                    </>
                  )}
                </li>
                <li className="flex items-center gap-2 pl-4">
                  {generatedImages['marquee'] ? (
                    <>
                      <Check className="h-3 w-3 text-success" />
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">promo-marquee-1280x800.png</code>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">marquee</code> — Generate below
                    </>
                  )}
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

      {/* Section C: Conjure the Visuals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <Card variant="glass" className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <Wand2 className="h-6 w-6 text-accent-dark" />
              </div>
              <div>
                <CardTitle className="text-xl">Conjure the Visuals</CardTitle>
                <CardDescription>AI-generated marketing assets for Chrome Web Store</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Small Promo Tile */}
            <div className="p-4 rounded-xl bg-muted/30 border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Small Promo Tile</h4>
                  <p className="text-sm text-muted-foreground">440×280px — Store listing thumbnail</p>
                </div>
                <Button 
                  onClick={() => generateImage('small-tile')}
                  disabled={generatingType !== null}
                  variant={generatedImages['small-tile'] ? 'outline' : 'default'}
                >
                  {generatingType === 'small-tile' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conjuring...
                    </>
                  ) : generatedImages['small-tile'] ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Conjure
                    </>
                  )}
                </Button>
              </div>
              {generatedImages['small-tile'] && (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border bg-slate-950">
                    <img 
                      src={generatedImages['small-tile'].imageData} 
                      alt="Small Promo Tile" 
                      className="w-full max-w-[440px] mx-auto"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadImage(generatedImages['small-tile']!, 'zero-hero-small-tile-440x280.png')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                </div>
              )}
            </div>

            {/* Marquee Promo */}
            <div className="p-4 rounded-xl bg-muted/30 border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marquee Promo</h4>
                  <p className="text-sm text-muted-foreground">1280×800px — Featured placement banner</p>
                </div>
                <Button 
                  onClick={() => generateImage('marquee')}
                  disabled={generatingType !== null}
                  variant={generatedImages['marquee'] ? 'outline' : 'default'}
                >
                  {generatingType === 'marquee' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conjuring...
                    </>
                  ) : generatedImages['marquee'] ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Conjure
                    </>
                  )}
                </Button>
              </div>
              {generatedImages['marquee'] && (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border bg-slate-950">
                    <img 
                      src={generatedImages['marquee'].imageData} 
                      alt="Marquee Promo" 
                      className="w-full"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadImage(generatedImages['marquee']!, 'zero-hero-marquee-1280x800.png')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                </div>
              )}
            </div>

            {/* Icon Preview */}
            <div className="p-4 rounded-xl bg-muted/30 border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Extension Icons</h4>
                  <p className="text-sm text-muted-foreground">Auto-generated from connector-shield.svg (16, 48, 128px)</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <Check className="h-3 w-3 mr-1" />
                  Included in ZIP
                </Badge>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-950 justify-center">
                <img src={connectorShieldSvg} alt="Icon 16" className="w-4 h-4" />
                <img src={connectorShieldSvg} alt="Icon 48" className="w-12 h-12" />
                <img src={connectorShieldSvg} alt="Icon 128" className="w-32 h-32" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Promotional images may need minor adjustments. Icons are automatically generated from the branded SVG.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section D: Visual Assets Required */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <ImageIcon className="h-6 w-6 text-success" />
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
