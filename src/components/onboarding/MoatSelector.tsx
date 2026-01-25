import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star, Edit3 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

interface MoatOption {
  value: number;
  label: string;
  subtitle: string;
  recommended?: boolean;
}

const presetOptions: MoatOption[] = [
  { value: 500, label: '$500', subtitle: 'Starter' },
  { value: 1000, label: '$1,000', subtitle: 'Recommended', recommended: true },
  { value: 2000, label: '$2,000', subtitle: 'Full Protection' },
];

interface MoatSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoatSelector({ value, onChange }: MoatSelectorProps) {
  const isCustom = !presetOptions.some(opt => opt.value === value);
  const [customValue, setCustomValue] = useState(isCustom ? value.toString() : '');
  const [showCustomInput, setShowCustomInput] = useState(isCustom);

  const handleCustomSelect = () => {
    setShowCustomInput(true);
    // Set a reasonable default when switching to custom
    if (!customValue) {
      setCustomValue('1500');
      onChange(1500);
    } else {
      const parsed = parseFloat(customValue);
      if (!isNaN(parsed) && parsed >= 100) {
        onChange(parsed);
      }
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 100) {
      onChange(parsed);
    }
  };

  const handlePresetSelect = (presetValue: number) => {
    setShowCustomInput(false);
    setCustomValue('');
    onChange(presetValue);
  };

  return (
    <div className="space-y-4">
      {/* 2x2 grid on mobile, 4-column on desktop for better touch targets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {presetOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handlePresetSelect(option.value)}
            className={cn(
              'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 min-h-[80px]',
              value === option.value && !showCustomInput
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
              'text-lg sm:text-xl font-bold mb-1',
              value === option.value && !showCustomInput ? 'text-accent' : 'text-foreground'
            )}>
              {option.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {option.subtitle}
            </span>
          </button>
        ))}
        
        {/* Custom option - shows value when selected */}
        <button
          type="button"
          onClick={handleCustomSelect}
          className={cn(
            'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 min-h-[80px]',
            showCustomInput
              ? 'border-accent bg-accent/10 shadow-md'
              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          {showCustomInput ? (
            <>
              <span className="text-lg sm:text-xl font-bold text-accent mb-1">
                ${customValue || '1,500'}
              </span>
              <span className="text-xs text-muted-foreground">Custom</span>
            </>
          ) : (
            <>
              <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Custom</span>
            </>
          )}
        </button>
      </div>

      {/* Custom input field (animated) */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 rounded-xl bg-accent/5 border border-accent/20">
              <div className="flex flex-col items-center text-center space-y-3">
                <Label 
                  htmlFor="custom-goal" 
                  className="text-sm font-medium text-foreground"
                >
                  Your Custom Goal
                </Label>
                <CurrencyInput
                  id="custom-goal"
                  prefix="$"
                  value={customValue}
                  onChange={handleCustomChange}
                  placeholder="1500"
                  min={100}
                  autoFocus
                  className="text-center text-xl h-14 max-w-[180px] font-semibold"
                />
                {parseFloat(customValue) < 100 && customValue !== '' ? (
                  <p className="text-xs text-destructive">
                    Minimum goal is $100
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Tip: 3-6 months of expenses is a common goal
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
