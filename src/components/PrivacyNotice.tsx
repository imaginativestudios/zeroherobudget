import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";

const DISMISSED_KEY = "privacy_notice_dismissed";

export function PrivacyNotice() {
  const [isDismissed, setIsDismissed] = useState(true); // Start true to avoid flash

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <InlineAlert variant="info" className="relative pr-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1">
          <span className="font-medium">Your financial data stays on your device.</span>
          <span className="text-muted-foreground ml-1">
            We never see or store your information.
          </span>
        </div>
        <Link 
          to="/data-privacy" 
          className="text-primary hover:underline text-sm font-medium whitespace-nowrap"
        >
          Learn more →
        </Link>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
        aria-label="Dismiss privacy notice"
      >
        <X className="h-4 w-4" />
      </Button>
    </InlineAlert>
  );
}
