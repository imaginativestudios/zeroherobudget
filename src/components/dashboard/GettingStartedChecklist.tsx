import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Receipt,
  Target,
  Heart,
  ArrowUpRight,
  Check,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import confetti from 'canvas-confetti';
import type { Expense } from '@/hooks/useLocalExpenses';
import type { Debt } from '@/hooks/useLocalDebts';
import type { Transaction } from '@/hooks/useLocalTransactions';

interface GettingStartedChecklistProps {
  income: number;
  expenses: Expense[];
  debts: Debt[];
  transactions: Transaction[];
  moatCurrent: number;
}

interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isComplete: boolean;
  href?: string;
}

export function GettingStartedChecklist({
  income,
  expenses,
  debts,
  transactions,
  moatCurrent,
}: GettingStartedChecklistProps) {
  const [isCollapsed, setIsCollapsed] = useUserLocalStorage('bdt_checklist_collapsed', false);
  const [hasShownCelebration, setHasShownCelebration] = useUserLocalStorage('bdt_checklist_celebrated', false);
  const [isHidden, setIsHidden] = useState(false);

  const tasks: ChecklistTask[] = [
    { 
      id: 'income', 
      title: 'Set your income', 
      description: 'Define your monthly earnings',
      icon: DollarSign,
      isComplete: income > 0, 
      href: '/budgets'
    },
    { 
      id: 'expense', 
      title: 'Add your first expense', 
      description: 'Track where your gold flows',
      icon: Receipt,
      isComplete: expenses.length > 0, 
      href: '/budgets'
    },
    { 
      id: 'debt', 
      title: 'Track a debt', 
      description: 'Know your shadow to defeat it',
      icon: Target,
      isComplete: debts.length > 0, 
      href: '/debts'
    },
    { 
      id: 'moat', 
      title: 'Build your Sanctuary', 
      description: 'Start your emergency reserve',
      icon: Heart,
      isComplete: moatCurrent > 0
    },
    { 
      id: 'transaction', 
      title: 'Record a transaction', 
      description: 'Log your first spending entry',
      icon: Receipt,
      isComplete: transactions.length > 0, 
      href: '/transactions'
    },
  ];

  const completedCount = tasks.filter(t => t.isComplete).length;
  const allComplete = completedCount === tasks.length;
  const progressPercentage = (completedCount / tasks.length) * 100;

  // Celebrate when all tasks complete
  useEffect(() => {
    if (allComplete && !hasShownCelebration) {
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setHasShownCelebration(true);
      
      // Auto-hide after celebration
      setTimeout(() => {
        setIsHidden(true);
      }, 3000);
    }
  }, [allComplete, hasShownCelebration, setHasShownCelebration]);

  // Don't render if all complete and hidden
  if (allComplete && (hasShownCelebration || isHidden)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-royal hover-lift">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Swords className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  {allComplete ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                      Quest Complete!
                    </span>
                  ) : (
                    'Your Quest Begins'
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {allComplete 
                    ? 'All systems operational. Your dashboard is fully unlocked.'
                    : 'Complete these tasks to unlock your full dashboard'
                  }
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          {/* Progress bar - always visible */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-amber-400">
                {completedCount} of {tasks.length} Complete
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              aria-label={`${completedCount} of ${tasks.length} tasks complete`}
            />
          </div>

          {/* Task grid - collapsible */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TaskItem({ task }: { task: ChecklistTask }) {
  const Icon = task.icon;
  
  const content = (
    <div 
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-colors
        ${task.isComplete 
          ? 'bg-primary/5 border-primary/20' 
          : 'bg-muted/30 border-border hover:border-primary/40 hover:bg-muted/50'
        }
      `}
    >
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${task.isComplete 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
        }
      `}>
        {task.isComplete ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Icon className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.isComplete ? 'text-primary' : ''}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {task.description}
        </p>
      </div>
      {!task.isComplete && task.href && (
        <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      )}
    </div>
  );

  if (!task.isComplete && task.href) {
    return (
      <Link to={task.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
