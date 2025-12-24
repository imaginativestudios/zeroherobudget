import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { InlineAlert } from "@/components/ui/inline-alert";

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
      case "trend-up":
      case "success": return "success";
      case "trend-down": return "warning";
      default: return "info";
    }
  };

  return (
    <InlineAlert 
      variant={getVariant()} 
      icon={getIcon()} 
      className="animate-fade-in border-dashed"
    >
      <span className="font-medium">Insight:</span> {insight}
    </InlineAlert>
  );
};
