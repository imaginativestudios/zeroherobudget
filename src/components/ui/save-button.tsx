import * as React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { SaveState } from "@/hooks/useSaveState";
import { cn } from "@/lib/utils";

export interface SaveButtonProps extends Omit<ButtonProps, 'children'> {
  state: SaveState;
  defaultText?: string;
  savingText?: string;
  savedText?: string;
  errorText?: string;
  children?: React.ReactNode;
}

const SaveButton = React.forwardRef<HTMLButtonElement, SaveButtonProps>(
  ({ 
    state, 
    defaultText = "Save", 
    savingText = "Saving...",
    savedText = "Saved",
    errorText = "Error",
    className,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || state === 'saving';

    const getContent = () => {
      switch (state) {
        case 'saving':
          return (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {savingText}
            </>
          );
        case 'saved':
          return (
            <>
              <Check className="h-4 w-4 mr-2" />
              {savedText}
            </>
          );
        case 'error':
          return (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              {errorText}
            </>
          );
        default:
          return children || defaultText;
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "transition-all duration-200",
          state === 'saved' && "bg-success hover:bg-success/90 text-success-foreground animate-pulse-once",
          state === 'error' && "bg-destructive hover:bg-destructive/90",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {getContent()}
      </Button>
    );
  }
);

SaveButton.displayName = "SaveButton";

export { SaveButton };
