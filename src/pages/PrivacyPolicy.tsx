import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

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
            Last Updated: December 29, 2024
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
              At Zero Hero, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, store, and protect your data when you use our debt elimination 
              and budget management application. By using Zero Hero, you agree to the collection and use of information in 
              accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Account Information</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Email address (required for account creation and authentication)</li>
              <li>Display name and profile information (optional)</li>
              <li>Password (encrypted and securely stored)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Financial Data</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Budget categories and expense amounts</li>
              <li>Debt information (balances, interest rates, payment schedules)</li>
              <li>Transaction records and descriptions</li>
              <li>Subscription service information and costs</li>
              <li>Account balances and financial goals</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and general location data</li>
              <li>Pages visited and features used within the application</li>
              <li>Timestamps of activities and interactions</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              How We Use Your Information
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To provide and maintain our debt elimination and budget management services</li>
              <li>To authenticate your identity and secure your account</li>
              <li>To calculate debt payoff strategies and financial insights</li>
              <li>To generate reports, charts, and personalized recommendations</li>
              <li>To enable household collaboration features</li>
              <li>To send important service notifications and updates</li>
              <li>To improve our application and develop new features</li>
              <li>To detect and prevent fraudulent activity or security breaches</li>
              <li>To comply with legal obligations and enforce our terms of service</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Data Storage and Security
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Where We Store Your Data</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Your data is stored securely using Supabase, a trusted cloud infrastructure provider built on PostgreSQL. 
              All data is encrypted in transit using SSL/TLS protocols and at rest using industry-standard encryption.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Security Measures</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Password hashing using bcrypt with salt rounds</li>
              <li>Row-Level Security (RLS) policies to isolate user data</li>
              <li>Secure authentication tokens with automatic expiration</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>HTTPS encryption for all data transmission</li>
              <li>Access controls and permission management</li>
              <li>Automated backup systems for data recovery</li>
            </ul>

            <p className="text-foreground/80 leading-relaxed mt-4">
              While we implement robust security measures, no method of transmission over the internet or electronic storage 
              is 100% secure. We cannot guarantee absolute security but continuously work to protect your information.
            </p>
          </section>

          {/* Your Rights Under GDPR */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Rights Under GDPR</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you are a resident of the European Economic Area (EEA), you have certain data protection rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data under certain conditions</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of how we process your data</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Right to Object:</strong> Object to our processing of your personal data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:privacy@zerohero.app" className="text-primary hover:underline">
                privacy@zerohero.app
              </a>
            </p>
          </section>

          {/* Data Sharing and Third Parties */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Third Parties</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in 
              the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Service Providers:</strong> Trusted third-party services (e.g., Supabase for hosting) that help us operate our application</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Household Members:</strong> With other members of your household (only data you choose to share)</li>
              <li><strong>Protection of Rights:</strong> To protect the rights, property, or safety of Zero Hero, our users, or others</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our application</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              You can control cookie settings through your browser, but disabling certain cookies may affect functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-foreground/80 leading-relaxed">
              We retain your personal data only for as long as necessary to provide our services and fulfill the purposes 
              outlined in this policy. When you delete your account, we will delete or anonymize your personal information 
              within 30 days, except where we are required to retain it for legal, regulatory, or security purposes.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              Zero Hero is not intended for use by individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have inadvertently collected data from a child, please contact 
              us immediately so we can delete it.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
            <p className="text-foreground/80 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws. We ensure that appropriate safeguards are in place 
              to protect your data in accordance with this Privacy Policy and applicable laws.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" 
              date. Your continued use of Zero Hero after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Contact Us
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-foreground/80">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@zerohero.app" className="text-primary hover:underline">
                  privacy@zerohero.app
                </a>
              </p>
              <p className="text-foreground/80">
                <strong>Data Protection Officer:</strong>{" "}
                <a href="mailto:dpo@zerohero.app" className="text-primary hover:underline">
                  dpo@zerohero.app
                </a>
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We will respond to all requests within 30 days in accordance with GDPR requirements.
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
