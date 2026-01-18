import { Trophy, Calendar, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AchievementCard } from "@/components/AchievementCard";
import { useAchievements } from "@/hooks/useAchievements";
import { useLocalDebts } from "@/hooks/useLocalDebts";
import { formatCurrency } from "@/lib/constants";
import { format } from "date-fns";
import { useMemo } from "react";

export const Achievements = () => {
  const { debts } = useLocalDebts();
  
  const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const debtsPaidOff = useMemo(() => 
    debts.filter(d => d.balance === 0).length, [debts]
  );
  
  const { achievements, unlockedCount, totalCount, initialDebt } = useAchievements({
    totalDebt,
    debtsPaidOff,
    totalDebts: debts.length,
  });

  const completionPercentage = (unlockedCount / totalCount) * 100;
  const debtReduction = initialDebt > 0 ? ((initialDebt - totalDebt) / initialDebt) * 100 : 0;

  // Sort achievements: unlocked first (by date), then locked by progress
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    if (a.unlocked && b.unlocked) {
      return new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime();
    }
    return (b.progress || 0) - (a.progress || 0);
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="pt-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="h-8 w-8 text-accent" />
              Achievements
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your debt-fighting victories and milestones
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {unlockedCount} / {totalCount}
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completionPercentage.toFixed(0)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Debt Reduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {debtReduction.toFixed(1)}%
              </div>
              <Progress value={debtReduction} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {initialDebt > 0 ? formatCurrency(initialDebt - totalDebt) : '$0'} paid off
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-5 w-5" />
              Debts Eliminated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {debtsPaidOff}
              </div>
              <p className="text-xs text-muted-foreground">
                {debts.length - debtsPaidOff} remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Achievement Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedAchievements.map((achievement) => (
              <div key={achievement.id} className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AchievementCard achievement={achievement} />
                  </div>
                </div>
                
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="ml-16 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Unlocked on {format(new Date(achievement.unlockedAt), 'PPP')}</span>
                    <Badge variant="outline" className="ml-2">
                      {format(new Date(achievement.unlockedAt), 'p')}
                    </Badge>
                  </div>
                )}

                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="ml-16 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {achievement.progress.toFixed(1)} / {achievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / (achievement.maxProgress || 1)) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      {unlockedCount < totalCount && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Trophy className="h-12 w-12 mx-auto text-accent" />
              <h3 className="text-lg font-semibold">Keep Fighting!</h3>
              <p className="text-muted-foreground">
                {unlockedCount === 0 
                  ? "Start your journey to financial freedom and unlock your first achievement!"
                  : `You're making great progress! ${totalCount - unlockedCount} more ${totalCount - unlockedCount === 1 ? 'achievement' : 'achievements'} to go.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {unlockedCount === totalCount && totalCount > 0 && (
        <Card className="border-accent/50 bg-gradient-to-br from-accent/10 to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Trophy className="h-16 w-16 mx-auto text-accent animate-pulse" />
              <h3 className="text-2xl font-bold">Legendary Debt Warrior!</h3>
              <p className="text-muted-foreground text-lg">
                You've unlocked all achievements! You're a true champion of financial freedom!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
