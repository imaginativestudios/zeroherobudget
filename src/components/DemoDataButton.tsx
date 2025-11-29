import { Button } from "./ui/button";
import { setupDemoData, isDemoDataSetup } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_EMAIL } from "@/lib/constants";

export const DemoDataButton = () => {
  const { user } = useAuth();

  // Only show for demo account
  if (!user || user.email !== DEMO_EMAIL) {
    return null;
  }

  // Auto-seed demo data for demo users on mount if not already setup
  useEffect(() => {
    if (user && user.email === DEMO_EMAIL) {
      if (!isDemoDataSetup(user.id)) {
        setupDemoData(user.id);
      }
    }
  }, [user]);

  const handleRefreshDemo = () => {
    if (!user) return;
    
    setupDemoData(user.id);
    toast({
      title: "Demo data refreshed",
      description: "Sample financial data has been restored to defaults.",
    });
    window.location.reload();
  };

  return (
    <Button 
      onClick={handleRefreshDemo}
      variant="outline"
      size="sm"
      className="w-full gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Refresh Demo Data
    </Button>
  );
};