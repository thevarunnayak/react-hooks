import { track } from '@vercel/analytics';

/**
 * Vercel Analytics event dispatcher for ReactLabz
 * Tracks user actions safely without throwing errors if analytics is disabled or blocked.
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) => {
  try {
    track(eventName, properties);
  } catch {
    // Non-blocking in dev mode or ad-blocked environments
  }
};
