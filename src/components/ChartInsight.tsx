import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ChartInsightProps {
  insight: string;
  type?: "info" | "warning" | "success" | "trend-up" | "trend-down";
}

export const ChartInsight = ({ insight, type = "info" }: ChartInsightProps) => {
  const getIcon = () => {
    switch (type) {
      case "trend-up": return TrendingUp;
      case "trend-down": return TrendingDown;
      case "warning": return AlertTriangle;
      default: return Lightbulb;
    }
  };

  const getVariant = () => {
    switch (type) {
      case "warning": return "destructive";
      default: return "default";
    }
  };

  const Icon = getIcon();
  const isLightbulb = type === "info" || type === "success";

  return (
    <Alert variant={getVariant() as any} className="animate-fade-in border-dashed">
      <Icon className={cn("h-4 w-4", isLightbulb && "fill-current")} />
      <AlertDescription className="text-sm">
        <span className="font-medium">Insight:</span> {insight}
      </AlertDescription>
    </Alert>
  );
};