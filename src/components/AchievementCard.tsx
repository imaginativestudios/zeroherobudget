import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Achievement } from "@/hooks/useAchievements";
import { useState, useEffect } from "react";

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const [justUnlocked, setJustUnlocked] = useState(false);
  const showProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;
  const progressPercentage = showProgress 
    ? (achievement.progress! / achievement.maxProgress!) * 100 
    : 0;

  // Trigger animation when achievement unlocks
  useEffect(() => {
    if (achievement.unlocked && !justUnlocked) {
      setJustUnlocked(true);
      // Reset animation state after it completes
      const timer = setTimeout(() => setJustUnlocked(false), 600);
      return () => clearTimeout(timer);
    }
  }, [achievement.unlocked, justUnlocked]);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        achievement.unlocked 
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-elegant" 
          : "bg-muted/30 opacity-60 border-border/50",
        justUnlocked && "animate-scale-in"
      )}
    >
      <CardContent className="p-4">
        {achievement.unlocked && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-pulse pointer-events-none" />
        )}
        <div className="flex items-start gap-3 relative">
          <div 
            className={cn(
              "text-4xl transition-all duration-500",
              achievement.unlocked ? "grayscale-0 scale-100" : "grayscale opacity-50 scale-90",
              justUnlocked && "animate-[spin_0.6s_ease-in-out]"
            )}
          >
            {achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-sm mb-1",
              achievement.unlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {achievement.title}
            </h4>
            <p className="text-xs text-muted-foreground">
              {achievement.description}
            </p>
            {showProgress && !achievement.unlocked && (
              <div className="mt-2 space-y-1">
                <Progress value={progressPercentage} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {achievement.progress?.toFixed(0)} / {achievement.maxProgress}
                </p>
              </div>
            )}
          </div>
          {achievement.unlocked && (
            <div 
              className={cn(
                "text-primary text-xl transition-all duration-300",
                justUnlocked && "animate-scale-in"
              )}
            >
              ✓
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
