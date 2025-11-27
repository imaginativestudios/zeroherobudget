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
};
