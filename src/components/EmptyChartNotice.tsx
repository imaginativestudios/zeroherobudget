import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyChartNoticeProps {
  title?: string;
  message?: string;
}

export const EmptyChartNotice = ({ 
  title = "No Data Available", 
  message = "These charts will populate once you enter or upload transactions" 
}: EmptyChartNoticeProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <BarChart3 className="h-16 w-16 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {message}
      </p>
      <Button asChild>
        <Link to="/transactions" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Transactions
        </Link>
      </Button>
    </div>
  );
};