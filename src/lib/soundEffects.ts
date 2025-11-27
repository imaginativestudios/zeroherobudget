/**
 * Sound effect utilities using Web Audio API
 */

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Play a subtle tone
 */
const playTone = (frequency: number, duration: number, volume: number = 0.1) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug('Audio playback not available:', error);
  }
};

export const soundEffects = {
  /**
   * Subtle pickup sound for drag start
   */
  pickup: () => {
    playTone(800, 0.05, 0.08);
  },

  /**
   * Subtle drop sound for successful drop
   */
  drop: () => {
    playTone(600, 0.08, 0.08);
  },

  /**
   * Success sound for completed reorder
   */
  success: () => {
    playTone(900, 0.05, 0.06);
    setTimeout(() => playTone(1200, 0.05, 0.06), 50);
  },

  /**
   * Achievement unlock sounds - subtle and pleasant
   */
  achievementBasic: () => {
    // Basic achievement - simple pleasant ding
    playTone(784, 0.15, 0.04);
    setTimeout(() => playTone(1047, 0.2, 0.04), 60);
  },

  achievementMilestone: () => {
    // Milestone achievement - bright ascending notes
    playTone(659, 0.18, 0.05);
    setTimeout(() => playTone(784, 0.18, 0.05), 80);
    setTimeout(() => playTone(988, 0.22, 0.05), 160);
  },

  achievementEpic: () => {
    // Epic achievement - ascending triumphant chord
    playTone(523, 0.25, 0.06);
    setTimeout(() => playTone(659, 0.25, 0.06), 100);
    setTimeout(() => playTone(784, 0.25, 0.06), 200);
    setTimeout(() => playTone(1047, 0.3, 0.06), 300);
  },
};

export const playAchievementUnlockSound = (level: 'basic' | 'milestone' | 'epic' = 'basic') => {
  if (level === 'epic') {
    soundEffects.achievementEpic();
  } else if (level === 'milestone') {
    soundEffects.achievementMilestone();
  } else {
    soundEffects.achievementBasic();
  }
};
