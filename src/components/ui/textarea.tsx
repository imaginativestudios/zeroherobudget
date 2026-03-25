import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // min-h-[88px] on mobile (2x 44px rows), min-h-[80px] on desktop with touch-friendly padding
          "flex min-h-[88px] sm:min-h-[80px] w-full rounded-xl border border-input/50 bg-muted/30 px-4 py-3 sm:py-2 text-base sm:text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground/50 hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
