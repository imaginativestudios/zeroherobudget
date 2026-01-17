import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Shield, 
  Heart, 
  Scroll, 
  Compass, 
  Database, 
  CreditCard, 
  AlertTriangle,
  Cookie
} from "lucide-react";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Zero Hero home">
            <Logo className="h-8 w-auto" />
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
            The Code of the Fortress
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparency, Privacy, and Terms of Engagement for all Wayfarers.
          </p>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-8">
            <TabsTrigger 
              value="privacy" 
              className="flex items-center gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Heart className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">The Fortress Pledge</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
            <TabsTrigger 
              value="terms" 
              className="flex items-center gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Scroll className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Terms of Engagement</span>
              <span className="sm:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger 
              value="connector" 
              className="flex items-center gap-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Compass className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">The Scout Protocol</span>
              <span className="sm:hidden">Connector</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab A: The Fortress Pledge (Privacy Policy) */}
          <TabsContent value="privacy" className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
                The Fortress Pledge
              </h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg italic">
                At Zero Hero, we believe your financial data is sovereign territory.
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
                    <h3 className="font-semibold text-card-foreground mb-2">Local-First Architecture</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Your financial Atlas, including all transaction history and debt data, is stored locally on your device using IndexedDB (via RxDB). Zero Hero servers do not possess, read, or monetize your personal financial records.
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
                    <h3 className="font-semibold text-card-foreground mb-2">No Third-Party Tracking</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      We do not sell your data. We use anonymous telemetry only to track game progression (e.g., 'Level Ups') to improve the experience.
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
                    <h3 className="font-semibold text-card-foreground mb-2">Payment Data</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Subscription payments are processed securely via Stripe. Zero Hero does not store your credit card information.
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
                  <h3 className="font-semibold text-card-foreground mb-2 text-sm">Cookie Policy</h3>
                  <p className="text-muted-foreground text-sm">
                    We use cookies solely for authentication (Supabase) and payment processing (Stripe).
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab B: Terms of Engagement (Terms of Service) */}
          <TabsContent value="terms" className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                <Scroll className="h-6 w-6 text-primary" aria-hidden="true" />
                Terms of Engagement
              </h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg italic">
                By using Zero Hero, you agree to the following:
              </p>

              <div className="space-y-6">
                {/* Educational Purpose */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Educational Purpose</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Zero Hero is a navigational tool and behavioral coach. It is not a financial advisor. All insights, including 'Shadow Budget' calculations and 'Freedom Dates,' are estimates based on user input.
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
                    <h3 className="font-semibold text-card-foreground mb-2">User Responsibility</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      You are the sole commander of your finances. Zero Hero is not liable for financial decisions made based on app data.
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
                    <h3 className="font-semibold text-card-foreground mb-2">As-Is Software</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      The software is provided 'as is' without warranty of any kind. We strive for perfection, but bugs may occur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab C: The Scout Protocol (Connector Extension) */}
          <TabsContent value="connector" className="space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                <Compass className="h-6 w-6 text-primary" aria-hidden="true" />
                The Scout Protocol
              </h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg italic">
                Regarding the use of the Zero Hero Connector (Browser Extension):
              </p>

              <div className="space-y-6">
                {/* User Autonomy */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">User Autonomy</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      The Connector is a tool that allows you to scrape your own data from your banking dashboard. It operates entirely on your client-side browser.
                    </p>
                  </div>
                </div>

                {/* No Liability */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">No Liability</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Zero Hero is not responsible for any violations of your bank's Terms of Service resulting from the use of automated scraping tools. Use the Scout responsibly.
                    </p>
                  </div>
                </div>

                {/* Data Integrity */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Data Integrity</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      You are responsible for verifying the accuracy of imported data before acting on it.
                    </p>
                  </div>
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
