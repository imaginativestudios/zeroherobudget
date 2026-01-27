/**
 * Emergency Fund Card
 * 
 * Standalone card for tracking emergency fund progress with:
 * - Editable current and goal amounts
 * - Milestone markers (25%, 50%, 75%, 100%)
 * - Progress visualization
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EditableValue } from '@/components/ui/editable-value';
import { formatCurrency } from '@/lib/utils';
import { FUNCTIONAL_COPY, HEROIC_SUBTEXTS } from '@/lib/functionalVocabulary';
import { cn } from '@/lib/utils';

interface EmergencyFundCardProps {
  current: number;
  target: number;
  onCurrentChange: (amount: number) => void;
  onTargetChange: (amount: number) => void;
  animationDelay?: number;
}

// Milestone markers for visual feedback
const MILESTONES = [25, 50, 75, 100];

export function EmergencyFundCard({
  current,
  target,
  onCurrentChange,
  onTargetChange,
  animationDelay = 0,
}: EmergencyFundCardProps) {
  const progress = useMemo(() => {
    if (target <= 0) return 100;
    return Math.min(100, (current / target) * 100);
  }, [current, target]);

  const remaining = useMemo(() => Math.max(0, target - current), [current, target]);
  const isComplete = current >= target;

  // Determine which milestones have been achieved
  const achievedMilestones = useMemo(() => 
    MILESTONES.filter(m => progress >= m), 
    [progress]
  );

  // Get status message based on progress
  const statusMessage = useMemo(() => {
    if (isComplete) return "Goal reached! You have a solid financial foundation.";
    if (progress >= 75) return "Almost there! Just a little more to go.";
    if (progress >= 50) return "Halfway to your goal. Keep building!";
    if (progress >= 25) return "Great start! You're building momentum.";
    return "Every dollar saved strengthens your foundation.";
  }, [progress, isComplete]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: animationDelay, duration: 0.4 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className={cn(
        "shadow-royal hover-lift bg-white dark:bg-card",
        isComplete && "ring-2 ring-success/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {FUNCTIONAL_COPY.emergencyFund}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {HEROIC_SUBTEXTS.emergencyFund}
              </p>
            </div>
            {isComplete && (
              <div className="flex items-center gap-1 text-success">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium">Complete</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current & Goal Display with Inline Editing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Current Balance</span>
              <EditableValue
                value={current}
                onChange={onCurrentChange}
                prefix="$"
                formatDisplay={formatCurrency}
                className="text-xl font-bold text-success"
                min={0}
                aria-label="Current emergency fund balance"
              />
            </div>
            <div className="space-y-1 text-right">
              <span className="text-xs text-muted-foreground">Goal Amount</span>
              <div className="flex justify-end">
                <EditableValue
                  value={target}
                  onChange={onTargetChange}
                  prefix="$"
                  formatDisplay={formatCurrency}
                  className="text-xl font-bold text-foreground"
                  min={100}
                  aria-label="Emergency fund goal"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar with Milestone Markers */}
          <div className="space-y-2">
            <div className="relative">
              <Progress value={progress} className="h-3" />
              
              {/* Milestone markers */}
              <div className="absolute top-0 left-0 right-0 h-3 flex items-center pointer-events-none">
                {MILESTONES.slice(0, -1).map(milestone => (
                  <div 
                    key={milestone}
                    className="absolute w-0.5 h-3 bg-background/50"
                    style={{ left: `${milestone}%` }}
                  />
                ))}
              </div>
            </div>
            
            {/* Milestone labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              {MILESTONES.map(milestone => (
                <span 
                  key={milestone}
                  className={cn(
                    "transition-colors",
                    achievedMilestones.includes(milestone) && "text-success font-medium"
                  )}
                >
                  {milestone}%
                </span>
              ))}
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress.toFixed(0)}% of goal
            </span>
            {!isComplete && (
              <span className="text-muted-foreground">
                {formatCurrency(remaining)} remaining
              </span>
            )}
          </div>

          {/* Status Message */}
          <p className="text-xs text-muted-foreground text-center italic">
            {statusMessage}
          </p>

          {/* Action Button */}
          <Button 
            variant="outline" 
            className="w-full min-h-[44px]"
            asChild
          >
            <Link to="/budgets">
              {isComplete ? 'View Budget' : 'Allocate More'} 
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
