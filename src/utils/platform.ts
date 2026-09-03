/**
 * Utility functions for operating system detection and cross-platform keybinding formatting.
 */

export const isMac = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const nav = navigator as any;
  if (nav.userAgentData?.platform) {
    return /mac/i.test(nav.userAgentData.platform);
  }
  if (navigator.platform) {
    return /mac/i.test(navigator.platform);
  }
  return /macintosh|mac os x/i.test(navigator.userAgent || '');
};

/**
 * Formats a keybinding shortcut string based on the active operating system:
 * - On macOS: displays symbols or Mac keys (e.g. '⌘K', '⌘Z', '⌘⇧Z', '⌘D')
 * - On Windows / Linux: displays Ctrl equivalents (e.g. 'Ctrl+K', 'Ctrl+Z', 'Ctrl+Shift+Z' or 'Ctrl+Y', 'Ctrl+D')
 */
export const formatKeybinding = (shortcut: string, forceMac?: boolean): string => {
  if (!shortcut) return '';
  const mac = forceMac !== undefined ? forceMac : isMac();

  if (mac) {
    // If on Mac, normalize Windows / generic keys into Mac symbols
    return shortcut
      .replace(/Ctrl\+Shift\+/gi, '⌘⇧')
      .replace(/Ctrl\+Y/gi, '⌘⇧Z')
      .replace(/Ctrl\+/gi, '⌘')
      .replace(/Control\+/gi, '⌘')
      .replace(/Command\+/gi, '⌘')
      .replace(/Cmd\+/gi, '⌘');
  } else {
    // If on Windows / Linux, normalize Mac symbols into Ctrl+
    return shortcut
      .replace(/⌘⇧/g, 'Ctrl+Shift+')
      .replace(/⌘Shift\+/gi, 'Ctrl+Shift+')
      .replace(/⌘\s*/g, 'Ctrl+')
      .replace(/Cmd\+/gi, 'Ctrl+')
      .replace(/Command\+/gi, 'Ctrl+');
  }
};

/**
 * Returns modifier label ('⌘' on Mac, 'Ctrl' on Windows/Linux)
 */
export const getModifierKeyLabel = (forceMac?: boolean): string => {
  const mac = forceMac !== undefined ? forceMac : isMac();
  return mac ? '⌘' : 'Ctrl';
};
