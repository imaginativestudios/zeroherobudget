import { Link } from "react-router-dom";
import { 
  Home, LayoutDashboard, Wallet, CreditCard, Receipt, BarChart3, 
  Trophy, Lightbulb, Database, User, Users, Settings, Shield, 
  HelpCircle, FileText, Scale, Lock, Smartphone, MapPin, Sparkles,
  PaintBucket, Shapes, ArrowRight, Globe, Bot, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

interface RouteInfo {
  path: string;
  name: string;
  description: string;
  icon: React.ElementType;
  tags: string[];
}

const publicRoutes: RouteInfo[] = [
  { path: "/", name: "Coming Soon", description: "Landing page with waitlist signup and demo access", icon: Home, tags: ["marketing", "waitlist"] },
  { path: "/landing", name: "Landing Page", description: "Full marketing page with features, pricing, and social proof", icon: Globe, tags: ["marketing"] },
  { path: "/auth", name: "Authentication", description: "Login and signup modal with email/password auth", icon: Lock, tags: ["auth"] },
  { path: "/reset-password", name: "Reset Password", description: "Password reset flow via email link", icon: Lock, tags: ["auth"] },
  { path: "/onboarding", name: "Onboarding", description: "4-step setup: hourly wage, primary debt, emergency fund, payoff timeline", icon: MapPin, tags: ["onboarding"] },
  { path: "/pricing", name: "Pricing", description: "Subscription plans with Stripe checkout", icon: CreditCard, tags: ["billing"] },
  { path: "/privacy", name: "Privacy Policy", description: "Data privacy and handling policies", icon: Shield, tags: ["legal"] },
  { path: "/terms", name: "Terms of Service", description: "Terms and conditions", icon: FileText, tags: ["legal"] },
  { path: "/legal", name: "Legal", description: "Legal information hub", icon: Scale, tags: ["legal"] },
  { path: "/help", name: "Help & Support", description: "FAQ and support resources", icon: HelpCircle, tags: ["support"] },
  { path: "/data-privacy", name: "Data Privacy FAQ", description: "Detailed data privacy questions and answers", icon: Lock, tags: ["legal", "support"] },
  { path: "/install", name: "Install Guide", description: "PWA installation instructions for all platforms", icon: Smartphone, tags: ["pwa"] },
];

const protectedRoutes: RouteInfo[] = [
  { path: "/dashboard", name: "Dashboard", description: "Command center with financial overview, debt targets, AI budget drafting, and getting started checklist", icon: LayoutDashboard, tags: ["core", "ai"] },
  { path: "/journey", name: "Journey", description: "Financial freedom journey with step-by-step progress tracking", icon: MapPin, tags: ["gamification"] },
  { path: "/budgets", name: "Budget", description: "Zero-based budget management with expense categories and income allocation", icon: Wallet, tags: ["core"] },
  { path: "/debts", name: "Debt Strategy", description: "Snowball/Avalanche payoff simulator with freedom date projection", icon: CreditCard, tags: ["core"] },
  { path: "/transactions", name: "Transactions", description: "Transaction log with CSV import, AI categorization, and filtering", icon: Receipt, tags: ["core", "ai"] },
  { path: "/subscriptions", name: "Subscriptions", description: "Recurring subscription tracker with billing alerts", icon: Receipt, tags: ["core"] },
  { path: "/accounts", name: "Accounts", description: "Financial account management with balance tracking", icon: Wallet, tags: ["core"] },
  { path: "/reports", name: "Reports", description: "Financial reports hub: income, net worth, subscriptions, available-for-debt", icon: BarChart3, tags: ["analytics"] },
  { path: "/achievements", name: "Achievements", description: "Unlocked badges and financial milestones", icon: Trophy, tags: ["gamification"] },
  { path: "/learn", name: "Financial Tips", description: "Educational content and financial literacy resources", icon: Lightbulb, tags: ["education"] },
  { path: "/data", name: "Data Management", description: "Backup, restore, clear data, and delete account", icon: Database, tags: ["settings"] },
  { path: "/account", name: "Account Settings", description: "Profile editing and account preferences", icon: User, tags: ["settings"] },
  { path: "/household", name: "Household", description: "Multi-user household management with role-based invitations", icon: Users, tags: ["collaboration"] },
  
];

const features = [
  { name: "AI Budget Drafting", description: "Gemini Flash analyzes spending history and suggests zero-based allocations", tags: ["ai", "core"] },
  { name: "Debt Avalanche/Snowball", description: "Visual payoff timelines with interest savings comparison", tags: ["core"] },
  { name: "Shadow Cost Calculator", description: "Shows purchase costs in work hours, not just dollars", tags: ["behavioral"] },
  { name: "Behavioral Coaching", description: "Supportive vocabulary, victory celebrations, and level-up system", tags: ["gamification"] },
  { name: "CSV Import Wizard", description: "Column mapping, category suggestions, and duplicate detection", tags: ["data"] },
  { name: "PWA + Offline", description: "Install to home screen, works offline, pull-to-refresh", tags: ["pwa"] },
  { name: "Household Sharing", description: "Invite family members with role-based access control", tags: ["collaboration"] },
  { name: "Stripe Billing", description: "Subscription management with checkout, portal, and webhooks", tags: ["billing"] },
];

const tagColors: Record<string, string> = {
  core: "bg-primary/10 text-primary",
  ai: "bg-chart-4/20 text-chart-4",
  marketing: "bg-chart-2/20 text-chart-2",
  auth: "bg-chart-3/20 text-chart-3",
  billing: "bg-chart-5/20 text-chart-5",
  legal: "bg-muted text-muted-foreground",
  support: "bg-info/10 text-info",
  settings: "bg-muted text-muted-foreground",
  gamification: "bg-warning/10 text-warning",
  analytics: "bg-chart-1/20 text-chart-1",
  education: "bg-chart-2/20 text-chart-2",
  collaboration: "bg-chart-4/20 text-chart-4",
  integrations: "bg-chart-3/20 text-chart-3",
  pwa: "bg-info/10 text-info",
  behavioral: "bg-warning/10 text-warning",
  data: "bg-muted text-muted-foreground",
  onboarding: "bg-chart-2/20 text-chart-2",
};

function RouteCard({ route }: { route: RouteInfo }) {
  const Icon = route.icon;
  return (
    <Link to={route.path} className="block group">
      <Card className="h-full transition-all duration-150 hover:shadow-md hover:border-primary/30 group-hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="rounded-lg bg-muted p-2 shrink-0">
            <Icon className="h-4 w-4 text-foreground/70" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{route.name}</h3>
              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{route.description}</p>
            <code className="text-[10px] text-muted-foreground/60 font-mono">{route.path}</code>
            <div className="flex flex-wrap gap-1 mt-2">
              {route.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className={`text-[10px] px-1.5 py-0 ${tagColors[tag] || ""}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SiteMap() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Logo variant="dark" className="h-8 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Site Map & Features</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Complete overview of Zero Hero's pages, features, and capabilities.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
                <Bot className="h-3.5 w-3.5 mr-1.5" />
                llms.txt
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                robots.txt
              </a>
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <Card key={f.name} className="p-4">
                <h3 className="font-medium text-sm mb-1">{f.name}</h3>
                <p className="text-xs text-muted-foreground">{f.description}</p>
                <div className="flex gap-1 mt-2">
                  {f.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className={`text-[10px] px-1.5 py-0 ${tagColors[tag] || ""}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Public Routes */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Public Pages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {publicRoutes.map((route) => (
              <RouteCard key={route.path} route={route} />
            ))}
          </div>
        </section>

        {/* Protected Routes */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            App Pages <Badge variant="outline" className="text-[10px] ml-1">requires login</Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {protectedRoutes.map((route) => (
              <RouteCard key={route.path} route={route} />
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Technology Stack
          </h2>
          <Card className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {[
                ["Frontend", "React 18, TypeScript, Vite"],
                ["Styling", "Tailwind CSS, shadcn/ui"],
                ["Animation", "Framer Motion"],
                ["Charts", "Recharts"],
                ["Backend", "Supabase (Postgres, Auth, Edge Functions)"],
                ["AI", "Lovable AI Gateway (Gemini Flash)"],
                ["Payments", "Stripe"],
                ["Email", "Resend"],
                ["PWA", "vite-plugin-pwa"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="font-medium text-foreground">{label}</span>
                  <p className="text-xs text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
