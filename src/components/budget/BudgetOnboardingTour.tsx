import { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useBudgetTour } from '@/hooks/useBudgetTour';
import { useIsTabletOrMobile } from '@/hooks/useIsTabletOrMobile';

const getBudgetTourSteps = (isMobile: boolean): Step[] => [
  {
    target: 'body',
    content: (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">Let's Set Up Your Budget! 🎯</h2>
        <p className="text-sm text-muted-foreground">
          Track your planned spending and compare it with actual expenses. Let's walk through the key features.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="budget-income"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Set Your Income</h3>
        <p className="text-sm text-muted-foreground">
          Start by entering your monthly take-home income. This helps calculate how much you have available to budget.
        </p>
      </div>
    ),
    placement: isMobile ? 'bottom' : 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="budget-add-group"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Create Expense Groups</h3>
        <p className="text-sm text-muted-foreground">
          Organize your expenses into groups like "Housing", "Transportation", or "Entertainment". Click "Add Group" to create a new category.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="budget-add-expense"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Add Your First Expense</h3>
        <p className="text-sm text-muted-foreground">
          Click the + button to add a new planned expense to this group. Enter the name and budgeted amount.
        </p>
      </div>
    ),
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: '[data-tour="budget-expense-list"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Your Expense Items</h3>
        <p className="text-sm text-muted-foreground">
          Each expense shows your planned amount and actual spending. You can drag items to reorder or move them between groups.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="budget-summary"]',
    content: (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Track Your Progress</h3>
        <p className="text-sm text-muted-foreground">
          Your budget summary updates automatically as you add expenses. See planned vs. actual spending and stay on track!
        </p>
      </div>
    ),
    placement: isMobile ? 'bottom' : 'left',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">You're Ready! 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Start adding your expenses to track your planned vs. actual spending. You can restart this tour anytime from the header.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
];

interface BudgetOnboardingTourProps {
  hasExpenses: boolean;
}

export const BudgetOnboardingTour = ({ hasExpenses }: BudgetOnboardingTourProps) => {
  const { hasSeenBudgetTour, isRunning, stepIndex, startTour, completeTour, skipTour, setStepIndex } = useBudgetTour();
  const isTabletOrMobile = useIsTabletOrMobile();

  // Auto-start tour for first-time users with no expenses
  useEffect(() => {
    if (!hasSeenBudgetTour && !hasExpenses && !isRunning) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenBudgetTour, hasExpenses, isRunning, startTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
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

  const steps = getBudgetTourSteps(isTabletOrMobile);
  const tooltipWidth = isTabletOrMobile ? 280 : 380;

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
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started',
        next: 'Next',
        skip: 'Skip tour',
      }}
      scrollToFirstStep={true}
      scrollOffset={100}
      spotlightPadding={8}
      disableOverlayClose={false}
    />
  );
};
