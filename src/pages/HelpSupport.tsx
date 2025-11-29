import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import {
  HelpCircle,
  BookOpen,
  Target,
  MessageCircleQuestion,
  Wrench,
  Mail,
  Wallet,
  TrendingDown,
  CreditCard,
  BarChart3,
  Home,
  Users,
  Calendar,
  Shield,
  Download,
  RefreshCw,
  Eye,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

const HelpSupport = () => {
  const { resetTour } = useOnboardingTour();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTakeTour = () => {
    resetTour();
    // Navigate to dashboard where tour will start
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8" />
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <HelpCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Help & Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to get started and make the most of Zero Hero
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => scrollToSection("getting-started")}
            className="bg-card border border-border rounded-lg p-6 text-left hover:bg-muted/50 transition-colors"
          >
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Getting Started</h3>
            <p className="text-sm text-muted-foreground">Learn the basics</p>
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="bg-card border border-border rounded-lg p-6 text-left hover:bg-muted/50 transition-colors"
          >
            <Target className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Features</h3>
            <p className="text-sm text-muted-foreground">Explore capabilities</p>
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="bg-card border border-border rounded-lg p-6 text-left hover:bg-muted/50 transition-colors"
          >
            <MessageCircleQuestion className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">FAQ</h3>
            <p className="text-sm text-muted-foreground">Common questions</p>
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="bg-card border border-border rounded-lg p-6 text-left hover:bg-muted/50 transition-colors"
          >
            <Mail className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Contact Us</h3>
            <p className="text-sm text-muted-foreground">Get in touch</p>
          </button>
        </div>

        {/* Getting Started Section */}
        <section id="getting-started" className="scroll-mt-20">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Getting Started</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">1</span>
                  Creating Your Account
                </h3>
                <p className="text-muted-foreground ml-10">
                  Click the "Get Started" button on the home page and sign up with your email address. You'll receive a confirmation email to verify your account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">2</span>
                  Setting Up Your First Budget
                </h3>
                <p className="text-muted-foreground ml-10">
                  Navigate to the Budget page and start adding your monthly expenses. Organize them by category (Housing, Utilities, Food, etc.) and set planned amounts for each item. You can drag and drop to reorder items within categories.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">3</span>
                  Adding Your Debts
                </h3>
                <p className="text-muted-foreground ml-10">
                  Go to the Debt Snowball page and add all your debts including credit cards, student loans, and personal loans. Enter the balance, interest rate, and minimum payment for each. Zero Hero will calculate the optimal payoff strategy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">4</span>
                  Inviting Household Members
                </h3>
                <p className="text-muted-foreground ml-10">
                  Visit the Household page to invite family members or partners. They'll receive an email invitation to join your household and collaborate on your shared financial goals.
                </p>
              </div>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Compass className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Interactive Tour</h4>
                      <p className="text-sm text-muted-foreground">
                        Take our interactive tour to learn about all the features and how to navigate the app. Perfect for new users or if you want a refresher!
                      </p>
                    </div>
                    <Button 
                      onClick={handleTakeTour}
                      variant="default"
                      size="sm"
                      className="gap-2"
                    >
                      <Compass className="h-4 w-4" />
                      Restart Tour
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview Section */}
        <section id="features" className="scroll-mt-20">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Key Features</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Budget Tracking</h3>
                </div>
                <p className="text-muted-foreground">
                  Track planned vs. actual spending across 10 household categories. Visualize budget variance with charts and get instant insights on overspending.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <TrendingDown className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Debt Payoff Strategies</h3>
                </div>
                <p className="text-muted-foreground">
                  Choose between Debt Snowball (smallest balance first) or Debt Avalanche (highest interest first) strategies. See projected payoff timelines and total interest saved.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Subscription Management</h3>
                </div>
                <p className="text-muted-foreground">
                  Track all your recurring subscriptions in one place. Get alerts for upcoming renewals and identify subscriptions you may no longer need.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Reports & Analytics</h3>
                </div>
                <p className="text-muted-foreground">
                  Generate detailed financial reports including income analysis, net worth tracking, and expense breakdowns. Export reports as PDF or CSV.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Household Collaboration</h3>
                </div>
                <p className="text-muted-foreground">
                  Invite family members to collaborate on shared finances. Assign roles (Owner, Admin, Member, Viewer) with different permission levels.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
                </div>
                <p className="text-muted-foreground">
                  Record and categorize all income and expenses. Search, filter, and analyze transaction patterns over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-20">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <MessageCircleQuestion className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">General Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Zero Hero?</AccordionTrigger>
                  <AccordionContent>
                    Zero Hero is a comprehensive debt management and budgeting application designed to help individuals and families achieve financial freedom. We combine proven debt payoff strategies with intuitive budget tracking, subscription management, and collaborative household features.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Is Zero Hero free to use?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Zero Hero offers a free tier that includes all core features including budget tracking, debt management, and basic reports. Premium features like advanced analytics and priority support are available with our paid plans.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>What debt payoff strategies are available?</AccordionTrigger>
                  <AccordionContent>
                    Zero Hero supports two proven strategies: the Debt Snowball method (paying off smallest balances first for psychological wins) and the Debt Avalanche method (paying off highest interest rates first to save money). You can switch between strategies at any time to see which works best for you.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I use Zero Hero with my family?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely! Zero Hero includes household collaboration features. You can invite family members, assign different roles (Owner, Admin, Member, Viewer), and work together on shared financial goals. All household members can view and contribute to budgets, debts, and transactions based on their permission level.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>What browsers are supported?</AccordionTrigger>
                  <AccordionContent>
                    Zero Hero works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for the best experience and security.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Can I access Zero Hero on my phone?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Zero Hero is fully responsive and works on smartphones and tablets. Simply access it through your mobile browser. We're also working on dedicated mobile apps for iOS and Android.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <h3 className="text-lg font-semibold text-foreground mt-8">Account & Billing</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="account-1">
                  <AccordionTrigger>How do I create an account?</AccordionTrigger>
                  <AccordionContent>
                    Click the "Get Started" button on the home page, enter your email address and create a password. You'll receive a confirmation email to verify your account. Once verified, you can log in and start using Zero Hero immediately.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-2">
                  <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                  <AccordionContent>
                    On the login page, click "Forgot Password" and enter your email address. You'll receive an email with instructions to reset your password. The reset link is valid for 24 hours.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-3">
                  <AccordionTrigger>Can I delete my account?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can delete your account at any time from your Account Settings. Please note that this action is permanent and will delete all your data including budgets, debts, transactions, and household information. We recommend exporting your data before deletion if you want to keep a copy.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account-4">
                  <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                  <AccordionContent>
                    For premium subscriptions, we accept all major credit cards (Visa, MasterCard, American Express, Discover) and PayPal. All payments are processed securely through industry-standard payment processors.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <h3 className="text-lg font-semibold text-foreground mt-8">Data & Privacy</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="privacy-1">
                  <AccordionTrigger>Is my financial data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes! We take security seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use industry-standard security practices including regular security audits, secure authentication, and data isolation. We never store bank account credentials.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-2">
                  <AccordionTrigger>Do you sell my data to third parties?</AccordionTrigger>
                  <AccordionContent>
                    Never. We do not sell, rent, or share your personal or financial data with third parties for marketing purposes. Your data is yours. We only share data when required by law or with service providers essential to operating Zero Hero (and only under strict confidentiality agreements).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-3">
                  <AccordionTrigger>Can I export my data?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can export all your data at any time. Go to Reports or Settings and use the export feature to download your data in CSV or PDF format. This includes budgets, debts, transactions, and household information.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy-4">
                  <AccordionTrigger>What happens to my data if I delete my account?</AccordionTrigger>
                  <AccordionContent>
                    When you delete your account, all your personal data is permanently removed from our active systems within 30 days. Some data may be retained in encrypted backups for up to 90 days for disaster recovery purposes, after which it is permanently deleted. Aggregated, anonymized data may be retained for analytics.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Troubleshooting Section */}
        <section id="troubleshooting" className="scroll-mt-20">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Troubleshooting Tips</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  The app is loading slowly
                </h3>
                <p className="text-muted-foreground ml-7 mb-2">
                  Try these solutions:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-7 space-y-1">
                  <li>Clear your browser cache and cookies</li>
                  <li>Close other browser tabs to free up memory</li>
                  <li>Check your internet connection speed</li>
                  <li>Try accessing Zero Hero in an incognito/private window</li>
                  <li>Disable browser extensions that might interfere with the app</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  My data isn't syncing across devices
                </h3>
                <p className="text-muted-foreground ml-7 mb-2">
                  If your data isn't appearing on another device:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-7 space-y-1">
                  <li>Make sure you're logged into the same account on both devices</li>
                  <li>Refresh the page or app on the second device</li>
                  <li>Check that you have a stable internet connection</li>
                  <li>Log out and log back in to force a sync</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  I can't see my transactions
                </h3>
                <p className="text-muted-foreground ml-7 mb-2">
                  If transactions aren't displaying:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-7 space-y-1">
                  <li>Check that you've selected the correct date range</li>
                  <li>Verify you're viewing the correct household (if you have multiple)</li>
                  <li>Clear any active filters that might be hiding transactions</li>
                  <li>Refresh the page to reload data</li>
                  <li>Try accessing from a different browser or device</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  How do I clear the cache?
                </h3>
                <p className="text-muted-foreground ml-7 mb-2">
                  To clear your browser cache:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-7 space-y-1">
                  <li><strong>Chrome:</strong> Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac), select "Cached images and files", and click "Clear data"</li>
                  <li><strong>Firefox:</strong> Press Ctrl+Shift+Delete, select "Cache", and click "Clear Now"</li>
                  <li><strong>Safari:</strong> Go to Safari → Preferences → Privacy → Manage Website Data → Remove All</li>
                  <li><strong>Edge:</strong> Press Ctrl+Shift+Delete, select "Cached images and files", and click "Clear"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-20">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Contact Support</h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help!
              </p>

              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:support@zerohero.com" className="text-primary hover:underline">
                      support@zerohero.com
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                  <p className="text-muted-foreground">
                    We typically respond within 24 hours on business days. Premium members receive priority support with response times under 4 hours.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-1">Before Contacting Support</h3>
                  <p className="text-muted-foreground">
                    Please include your account email, a detailed description of the issue, and any relevant screenshots. This helps us resolve your issue faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who are taking control of their finances with Zero Hero.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="default" className="bg-accent hover:bg-accent-dark text-primary-dark hover:text-white">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground border-t border-border pt-8">
          <p>© 2026 Zero Hero. From balances due to a more balanced you.</p>
        </footer>
      </main>
    </div>
  );
};

export default HelpSupport;
