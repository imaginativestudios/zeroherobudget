import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SweepSuccessCardProps {
  onSweepAgain: () => void;
}

export function SweepSuccessCard({ onSweepAgain }: SweepSuccessCardProps) {
  return (
    <Card className="border-2 border-accent/30 bg-accent/5">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden="true" />
        <h3 className="text-lg font-bold text-foreground">Sweep Complete!</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your lazy cash is now working for you. Check your Transactions log for the transfer details.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Note: This records a transfer in your budget — it does not move money at your bank.
        </p>
        <Button variant="outline" size="sm" onClick={onSweepAgain}>
          Sweep Again
        </Button>
      </CardContent>
    </Card>
  );
}
