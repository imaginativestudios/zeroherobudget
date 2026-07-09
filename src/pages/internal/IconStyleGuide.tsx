import { Link } from "react-router-dom";
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Target, 
  CreditCard, 
  Calendar,
  BookOpen,
  Shield,
  Mail,
  Plus,
  Edit,
  Trash2,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Compass
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

const IconStyleGuide = () => {
  const iconPatterns = [
    {
      name: "Card Title Icons",
      description: "Used in card headers for financial data, KPIs, and chart titles",
      size: "h-5 w-5",
      color: "text-accent",
      examples: [
        { icon: DollarSign, label: "Monthly Income" },
        { icon: TrendingUp, label: "Budget Summary" },
        { icon: Compass, label: "Spending Chart" },
      ]
    },
    {
      name: "Section Header Icons",
      description: "Used for major page sections and feature headers",
      size: "h-6 w-6",
      color: "text-primary",
      examples: [
        { icon: BookOpen, label: "Getting Started" },
        { icon: Target, label: "Key Features" },
        { icon: Shield, label: "Data Privacy" },
      ]
    },
    {
      name: "Quick Link Cards",
      description: "Used in navigation cards and feature callout grids",
      size: "h-6 w-6",
      color: "text-primary",
      examples: [
        { icon: BookOpen, label: "Getting Started" },
        { icon: Mail, label: "Contact Us" },
        { icon: Calendar, label: "Transactions" },
      ]
    },
    {
      name: "Hero Icons",
      description: "Large icons for empty states and hero sections",
      size: "h-16 w-16",
      color: "text-primary",
      examples: [
        { icon: BarChart3, label: "No Data" },
        { icon: Shield, label: "Privacy Hero" },
      ]
    },
    {
      name: "Button Icons",
      description: "Icons inside buttons and action triggers",
      size: "h-4 w-4",
      color: "inherit",
      examples: [
        { icon: Plus, label: "Add" },
        { icon: Edit, label: "Edit" },
        { icon: Trash2, label: "Delete" },
      ]
    },
    {
      name: "KPI Card Icons",
      description: "Icons in key performance indicator cards",
      size: "h-5 w-5",
      color: "text-accent",
      examples: [
        { icon: CreditCard, label: "Monthly Spend" },
        { icon: Calendar, label: "Upcoming" },
        { icon: Target, label: "Goals" },
      ]
    },
    {
      name: "Insight Icons",
      description: "Icons for tips, insights, and informational callouts",
      size: "h-3.5 w-3.5",
      color: "text-accent-dark",
      examples: [
        { icon: Lightbulb, label: "Insight" },
        { icon: AlertTriangle, label: "Warning" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8" variant="dark" />
          </Link>
          <Link to="/help">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Back to Help
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl py-12 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Target className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Icon Style Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Standardized icon patterns for consistent UI across Zero Hero
          </p>
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-muted-foreground">Context</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Size</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Color</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Card Title Icons</td>
                    <td className="p-3"><Badge variant="outline">h-5 w-5</Badge></td>
                    <td className="p-3"><Badge className="bg-accent/10 text-accent">text-accent</Badge></td>
                    <td className="p-3 text-muted-foreground">Charts, KPIs, sections</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Section Headers</td>
                    <td className="p-3"><Badge variant="outline">h-6 w-6</Badge></td>
                    <td className="p-3"><Badge className="bg-primary/10 text-primary">text-primary</Badge></td>
                    <td className="p-3 text-muted-foreground">Page sections</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Quick Link Cards</td>
                    <td className="p-3"><Badge variant="outline">h-6 w-6</Badge></td>
                    <td className="p-3"><Badge className="bg-primary/10 text-primary">text-primary</Badge></td>
                    <td className="p-3 text-muted-foreground">Navigation cards</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Hero Icons</td>
                    <td className="p-3"><Badge variant="outline">h-16 w-16</Badge></td>
                    <td className="p-3"><Badge className="bg-primary/10 text-primary">text-primary</Badge></td>
                    <td className="p-3 text-muted-foreground">Empty states, heroes</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Button Icons</td>
                    <td className="p-3"><Badge variant="outline">h-4 w-4</Badge></td>
                    <td className="p-3"><Badge variant="secondary">inherit</Badge></td>
                    <td className="p-3 text-muted-foreground">Actions, triggers</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">KPI Card Icons</td>
                    <td className="p-3"><Badge variant="outline">h-5 w-5</Badge></td>
                    <td className="p-3"><Badge className="bg-accent/10 text-accent">text-accent</Badge></td>
                    <td className="p-3 text-muted-foreground">Metrics cards</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Insight Icons</td>
                    <td className="p-3"><Badge variant="outline">h-3.5 w-3.5</Badge></td>
                    <td className="p-3"><Badge className="bg-accent-dark/10 text-accent-dark">text-accent-dark</Badge></td>
                    <td className="p-3 text-muted-foreground">Tips, callouts</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Alert Icons</td>
                    <td className="p-3"><Badge variant="outline">h-5 w-5</Badge></td>
                    <td className="p-3"><Badge className="bg-warning/10 text-warning">text-warning</Badge></td>
                    <td className="p-3 text-muted-foreground">Warnings, alerts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Visual Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground">Visual Examples</h2>
          
          {iconPatterns.map((pattern) => (
            <Card key={pattern.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pattern.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{pattern.size}</Badge>
                    <Badge className="bg-muted">{pattern.color}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{pattern.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {pattern.examples.map((example, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/30">
                      <example.icon className={`${pattern.size} ${pattern.color}`} />
                      <span className="text-sm font-medium text-foreground">{example.label}</span>
                    </div>
                  ))}
                </div>
                
                {/* Code Example */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Usage:</p>
                  <code className="text-sm text-foreground font-mono">
                    {`<Icon className="${pattern.size} ${pattern.color}" />`}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-success/30 bg-success/5 rounded-lg">
                <h4 className="font-semibold text-success mb-2">✓ Do</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use <code className="text-foreground">text-accent</code> for financial data icons</li>
                  <li>• Use <code className="text-foreground">text-primary</code> for navigation icons</li>
                  <li>• Keep button icons at <code className="text-foreground">h-4 w-4</code></li>
                  <li>• Add <code className="text-foreground">aria-hidden="true"</code> to decorative icons</li>
                </ul>
              </div>
              <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                <h4 className="font-semibold text-destructive mb-2">✗ Don't</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use <code className="text-foreground">text-chart-1</code>, <code className="text-foreground">text-chart-2</code> for card icons</li>
                  <li>• Mix icon sizes within the same card type</li>
                  <li>• Use <code className="text-foreground">text-muted-foreground</code> for KPI icons</li>
                  <li>• Forget semantic color tokens</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default IconStyleGuide;
