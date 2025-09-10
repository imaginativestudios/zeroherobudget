import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface DataFreshnessIndicatorProps {
  lastUpdated?: Date;
  isLive?: boolean;
  className?: string;
}

export const DataFreshnessIndicator = ({ 
  lastUpdated, 
  isLive = false, 
  className 
}: DataFreshnessIndicatorProps) => {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getFreshnessStatus = (date: Date) => {
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return "fresh";
    if (diffHours < 24) return "recent";
    return "stale";
  };

  if (isLive) {
    return (
      <Badge variant="secondary" className={cn("animate-pulse", className)}>
        <CheckCircle className="h-3 w-3 mr-1 text-success" />
        Live Data
      </Badge>
    );
  }

  if (!lastUpdated) return null;

  const status = getFreshnessStatus(lastUpdated);
  const timeAgo = getTimeAgo(lastUpdated);

  const getIcon = () => {
    switch (status) {
      case "fresh": return CheckCircle;
      case "recent": return Clock;
      default: return AlertCircle;
    }
  };

  const getVariant = () => {
    switch (status) {
      case "fresh": return "secondary";
      case "recent": return "outline";
      default: return "destructive";
    }
  };

  const Icon = getIcon();

  return (
    <Badge variant={getVariant() as any} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      Updated {timeAgo}
    </Badge>
  );
};