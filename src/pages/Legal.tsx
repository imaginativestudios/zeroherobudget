import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Shield, 
  Heart, 
  Scroll, 
  Link2, 
  Database, 
  CreditCard, 
  AlertTriangle,
  Cookie,
  Lock,
  Trash2
} from "lucide-react";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Zero Hero home">
            <Logo className="h-8 w-auto" variant="dark" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Shield className="h-12 w-12 mx-auto text-primary mb-4" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
            Legal & Privacy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How we protect your data, what you agree to, and how bank connections work.
          </p>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-8">
            <TabsTrigger 
              value="privacy" 
              className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm text-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Heart className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Privacy</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
            <TabsTrigger 
              value="terms" 
              className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm text-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Scroll className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Terms of Service</span>
              <span className="sm:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bank-connections" 
              className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm text-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Link2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Bank Connections</span>
              <span className="sm:hidden">Banks</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab A: Privacy */}
          <TabsContent value="privacy" className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
                Our Privacy Promise
              </h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg">
                Your financial data belongs to you. Here's how we keep it that way.
              </p>

              <div className="space-y-6">
                {/* Local-First Architecture */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Your Data Stays on Your Device</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Your financial information — transactions, debts, budgets — is stored locally in your browser's storage. Our servers don't have access to your personal financial records.
                    </p>
                  </div>
                </div>

                {/* No Third-Party Tracking */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">No Selling Your Data</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      We don't sell, trade, or share your data with advertisers. We only use anonymous usage metrics to improve the app experience.
                    </p>
                  </div>
                </div>

                {/* Payment Data */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Payments Handled by Stripe</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Subscription payments are processed securely through Stripe. We never store your credit card number.
                    </p>
                  </div>
                </div>

                {/* Bank Connections via Plaid */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Bank Connections via Plaid</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      If you choose to link a bank account, the connection is handled by{" "}
                      <a href="https://plaid.com/legal/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Plaid</a>, 
                      a trusted financial technology provider. We never see your bank login credentials. See the Bank Connections tab for full details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookie Policy Note */}
            <div className="bg-muted/50 border border-border rounded-xl p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2 text-sm">Cookies</h3>
                  <p className="text-muted-foreground text-sm">
                    We only use cookies for authentication (Supabase) and payment processing (Stripe). No advertising or tracking cookies.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab B: Terms of Service */}
          <TabsContent value="terms" className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                <Scroll className="h-6 w-6 text-primary" aria-hidden="true" />
                Terms of Service
              </h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg">
                By using Zero Hero, you agree to the following:
              </p>

              <div className="space-y-6">
                {/* Not Financial Advice */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Not Financial Advice</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Zero Hero is a budgeting and debt tracking tool — not a financial advisor. Features like payoff projections and budget suggestions are estimates based on what you enter. Always consult a qualified professional for financial decisions.
                    </p>
                  </div>
                </div>

                {/* User Responsibility */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">You're in Control</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      You are responsible for the accuracy of the data you enter and for any financial decisions you make. Zero Hero is not liable for outcomes based on app data.
                    </p>
                  </div>
                </div>

                {/* As-Is Software */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Provided As-Is</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      The software is provided "as is" without warranty. We work hard to keep things running smoothly, but bugs can happen.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mt-6">
                For the full legal terms, see our{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">complete Terms of Service</Link>.
              </p>
            </div>
          </TabsContent>

          {/* Tab C: Bank Connections */}
          <TabsContent value="bank-connections" className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                <Link2 className="h-6 w-6 text-primary" aria-hidden="true" />
                Bank Connections
              </h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg">
                How linking your bank account works, and what happens with your data.
              </p>

              <div className="space-y-6">
                {/* How it works */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">How It Works</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      When you link a bank account, you log in directly through{" "}
                      <a href="https://plaid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Plaid</a>, 
                      a trusted service used by thousands of financial apps. Plaid connects to your bank on your behalf — Zero Hero never sees or stores your bank login credentials.
                    </p>
                  </div>
                </div>

                {/* What we store */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">What We Store</h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-2">
                      After you connect, we only receive and store locally on your device:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground text-sm sm:text-base space-y-1 ml-1">
                      <li>Account name and type (e.g., "Checking")</li>
                      <li>Last 4 digits of the account number</li>
                      <li>Current balance</li>
                      <li>Your bank's name</li>
                    </ul>
                  </div>
                </div>

                {/* What we don't store */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">What We Don't Store</h3>
                    <ul className="list-disc list-inside text-muted-foreground text-sm sm:text-base space-y-1 ml-1">
                      <li>Your bank username or password</li>
                      <li>Full account or routing numbers</li>
                      <li>Your bank login credentials on our servers</li>
                    </ul>
                  </div>
                </div>

                {/* Disconnect anytime */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Disconnect Anytime</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      You can unlink any bank account at any time. When you do, all data for that account is permanently removed from your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plaid privacy note */}
            <div className="bg-muted/50 border border-border rounded-xl p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2 text-sm">Plaid's Privacy Policy</h3>
                  <p className="text-muted-foreground text-sm">
                    Plaid has its own privacy policy governing how they handle your bank data. You can review it at{" "}
                    <a href="https://plaid.com/legal/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">plaid.com/legal</a>.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Button variant="royal" size="lg" asChild>
            <Link to="/">Return to Zero Hero</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Zero Hero. From balances due to a more balanced you.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Legal;
