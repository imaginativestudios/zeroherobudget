import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import {
  HardDrive,
  Shield,
  RefreshCw,
  AlertTriangle,
  Download,
  Home,
  Smartphone,
  Globe,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Lock,
  Eye,
  CloudOff,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function DataPrivacyFAQ() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8" variant="dark" />
          </Link>
          <Link to="/data">
            <Button variant="outline" size="sm">
              <Database className="mr-2 h-4 w-4" />
              Data Management
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Your Data, Your Device
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Understanding how Zero Hero keeps your financial data private and secure
          </p>
        </div>

        {/* Visual Explainer Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-background p-4 shadow-lg">
                  <Smartphone className="h-10 w-10 text-primary" />
                </div>
                <p className="mt-2 font-medium text-sm">Your Device</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-primary hidden md:block" />
              <div className="h-6 w-0.5 bg-primary md:hidden" />
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-background p-4 shadow-lg">
                  <HardDrive className="h-10 w-10 text-primary" />
                </div>
                <p className="mt-2 font-medium text-sm">Browser Storage</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-primary hidden md:block" />
              <div className="h-6 w-0.5 bg-primary md:hidden" />
              
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-background p-4 shadow-lg">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
                <p className="mt-2 font-medium text-sm">Your Data (Private)</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CloudOff className="h-5 w-5 text-destructive" />
                <span>No external servers</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-destructive" />
                <span className="line-through">We can't see your data</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Simple Answer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              The Short Answer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              <strong>Yes, your data will still be there</strong> when you close your browser and come back later. 
              Here's why:
            </p>
            <p className="text-muted-foreground">
              Zero Hero uses your browser's built-in "localStorage" — think of it like a personal filing cabinet 
              inside your browser. When you enter your budgets, debts, and transactions, they're saved directly 
              to this filing cabinet on your device. It persists even when you close the tab, shut down your 
              computer, or come back days later.
            </p>
          </CardContent>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {/* How Data is Stored */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">How Your Data is Stored</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="where-stored">
                <AccordionTrigger>Where is my data stored?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    Your data is stored in your web browser's <strong>localStorage</strong> — a secure, permanent 
                    storage area built into every modern browser (Chrome, Firefox, Safari, Edge, etc.).
                  </p>
                  <p className="text-muted-foreground">
                    Think of it like a private notebook that only your browser can read. Each website gets its 
                    own notebook, so Zero Hero's data is completely separate from other sites you visit.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sent-to-servers">
                <AccordionTrigger>Is my data sent to any servers?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    <strong>No.</strong> Your financial data never leaves your device. It's stored only in your 
                    browser's local storage — we can't see it, and neither can anyone else.
                  </p>
                  <p className="text-muted-foreground">
                    This "local-first" approach means maximum privacy for you. There's no cloud database 
                    holding your sensitive financial information.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-is-localstorage">
                <AccordionTrigger>What is "localStorage" in simple terms?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    LocalStorage is like a small, private filing cabinet that lives inside your browser. 
                    Every browser has one, and websites can use it to remember information between your visits.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>It stays on your computer (never sent over the internet)</li>
                    <li>It survives browser restarts and computer shutdowns</li>
                    <li>Each website gets its own separate space</li>
                    <li>Only the website that saved the data can read it back</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Data Persistence */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Data Persistence</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="close-browser">
                <AccordionTrigger>Will my data still be there if I close the browser?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    <strong>Yes!</strong> Your data is saved in your browser's permanent storage (localStorage). 
                    This means you can:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Close the browser tab ✓</li>
                    <li>Quit the browser completely ✓</li>
                    <li>Shut down your computer ✓</li>
                    <li>Come back days or weeks later ✓</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    Your budgets, transactions, and debts will all be right where you left them.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="restart-computer">
                <AccordionTrigger>What happens if I restart my computer?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Nothing changes! Your data persists through computer restarts, sleep mode, and shutdowns. 
                    When you open your browser again and visit Zero Hero, all your data will be there waiting for you.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-long-kept">
                <AccordionTrigger>How long is my data kept?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    <strong>Indefinitely</strong>, as long as you don't manually clear your browser data. 
                    LocalStorage has no automatic expiration date.
                  </p>
                  <p className="text-muted-foreground">
                    Unlike cookies (which can expire), localStorage is designed for permanent storage. 
                    Your data will remain until you explicitly delete it or clear your browser cache.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Potential Data Loss */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-warning" />
              <h2 className="text-2xl font-bold text-foreground">When You Could Lose Data</h2>
            </div>
            
            <Card className="mb-4 border-warning/30 bg-warning/5">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Because your data lives only on your device, certain actions can permanently delete it. 
                  <strong> This is why we strongly recommend regular backups!</strong>
                </p>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="when-lose-data">
                <AccordionTrigger>When could I lose my data?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Your data could be lost if you:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                      <span><strong>Clear your browser cache, cookies, or site data</strong> — this erases localStorage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                      <span><strong>Use private/incognito browsing</strong> — data isn't saved between sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                      <span><strong>Reinstall or reset your browser</strong> — this clears all browser data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                      <span><strong>Use a different browser or device</strong> — data doesn't sync automatically</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="clear-cache">
                <AccordionTrigger>What happens if I clear my browser cache?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    If you clear <strong>all</strong> site data (sometimes called "cookies and other site data"), 
                    your Zero Hero data will be permanently deleted.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Tip:</strong> Most browsers let you clear cache while keeping site data. Look for options 
                    like "Clear browsing data" and uncheck "Cookies and other site data" to preserve your Zero Hero information.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="different-device">
                <AccordionTrigger>Can I access my data on another device?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    <strong>Not automatically.</strong> Since your data lives only in your browser's local storage, 
                    it doesn't sync between devices or browsers.
                  </p>
                  <p className="text-muted-foreground">
                    However, you can manually transfer your data by creating a backup on one device and restoring 
                    it on another. This is done through the <Link to="/data" className="text-primary hover:underline">Data Management</Link> page.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Protecting Your Data */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Protecting Your Data</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-backup">
                <AccordionTrigger>How do I back up my data?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 mb-3">
                    <li>Go to the <Link to="/data" className="text-primary hover:underline">Data Management</Link> page</li>
                    <li>Find the "Backup & Restore" section</li>
                    <li>Click "Download Backup"</li>
                    <li>Save the JSON file somewhere safe (like your Documents folder or cloud storage)</li>
                  </ol>
                  <p className="text-muted-foreground">
                    The backup file contains all your transactions, budgets, debts, and subscriptions in a 
                    single, portable file.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-restore">
                <AccordionTrigger>How do I restore from a backup?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 mb-3">
                    <li>Go to the <Link to="/data" className="text-primary hover:underline">Data Management</Link> page</li>
                    <li>Find the "Backup & Restore" section</li>
                    <li>Click "Restore from Backup"</li>
                    <li>Select your backup JSON file</li>
                    <li>Confirm the restore</li>
                  </ol>
                  <p className="text-muted-foreground">
                    <strong>Note:</strong> Restoring will replace your current data with the backup data. 
                    Consider creating a fresh backup first if you have data you want to keep.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-often-backup">
                <AccordionTrigger>How often should I back up?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">We recommend backing up:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong>Weekly</strong> — if you're actively tracking finances</li>
                    <li><strong>After major updates</strong> — when you add lots of transactions or debts</li>
                    <li><strong>Before clearing browser data</strong> — always back up first!</li>
                    <li><strong>Before switching devices</strong> — so you can restore on the new device</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    Zero Hero will remind you if your backup is more than 7 days old.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Bank Account Linking */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Bank Account Linking</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-happens-link">
                <AccordionTrigger>What happens when I link a bank account?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    When you link a bank account, you log in through <strong>Plaid</strong>, a trusted financial 
                    technology service used by thousands of apps. Plaid connects to your bank securely and sends 
                    us only basic account info:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Account name and type (e.g., "Checking")</li>
                    <li>Last 4 digits of the account number</li>
                    <li>Current balance</li>
                    <li>Your bank's name</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    This data is stored locally on your device, just like all your other financial data.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="see-bank-login">
                <AccordionTrigger>Does Zero Hero see my bank login?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    <strong>No.</strong> You log in directly through Plaid's secure interface. Your bank username 
                    and password are never sent to or stored by Zero Hero. We have no way to access your bank 
                    account directly.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="linked-data-stored">
                <AccordionTrigger>Where is my linked account data stored?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    The same place as all your other financial data — <strong>locally on your device</strong>, 
                    in your browser's storage. It never gets sent to our servers.
                  </p>
                  <p className="text-muted-foreground">
                    This means the same backup and data-loss precautions apply. We recommend regular backups 
                    through the <Link to="/data" className="text-primary hover:underline">Data Management</Link> page.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="disconnect-bank">
                <AccordionTrigger>Can I disconnect my bank?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    <strong>Yes, anytime.</strong> Go to the Accounts page and click "Disconnect" on any linked account. 
                    All data for that account will be permanently removed from your device immediately.
                  </p>
                  <p className="text-muted-foreground">
                    You can also revoke Plaid's access to your bank directly through{" "}
                    <a href="https://my.plaid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      my.plaid.com
                    </a>.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Visual Data Lifecycle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              Your Data Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <p className="mt-2 font-medium text-sm">Enter Data</p>
                <p className="text-xs text-muted-foreground">Add budgets, debts, transactions</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <p className="mt-2 font-medium text-sm">Saved Instantly</p>
                <p className="text-xs text-muted-foreground">Stored in browser localStorage</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <p className="mt-2 font-medium text-sm">Always Available</p>
                <p className="text-xs text-muted-foreground">Come back anytime</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary border-dashed">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 font-medium text-sm">Backup Regularly</p>
                <p className="text-xs text-muted-foreground">Recommended!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to protect your data?</h3>
            <p className="text-muted-foreground mb-6">
              Head to Data Management to create your first backup or restore from an existing one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/data">
                <Button size="lg" className="w-full sm:w-auto">
                  <Database className="mr-2 h-5 w-5" />
                  Go to Data Management
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Home className="mr-2 h-5 w-5" />
                  Help & Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}