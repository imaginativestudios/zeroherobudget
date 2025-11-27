import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Achievement } from "@/hooks/useAchievements";

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const showProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;
  const progressPercentage = showProgress 
    ? (achievement.progress! / achievement.maxProgress!) * 100 
    : 0;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        achievement.unlocked 
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-elegant" 
          : "bg-muted/30 opacity-60 border-border/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className={cn(
              "text-4xl transition-all duration-300",
              achievement.unlocked ? "grayscale-0 scale-100" : "grayscale opacity-50 scale-90"
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
            <div className="text-primary text-xl">
              ✓
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
