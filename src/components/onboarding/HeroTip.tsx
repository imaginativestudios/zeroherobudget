import { Lightbulb } from 'lucide-react';

interface HeroTipProps {
  children: React.ReactNode;
}

export function HeroTip({ children }: HeroTipProps) {
  return (
    <div className="bg-muted border border-info/30 rounded-lg p-4 mt-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-info" />
        </div>
        <div>
          <p className="text-sm font-medium text-info mb-1">Tip</p>
          <p className="text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
}
