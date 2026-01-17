/**
 * Sanctuary Health Calculations
 * 
 * Calculates the health/status of the user's emergency fund (Sanctuary)
 * to determine if it should be the Current Quest on the Dashboard.
 */

export type MoatStatus = 'vulnerable' | 'building' | 'fortified' | 'secure';
export type CastleLevel = 1 | 2 | 3 | 4;

export interface MoatHealth {
  status: MoatStatus;
  isPrimaryQuest: boolean;
  percentage: number;
  message: string;
  castleLevel: CastleLevel;
  statusLabel: string;
}

/**
 * Calculate the health of the user's Sanctuary (emergency fund)
 * 
 * @param moatCurrent - Current sanctuary balance
 * @param moatTarget - Target sanctuary amount (default $1,000)
 * @returns MoatHealth object with status, quest priority, and messaging
 */
export function calculateMoatHealth(
  moatCurrent: number, 
  moatTarget: number = 1000
): MoatHealth {
  const percentage = Math.min(100, Math.max(0, (moatCurrent / moatTarget) * 100));
  
  // Sanctuary is complete - no longer current quest
  if (moatCurrent >= moatTarget) {
    return {
      status: 'secure',
      isPrimaryQuest: false,
      percentage: 100,
      message: "Your Sanctuary is safe! You're protected from the unexpected. Focus on clearing the next Shadow.",
      castleLevel: 4,
      statusLabel: 'Sanctuary Safe',
    };
  }
  
  // No sanctuary at all - vulnerable state
  if (moatCurrent === 0) {
    return {
      status: 'vulnerable',
      isPrimaryQuest: true,
      percentage: 0,
      message: "Your Sanctuary needs building. Create your $1,000 safe haven to protect your journey.",
      castleLevel: 1,
      statusLabel: 'Sanctuary Exposed',
    };
  }
  
  // Fortified state (76-99%)
  if (percentage >= 76) {
    return {
      status: 'fortified',
      isPrimaryQuest: true,
      percentage,
      message: "Almost there! Your Sanctuary is nearly complete. One final step to full protection!",
      castleLevel: 4,
      statusLabel: 'Sanctuary Strengthening',
    };
  }
  
  // Building state - moderate progress (26-75%)
  if (percentage >= 26) {
    const castleLevel: CastleLevel = percentage >= 51 ? 3 : 2;
    return {
      status: 'building',
      isPrimaryQuest: true,
      percentage,
      message: percentage >= 51 
        ? "Your Sanctuary grows stronger! Keep nurturing your safe haven."
        : "Good progress, traveler! Your Sanctuary is taking shape.",
      castleLevel,
      statusLabel: 'Sanctuary Growing',
    };
  }
  
  // Early building stage (1-25%)
  return {
    status: 'building',
    isPrimaryQuest: true,
    percentage,
    message: "Every dollar brings more peace of mind. Keep building your Sanctuary!",
    castleLevel: 1,
    statusLabel: 'Sanctuary Growing',
  };
}

/**
 * Get the castle icon type based on the castle level
 */
export function getCastleIconType(level: CastleLevel): 'cabin' | 'tower' | 'castle' | 'fortress' {
  switch (level) {
    case 1: return 'cabin';
    case 2: return 'tower';
    case 3: return 'castle';
    case 4: return 'fortress';
  }
}

/**
 * Sanctuary level display labels for the badge
 */
export const FORTRESS_LEVEL_LABELS: Record<CastleLevel, string> = {
  1: 'Seedling',
  2: 'Shelter',
  3: 'Haven',
  4: 'Sanctuary',
};

/**
 * Sanctuary Milestone definitions for celebrations
 */
export interface MoatMilestone {
  percentage: 25 | 50 | 75 | 100;
  title: string;
  message: string;
  icon: string;
  celebrationLevel: 'basic' | 'milestone' | 'epic';
}

export const MOAT_MILESTONES: Record<number, MoatMilestone> = {
  25: {
    percentage: 25,
    title: "Seeds Planted!",
    message: "Your Sanctuary is taking root! 25% of your goal is reached.",
    icon: "🌱",
    celebrationLevel: 'basic',
  },
  50: {
    percentage: 50,
    title: "Halfway There!",
    message: "Remarkable progress, traveler! Your Sanctuary is halfway complete.",
    icon: "🏕️",
    celebrationLevel: 'milestone',
  },
  75: {
    percentage: 75,
    title: "Almost Complete!",
    message: "Your safe haven grows strong! Just a bit more to full peace of mind.",
    icon: "🏡",
    celebrationLevel: 'milestone',
  },
  100: {
    percentage: 100,
    title: "Sanctuary Complete!",
    message: "Your Sanctuary is safe! You're protected from life's unexpected turns.",
    icon: "✨",
    celebrationLevel: 'epic',
  },
};
