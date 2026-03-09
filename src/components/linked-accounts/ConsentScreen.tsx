import { Shield, Smartphone, ServerOff, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConsentScreenProps {
  onConsent: () => void;
  onCancel: () => void;
}

export function ConsentScreen({ onConsent, onCancel }: ConsentScreenProps) {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Link a Bank Account</h2>
        <p className="text-muted-foreground text-sm">
          Before we connect, here's exactly how your data is handled.
        </p>
      </div>

      <div className="space-y-3">
        <Card className="border-border/60">
          <CardContent className="flex gap-3 py-4">
            <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground">Stored only on your device</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Institution name, account nickname (masked), and account type are saved locally with encryption. Only you can access them.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex gap-3 py-4">
            <ServerOff className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground">Never stored on our servers</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Account numbers, routing numbers, balances, and transaction history are never sent to or stored on our servers.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex gap-3 py-4">
            <Unlink className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground">Disconnect anytime</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You can unlink any account at any time. All locally stored data for that account is permanently deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg bg-muted/50 border border-border/40 p-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Device loss:</strong> If you clear browser data or uninstall the app, linked account information will be permanently deleted. You can always re-link your accounts.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onConsent} className="min-h-[44px] w-full">
          I Understand — Continue
        </Button>
        <Button variant="ghost" onClick={onCancel} className="min-h-[44px] w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
