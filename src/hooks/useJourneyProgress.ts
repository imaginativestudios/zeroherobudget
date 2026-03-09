import { useMemo } from 'react';
import { Compass, Blocks, Link2, Shield, Landmark, Sprout, Sun, LucideIcon } from 'lucide-react';
import { useHeroProfile } from './useHeroProfile';
import { useLocalDebts } from './useLocalDebts';
import { useLocalExpenses } from './useLocalExpenses';
import { useLocalAccounts } from './useLocalAccounts';
import { HEROIC_COPY } from '@/lib/heroicVocabulary';

export interface JourneyStep {
  id: number;
  title: string;
  quote: string;
  icon: LucideIcon;
  status: 'complete' | 'current' | 'locked';
  progress: number; // 0-100
  details: string[];
  actionHref?: string;
  actionLabel?: string;
}

interface JourneyProgress {
  steps: JourneyStep[];
  currentStep: number;
  completedSteps: number;
  totalSteps: number;
  overallProgress: number; // 0-100
}

const JOURNEY_STEPS_CONFIG = [
  {
    id: 1,
    title: HEROIC_COPY.journeyStep1,
    quote: HEROIC_COPY.wisdomBudget,
    icon: Compass,
    actionHref: '/budgets',
    actionLabel: 'Set Up Budget',
  },
  {
    id: 2,
    title: HEROIC_COPY.journeyStep2,
    quote: HEROIC_COPY.wisdomStarterFund,
    icon: Blocks,
    actionHref: '/dashboard',
    actionLabel: 'Add to Fund',
  },
  {
    id: 3,
    title: HEROIC_COPY.journeyStep3,
    quote: HEROIC_COPY.wisdomDebtFree,
    icon: Link2,
    actionHref: '/debts',
    actionLabel: 'View Debt Strategy',
  },
  {
    id: 4,
    title: HEROIC_COPY.journeyStep4,
    quote: HEROIC_COPY.wisdomEmergencyFund,
    icon: Shield,
    actionHref: '/dashboard',
    actionLabel: 'Grow Emergency Fund',
  },
  {
    id: 5,
    title: HEROIC_COPY.journeyStep5,
    quote: HEROIC_COPY.wisdomWealth,
    icon: Landmark,
    actionHref: '/wealth',
    actionLabel: 'Explore High-Yield Savings',
  },
  {
    id: 6,
    title: HEROIC_COPY.journeyStep6,
    quote: HEROIC_COPY.wisdomInvesting,
    icon: Sprout,
    actionHref: '/budgets',
    actionLabel: 'Plan Investments',
  },
  {
    id: 7,
    title: HEROIC_COPY.journeyStep7,
    quote: HEROIC_COPY.wisdomFreedom,
    icon: Sun,
    actionHref: '/achievements',
    actionLabel: 'View Achievements',
  },
];

const TOTAL_STEPS = 7;

