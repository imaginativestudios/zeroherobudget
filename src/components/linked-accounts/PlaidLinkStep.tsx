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
      </CardContent>
    </Card>
  );
}
