import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'debt' | 'expense';
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, prefix, suffix, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: '',
      debt: 'border-purple-500/30 focus-within:border-purple-500 focus-within:ring-purple-500/20',
      expense: 'border-blue-500/30 focus-within:border-blue-500 focus-within:ring-blue-500/20',
    };

    return (
      <div 
        className={cn(
          "flex items-center rounded-md border border-input bg-background ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          variantClasses[variant],
          className
        )}
      >
        {prefix && (
          <span className="pl-3 text-muted-foreground select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          ref={ref}
          className={cn(
            "border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            prefix && "pl-1",
            suffix && "pr-1"
          )}
          {...props}
        />
        {suffix && (
          <span className="pr-3 text-muted-foreground select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
