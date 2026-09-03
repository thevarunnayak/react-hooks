import { useState } from 'react';
import { isMac, formatKeybinding } from '../utils/platform';

/**
 * React hook that returns true if user is on macOS.
 * Guaranteed hydration-safe.
 */
export function useIsMac(): boolean {
  const [mac] = useState(() => isMac());
  return mac;
}

/**
 * React hook that returns a shortcut string formatted for the current user's OS.
 */
export function useFormattedShortcut(shortcut: string): string {
  const mac = useIsMac();
  return formatKeybinding(shortcut, mac);
}
