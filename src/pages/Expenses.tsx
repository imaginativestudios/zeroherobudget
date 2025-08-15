import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Expenses = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Crown className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold text-foreground">Expense Tracking</h1>
      </div>
      
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Expense tracking features will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};