// Dismissal flag for the onboarding checklist. Lives in sessionStorage keyed
// by wallet, and is cleared on every real login (AuthContext.completeLogin),
// so each sign-in surfaces the checklist again while steps remain pending -
// dismissing only silences it for the rest of the current visit.

const dismissKey = (walletAddress: string) => `orbital:onboarding-dismissed:${walletAddress}`;

export const isOnboardingDismissed = (walletAddress: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(dismissKey(walletAddress)) === '1';
};

export const dismissOnboarding = (walletAddress: string): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(dismissKey(walletAddress), '1');
};

export const clearOnboardingDismissal = (walletAddress: string): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(dismissKey(walletAddress));
};
