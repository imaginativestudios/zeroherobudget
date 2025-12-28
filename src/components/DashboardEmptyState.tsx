import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  CreditCard, 
  Receipt, 
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardEmptyStateProps {
  greetingName: string;
}

const gettingStartedSteps = [
  {
    icon: DollarSign,
    title: 'Set your income',
    description: 'Add your monthly income to start tracking your finances.',
    href: '/budgets',
    linkText: 'Go to Budgets',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Receipt,
    title: 'Add your expenses',
    description: 'Track your planned monthly expenses by category.',
    href: '/budgets',
    linkText: 'Add Expenses',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  {
    icon: Target,
    title: 'Track your debts',
    description: 'Add debts to see your payoff timeline and strategies.',
    href: '/debts',
    linkText: 'Add Debts',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: CreditCard,
    title: 'Monitor subscriptions',
    description: 'Keep track of recurring subscriptions and their costs.',
    href: '/subscriptions',
    linkText: 'Add Subscriptions',
    color: 'text-tier-hero',
    bgColor: 'bg-tier-hero/10',
  },
];

export function DashboardEmptyState({ greetingName }: DashboardEmptyStateProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 sm:p-8 text-primary-foreground">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">Welcome to Zero Hero</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Hi {greetingName}, let's start your journey!
          </h1>
          <p className="text-primary-foreground/80 max-w-xl">
            Zero Hero helps you take control of your finances, crush your debt, and build wealth. 
            Follow the steps below to get started.
          </p>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Getting Started
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gettingStartedSteps.map((step, index) => (
            <Card 
              key={step.title} 
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${step.bgColor}`}>
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    Step {index + 1}
                  </span>
                </div>
                <CardTitle className="text-base mt-2">{step.title}</CardTitle>
                <CardDescription className="text-sm">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="ghost" size="sm" asChild className="group/btn -ml-2">
                  <Link to={step.href}>
                    {step.linkText}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-foreground">What you'll unlock:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Personalized debt payoff strategies',
              'Spending insights and analytics',
              'Net worth tracking over time',
              'Achievement badges and milestones',
              'Subscription cost monitoring',
              'Financial tips tailored to you',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action */}
      <div className="text-center py-4">
        <p className="text-muted-foreground mb-4">
          Ready to take control of your finances?
        </p>
        <Button variant="royal" size="lg" asChild>
          <Link to="/budgets">
            Start with Your Budget
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
