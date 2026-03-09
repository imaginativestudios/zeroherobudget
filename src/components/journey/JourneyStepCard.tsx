import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { JourneyStep } from '@/hooks/useJourneyProgress';

interface JourneyStepCardProps {
  step: JourneyStep;
  isExpanded?: boolean;
}

export function JourneyStepCard({ step, isExpanded = false }: JourneyStepCardProps) {
  const Icon = step.icon;
  const isCurrent = step.status === 'current';
  const isComplete = step.status === 'complete';
  const isLocked = step.status === 'locked';

  return (
    <Card
      className={cn(
        "transition-all duration-300 shadow-royal",
        isCurrent && "ring-2 ring-primary bg-card",
        isComplete && "bg-muted/30",
        isLocked && "opacity-60"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          {/* Step Icon & Number */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isComplete && "bg-primary text-primary-foreground",
                isCurrent && "bg-accent text-accent-foreground",
                isLocked && "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? (
                <Check className="h-6 w-6" aria-hidden="true" />
              ) : isLocked ? (
                <Lock className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            {/* Vertical line for timeline effect (hidden on last item) */}
            {step.id < 7 && (
              <div 
                className={cn(
                  "w-0.5 h-full min-h-[40px] mt-2",
                  isComplete ? "bg-primary" : "bg-muted"
                )}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">
                Step {step.id}
              </span>
              <Badge
                variant={isComplete ? "default" : isCurrent ? "secondary" : "outline"}
                className={cn(
                  "text-xs",
                  isComplete && "bg-primary",
                  isCurrent && "bg-accent"
                )}
              >
                {isComplete ? 'Complete' : isCurrent ? 'In Progress' : 'Locked'}
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold mt-1">{step.title}</h3>
            
            <p className="text-sm italic text-muted-foreground mt-1">
              "{step.quote}"
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pl-20">
        {/* Progress Bar (for current step) */}
        {isCurrent && step.progress > 0 && step.progress < 100 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round(step.progress)}%</span>
            </div>
            <Progress value={step.progress} className="h-2" />
          </div>
        )}

        {/* Details */}
        {(isCurrent || isComplete || isExpanded) && (
          <ul className="space-y-1 text-sm text-muted-foreground mb-4">
            {step.details.map((detail, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground" aria-hidden="true" />
                {detail}
              </li>
            ))}
          </ul>
        )}

        {/* Action Button */}
        {isCurrent && step.actionHref && (
          <Button asChild size="sm" className="gap-2">
            <Link to={step.actionHref}>
              {step.actionLabel}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
