/**
 * Emergency Fund Health Calculations
 * 
 * Calculates the health/status of the user's emergency fund
 * to determine if it should be the Current Quest on the Dashboard.
 * 
 * Uses functional terminology for clarity, with heroic flavor in descriptions only.
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
 * Calculate the health of the user's Emergency Fund
 * 
 * @param moatCurrent - Current emergency fund balance
 * @param moatTarget - Target emergency fund amount (default $1,000)
 * @returns MoatHealth object with status, quest priority, and messaging
 */
export function calculateMoatHealth(
  moatCurrent: number, 
  moatTarget: number = 1000
): MoatHealth {
  const percentage = Math.min(100, Math.max(0, (moatCurrent / moatTarget) * 100));
  
  // Emergency fund is complete - no longer current quest
  if (moatCurrent >= moatTarget) {
    return {
      status: 'secure',
      isPrimaryQuest: false,
      percentage: 100,
      message: "Your emergency fund is secure! You're protected from unexpected expenses. Focus on paying down your debt.",
      castleLevel: 4,
      statusLabel: 'Fund Secure',
    };
  }
  
  // No emergency fund at all - vulnerable state
  if (moatCurrent === 0) {
    return {
      status: 'vulnerable',
      isPrimaryQuest: true,
      percentage: 0,
      message: "Start your emergency fund today. Build a $1,000 safety net to protect yourself from unexpected expenses.",
      castleLevel: 1,
      statusLabel: 'Fund Vulnerable',
    };
  }
  
  // Fortified state (76-99%)
  if (percentage >= 76) {
    return {
      status: 'fortified',
      isPrimaryQuest: true,
      percentage,
      message: "Almost there! Your emergency fund is nearly complete. One final push to full protection!",
      castleLevel: 4,
      statusLabel: 'Fund Fortified',
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
        ? "Great progress! Your emergency fund is growing stronger. Keep it up!"
        : "Good start! Your emergency fund is taking shape. Keep building!",
      castleLevel,
      statusLabel: 'Fund Building',
    };
  }
  
  // Early building stage (1-25%)
  return {
    status: 'building',
    isPrimaryQuest: true,
    percentage,
    message: "Every dollar adds more security. Keep building your emergency fund!",
    castleLevel: 1,
    statusLabel: 'Fund Building',
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
 * Emergency fund level display labels for the badge
 */
export const FORTRESS_LEVEL_LABELS: Record<CastleLevel, string> = {
  1: 'Starting',
  2: 'Growing',
  3: 'Strong',
  4: 'Complete',
};

/**
 * Emergency Fund Milestone definitions for celebrations
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
    title: "Great Start!",
    message: "You've reached 25% of your emergency fund goal. Keep going!",
    icon: "🌱",
    celebrationLevel: 'basic',
  },
  50: {
    percentage: 50,
    title: "Halfway There!",
    message: "Amazing progress! Your emergency fund is 50% complete.",
    icon: "🏕️",
    celebrationLevel: 'milestone',
  },
  75: {
    percentage: 75,
    title: "Almost Complete!",
    message: "Your emergency fund is 75% complete. The finish line is in sight!",
    icon: "🏡",
    celebrationLevel: 'milestone',
  },
  100: {
    percentage: 100,
    title: "Emergency Fund Complete!",
    message: "Congratulations! You now have a $1,000 emergency fund. You're protected!",
    icon: "✨",
    celebrationLevel: 'epic',
  },
};
