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

interface PaymentFailedEmailProps {
  email: string;
  planDisplayName: string;
  planType: 'monthly' | 'annual';
  amount: number;
  nextRetryDate?: string;
  portalUrl: string;
  supportEmail: string;
}

export const PaymentFailedEmail = ({
  email,
  planDisplayName,
  planType,
  amount,
  nextRetryDate,
  portalUrl,
  supportEmail,
}: PaymentFailedEmailProps) => {
  const formattedRetryDate = nextRetryDate
    ? new Date(nextRetryDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Html>
      <Head />
      <Preview>Action needed: We couldn't process your Zero Hero payment</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Zero Hero</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Icon */}
            <Text style={iconStyle}>⚠️</Text>
            <Heading style={title}>We Couldn't Process Your Payment</Heading>
            <Text style={subtitle}>
              Hi there, we tried to charge your payment method for your {planDisplayName} ({planType === 'annual' ? `$${amount}/year` : `$${amount}/month`}), but the payment didn't go through.
            </Text>

            {/* What happened box */}
            <Section style={alertBox}>
              <Text style={alertTitle}>Why did this happen?</Text>
              <Text style={alertText}>
                This can occur for a few common reasons:
              </Text>
              <Text style={alertItem}>• Your card may have expired</Text>
              <Text style={alertItem}>• Insufficient funds in the account</Text>
              <Text style={alertItem}>• Your bank flagged it as unusual activity</Text>
              <Text style={alertItem}>• The card details need updating</Text>
            </Section>

            {/* What to do */}
            <Section style={infoBox}>
              <Text style={infoTitle}>What you can do</Text>
              <Text style={infoText}>
                To keep your subscription active and avoid any interruption to your financial tracking, please update your payment method.
              </Text>
              {formattedRetryDate && (
                <Text style={retryText}>
                  We'll automatically retry the payment on <strong>{formattedRetryDate}</strong>.
                </Text>
              )}
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={portalUrl} style={primaryButton}>
                Update Payment Method
              </Link>
            </Section>

            {/* Reassurance */}
            <Text style={reassurance}>
              Your data is safe—we're simply waiting for payment to restore full access. If you have any questions or need help, just reply to this email or contact us at{" "}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
              .
            </Text>

            {/* Note about access */}
            <Section style={noteBox}>
              <Text style={noteText}>
                <strong>Note:</strong> Your subscription is currently marked as past due. You'll retain access for a grace period, but please update your payment soon to avoid any interruption.
              </Text>
            </Section>
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

export default PaymentFailedEmail;

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
  color: "#dc2626",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 12px 0",
};

const subtitle: React.CSSProperties = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const alertBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  margin: "0 0 24px 0",
  padding: "20px 24px",
  textAlign: "left" as const,
};

const alertTitle: React.CSSProperties = {
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const alertText: React.CSSProperties = {
  color: "#7f1d1d",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

const alertItem: React.CSSProperties = {
  color: "#7f1d1d",
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  margin: "0 0 24px 0",
  padding: "20px 24px",
  textAlign: "left" as const,
};

const infoTitle: React.CSSProperties = {
  color: "#1a202c",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const infoText: React.CSSProperties = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px 0",
};

const retryText: React.CSSProperties = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0 0 0",
};

const buttonContainer: React.CSSProperties = {
  margin: "0 0 24px 0",
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

const reassurance: React.CSSProperties = {
  color: "#718096",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 24px 0",
};

const link: React.CSSProperties = {
  color: "#0D7377",
  textDecoration: "underline",
};

const noteBox: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
  padding: "12px 16px",
  textAlign: "left" as const,
};

const noteText: React.CSSProperties = {
  color: "#92400e",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
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
