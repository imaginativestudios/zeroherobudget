import { Link } from "react-router-dom";
import { 
  Home, 
  Palette,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Lightbulb,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

// Color swatch component for displaying colors
interface ColorSwatchProps {
  name: string;
  cssVar: string;
  description: string;
  usage: string[];
  contrastRating?: "AAA" | "AA" | "AA-large" | "Fail";
  foregroundVar?: string;
}

const ColorSwatch = ({ name, cssVar, description, usage, contrastRating, foregroundVar }: ColorSwatchProps) => {
  const getContrastBadge = () => {
    switch (contrastRating) {
      case "AAA":
        return <Badge variant="success" className="text-xs"><Check className="h-3 w-3 mr-1" />AAA</Badge>;
      case "AA":
        return <Badge variant="success" className="text-xs"><Check className="h-3 w-3 mr-1" />AA</Badge>;
      case "AA-large":
        return <Badge variant="warning" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />AA Large</Badge>;
      case "Fail":
        return <Badge variant="destructive" className="text-xs"><X className="h-3 w-3 mr-1" />Fail</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div 
        className="h-24 flex items-center justify-center"
        style={{ backgroundColor: `hsl(var(${cssVar}))` }}
      >
        {foregroundVar && (
          <span 
            className="text-sm font-medium"
            style={{ color: `hsl(var(${foregroundVar}))` }}
          >
            Sample Text
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">{name}</h4>
          {getContrastBadge()}
        </div>
        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block">
          {cssVar}
        </code>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-1">
          {usage.map((use, i) => (
            <Badge key={i} variant="outline" className="text-xs">{use}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

const ColorPaletteGuide = () => {
  const coreColors = [
    {
      name: "Primary",
      cssVar: "--primary",
      description: "Main brand color - Teal. Used for primary actions and brand identity.",
      usage: ["Buttons", "Links", "Focus rings", "Brand elements"],
      contrastRating: "AAA" as const,
      foregroundVar: "--primary-foreground"
    },
    {
      name: "Primary Light",
      cssVar: "--primary-light",
      description: "Lighter teal variant for hover states and accents.",
      usage: ["Hover states", "Decorative accents"],
      contrastRating: "AA" as const,
      foregroundVar: "--primary-foreground"
    },
    {
      name: "Primary Dark",
      cssVar: "--primary-dark",
      description: "Darker teal for text on light backgrounds.",
      usage: ["Text on accent", "Active states"],
      contrastRating: "AAA" as const,
      foregroundVar: "--primary-foreground"
    },
    {
      name: "Accent",
      cssVar: "--accent",
      description: "Sandy orange - Secondary brand color for highlights and CTAs.",
      usage: ["Icons", "Highlights", "CTAs"],
      contrastRating: "AA-large" as const,
      foregroundVar: "--accent-foreground"
    },
    {
      name: "Accent Dark",
      cssVar: "--accent-dark",
      description: "Darker orange for text - WCAG AA compliant.",
      usage: ["Text labels", "Insights", "Links"],
      contrastRating: "AA" as const,
      foregroundVar: "--primary-foreground"
    },
  ];

  const semanticColors = [
    {
      name: "Success",
      cssVar: "--success",
      description: "Green-teal for positive states, confirmations, and completed actions.",
      usage: ["Success messages", "Completed status", "Positive trends"],
      contrastRating: "AA" as const,
      foregroundVar: "--success-foreground"
    },
    {
      name: "Warning",
      cssVar: "--warning",
      description: "Amber-orange for warnings and caution states.",
      usage: ["Warnings", "Budget alerts", "Attention needed"],
      contrastRating: "AA" as const,
      foregroundVar: "--warning-foreground"
    },
    {
      name: "Destructive",
      cssVar: "--destructive",
      description: "Red for errors, deletions, and critical actions.",
      usage: ["Error messages", "Delete actions", "Negative trends"],
      contrastRating: "AA" as const,
      foregroundVar: "--destructive-foreground"
    },
    {
      name: "Info",
      cssVar: "--info",
      description: "Blue for informational content and neutral highlights.",
      usage: ["Info alerts", "Help text", "Neutral status"],
      contrastRating: "AA" as const,
      foregroundVar: "--info-foreground"
    },
  ];

  const tierColors = [
    {
      name: "Tier Starter",
      cssVar: "--tier-starter",
      description: "Green for starter/growth tier in pricing.",
      usage: ["Starter tier", "Growth indicators"],
      contrastRating: "AA" as const,
      foregroundVar: "--success-foreground"
    },
    {
      name: "Tier Supporter",
      cssVar: "--tier-supporter",
      description: "Blue for supporter tier.",
      usage: ["Supporter tier"],
      contrastRating: "AA" as const,
      foregroundVar: "--info-foreground"
    },
    {
      name: "Tier Champion",
      cssVar: "--tier-champion",
      description: "Gold/amber for champion tier.",
      usage: ["Champion tier", "Achievement badges"],
      contrastRating: "AA" as const,
      foregroundVar: "--warning-foreground"
    },
    {
      name: "Tier Hero",
      cssVar: "--tier-hero",
      description: "Purple for hero tier - top-tier status.",
      usage: ["Hero tier", "Premium features"],
      contrastRating: "AA" as const,
      foregroundVar: "--primary-foreground"
    },
  ];

  const surfaceColors = [
    {
      name: "Background",
      cssVar: "--background",
      description: "Main page background - light teal-tinted white.",
      usage: ["Page background", "App background"],
    },
    {
      name: "Foreground",
      cssVar: "--foreground",
      description: "Primary text color - dark teal.",
      usage: ["Body text", "Headings"],
      contrastRating: "AAA" as const,
    },
    {
      name: "Card",
      cssVar: "--card",
      description: "Card and container backgrounds.",
      usage: ["Cards", "Dialogs", "Dropdowns"],
    },
    {
      name: "Muted",
      cssVar: "--muted",
      description: "Subtle background for secondary content.",
      usage: ["Code blocks", "Disabled states", "Subtle backgrounds"],
    },
    {
      name: "Muted Foreground",
      cssVar: "--muted-foreground",
      description: "Secondary text for labels and captions.",
      usage: ["Labels", "Placeholders", "Captions"],
      contrastRating: "AA" as const,
    },
    {
      name: "Border",
      cssVar: "--border",
      description: "Default border color for all elements.",
      usage: ["Card borders", "Dividers", "Input borders"],
    },
  ];

  const chartColors = [
    { name: "Chart 1", cssVar: "--chart-1", label: "Housing" },
    { name: "Chart 2", cssVar: "--chart-2", label: "Utilities" },
    { name: "Chart 3", cssVar: "--chart-3", label: "Transportation" },
    { name: "Chart 4", cssVar: "--chart-4", label: "Food" },
    { name: "Chart 5", cssVar: "--chart-5", label: "Insurance" },
    { name: "Chart 6", cssVar: "--chart-6", label: "Personal Care" },
    { name: "Chart 7", cssVar: "--chart-7", label: "Entertainment" },
    { name: "Chart 8", cssVar: "--chart-8", label: "Savings" },
    { name: "Chart 9", cssVar: "--chart-9", label: "Debt" },
    { name: "Chart 10", cssVar: "--chart-10", label: "Misc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8" variant="dark" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/internal/style-guide/icons">
              <Button variant="ghost" size="sm">
                Icon Guide
              </Button>
            </Link>
            <Link to="/help">
              <Button variant="outline" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Back to Help
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl py-12 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Palette className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Color Palette Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive color system for Zero Hero with accessibility ratings and usage guidelines
          </p>
        </div>

        {/* Accessibility Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" />
              WCAG Accessibility Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Badge variant="success"><Check className="h-3 w-3 mr-1" />AAA</Badge>
                <span className="text-sm text-muted-foreground">7:1+ contrast</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Badge variant="success"><Check className="h-3 w-3 mr-1" />AA</Badge>
                <span className="text-sm text-muted-foreground">4.5:1+ contrast</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />AA Large</Badge>
                <span className="text-sm text-muted-foreground">3:1+ (large text)</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Fail</Badge>
                <span className="text-sm text-muted-foreground">Below 3:1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Brand Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-2xl font-bold text-foreground">Core Brand Colors</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreColors.map((color) => (
              <ColorSwatch key={color.cssVar} {...color} />
            ))}
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-2xl font-bold text-foreground">Semantic Colors</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {semanticColors.map((color) => (
              <ColorSwatch key={color.cssVar} {...color} />
            ))}
          </div>
        </section>

        {/* Tier Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-2xl font-bold text-foreground">Pricing Tier Colors</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tierColors.map((color) => (
              <ColorSwatch key={color.cssVar} {...color} />
            ))}
          </div>
        </section>

        {/* Surface Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-2xl font-bold text-foreground">Surface & Text Colors</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {surfaceColors.map((color) => (
              <ColorSwatch key={color.cssVar} {...color} />
            ))}
          </div>
        </section>

        {/* Chart Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-2xl font-bold text-foreground">Chart Colors</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {chartColors.map((color, i) => (
                  <div key={color.cssVar} className="text-center">
                    <div 
                      className="h-16 w-full rounded-lg mb-2"
                      style={{ backgroundColor: `hsl(var(${color.cssVar}))` }}
                    />
                    <p className="text-xs font-medium text-foreground">{color.label}</p>
                    <code className="text-xs text-muted-foreground">{color.cssVar}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border border-success/30 bg-success/5 rounded-lg">
                <h4 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Do
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Use semantic color tokens (<code className="text-foreground">text-success</code>, <code className="text-foreground">text-warning</code>)</li>
                  <li>• Always pair colors with their foreground variants</li>
                  <li>• Use <code className="text-foreground">text-accent-dark</code> for text on light backgrounds</li>
                  <li>• Use tier colors for pricing-related UI</li>
                  <li>• Test color combinations for accessibility</li>
                </ul>
              </div>
              <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                <h4 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Don't
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Use hardcoded colors like <code className="text-foreground">text-blue-500</code></li>
                  <li>• Mix chart colors for non-chart purposes</li>
                  <li>• Use <code className="text-foreground">text-accent</code> for small text (use <code className="text-foreground">accent-dark</code>)</li>
                  <li>• Ignore dark mode compatibility</li>
                  <li>• Use colors without checking contrast ratios</li>
                </ul>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="mt-6">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-info" />
                Quick Reference Table
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold text-muted-foreground">Use Case</th>
                      <th className="text-left p-3 font-semibold text-muted-foreground">Color Token</th>
                      <th className="text-left p-3 font-semibold text-muted-foreground">Tailwind Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-3">Primary buttons</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 rounded">--primary</code></td>
                      <td className="p-3"><Badge variant="outline">bg-primary text-primary-foreground</Badge></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3">Card icons</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 rounded">--accent</code></td>
                      <td className="p-3"><Badge variant="outline">text-accent</Badge></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3">Insight text</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 rounded">--accent-dark</code></td>
                      <td className="p-3"><Badge variant="outline">text-accent-dark</Badge></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3">Success states</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 rounded">--success</code></td>
                      <td className="p-3"><Badge variant="outline">text-success bg-success/10</Badge></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3">Warning alerts</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 rounded">--warning</code></td>
                      <td className="p-3"><Badge variant="outline">text-warning bg-warning/10</Badge></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3">Error messages</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 rounded">--destructive</code></td>
                      <td className="p-3"><Badge variant="outline">text-destructive bg-destructive/10</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-3">Info messages</td>
                      <td className="p-3"><code className="text-xs bg-muted px-1 rounded">--info</code></td>
                      <td className="p-3"><Badge variant="outline">text-info bg-info/10</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Color Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">CSS Variables</h4>
                <code className="text-sm text-muted-foreground">src/index.css</code>
                <p className="text-xs text-muted-foreground mt-2">
                  All HSL color definitions and CSS custom properties
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Tailwind Config</h4>
                <code className="text-sm text-muted-foreground">tailwind.config.ts</code>
                <p className="text-xs text-muted-foreground mt-2">
                  Tailwind class mappings to CSS variables
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ColorPaletteGuide;
