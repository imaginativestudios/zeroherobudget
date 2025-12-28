import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertTriangle, Scale, UserX, Shield } from "lucide-react";
const TermsOfService = () => {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Logo className="h-8 md:h-10 w-auto" />
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last Updated: December 29, 2024
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Agreement to Terms */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Agreement to Terms
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Zero Hero 
              ("Company," "we," "us," or "our") regarding your access to and use of the Zero Hero application, 
              website, and related services (collectively, the "Service").
            </p>
            <p className="text-foreground/80 leading-relaxed">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to 
              these Terms, you may not access or use the Service. We reserve the right to modify these Terms 
              at any time, and your continued use of the Service after such changes constitutes acceptance of 
              the revised Terms.
            </p>
          </section>

          {/* Eligibility */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Eligibility</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              To use the Service, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              By creating an account, you represent and warrant that you meet all eligibility requirements 
              and that all information you provide is truthful and accurate.
            </p>
          </section>

          {/* Account Registration and Security */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Account Registration and Security</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Account Creation</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Provide accurate and complete registration information</li>
              <li>Keep your account information up to date</li>
              <li>Maintain the confidentiality of your password and account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Account Responsibilities</h3>
            <p className="text-foreground/80 leading-relaxed">
              You are solely responsible for maintaining the security of your account. Zero Hero will not be 
              liable for any loss or damage arising from your failure to comply with these security obligations. 
              You may not share your account credentials with any third party or allow others to access your account.
            </p>
          </section>

          {/* Acceptable Use Policy */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Acceptable Use Policy
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. 
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Use the Service for any fraudulent or illegal activities</li>
              <li>Upload or transmit viruses, malware, or malicious code</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
              <li>Scrape, data mine, or use automated systems to access the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Remove or modify any copyright, trademark, or proprietary notices</li>
              <li>Use the Service to harass, abuse, or harm another person</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Collect or store personal data about other users without permission</li>
              <li>Use the Service in any manner that could damage, disable, or impair the Service</li>
            </ul>
          </section>

          {/* Service Description */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Zero Hero provides a debt elimination and budget management platform that includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Budget tracking and expense categorization</li>
              <li>Debt management with snowball and avalanche strategies</li>
              <li>Subscription tracking and analysis</li>
              <li>Financial reporting and insights</li>
              <li>Household collaboration features</li>
              <li>Transaction management and account tracking</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time 
              without notice or liability. We do not guarantee that the Service will be available at all times 
              or free from errors, viruses, or other harmful components.
            </p>
          </section>

          {/* Financial Information Disclaimer */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Financial Information Disclaimer
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
              <p className="text-foreground/90 font-semibold mb-2">IMPORTANT NOTICE</p>
              <p className="text-foreground/80 leading-relaxed">
                Zero Hero is a financial management tool designed to help you track and organize your personal 
                finances. We are NOT financial advisors, tax professionals, or legal experts.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>The Service provides calculations, suggestions, and strategies based on the data you input</li>
              <li>All financial information, insights, and recommendations are for informational purposes only</li>
              <li>We do not provide personalized financial, investment, tax, or legal advice</li>
              <li>You should consult with qualified professionals before making financial decisions</li>
              <li>The accuracy of calculations and projections depends on the accuracy of your input data</li>
              <li>Past performance and projections do not guarantee future results</li>
              <li>We are not responsible for any financial losses or decisions made based on the Service</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Our Rights</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              The Service, including all content, features, functionality, software, designs, text, graphics, 
              logos, and other materials, is owned by Zero Hero and is protected by copyright, trademark, 
              patent, and other intellectual property laws. You may not copy, modify, distribute, sell, or 
              lease any part of the Service without our express written permission.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Your Content</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You retain ownership of any financial data, information, or content you submit to the Service 
              ("User Content"). By submitting User Content, you grant us a limited, non-exclusive, royalty-free 
              license to use, process, and store your User Content solely for the purpose of providing the Service 
              to you.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              You represent and warrant that you own or have the necessary rights to all User Content and that 
              your User Content does not violate any third-party rights or applicable laws.
            </p>
          </section>

          {/* Payment Terms */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Subscription Plans</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Zero Hero may offer both free and paid subscription plans. Paid plans may include additional 
              features, storage, or capabilities not available in free plans.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Billing and Renewal</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Subscription fees are billed in advance on a recurring basis (monthly or annually)</li>
              <li>Your subscription will automatically renew unless cancelled before the renewal date</li>
              <li>We reserve the right to change our pricing with 30 days' notice</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You are responsible for all taxes associated with your subscription</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cancellation</h3>
            <p className="text-foreground/80 leading-relaxed">
              You may cancel your subscription at any time through your account settings. Cancellation will 
              take effect at the end of your current billing period. No refunds will be provided for partial 
              subscription periods.
            </p>
          </section>

          {/* Termination */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <UserX className="h-6 w-6 text-destructive" />
              Termination
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Termination by You</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You may terminate your account at any time by contacting us or using the account deletion feature 
              in your settings. Upon termination, your access to the Service will cease, and your data will be 
              deleted in accordance with our Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Termination by Us</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account and access to the Service at any time, 
              with or without notice, for any reason, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Violation of these Terms or our policies</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Prolonged inactivity</li>
              <li>Non-payment of fees (for paid subscriptions)</li>
              <li>At our sole discretion for any other reason</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-foreground/90 font-semibold mb-2 uppercase">Important Legal Notice</p>
              <p className="text-foreground/80 leading-relaxed text-sm">
                Please read this section carefully as it limits our liability to you.
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZERO HERO AND ITS AFFILIATES, OFFICERS, DIRECTORS, 
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Financial losses resulting from decisions made using the Service</li>
              <li>Errors, mistakes, or inaccuracies in calculations or recommendations</li>
              <li>Service interruptions, downtime, or data loss</li>
              <li>Unauthorized access to your account or data</li>
              <li>Third-party actions or content</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) 
              MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT</li>
              <li>ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY INFORMATION OR CALCULATIONS</li>
              <li>UNINTERRUPTED, SECURE, OR ERROR-FREE OPERATION</li>
              <li>If you have any dispute with us, you agree to first contact us and attempt to resolve the dispute informally by contacting us at legal@zeroherobudget.com</li>
              <li>THAT THE SERVICE IS FREE FROM VIRUSES OR HARMFUL COMPONENTS</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              legal@zeroherobudget.com
            </p>
          </section>

          {/* Indemnification */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
            <p className="text-foreground/80 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Zero Hero and its affiliates, officers, 
              directors, employees, and agents from and against any claims, liabilities, damages, losses, 
              costs, expenses, or fees (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4 mt-4">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your User Content</li>
              <li>Any fraudulent or illegal activity associated with your account</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Dispute Resolution and Arbitration</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Informal Resolution</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you have any dispute with us, you agree to first contact us and attempt to resolve the 
              dispute informally by contacting us at{" "}
              <a href="mailto:legal@zerohero.app" className="text-primary hover:underline">
                legal@zerohero.app
              </a>
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Governing Law</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which Zero Hero is incorporated, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Class Action Waiver</h3>
            <p className="text-foreground/80 leading-relaxed">
              You agree that any disputes will be resolved on an individual basis and not as part of a 
              class action, consolidated action, or representative action.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Posting the updated Terms on our website</li>
              <li>Updating the "Last Updated" date at the top of this page</li>
              <li>Sending an email notification (for significant changes)</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              Your continued use of the Service after changes become effective constitutes acceptance of the 
              revised Terms. If you do not agree to the changes, you must stop using the Service and close 
              your account.
            </p>
          </section>

          {/* Severability */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Severability</h2>
            <p className="text-foreground/80 leading-relaxed">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining 
              provisions shall continue in full force and effect. The invalid provision shall be modified to 
              the minimum extent necessary to make it valid and enforceable.
            </p>
          </section>

          {/* Entire Agreement */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Entire Agreement</h2>
            <p className="text-foreground/80 leading-relaxed">
              These Terms, together with our Privacy Policy and any other legal notices published by us on 
              the Service, constitute the entire agreement between you and Zero Hero regarding your use of 
              the Service. These Terms supersede any prior agreements or understandings.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-foreground/80">
                <strong>Email:</strong>{" "}
                <a className="text-primary hover:underline" href="mailto:legal@zeroherobudget.com">
                  legal@zeroherobudget.com
                </a>
              </p>
              <p className="text-foreground/80">
                <strong>Support:</strong>{" "}
                <a href="mailto:support@zerohero.app" className="text-primary hover:underline">
                  support@zeroherobudget.com
                </a>
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Acknowledgment</h2>
            <p className="text-foreground/90 leading-relaxed font-medium">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND 
              BY THESE TERMS OF SERVICE.
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
    </div>;
};
export default TermsOfService;