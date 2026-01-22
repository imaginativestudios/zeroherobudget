import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface MoatOption {
  value: 500 | 1000 | 2000;
  label: string;
  subtitle: string;
  recommended?: boolean;
}

const moatOptions: MoatOption[] = [
  { value: 500, label: '$500', subtitle: 'Starter' },
  { value: 1000, label: '$1,000', subtitle: 'Recommended', recommended: true },
  { value: 2000, label: '$2,000', subtitle: 'Full Protection' },
];

interface MoatSelectorProps {
  value: 500 | 1000 | 2000;
  onChange: (value: 500 | 1000 | 2000) => void;
}

export function MoatSelector({ value, onChange }: MoatSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {moatOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border-2 transition-all duration-200',
            value === option.value
              ? 'border-accent bg-accent/10 shadow-md'
              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          {option.recommended && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span className="hidden sm:inline">Best</span>
            </div>
          )}
          <span className={cn(
            'text-xl sm:text-2xl font-bold mb-1',
            value === option.value ? 'text-accent' : 'text-foreground'
          )}>
            {option.label}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {option.subtitle}
          </span>
        </button>
      ))}
    </div>
  );
}
