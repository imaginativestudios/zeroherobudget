import { Button } from "./ui/button";
import { setupDemoData, clearDemoData, isDemoDataSetup } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Play, Trash2 } from "lucide-react";

export const DemoDataButton = () => {
  const [hasDemoData, setHasDemoData] = useState(false);

  useEffect(() => {
    setHasDemoData(isDemoDataSetup());
  }, []);

  const handleSetupDemo = () => {
    setupDemoData();
    setHasDemoData(true);
    toast({
      title: "Demo data loaded",
      description: "Your account now has sample financial data for testing.",
    });
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleClearDemo = () => {
    clearDemoData();
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