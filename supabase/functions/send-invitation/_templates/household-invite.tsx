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
    <Preview>You've been invited to join {householdName} on Zero Hero!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Zero Hero branding */}
        <Section style={header}>
          <Heading style={headerTitle}>🎯 Zero Hero</Heading>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h2}>You're Invited!</Heading>
          
          <Text style={paragraph}>
            Hey there! 👋
          </Text>
          
          <Text style={paragraph}>
            <strong>{inviterName}</strong> has invited you to join their household 
            "<strong>{householdName}</strong>" on Zero Hero as a <strong>{role}</strong>.
          </Text>

          {/* Benefits Box */}
          <Section style={boxSection}>
            <Heading style={boxHeading}>What You'll Get</Heading>
            <Text style={listItem}>✓ Shared budgets and expense tracking</Text>
            <Text style={listItem}>✓ Collaborative debt payoff planning</Text>
            <Text style={listItem}>✓ Real-time financial insights for the household</Text>
          </Section>

          <Text style={paragraph}>
            Click the button below to accept your invitation and start your journey to financial freedom together!
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
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </em>
          </Text>

          <Text style={footer}>
            Questions? Just reply to this email - we'd love to hear from you!
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

// Styles - Zero Hero brand colors (Teal primary #0D7377, Orange accent #F4A259)
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
  background: 'linear-gradient(135deg, #0D7377 0%, #0a5c5f 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1.2',
};

const content = {
  padding: '40px 30px',
};

const h2 = {
  color: '#0D7377',
  fontSize: '24px',
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
  backgroundColor: '#e6f5f5',
  borderLeft: '4px solid #0D7377',
  borderRadius: '0 8px 8px 0',
  padding: '24px',
  margin: '24px 0',
};

const boxHeading = {
  color: '#0D7377',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '16px',
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
  backgroundColor: '#F4A259',
  borderRadius: '8px',
  color: '#1a1a1a',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
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
