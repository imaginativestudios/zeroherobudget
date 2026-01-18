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
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WaitlistWelcomeEmailProps {
  email: string;
  unsubscribeUrl: string;
}

export const WaitlistWelcomeEmail = ({ email, unsubscribeUrl }: WaitlistWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>You're on the Zero Hero waitlist</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with solid background */}
        <Section style={header}>
          <Heading style={headerTitle}>Zero Hero</Heading>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h2}>You're on the list</Heading>
          
          <Text style={paragraph}>
            Thanks for signing up for the Zero Hero waitlist.
          </Text>
          
          <Text style={paragraph}>
            We'll send you an email when we're ready to welcome you.
          </Text>

          {/* What's Next Box */}
          <Section style={boxSection}>
            <Text style={listItem}>- You'll be notified when we launch</Text>
            <Text style={listItem}>- Early access to new features</Text>
            <Text style={listItem}>- No spam, ever</Text>
          </Section>

          <Section style={divider} />

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
          <Text style={unsubscribeText}>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe
            </Link>
            {' '}from waitlist emails
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WaitlistWelcomeEmail;

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

const unsubscribeText = {
  color: '#9CA3AF',
  fontSize: '11px',
  marginTop: '12px',
  marginBottom: '0',
};

const unsubscribeLink = {
  color: '#9CA3AF',
  textDecoration: 'underline',
};
