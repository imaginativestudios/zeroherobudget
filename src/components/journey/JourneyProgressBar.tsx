import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { JourneyStep } from '@/hooks/useJourneyProgress';

interface JourneyProgressBarProps {
  steps: JourneyStep[];
  currentStep: number;
}

export function JourneyProgressBar({ steps, currentStep }: JourneyProgressBarProps) {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={7}>
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted" aria-hidden="true" />
        <div 
          className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `calc(${((currentStep - 1) / 6) * 100}% - 2rem)` }}
          aria-hidden="true"
        />
        
        {/* Step Indicators */}
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                step.status === 'complete' && "bg-primary text-primary-foreground",
                step.status === 'current' && "bg-accent text-accent-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                step.status === 'locked' && "bg-muted text-muted-foreground"
              )}
              aria-label={`Step ${step.id}: ${step.title} - ${step.status}`}
            >
              {step.status === 'complete' ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                step.id
              )}
            </div>
            <span 
              className={cn(
                "mt-2 text-xs font-medium text-center max-w-[60px] hidden sm:block",
                step.status === 'complete' && "text-primary",
                step.status === 'current' && "text-accent-foreground",
                step.status === 'locked' && "text-muted-foreground"
              )}
            >
              {step.id === 1 ? 'Budget' :
               step.id === 2 ? 'Starter' :
               step.id === 3 ? 'Debt Free' :
               step.id === 4 ? 'Safety Net' :
               step.id === 5 ? 'Invest' :
               'Freedom'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