export function useJourneyProgress(): JourneyProgress {
  const { savingsVault, profile } = useHeroProfile();
  const { debts } = useLocalDebts();
  const { expenses } = useLocalExpenses();
  const { accounts } = useLocalAccounts();

  const steps = useMemo(() => {
    const incomeItems = expenses.filter(e => e.is_income);
    const totalIncome = incomeItems.reduce((sum, e) => sum + e.amount, 0);
    const expenseItems = expenses.filter(e => !e.is_income);
    const hasExpenses = expenseItems.length > 0;
    const totalMonthlyExpenses = expenseItems.reduce((sum, e) => sum + e.amount, 0);
    const moatCurrent = savingsVault?.moat_balance ?? profile?.moat_current ?? 0;
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const paidOffDebts = debts.filter(d => d.balance === 0).length;
    const totalDebts = debts.length;

    // Check for savings / high-yield savings accounts
    const hasSavingsAccount = accounts.some(a =>
      a.type.toLowerCase().includes('savings') ||
      a.type.toLowerCase().includes('high-yield') ||
      a.type.toLowerCase().includes('hysa') ||
      a.type.toLowerCase().includes('money market')
    );
    const savingsBalance = accounts
      .filter(a =>
        a.type.toLowerCase().includes('savings') ||
        a.type.toLowerCase().includes('high-yield') ||
        a.type.toLowerCase().includes('hysa') ||
        a.type.toLowerCase().includes('money market')
      )
      .reduce((sum, a) => sum + a.balance, 0);

    // Check for investment accounts
    const hasInvestmentAccount = accounts.some(a =>
      a.type.toLowerCase().includes('investment') ||
      a.type.toLowerCase().includes('retirement') ||
      a.type.toLowerCase().includes('401k') ||
      a.type.toLowerCase().includes('ira')
    );
    const hasInvestmentExpense = expenses.some(e =>
      e.category.toLowerCase().includes('investment') ||
      e.category.toLowerCase().includes('savings')
    );

    // Step completion logic
    const hasIncome = totalIncome > 0;
    const step1Complete = hasIncome && hasExpenses;
    const step1Progress = (hasIncome ? 50 : 0) + (hasExpenses ? 50 : 0);

    const step2Complete = moatCurrent >= 1000;
    const step2Progress = Math.min(100, (moatCurrent / 1000) * 100);

    const step3Complete = totalDebts === 0 || totalDebt === 0;
    const step3Progress = totalDebts > 0
      ? (paidOffDebts / totalDebts) * 100
      : (totalDebts === 0 ? 100 : 0);

    const targetEmergencyFund = totalMonthlyExpenses * 3;
    const step4Complete = targetEmergencyFund > 0 && moatCurrent >= targetEmergencyFund;
    const step4Progress = targetEmergencyFund > 0
      ? Math.min(100, (moatCurrent / targetEmergencyFund) * 100)
      : 0;

    // Step 5: Start Building Wealth — has a savings/HYSA account with balance > 0
    const step5Complete = hasSavingsAccount && savingsBalance > 0;
    const step5Progress = step5Complete ? 100 : hasSavingsAccount ? 50 : 0;

    const step6Complete = hasInvestmentAccount || hasInvestmentExpense;
    const step6Progress = step6Complete ? 100 : 0;

    const step7Complete = step1Complete && step2Complete && step3Complete && step4Complete && step5Complete && step6Complete;
    const step7Progress = step7Complete ? 100 : 0;

    const completionStatus = [
      step1Complete,
      step2Complete,
      step3Complete,
      step4Complete,
      step5Complete,
      step6Complete,
      step7Complete,
    ];

    const progressValues = [
      step1Progress,
      step2Progress,
      step3Progress,
      step4Progress,
      step5Progress,
      step6Progress,
      step7Progress,
    ];

    const currentStepIndex = completionStatus.findIndex(complete => !complete);
    const currentStep = currentStepIndex === -1 ? TOTAL_STEPS : currentStepIndex + 1;

    const getStepDetails = (stepId: number): string[] => {
      switch (stepId) {
        case 1:
          return [
            hasIncome ? `Monthly income: $${totalIncome.toLocaleString()}` : 'Set your monthly income',
            hasExpenses ? `${expenseItems.length} expense categories tracked` : 'Add expense categories',
          ];
        case 2:
          return [
            `Emergency fund: $${moatCurrent.toLocaleString()} / $1,000`,
            step2Complete ? 'Starter fund complete!' : `$${Math.max(0, 1000 - moatCurrent).toLocaleString()} to go`,
          ];
        case 3:
          if (totalDebts === 0) {
            return ['No debts tracked', 'Add debts or mark as complete'];
          }
          return [
            `${paidOffDebts} of ${totalDebts} debts cleared`,
            totalDebt > 0 ? `$${totalDebt.toLocaleString()} remaining` : 'All debts eliminated!',
          ];
        case 4: {
          const target = totalMonthlyExpenses * 3;
          return [
            target > 0
              ? `Target: $${target.toLocaleString()} (3 months)`
              : 'Set expenses to calculate target',
            moatCurrent > 0
              ? `Current: $${moatCurrent.toLocaleString()}`
              : 'Start building your safety net',
          ];
        }
        case 5:
          return [
            hasSavingsAccount
              ? `Savings balance: $${savingsBalance.toLocaleString()}`
              : 'Open a high-yield savings account',
            step5Complete
              ? 'Your money is growing!'
              : 'Explore HYSA options to earn more on your savings',
          ];
        case 6:
          return [
            hasInvestmentAccount || hasInvestmentExpense
              ? 'Investment contributions tracked'
              : 'Set up investment tracking',
            'Plant seeds for your future',
          ];
        case 7: {
          const completedCount = completionStatus.filter(Boolean).length;
          return [
            `${completedCount} of ${TOTAL_STEPS - 1} prerequisites complete`,
            step7Complete ? 'You own your time.' : 'Complete all steps to achieve freedom',
          ];
        }
        default:
          return [];
      }
    };

    return JOURNEY_STEPS_CONFIG.map((config, index) => {
      const isComplete = completionStatus[index];
      const isCurrent = index + 1 === currentStep;

      return {
        ...config,
        status: isComplete ? 'complete' : isCurrent ? 'current' : 'locked',
        progress: progressValues[index],
        details: getStepDetails(config.id),
      } as JourneyStep;
    });
  }, [savingsVault, profile, debts, expenses, accounts]);

  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const currentStep = steps.find(s => s.status === 'current')?.id ?? TOTAL_STEPS;
  const overallProgress = (completedSteps / TOTAL_STEPS) * 100;

  return {
    steps,
    currentStep,
    completedSteps,
    totalSteps: TOTAL_STEPS,
    overallProgress,
  };
}
