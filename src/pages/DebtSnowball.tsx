import { Crown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DebtSnowball = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Crown className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold text-foreground">Debt Snowball Strategy</h1>
      </div>
      
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed debt snowball management features will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};