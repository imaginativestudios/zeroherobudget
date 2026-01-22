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

interface TrialEndingReminderEmailProps {
  email: string;
  daysRemaining: number;
  trialEndDate: string;
  planType: 'monthly' | 'annual';
  planDisplayName: string;
  amount: number;
  dashboardUrl: string;
  portalUrl: string;
}

export const TrialEndingReminderEmail = ({
  email,
  daysRemaining,
  trialEndDate,
  planType,
  planDisplayName,
  amount,
  dashboardUrl,
  portalUrl,
}: TrialEndingReminderEmailProps) => {
  const formattedEndDate = new Date(trialEndDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const formattedAmount = planType === 'annual' 
    ? `$${amount}/year` 
    : `$${amount}/month`;

  return (
    <Html>
      <Head />
      <Preview>Your Zero Hero trial ends in {daysRemaining} days - continue your quest!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Zero Hero</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Hourglass Icon */}
            <Text style={iconStyle}>⏳</Text>
            <Heading style={title}>Your Trial Ends Soon</Heading>
            <Text style={subtitle}>
              Your Zero Hero trial expires in <strong>{daysRemaining} days</strong> ({formattedEndDate}).
            </Text>

            {/* Urgency Box */}
            <Section style={urgencyBox}>
              <Text style={urgencyText}>
                Don't lose access to your financial fortress! Your budget tracking, debt strategies, and progress will remain safe when you continue.
              </Text>
            </Section>

            {/* What happens next */}
            <Section style={infoBox}>
              <Text style={infoTitle}>What happens next?</Text>
              <Text style={infoItem}>
                ✓ Your {planDisplayName} ({formattedAmount}) begins automatically
              </Text>
              <Text style={infoItem}>
                ✓ All your data and progress stays exactly where it is
              </Text>
              <Text style={infoItem}>
                ✓ Cancel anytime before {formattedEndDate} if you change your mind
              </Text>
            </Section>

            {/* CTA Buttons */}
            <Section style={buttonContainer}>
              <Link href={dashboardUrl} style={primaryButton}>
                Continue Your Quest
              </Link>
            </Section>

            <Text style={secondaryAction}>
              Need to update payment or cancel?{" "}
              <Link href={portalUrl} style={link}>
                Manage subscription
              </Link>
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

export default TrialEndingReminderEmail;

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

const iconStyle: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 16px 0",
};

const title: React.CSSProperties = {
  color: "#d97706",
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

const urgencyBox: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #d97706",
  borderRadius: "4px",
  margin: "0 0 24px 0",
  padding: "16px 20px",
  textAlign: "left" as const,
};

const urgencyText: React.CSSProperties = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  margin: "0 0 24px 0",
  padding: "24px",
  textAlign: "left" as const,
};

const infoTitle: React.CSSProperties = {
  color: "#1a202c",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const infoItem: React.CSSProperties = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "28px",
  margin: "0",
};

const buttonContainer: React.CSSProperties = {
  margin: "0 0 16px 0",
};

const primaryButton: React.CSSProperties = {
  backgroundColor: "#0D7377",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
};

const secondaryAction: React.CSSProperties = {
  color: "#718096",
  fontSize: "14px",
  margin: "0",
};

const link: React.CSSProperties = {
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
