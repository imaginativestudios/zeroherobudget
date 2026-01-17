import { TestTube, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isDemoDataLoaded } from "@/lib/demoDataLoader";

/**
 * Demo Mode Badge
 * 
 * Displays when users are viewing demo data (unauthenticated).
 * Provides a clear visual indicator and CTA to sign up for a real account.
 */
export function DemoModeBadge() {
  const { user } = useAuth();
  
  // Only show for unauthenticated users viewing demo data
  const isInDemoMode = !user && isDemoDataLoaded();
  
  if (!isInDemoMode) {
    return null;
  }
  
  return (
    <div className="bg-info/10 border border-info/30 rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2">
        <TestTube className="h-4 w-4 text-info" aria-hidden="true" />
        <span className="text-sm font-medium text-info">Demo Mode</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        You're viewing sample data. Create an account to track your real finances.
      </p>
      <Button
        asChild
        size="sm"
        className="w-full"
      >
        <Link to="/auth">
          <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
          Create Free Account
        </Link>
      </Button>
    </div>
  );
}
