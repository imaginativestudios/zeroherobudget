import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PrivacyBadgeProps {
  className?: string;
  variant?: "default" | "compact";
}

export function PrivacyBadge({ className, variant = "default" }: PrivacyBadgeProps) {
  if (variant === "compact") {
    return (
      <Link 
        to="/data-privacy" 
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
          className
        )}
      >
        <Shield className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Your data stays local</span>
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
      <span>Data stored locally on your device</span>
      <Link 
        to="/data-privacy" 
        className="text-primary hover:underline text-xs"
      >
        Learn more
      </Link>
    </div>
  );
}
