import { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const getMobileTourSteps = (): Step[] => [
  {
    target: 'body',
    content: (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">Welcome to Zero Hero! 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Quick tour of the essentials. Tap Next to continue.
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
        <h3 className="text-base font-semibold text-foreground">Main Menu</h3>
        <p className="text-sm text-muted-foreground">
          Tap here to access all your financial tools.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="financial-overview"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Your Financial Snapshot</h3>
        <p className="text-sm text-muted-foreground">
          Key metrics at a glance - income, expenses, and net worth.
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
        <h3 className="text-base font-semibold text-foreground">Budget Tracking</h3>
        <p className="text-sm text-muted-foreground">
          Track spending across 10 categories. Tap to see details.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-debts"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Debt Payoff</h3>
        <p className="text-sm text-muted-foreground">
          Choose Snowball or Avalanche strategies to eliminate debt faster.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="chatbot-widget"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">AI Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Need help? Tap here to chat with our AI assistant anytime.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
    isFixed: true,
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
        <h3 className="font-semibold text-foreground">Budget Management</h3>
        <p className="text-sm text-muted-foreground">
          Track your planned vs. actual spending across 10 household categories. Drag and drop to organize expenses, and see variance alerts.
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
        <h3 className="font-semibold text-foreground">Debt Payoff Strategies</h3>
        <p className="text-sm text-muted-foreground">
          Choose between Snowball (smallest balance first) or Avalanche (highest interest first) strategies. See projected payoff timelines and interest savings.
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
        <h3 className="font-semibold text-foreground">Transaction Tracking</h3>
        <p className="text-sm text-muted-foreground">
          Record all your income and expenses. Search, filter, and analyze spending patterns to stay on top of your finances.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-subscriptions"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Subscription Manager</h3>
        <p className="text-sm text-muted-foreground">
          Track all recurring subscriptions, get renewal alerts, and identify subscriptions you may no longer need.
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
        <h3 className="font-semibold text-foreground">Achievements & Milestones</h3>
        <p className="text-sm text-muted-foreground">
          Celebrate your progress! Unlock achievements as you pay off debts and reach financial milestones.
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
        <h3 className="font-semibold text-foreground">Reports & Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Generate detailed financial reports including income analysis, net worth tracking, and expense breakdowns. Export as PDF or CSV.
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

export const OnboardingTour = () => {
  const { hasSeenTour, isRunning, stepIndex, startTour, completeTour, skipTour, setStepIndex } = useOnboardingTour();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Auto-start tour for first-time users on dashboard
  useEffect(() => {
    if (!hasSeenTour && location.pathname === '/dashboard' && !isRunning) {
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, location.pathname, isRunning, startTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (status === STATUS.FINISHED) {
        completeTour();
      } else {
        skipTour();
      }
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  return (
    <Joyride
      steps={isMobile ? getMobileTourSteps() : getDesktopTourSteps()}
      run={isRunning}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(262, 83%, 58%)',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--card))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
          width: isMobile ? 'auto' : 400,
        },
        buttonNext: {
          backgroundColor: 'hsl(39, 100%, 57%)',
          color: 'hsl(262, 83%, 28%)',
          fontSize: isMobile ? 16 : 14,
          fontWeight: 600,
          borderRadius: 8,
          padding: isMobile ? '12px 24px' : '10px 20px',
          minHeight: isMobile ? 44 : 'auto',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: isMobile ? 16 : 14,
          marginRight: 10,
          minHeight: isMobile ? 44 : 'auto',
          padding: isMobile ? '12px 16px' : '10px 12px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: isMobile ? 16 : 14,
          minHeight: isMobile ? 44 : 'auto',
          padding: isMobile ? '12px 16px' : '10px 12px',
        },
        tooltip: {
          borderRadius: 12,
          padding: isMobile ? 16 : 20,
          boxShadow: '0 10px 40px -10px rgba(131, 56, 236, 0.3)',
          maxWidth: isMobile ? 'calc(100vw - 32px)' : 400,
          margin: isMobile ? '0 16px' : 0,
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
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
      disableScrolling={isMobile}
      scrollToFirstStep={!isMobile}
      scrollOffset={isMobile ? 20 : 100}
      spotlightPadding={isMobile ? 5 : 10}
      disableOverlayClose={!isMobile}
      floaterProps={{
        disableAnimation: isMobile,
        styles: {
          floater: {
            filter: 'none',
          }
        }
      }}
    />
  );
};
