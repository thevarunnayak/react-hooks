import { useEffect } from 'react';

export function useKeyboardShortcut(
  keyCombo: string, // e.g. 'k' with meta/ctrl, or 'Escape', or 'z' with meta/ctrl
  callback: (e: KeyboardEvent) => void,
  options: { meta?: boolean; shift?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey;

      if (options.meta && !isMetaOrCtrl) return;
      if (!options.meta && isMetaOrCtrl) return;
      if (options.shift && !event.shiftKey) return;
      if (!options.shift && event.shiftKey) return;

      if (event.key.toLowerCase() === keyCombo.toLowerCase()) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, callback, options.meta, options.shift]);
}
