import { AlertTriangle } from 'lucide-react';

export function DeviceLossWarning() {
  return (
    <div className="flex gap-2.5 rounded-lg border border-border/50 bg-muted/40 p-3">
      <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Linked account data is stored only on this device. If you clear browser data or uninstall the app, this information will be permanently deleted. You can always re-link your accounts.
      </p>
    </div>
  );
}
