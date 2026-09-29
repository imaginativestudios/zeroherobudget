import { Shield, Smartphone, Landmark, Unlink } from 'lucide-react';
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
              <p className="font-medium text-sm text-foreground">Stored with your account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When signed in, basic linked-account details are stored in your account and synced. In demo mode, they stay on this device.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex gap-3 py-4">
            <Landmark className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground">Sensitive numbers stay with Plaid</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                We do not receive full account or routing numbers. Signed-in balances and transactions are stored in your account; demo-mode data stays on this device.
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
                You can unlink any account at any time. Data for that connection is removed from your account and device.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg bg-muted/50 border border-border/40 p-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Device changes:</strong> Signed-in account data remains available through your account. Demo-mode data is deleted if you clear browser data or uninstall the app.
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
