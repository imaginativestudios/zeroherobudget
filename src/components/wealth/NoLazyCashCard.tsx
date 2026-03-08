import { Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function NoLazyCashCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <Wallet className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">No Lazy Cash Right Now</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your checking balance is at or below your safety floor. Lower the floor or add funds to unlock optimization opportunities.
        </p>
      </CardContent>
    </Card>
  );
}
