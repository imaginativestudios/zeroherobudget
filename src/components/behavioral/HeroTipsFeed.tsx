/**
 * Hero Tips Feed
 * 
 * Displays reactive behavioral coaching insights from the engine.
 */

import { useState } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { cn } from '@/lib/utils';

export function HeroTipsFeed() {
  const { heroTips, isLoading } = useBehavioralEngine();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Hero Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-16 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (heroTips.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? heroTips.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === heroTips.length - 1 ? 0 : prev + 1));
  };

  const currentTip = heroTips[currentIndex];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Hero Insights
          </span>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} of {heroTips.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {heroTips.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed flex-1 min-h-[3rem]">
            {currentTip}
          </p>

          {heroTips.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {heroTips.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {heroTips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
