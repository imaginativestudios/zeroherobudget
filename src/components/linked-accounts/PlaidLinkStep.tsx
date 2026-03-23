import { useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PlaidLinkStepProps {
  linkToken: string;
  onSuccess: (publicToken: string) => void;
  onExit: (error: any) => void;
}

export function PlaidLinkStep({ linkToken, onSuccess, onExit }: PlaidLinkStepProps) {
  const onPlaidSuccess = useCallback(
    (publicToken: string) => {
      onSuccess(publicToken);
    },
    [onSuccess]
  );

  const onPlaidExit = useCallback(
    (err: any) => {
      onExit(err);
    },
    [onExit]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  // Auto-open Plaid Link when ready
  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return (
    <Card className="py-16">
      <CardContent className="flex flex-col items-center text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium text-foreground">
          Opening secure bank connection…
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          A secure window will open for you to log in to your bank.
        </p>
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50 text-left max-w-sm">
          <p className="text-xs font-medium text-foreground mb-1">🧪 Sandbox test credentials</p>
          <p className="text-xs text-muted-foreground">
            Username: <code className="font-mono text-foreground">user_good</code> · Password: <code className="font-mono text-foreground">pass_good</code>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phone: <code className="font-mono text-foreground">111-111-1111</code> · Code: <code className="font-mono text-foreground">1234</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
