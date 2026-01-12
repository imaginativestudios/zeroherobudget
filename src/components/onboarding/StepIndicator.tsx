import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors duration-300',
              idx + 1 <= currentStep
                ? 'bg-accent'
                : 'bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}
