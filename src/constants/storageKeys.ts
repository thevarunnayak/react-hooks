/**
 * LocalStorage and SessionStorage Key Constants
 */

export const STORAGE_KEYS = {
  THEME: 'react-hooks-theme',
  PLAYGROUND_STATE: 'react-hooks-playground-state',
  LESSON_PROGRESS: 'react-hooks-lesson-progress',
  CHALLENGE_SUBMISSIONS: 'react-hooks-challenge-submissions',
  CUSTOM_HOOK_PROGRESS: 'react-hooks-custom-progress',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
