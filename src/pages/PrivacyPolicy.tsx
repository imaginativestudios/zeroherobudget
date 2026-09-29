import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail, Link2 } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Logo className="h-8 md:h-10 w-auto" variant="dark" />
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last Updated: March 25, 2026
          </p>
        </div>

        {/* Privacy Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              Introduction
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              This Privacy Policy explains what information Zero Hero collects, how we use it, and how we keep it safe. 
              We've written it in plain language so you can understand exactly what's happening with your data. 
              By using Zero Hero, you agree to the practices described here.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Account Information</h3>
            <p className="text-foreground/80 leading-relaxed mb-2">
              When you create an account, we store:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Your email address (for login and account recovery)</li>
              <li>Display name and profile info (optional)</li>
              <li>Your password (encrypted — we can never see it)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Financial Data</h3>
            <p className="text-foreground/80 leading-relaxed mb-2">
              When you use Zero Hero, you enter or import the following financial information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Budget categories and expense amounts</li>
              <li>Debt balances, interest rates, and payment schedules</li>
              <li>Transaction records</li>
              <li>Subscription tracking data</li>
              <li>Linked bank account summaries (name, type, last 4 digits, balance)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
            <p className="text-foreground/80 leading-relaxed mb-2">
              We collect basic, anonymous usage data to improve the app:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Device and browser type</li>
              <li>Which features you use</li>
              <li>General location (country-level, from IP address)</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              How We Use Your Information
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Provide budgeting, debt tracking, and financial insight features</li>
              <li>Authenticate your identity and keep your account secure</li>
              <li>Enable household collaboration (shared budgets with family/partners)</li>
              <li>Send important service notifications</li>
              <li>Improve the app based on anonymous usage patterns</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Data Storage and Security
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Where Your Data Lives</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Zero Hero uses a <strong>hybrid storage model</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4 mb-4">
              <li><strong>On your device:</strong> The app keeps a working copy of your data in your browser's storage so it loads fast and works offline. This copy is cleared when you sign out. In demo mode (no account), everything stays only on your device and never reaches our servers.</li>
              <li><strong>On our servers (Supabase):</strong> When you're signed in, your budgets, debts, transactions, subscription tracking, and linked account summaries are stored in our database so they're available across your devices and can be shared with household members you invite. We also store your account profile (email, name), subscription status, and household membership info.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Security Measures</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Passwords are hashed and salted — we can never read them</li>
              <li>All data in transit is encrypted with HTTPS/TLS</li>
              <li>Row-Level Security ensures you can only access your own server-side data</li>
              <li>Authentication tokens expire automatically</li>
            </ul>

            <p className="text-foreground/80 leading-relaxed mt-4">
              No system is 100% secure, but we work continuously to protect your information.
            </p>
          </section>

          {/* Bank Account Linking */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Link2 className="h-6 w-6 text-primary" />
              Bank Account Linking
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Zero Hero offers optional bank account linking through{" "}
              <a href="https://plaid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Plaid</a>, 
              a widely trusted financial technology provider. Here's how it works:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4 mb-4">
              <li><strong>Your bank credentials stay with Plaid.</strong> When you link an account, you log in through Plaid's secure interface. Zero Hero never sees or stores your bank username or password.</li>
              <li><strong>We only receive basic account info.</strong> After you connect, Plaid sends us the account name, type, last 4 digits, balance, and transactions. When you are signed in, this account and transaction data is stored in our database (hosted by Supabase) so it is available across your devices. In demo mode, data stays only on your device.</li>
              <li><strong>No full account numbers.</strong> We do not receive or store full account numbers, routing numbers, or any credentials.</li>
              <li><strong>Disconnect anytime.</strong> You can unlink any account at any time, which removes that account's data.</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed">
              Plaid has its own privacy policy that governs how they handle your bank data. You can review it at{" "}
              <a href="https://plaid.com/legal/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">plaid.com/legal</a>.
            </p>
          </section>

          {/* Data Sharing and Third Parties */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Third Parties</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information. We share data only with the service providers below, and only what each needs to do its job:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Stripe:</strong> Processes subscription payments. Stripe receives your email address and payment details so it can bill you; we never see your full card number.</li>
              <li><strong>Plaid:</strong> Connects your bank account, only if you choose to link one. Plaid receives your bank login directly and sends us account and transaction information so the app can show your real spending.</li>
              <li><strong>Supabase:</strong> Hosts our database and sign-in system. When you are signed in, it stores your account profile and your account, transaction, budget, debt, and subscription records so your data is available on any device.</li>
              <li><strong>Google (Gemini, via the Lovable AI Gateway):</strong> Powers our AI features. It receives a pseudonymous financial snapshot — monthly income, budget categories and amounts, debts with balance and APR, 3-month spending averages, upcoming bill names and amounts, transaction descriptions for categorization, and questions you ask the chat assistant. It never receives your name, email address, or account numbers. This lets us suggest budgets and categories tailored to your numbers.</li>
              <li><strong>Resend:</strong> Sends our transactional emails, such as waitlist confirmations, account deletion codes, and household invitations. Resend receives your email address so the message can reach you.</li>
              <li><strong>ipwho.is:</strong> Looks up the country of your IP address each time you start checkout. It receives your IP address so we can confirm the service is available in your region (currently the US).</li>
              <li><strong>Household members:</strong> Data you explicitly choose to share within a household.</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We may also share information when required by law, court order, or to protect the rights and safety of our users.
            </p>
          </section>

          {/* How We Use AI */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">How We Use AI</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Which features use AI:</strong> Budget drafting, transaction categorization, and the Zora chat assistant.</li>
              <li><strong>What is sent:</strong> Financial figures and category names only, in pseudonymous form.</li>
              <li><strong>What is not sent:</strong> Your name, email address, account numbers, or Plaid credentials. Free-text fields are length-capped and escaped before sending.</li>
              <li><strong>It's a suggestion:</strong> AI output is a suggestion you can edit or ignore. It is not financial advice.</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Access your data:</strong> Request a copy of what we store about you</li>
              <li><strong>Correct your data:</strong> Update inaccurate information</li>
              <li><strong>Delete your data:</strong> Request permanent deletion of your account and data</li>
              <li><strong>Export your data:</strong> Download your financial data as a backup file</li>
              <li><strong>Withdraw consent:</strong> Stop data processing at any time</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@zeroherobudget.com" className="text-primary hover:underline">
                privacy@zeroherobudget.com
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use a minimal number of cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Authentication cookies:</strong> Keep you logged in (required)</li>
              <li><strong>Preference cookies:</strong> Remember your app settings</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We do not use advertising or third-party tracking cookies.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-foreground/80 leading-relaxed">
              We keep your account and financial data on our servers as long as your account exists. When you delete your account,
              your data is removed from our systems, except where we're legally required to retain it. The local copy on your
              device is cleared when you sign out, and you can also clear it yourself through your browser's site-data settings.
              Demo-mode data stays on your device until you clear it.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              Zero Hero is not intended for anyone under 18. We do not knowingly collect data from children. 
              If you believe we have, please contact us so we can delete it.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this policy from time to time. We'll update the "Last Updated" date at the top and notify you 
              of significant changes. Continued use of Zero Hero after changes means you accept the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Contact Us
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Questions about this policy? Reach out:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-foreground/80">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@zeroherobudget.com" className="text-primary hover:underline">
                  privacy@zeroherobudget.com
                </a>
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We'll respond within 30 days.
            </p>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="royal" asChild>
            <Link to="/">Return to Zero Hero</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Zero Hero. From balances due to a more balanced you.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
