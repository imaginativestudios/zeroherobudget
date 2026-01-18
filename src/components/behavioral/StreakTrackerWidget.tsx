/**
 * Streak Tracker Widget
 * 
 * Visualizes the user's consistency streak with level badges and progress.
 */

import { Flame, Star, Trophy, Compass, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { cn } from '@/lib/utils';

const STREAK_LEVELS = {
  novice: { icon: Star, color: 'text-muted-foreground', label: 'Wayfarer', next: 'Seeker', threshold: 3 },
  apprentice: { icon: Flame, color: 'text-warning', label: 'Seeker', next: 'Pathfinder', threshold: 7 },
  warrior: { icon: Trophy, color: 'text-primary', label: 'Pathfinder', next: 'Sage', threshold: 14 },
  hero: { icon: Compass, color: 'text-success', label: 'Sage', next: 'Luminary', threshold: 30 },
  legend: { icon: Sparkles, color: 'text-tier-champion', label: 'Luminary', next: null, threshold: 100 },
};

export function StreakTrackerWidget() {
  const { consistencyScore, isLoading } = useBehavioralEngine();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-warning" />
            Consistency Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-2 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentStreak, longestStreak, streakLevel, heroMessage } = consistencyScore;
  const levelConfig = STREAK_LEVELS[streakLevel];
  const LevelIcon = levelConfig.icon;

  // Calculate progress to next level
  const currentThreshold = levelConfig.threshold;
  const prevThreshold = streakLevel === 'novice' ? 0 
    : streakLevel === 'apprentice' ? 3 
    : streakLevel === 'warrior' ? 7 
    : streakLevel === 'hero' ? 14 
    : 30;
  
  const progressInLevel = currentStreak - prevThreshold;
  const levelRange = currentThreshold - prevThreshold;
  const progressPercent = Math.min(100, (progressInLevel / levelRange) * 100);
  const daysToNext = currentThreshold - currentStreak;

  return (
    <Card className="h-full shadow-royal hover-lift">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-warning" />
            Consistency Streak
          </span>
          <Badge variant="outline" className={cn('gap-1', levelConfig.color)}>
            <LevelIcon className="h-3 w-3" />
            {levelConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-bold', levelConfig.color)}>
            {currentStreak}
          </span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to {levelConfig.next || 'Max'}</span>
            <span>{daysToNext > 0 ? `${daysToNext} days` : 'Achieved!'}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {heroMessage}
        </p>

        {longestStreak > currentStreak && (
          <p className="text-xs text-muted-foreground">
            Personal best: {longestStreak} days
          </p>
        )}
      </CardContent>
    </Card>
  );
}
