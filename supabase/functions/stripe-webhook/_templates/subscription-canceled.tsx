import * as React from "npm:react@18.3.1";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Preview,
} from "npm:@react-email/components@0.0.22";

interface SubscriptionCanceledEmailProps {
  email: string;
  tierName: string;
  accessEndDate: string;
  pricingUrl: string;
  supportEmail: string;
}

export const SubscriptionCanceledEmail: React.FC<SubscriptionCanceledEmailProps> = ({
  email,
  tierName,
  accessEndDate,
  pricingUrl,
  supportEmail,
}) => {
  const formattedEndDate = new Date(accessEndDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Html>
      <Head />
      <Preview>Thank you for being part of Zero Hero. Your quest is paused, but we'll be here when you're ready to continue.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Zero Hero</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={iconStyle}>👋</Text>
            <Heading style={title}>Your Quest is Paused</Heading>
            <Text style={subtitle}>
              Thank you for being part of Zero Hero, {email.split("@")[0]}.
            </Text>

            <Text style={paragraph}>
              We're grateful you chose to join us on your financial adventure as a{" "}
              <strong>{tierName}</strong> member. Every step you took on your quest toward 
              financial freedom matters, and we hope Zero Hero helped light the way.
            </Text>

            {/* What happens next box */}
            <Section style={infoBox}>
              <Text style={infoBoxTitle}>What happens next</Text>
              <Text style={infoBoxItem}>
                ✓ You'll have full access until <strong>{formattedEndDate}</strong>
              </Text>
              <Text style={infoBoxItem}>
                ✓ Your data remains safely stored and secure
              </Text>
              <Text style={infoBoxItem}>
                ✓ You can resubscribe anytime to pick up where you left off
              </Text>
            </Section>

            {/* Welcome back box */}
            <Section style={welcomeBackBox}>
              <Text style={welcomeBackTitle}>We'd love to have you back</Text>
              <Text style={welcomeBackText}>
                If you ever want to continue your quest toward financial freedom, 
                we'll be here with open arms. Your progress, your data, your journey—it's 
                all waiting for you.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={pricingUrl} style={button}>
                Start a New Quest
              </Link>
            </Section>

            {/* Support note */}
            <Text style={supportNote}>
              Questions, feedback, or just want to say hi? We're all ears at{" "}
              <Link href={`mailto:${supportEmail}`} style={supportLink}>
                {supportEmail}
              </Link>
            </Text>

            <Text style={closingNote}>
              Wishing you continued success on your financial journey,<br />
              <strong>The Zero Hero Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 Zero Hero. From balances due to a more balanced you.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  padding: "20px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header: React.CSSProperties = {
  backgroundColor: "#0D7377",
  padding: "32px 40px",
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
  padding: "40px",
};

const iconStyle: React.CSSProperties = {
  fontSize: "48px",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const title: React.CSSProperties = {
  color: "#1e293b",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const subtitle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "16px",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const paragraph: React.CSSProperties = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#f0fdfa",
  border: "1px solid #99f6e4",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const infoBoxTitle: React.CSSProperties = {
  color: "#0D7377",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const infoBoxItem: React.CSSProperties = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 8px 0",
};

const welcomeBackBox: React.CSSProperties = {
  backgroundColor: "#fefce8",
  border: "1px solid #fde047",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const welcomeBackTitle: React.CSSProperties = {
  color: "#854d0e",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const welcomeBackText: React.CSSProperties = {
  color: "#713f12",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#0D7377",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 28px",
  textDecoration: "none",
};

const supportNote: React.CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const supportLink: React.CSSProperties = {
  color: "#0D7377",
  textDecoration: "underline",
};

const closingNote: React.CSSProperties = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "center" as const,
};

const footer: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "0",
};

export default SubscriptionCanceledEmail;
