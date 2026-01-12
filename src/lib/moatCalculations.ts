/**
 * Moat Health Calculations
 * 
 * Calculates the health/status of the user's emergency fund (Moat)
 * to determine if it should be the Primary Quest on the Dashboard.
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
 * Calculate the health of the user's Moat (emergency fund)
 * 
 * @param moatCurrent - Current moat balance
 * @param moatTarget - Target moat amount (default $1,000)
 * @returns MoatHealth object with status, quest priority, and messaging
 */
export function calculateMoatHealth(
  moatCurrent: number, 
  moatTarget: number = 1000
): MoatHealth {
  const percentage = Math.min(100, Math.max(0, (moatCurrent / moatTarget) * 100));
  
  // Moat is complete - no longer primary quest
  if (moatCurrent >= moatTarget) {
    return {
      status: 'secure',
      isPrimaryQuest: false,
      percentage: 100,
      message: "The Moat is Secure! Your Fortress can now withstand the unexpected. Focus all power on the next Debt Boss.",
      castleLevel: 4,
      statusLabel: 'Moat Secure',
    };
  }
  
  // No moat at all - vulnerable state
  if (moatCurrent === 0) {
    return {
      status: 'vulnerable',
      isPrimaryQuest: true,
      percentage: 0,
      message: "Your Castle is vulnerable. Build your $1,000 Moat to prevent debt from ever breaking back in.",
      castleLevel: 1,
      statusLabel: 'Castle Vulnerable',
    };
  }
  
  // Fortified state (76-99%)
  if (percentage >= 76) {
    return {
      status: 'fortified',
      isPrimaryQuest: true,
      percentage,
      message: "Almost there! Your defenses are nearly impenetrable. One final push to complete your Moat!",
      castleLevel: 4,
      statusLabel: 'Walls Strengthening',
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
        ? "Your fortress grows stronger! Keep fortifying your defenses."
        : "Good progress, warrior! Your moat is taking shape.",
      castleLevel,
      statusLabel: 'Defenses Rising',
    };
  }
  
  // Early building stage (1-25%)
  return {
    status: 'building',
    isPrimaryQuest: true,
    percentage,
    message: "Every dollar strengthens your castle walls. Keep building!",
    castleLevel: 1,
    statusLabel: 'Defenses Rising',
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
 * Fortress level display labels for the badge
 */
export const FORTRESS_LEVEL_LABELS: Record<CastleLevel, string> = {
  1: 'Wood Cabin',
  2: 'Watchtower',
  3: 'Castle',
  4: 'Stone Fortress',
};

/**
 * Moat Milestone definitions for celebrations
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
    title: "Foundation Laid!",
    message: "Your castle walls are rising! 25% of your Moat is secured.",
    icon: "🏗️",
    celebrationLevel: 'basic',
  },
  50: {
    percentage: 50,
    title: "Halfway Fortified!",
    message: "Impressive progress, warrior! Your defenses are halfway complete.",
    icon: "🛡️",
    celebrationLevel: 'milestone',
  },
  75: {
    percentage: 75,
    title: "Almost Impenetrable!",
    message: "Your fortress grows mighty! Just a bit more to full protection.",
    icon: "⚔️",
    celebrationLevel: 'milestone',
  },
  100: {
    percentage: 100,
    title: "Moat Complete!",
    message: "The Moat is Secure! Your Fortress can now withstand the unexpected!",
    icon: "🏰",
    celebrationLevel: 'epic',
  },
};
