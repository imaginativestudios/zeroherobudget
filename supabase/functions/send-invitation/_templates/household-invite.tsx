import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface HouseholdInviteEmailProps {
  inviterName: string;
  householdName: string;
  inviteeEmail: string;
  role: string;
  inviteUrl: string;
}

export const HouseholdInviteEmail = ({
  inviterName,
  householdName,
  inviteeEmail,
  role,
  inviteUrl,
}: HouseholdInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>{inviterName} invited you to join {householdName} on Zero Hero</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with solid background */}
        <Section style={header}>
          <Heading style={headerTitle}>Zero Hero</Heading>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h2}>You're Invited</Heading>
          
          <Text style={paragraph}>
            <strong>{inviterName}</strong> invited you to join "<strong>{householdName}</strong>" on Zero Hero as a <strong>{role}</strong>.
          </Text>

          {/* Benefits Box */}
          <Section style={boxSection}>
            <Text style={listItem}>- Shared budgets and expense tracking</Text>
            <Text style={listItem}>- Collaborative debt payoff planning</Text>
            <Text style={listItem}>- Real-time financial insights</Text>
          </Section>

          <Text style={paragraph}>
            Click below to accept your invitation.
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button style={button} href={inviteUrl}>
              Accept Invitation
            </Button>
          </Section>

          <Text style={smallText}>
            Or copy and paste this link into your browser:
            <br />
            <span style={linkText}>{inviteUrl}</span>
          </Text>

          <Section style={divider} />

          <Text style={paragraph}>
            <em style={italic}>
              This invitation expires in 7 days. If you didn't expect this, you can ignore this email.
            </em>
          </Text>

          <Text style={footer}>
            Questions? Reply to this email.
            <br />
            <strong>- The Zero Hero Team</strong>
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footerSection}>
          <Text style={footerText}>
            © 2026 Zero Hero. From balances due to a more balanced you.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default HouseholdInviteEmail;

// Styles - clean, professional, no spam triggers
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#0D7377',
  padding: '32px 30px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1.2',
};

const content = {
  padding: '40px 30px',
};

const h2 = {
  color: '#0D7377',
  fontSize: '22px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '20px',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const boxSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '20px 24px',
  margin: '24px 0',
};

const listItem = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0D7377',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const smallText = {
  color: '#6B7280',
  fontSize: '13px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const linkText = {
  color: '#0D7377',
  wordBreak: 'break-all' as const,
};

const italic = {
  fontStyle: 'italic',
  color: '#555555',
};

const divider = {
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '1.6',
  marginTop: '30px',
};

const footerSection = {
  backgroundColor: '#f9fafb',
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9CA3AF',
  fontSize: '12px',
  margin: '0',
};
