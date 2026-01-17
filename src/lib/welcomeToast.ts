/**
 * Welcome Toast Utility for First-Time Users
 * 
 * Displays a friendly welcome message with quick tips when a new user logs in
 * for the first time, guiding them to add their first debt.
 */

import { toast } from '@/hooks/use-toast';

const WELCOME_SHOWN_KEY = 'bdt_welcome_shown';

/**
 * Check if the welcome toast has already been shown to this user
 */
export function hasWelcomeBeenShown(userId: string): boolean {
  return localStorage.getItem(`${userId}_${WELCOME_SHOWN_KEY}`) === 'true';
}

/**
 * Mark the welcome toast as shown for this user
 */
export function markWelcomeAsShown(userId: string): void {
  localStorage.setItem(`${userId}_${WELCOME_SHOWN_KEY}`, 'true');
}

/**
 * Show the welcome toast with quick tips and a CTA to add first debt
 */
export function showWelcomeToast(
  userName: string | null,
  onAddDebt: () => void
): void {
  const greeting = userName ? `Welcome, ${userName}!` : 'Welcome, Hero!';
  
  const { dismiss } = toast({
    title: greeting,
    description: "Start your debt-free journey by adding your first debt to track. We'll help you create a winning strategy! Click here to get started.",
    duration: 10000, // Show for 10 seconds
  });

  // Attach a click handler by using a custom toast variant
  // The user can navigate by clicking on the toast notification
  setTimeout(() => {
    const toastElement = document.querySelector('[data-state="open"][data-radix-collection-item]');
    if (toastElement) {
      toastElement.addEventListener('click', () => {
        dismiss();
        onAddDebt();
      }, { once: true });
      (toastElement as HTMLElement).style.cursor = 'pointer';
    }
  }, 100);
}
