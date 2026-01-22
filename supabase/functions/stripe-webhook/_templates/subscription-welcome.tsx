import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface SubscriptionWelcomeEmailProps {
  email: string;
  planType: 'monthly' | 'annual';
  planDisplayName: string;
  amount: number;
  isTrialing: boolean;
  trialEndDate: string;
  dashboardUrl: string;
  portalUrl: string;
}

export const SubscriptionWelcomeEmail = ({
  email,
  planType,
  planDisplayName,
  amount,
  isTrialing,
  trialEndDate,
  dashboardUrl,
  portalUrl,
}: SubscriptionWelcomeEmailProps) => {
  const formattedTrialEnd = new Date(trialEndDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Welcome to Zero Hero, brave adventurer. Your quest begins now!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Zero Hero</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Trophy and Title */}
            <Text style={trophyIcon}>🏆</Text>
            <Heading style={title}>Your Quest Begins!</Heading>
            <Text style={subtitle}>
              Welcome to Zero Hero, brave adventurer.
              {isTrialing
                ? " Your 7-day trial has been activated."
                : " Your subscription is now active."}
            </Text>

            {/* Plan Badge */}
            <Section style={tierBadge}>
              <Text style={tierText}>
                ✨ {planDisplayName} • {planType === 'annual' ? `$${amount}/year` : `$${amount}/month`}
              </Text>
            </Section>

            {/* Features Box */}
            <Section style={featuresBox}>
              <Text style={featuresTitle}>What's Included:</Text>
              <Text style={featureItem}>✓ Full access to all features</Text>
              <Text style={featureItem}>✓ Unlimited budget tracking</Text>
              <Text style={featureItem}>✓ Debt payoff strategies</Text>
              <Text style={featureItem}>✓ Financial insights & reports</Text>
              <Text style={featureItem}>✓ Achievement system</Text>
              <Text style={featureItem}>✓ Household sharing</Text>
            </Section>

            {/* Trial Info */}
            {isTrialing && (
              <Text style={trialInfo}>
                Trial ends: <strong>{formattedTrialEnd}</strong>
                <br />
                First charge: {planType === 'annual' ? `$${amount}/year` : `$${amount}/month`} after trial
              </Text>
            )}

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={dashboardUrl} style={button}>
                Enter the Fortress
              </Link>
            </Section>

            {/* Manage Subscription Link */}
            <Text style={manageText}>
              Need to manage your subscription?{" "}
              <Link href={portalUrl} style={manageLink}>
                Visit your account settings
              </Link>
              .
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Zero Hero.
            </Text>
            <Text style={footerTagline}>
              From balances due to a more balanced you.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionWelcomeEmail;

// Styles
const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header: React.CSSProperties = {
  backgroundColor: "#0D7377",
  padding: "24px",
  textAlign: "center" as const,
};

const headerTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "0.5px",
};

const content: React.CSSProperties = {
  padding: "40px 32px",
  textAlign: "center" as const,
};

const trophyIcon: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 16px 0",
};

const title: React.CSSProperties = {
  color: "#0D7377",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 12px 0",
};

const subtitle: React.CSSProperties = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const tierBadge: React.CSSProperties = {
  backgroundColor: "#0D7377",
  borderRadius: "8px",
  margin: "0 auto 24px auto",
  padding: "12px 24px",
  display: "inline-block" as const,
};

const tierText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const featuresBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  margin: "0 0 24px 0",
  padding: "24px",
  textAlign: "left" as const,
};

const featuresTitle: React.CSSProperties = {
  color: "#1a202c",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const featureItem: React.CSSProperties = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "28px",
  margin: "0",
};

const trialInfo: React.CSSProperties = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 24px 0",
};

const buttonContainer: React.CSSProperties = {
  margin: "0 0 24px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#0D7377",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
};

const manageText: React.CSSProperties = {
  color: "#718096",
  fontSize: "14px",
  margin: "0",
};

const manageLink: React.CSSProperties = {
  color: "#0D7377",
  textDecoration: "underline",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#718096",
  fontSize: "12px",
  margin: "0 0 4px 0",
};

const footerTagline: React.CSSProperties = {
  color: "#a0aec0",
  fontSize: "12px",
  fontStyle: "italic" as const,
  margin: "0",
};
