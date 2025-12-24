import { useState, useEffect } from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineAlert } from "@/components/ui/inline-alert";
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
            <Lightbulb className="h-5 w-5 text-accent fill-accent" aria-hidden="true" />
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
          <InlineAlert variant="tip">
            <span className="font-medium">Pro Tip:</span> {tip.proTip}
          </InlineAlert>
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
