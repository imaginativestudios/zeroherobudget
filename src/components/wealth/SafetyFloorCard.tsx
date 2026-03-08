import { Shield, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/constants';

interface SafetyFloorCardProps {
  safetyFloor: number;
  checkingBalance: number;
  lazyCash: number;
  maxSlider: number;
  onSliderChange: (val: number[]) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SafetyFloorCard({
  safetyFloor,
  checkingBalance,
  lazyCash,
  maxSlider,
  onSliderChange,
  onInputChange,
}: SafetyFloorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
          Safety Floor
        </CardTitle>
        <CardDescription>
          How much do you want to keep in checking for peace of mind?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Slider
            value={[safetyFloor]}
            onValueChange={onSliderChange}
            min={0}
            max={maxSlider}
            step={50}
            className="flex-1"
            aria-label="Safety floor amount in dollars"
          />
          <div className="relative w-28 shrink-0">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <label className="sr-only" htmlFor="safety-floor-input">Safety floor in dollars</label>
            <Input
              id="safety-floor-input"
              type="number"
              value={safetyFloor}
              onChange={onInputChange}
              className="pl-8 h-11 text-right font-mono"
              min={0}
              max={checkingBalance}
            />
          </div>
        </div>

        {/* Visual breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Checking</p>
            <p className="font-bold text-foreground">{formatCurrency(checkingBalance)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Safety Floor</p>
            <p className="font-bold text-foreground">{formatCurrency(safetyFloor)}</p>
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-primary">
              Lazy Cash
            </p>
            <p className="font-bold text-primary text-lg">{formatCurrency(lazyCash)}</p>
            <p className="text-[10px] text-muted-foreground">Above your floor</p>
          </div>
        </div>

        {safetyFloor > checkingBalance && checkingBalance > 0 && (
          <p className="text-xs text-muted-foreground italic">
            Your safety floor exceeds your checking balance — lower the floor to unlock lazy cash.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
