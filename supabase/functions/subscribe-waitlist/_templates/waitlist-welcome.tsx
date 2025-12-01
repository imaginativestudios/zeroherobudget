import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WaitlistWelcomeEmailProps {
  email: string;
}

export const WaitlistWelcomeEmail = ({ email }: WaitlistWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Zero Hero - You're on the List!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with gradient background */}
        <Section style={header}>
          <Heading style={headerTitle}>🎯 Zero Hero</Heading>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h2}>Welcome to the Journey!</Heading>
          
          <Text style={paragraph}>
            Hey there, Future Zero Hero! 👋
          </Text>
          
          <Text style={paragraph}>
            Thanks for joining our waitlist! You're now part of an exclusive group getting early access to Zero Hero - the app that transforms debt into victory.
          </Text>

          {/* What's Next Box */}
          <Section style={boxSection}>
            <Heading style={boxHeading}>What's Next?</Heading>
            <Text style={listItem}>✓ We'll notify you as soon as we launch</Text>
            <Text style={listItem}>✓ Get exclusive early-bird features</Text>
            <Text style={listItem}>✓ Join a community committed to financial freedom</Text>
          </Section>

          <Text style={paragraph}>
            In the meantime, here's a pro tip:{' '}
            <em style={italic}>
              Start tracking where your money goes. The first step to crushing debt is knowing your cash flow.
            </em>
          </Text>

          <Text style={paragraph}>
            Ready to become a Zero Hero?
          </Text>

          <Section style={divider} />

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

export default WaitlistWelcomeEmail;

// Styles
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
  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
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
  color: '#8B5CF6',
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
  backgroundColor: '#F3F4F6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const boxHeading = {
  color: '#6D28D9',
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
