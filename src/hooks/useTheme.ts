import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ThemeMode } from '../constants/enums';
import { STORAGE_KEYS } from '../constants/storageKeys';

export type { ThemeMode } from '../constants/enums';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeMode>(STORAGE_KEYS.THEME, ThemeMode.SYSTEM);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', theme);
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return { theme, setTheme };
}
