import { useMemo } from 'react';
import { Compass, Blocks, Link2, Shield, Sprout, Sun, LucideIcon } from 'lucide-react';
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
    quote: HEROIC_COPY.wisdomInvesting,
    icon: Sprout,
    actionHref: '/budgets',
    actionLabel: 'Plan Investments',
  },
  {
    id: 6,
    title: HEROIC_COPY.journeyStep6,
    quote: HEROIC_COPY.wisdomFreedom,
    icon: Sun,
    actionHref: '/achievements',
    actionLabel: 'View Achievements',
  },
];

export function useJourneyProgress(): JourneyProgress {
  const { savingsVault, profile } = useHeroProfile();
  const { debts } = useLocalDebts();
  const { expenses } = useLocalExpenses();
  const { accounts } = useLocalAccounts();

  const steps = useMemo(() => {
    // Calculate income from income-type expenses
    const incomeItems = expenses.filter(e => e.is_income);
    const totalIncome = incomeItems.reduce((sum, e) => sum + e.amount, 0);
    const expenseItems = expenses.filter(e => !e.is_income);
    const hasExpenses = expenseItems.length > 0;
    const totalMonthlyExpenses = expenseItems.reduce((sum, e) => sum + e.amount, 0);
    const moatCurrent = savingsVault?.moat_balance ?? profile?.moat_current ?? 0;
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const paidOffDebts = debts.filter(d => d.balance === 0).length;
    const totalDebts = debts.length;
    
    // Check for investment accounts or investment-related expenses
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
    
    const step5Complete = hasInvestmentAccount || hasInvestmentExpense;
    const step5Progress = step5Complete ? 100 : 0;
    
    const step6Complete = step1Complete && step2Complete && step3Complete && step4Complete && step5Complete;
    const step6Progress = step6Complete ? 100 : 0;

    const completionStatus = [
      step1Complete,
      step2Complete,
      step3Complete,
      step4Complete,
      step5Complete,
      step6Complete,
    ];

    const progressValues = [
      step1Progress,
      step2Progress,
      step3Progress,
      step4Progress,
      step5Progress,
      step6Progress,
    ];

    // Find current step (first incomplete step)
    const currentStepIndex = completionStatus.findIndex(complete => !complete);
    const currentStep = currentStepIndex === -1 ? 6 : currentStepIndex + 1;

    // Generate step details
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
        case 4:
          const target = totalMonthlyExpenses * 3;
          return [
            target > 0 
              ? `Target: $${target.toLocaleString()} (3 months)` 
              : 'Set expenses to calculate target',
            moatCurrent > 0 
              ? `Current: $${moatCurrent.toLocaleString()}` 
              : 'Start building your safety net',
          ];
        case 5:
          return [
            hasInvestmentAccount || hasInvestmentExpense 
              ? 'Investment contributions tracked' 
              : 'Set up investment tracking',
            'Plant seeds for your future',
          ];
        case 6:
          const completedCount = completionStatus.filter(Boolean).length;
          return [
            `${completedCount} of 5 prerequisites complete`,
            step6Complete ? 'You own your time.' : 'Complete all steps to achieve freedom',
          ];
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
  const currentStep = steps.find(s => s.status === 'current')?.id ?? 6;
  const overallProgress = (completedSteps / 6) * 100;

  return {
    steps,
    currentStep,
    completedSteps,
    totalSteps: 6,
    overallProgress,
  };
}
