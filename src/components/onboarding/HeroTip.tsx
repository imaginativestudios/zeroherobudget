import { Lightbulb } from 'lucide-react';

interface HeroTipProps {
  children: React.ReactNode;
}

export function HeroTip({ children }: HeroTipProps) {
  return (
    <div className="bg-muted/50 border border-info/20 rounded-lg p-3 mt-4">
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 w-7 h-7 bg-info/15 rounded-full flex items-center justify-center">
          <Lightbulb className="h-3.5 w-3.5 text-info" />
        </div>
        <div className="pt-0.5">
          <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}
