import { useState, useEffect } from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRandomTip, type FinancialTip } from "@/lib/financialTips";

export const TipOfTheDay = () => {
  const [tip, setTip] = useState<FinancialTip | null>(null);

  useEffect(() => {
    // Get a random tip on component mount
    setTip(getRandomTip());
  }, []);

  if (!tip) return null;

  return (
    <Card className="shadow-royal border-l-4 border-l-accent">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Lightbulb className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span>Financial Tip of the Day</span>
              <Badge variant="secondary" className="text-xs">
                {tip.category}
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">{tip.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tip.content}
          </p>
        </div>
        
        {tip.proTip && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-sm font-medium text-foreground">
              💡 Pro Tip: {tip.proTip}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link to="/learn">
              Explore More Tips
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
