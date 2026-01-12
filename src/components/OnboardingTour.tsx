import { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsTabletOrMobile } from '@/hooks/useIsTabletOrMobile';
import { MobileOnboardingCarousel } from './MobileOnboardingCarousel';

interface OnboardingTourProps {
  setMobileMenuOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
}

const getMobileTabletTourSteps = (): Step[] => [
  {
    target: 'body',
    content: (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">Welcome to Zero Hero! 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Let's show you around. Tap Next to continue.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
    isFixed: true,
    data: { menuState: 'closed' },
  },
  {
    target: '[data-tour="mobile-menu-button"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Navigation Menu</h3>
        <p className="text-sm text-muted-foreground">
          Tap this menu button to access all your financial tools.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
    data: { menuState: 'closed' },
  },
  {
    target: '[data-tour="nav-sidebar"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Navigation Sidebar</h3>
        <p className="text-sm text-muted-foreground">
          Access your War Map, Battle Plan, Quest Log, Intel, and more from here.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
    data: { menuState: 'open' },
  },
  {
    target: '[data-tour="nav-budgets"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Your War Map</h3>
        <p className="text-sm text-muted-foreground">
          Plan your financial strategy and track deployment vs. actual spending.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
    data: { menuState: 'open' },
  },
  {
    target: '[data-tour="nav-debts"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Your Battle Plan</h3>
        <p className="text-sm text-muted-foreground">
          Slay your Balance Foes with Snowball or Avalanche tactics.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
    data: { menuState: 'open' },
  },
  {
    target: '[data-tour="financial-overview"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Your Financial Overview</h3>
        <p className="text-sm text-muted-foreground">
          Track key metrics: income, expenses, subscriptions, debt payoff funds, and net worth.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
    data: { menuState: 'closed' },
  },
  {
    target: '[data-tour="chatbot-widget"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">AI Financial Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Tap here anytime to ask questions about budgeting, debt strategies, and financial tips.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
    isFixed: true,
    data: { menuState: 'closed' },
  },
];

const getDesktopTourSteps = (): Step[] => [
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Welcome to Zero Hero! 🎉</h2>
        <p className="text-muted-foreground">
          Let's take a quick tour to help you transform debt into victory. This will only take a minute!
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-sidebar"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Navigation Menu</h3>
        <p className="text-sm text-muted-foreground">
          Use this sidebar to navigate between different sections of Zero Hero. All your financial tools are just a click away.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="financial-overview"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Financial Overview</h3>
        <p className="text-sm text-muted-foreground">
          See your key financial metrics at a glance: income, expenses, subscriptions, available funds for debt, and net worth.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-budgets"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Your War Map</h3>
        <p className="text-sm text-muted-foreground">
          Plan your financial strategy across 10 categories. Drag and drop to organize, and watch for Tactical Overstretch alerts.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-debts"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Your Battle Plan</h3>
        <p className="text-sm text-muted-foreground">
          Slay your Balance Foes with Snowball or Avalanche tactics. Track your path to becoming Victorious!
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-transactions"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Your Quest Log</h3>
        <p className="text-sm text-muted-foreground">
          Record every financial quest. Search, filter, and analyze your deployment patterns.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-achievements"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Your Victories</h3>
        <p className="text-sm text-muted-foreground">
          Celebrate your heroic progress! Unlock achievements as you vanquish debts and reach milestones.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-reports"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Intel Center</h3>
        <p className="text-sm text-muted-foreground">
          Gather intelligence on your financial kingdom. Generate reports on income, net worth, and spending patterns.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="chatbot-widget"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">AI Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Need help? Click here to chat with our AI assistant. Get answers to your questions about budgeting, debt strategies, and using Zero Hero.
        </p>
      </div>
    ),
    placement: 'top-start',
    disableBeacon: true,
    isFixed: true,
    disableScrolling: true,
  },
];

export const OnboardingTour = ({ setMobileMenuOpen, isMobileMenuOpen }: OnboardingTourProps) => {
  const { hasSeenTour, isRunning, stepIndex, startTour, completeTour, skipTour, setStepIndex } = useOnboardingTour();
  const location = useLocation();
  const navigate = useNavigate();
  const isTabletOrMobile = useIsTabletOrMobile();

  // Redirect to dashboard when tour starts from another page
  useEffect(() => {
    if (isRunning && location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  }, [isRunning, location.pathname, navigate]);

  // Auto-start tour for first-time users on dashboard
  useEffect(() => {
    if (!hasSeenTour && location.pathname === '/dashboard' && !isRunning) {
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, location.pathname, isRunning, startTour]);

  // Only render the tour when on dashboard to prevent targeting non-existent elements
  if (location.pathname !== '/dashboard') {
    return null;
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action, step } = data;

    // Control menu state based on step data
    if (type === 'step:before' && step?.data?.menuState) {
      setMobileMenuOpen(step.data.menuState === 'open');
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Close menu when tour ends
      setMobileMenuOpen(false);
      
      if (status === STATUS.FINISHED) {
        completeTour();
      } else {
        skipTour();
      }
    } else if (type === 'step:after') {
      if (action === 'prev') {
        setStepIndex(index - 1);
      } else if (action === 'next') {
        setStepIndex(index + 1);
      }
    }
  };

  // Use Joyride for all devices now (with responsive steps)
  const steps = isTabletOrMobile ? getMobileTabletTourSteps() : getDesktopTourSteps();
  const tooltipWidth = isTabletOrMobile ? 280 : 400;

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--tour-primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--card))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          spotlightShadow: '0 0 0 4px hsl(var(--tour-spotlight) / 0.5)',
          zIndex: 10000,
          width: tooltipWidth,
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--tour-accent))',
          color: 'hsl(var(--primary-dark))',
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 14,
          marginRight: 10,
          padding: '10px 12px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 14,
          padding: '10px 12px',
        },
        tooltip: {
          borderRadius: 12,
          padding: isTabletOrMobile ? 16 : 20,
          boxShadow: 'var(--shadow-royal)',
          maxWidth: tooltipWidth,
          position: 'relative',
          zIndex: 10002,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: '8px 0',
        },
        spotlight: {
          borderRadius: 8,
        },
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'none',
            zIndex: 10002,
          },
          arrow: {
            length: 10,
            spread: 16,
          },
        },
        options: {
          preventOverflow: {
            boundariesElement: 'viewport',
            padding: 10,
          },
          flip: {
            enabled: true,
            behavior: ['bottom', 'top', 'right', 'left'],
          },
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
      scrollToFirstStep={true}
      scrollOffset={100}
      spotlightPadding={10}
      spotlightClicks={true}
      disableOverlayClose={false}
    />
  );
};
