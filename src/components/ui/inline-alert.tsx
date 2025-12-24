import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const inlineAlertVariants = cva(
  "flex items-start gap-2.5 rounded-lg border p-3",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/50",
        destructive: "border-destructive/30 bg-destructive/5",
        warning: "border-amber-500/30 bg-amber-500/5",
        success: "border-green-500/30 bg-green-500/5",
        info: "border-blue-500/30 bg-blue-500/5",
        tip: "border-accent/30 bg-accent/5",
      },
      size: {
        sm: "p-2.5 gap-2",
        md: "p-3 gap-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const iconVariants = cva(
  "h-4 w-4 shrink-0 mt-0.5",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        destructive: "text-destructive",
        warning: "text-amber-600 dark:text-amber-500",
        success: "text-green-600 dark:text-green-500",
        info: "text-blue-600 dark:text-blue-500",
        tip: "text-accent fill-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const textVariants = cva(
  "text-xs leading-relaxed flex-1",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        destructive: "text-destructive",
        warning: "text-amber-700 dark:text-amber-400",
        success: "text-green-700 dark:text-green-400",
        info: "text-blue-700 dark:text-blue-400",
        tip: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const defaultIcons: Record<string, LucideIcon> = {
  default: AlertCircle,
  destructive: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  tip: Lightbulb,
};

export interface InlineAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineAlertVariants> {
  icon?: LucideIcon;
}

const InlineAlert = React.forwardRef<HTMLDivElement, InlineAlertProps>(
  ({ className, variant = "default", size, icon, children, ...props }, ref) => {
    const Icon = icon || defaultIcons[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(inlineAlertVariants({ variant, size }), className)}
        {...props}
      >
        <Icon 
          className={cn(iconVariants({ variant }))} 
          aria-hidden="true" 
        />
        <div className={cn(textVariants({ variant }))}>
          {children}
        </div>
      </div>
    );
  }
);

InlineAlert.displayName = "InlineAlert";

export { InlineAlert, inlineAlertVariants };
