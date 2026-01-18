import React from "npm:react@18.3.1";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
} from "npm:@react-email/components@0.0.22";

interface DeletionCodeEmailProps {
  code: string;
}

export const DeletionCodeEmail = ({ code }: DeletionCodeEmailProps) => (
  <Html>
    <Head />
    <Preview>Your account deletion confirmation code</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={headerTitle}>Zero Hero</Heading>
        </Section>

        {/* Content */}
        <Section style={content}>
          <Heading as="h2" style={warningTitle}>
            Account Deletion Request
          </Heading>
          <Text style={paragraph}>
            You've requested to delete your Zero Hero account. To confirm this
            action, please enter the following code:
          </Text>

          {/* Code Box */}
          <Section style={codeBox}>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Text style={expiryText}>
            This code will expire in 10 minutes. If you didn't request this,
            please ignore this email and your account will remain safe.
          </Text>

          <Text style={warningText}>
            Warning: Account deletion is permanent and cannot be undone.
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

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#0D7377",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  padding: "0",
};

const content = {
  padding: "40px",
};

const warningTitle = {
  color: "#dc2626",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px 0",
};

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const codeBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const codeText = {
  color: "#111827",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "8px",
  margin: "0",
  fontFamily: "monospace",
};

const expiryText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const warningText = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const footer = {
  backgroundColor: "#f9fafb",
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
};

export default DeletionCodeEmail;
