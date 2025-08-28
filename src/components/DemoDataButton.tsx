import { Button } from "./ui/button";
import { setupDemoData, clearDemoData, isDemoDataSetup } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Play, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_EMAIL } from "@/lib/constants";

export const DemoDataButton = () => {
  const { user } = useAuth();
  const [hasDemoData, setHasDemoData] = useState(false);

  // Only show for demo account
  if (!user || user.email !== DEMO_EMAIL) {
    return null;
  }

  // Auto-seed demo data for demo users on first sign-in
  useEffect(() => {
    if (user && user.email === DEMO_EMAIL && !hasDemoData) {
      setupDemoData(user.id);
      setHasDemoData(true);
    }
  }, [user, hasDemoData]);

  const handleSetupDemo = () => {
    if (!user) return;
    
    setupDemoData(user.id);
    setHasDemoData(true);
    toast({
      title: "Demo data loaded",
      description: "Your account now has sample financial data for testing.",
    });
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleClearDemo = () => {
    if (!user) return;
    
    clearDemoData(user.id);
    setHasDemoData(false);
    toast({
      title: "Demo data cleared",
      description: "All sample data has been removed from your account.",
    });
    // Refresh the page to show cleared data
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      {!hasDemoData ? (
        <Button 
          onClick={handleSetupDemo}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Load Demo Data
        </Button>
      ) : (
        <Button 
          onClick={handleClearDemo}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Demo Data
        </Button>
      )}
    </div>
  );
};