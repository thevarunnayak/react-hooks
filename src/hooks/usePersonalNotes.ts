import { useState, useEffect, useCallback, useMemo } from 'react';
import { NoteEntry } from '../types/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * Migration helper: loads legacy string-based notes into the unified notes table if needed.
 */
function getInitialNotesTable(): NoteEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawTable = localStorage.getItem(STORAGE_KEYS.NOTES_TABLE);
    if (rawTable) {
      const parsed = JSON.parse(rawTable);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Attempt migration from legacy formats
    const migrated: NoteEntry[] = [];
    const legacyStandard = localStorage.getItem('react_hooks_notes');
    if (legacyStandard) {
      const parsedStandard = JSON.parse(legacyStandard);
      if (parsedStandard && typeof parsedStandard === 'object') {
        Object.entries(parsedStandard).forEach(([targetId, text]) => {
          if (typeof text === 'string' && text.trim().length > 0) {
            migrated.push({
              id: `note-${targetId}-legacy`,
              targetId,
              content: text.trim(),
              createdAt: Date.now() - 60000, // backdated 1 min
            });
          }
        });
      }
    }

    const legacyCustom = localStorage.getItem('react_hooks_custom_notes');
    if (legacyCustom) {
      const parsedCustom = JSON.parse(legacyCustom);
      if (parsedCustom && typeof parsedCustom === 'object') {
        Object.entries(parsedCustom).forEach(([targetId, text]) => {
          if (typeof text === 'string' && text.trim().length > 0) {
            migrated.push({
              id: `note-custom-${targetId}-legacy`,
              targetId,
              content: text.trim(),
              createdAt: Date.now() - 30000,
            });
          }
        });
      }
    }

    if (migrated.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NOTES_TABLE, JSON.stringify(migrated));
    }

    return migrated;
  } catch (error) {
    console.error('Failed to load notes table:', error);
    return [];
  }
}

/**
 * Custom hook for managing personal notes stored in a single unified notes table in localStorage.
 * Allows multiple entries per hook with unique IDs, timestamps, and full CRUD.
 */
export function usePersonalNotes(targetId?: string) {
  const [allNotes, setAllNotes] = useState<NoteEntry[]>(getInitialNotesTable);

  const reloadNotes = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTES_TABLE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setAllNotes(parsed);
          return;
        }
      }
      setAllNotes([]);
    } catch {
      setAllNotes([]);
    }
  }, []);

  // Sync across tabs and local-storage events
  useEffect(() => {
    const handleStorageChange = () => {
      reloadNotes();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [reloadNotes]);

  // Persist updated list to localStorage and broadcast event
  const persistNotes = useCallback((updated: NoteEntry[]) => {
    setAllNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES_TABLE, JSON.stringify(updated));
      window.dispatchEvent(new Event('local-storage'));
    } catch (e) {
      console.error('Failed to save notes table:', e);
    }
  }, []);

  /**
   * Add a new note entry for the target hook
   */
  const addNote = useCallback(
    (content: string, customTargetId?: string): NoteEntry | null => {
      const tid = customTargetId || targetId;
      if (!tid) {
        console.error('Cannot add note without a targetId');
        return null;
      }

      const trimmed = content.trim();
      if (!trimmed) return null;

      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const newEntry: NoteEntry = {
        id: `note_${Date.now()}_${randomSuffix}`,
        targetId: tid,
        content: trimmed,
        createdAt: Date.now(),
      };

      const updated = [newEntry, ...allNotes];
      persistNotes(updated);
      return newEntry;
    },
    [targetId, allNotes, persistNotes]
  );

  /**
   * Update an existing note by ID
   */
  const updateNote = useCallback(
    (id: string, newContent: string): boolean => {
      const trimmed = newContent.trim();
      if (!trimmed) return false;

      const updated = allNotes.map((note) =>
        note.id === id ? { ...note, content: trimmed, updatedAt: Date.now() } : note
      );

      persistNotes(updated);
      return true;
    },
    [allNotes, persistNotes]
  );

  /**
   * Delete a single note by ID
   */
  const deleteNote = useCallback(
    (id: string) => {
      const updated = allNotes.filter((note) => note.id !== id);
      persistNotes(updated);
    },
    [allNotes, persistNotes]
  );

  /**
   * Clear all notes for this target hook
   */
  const clearTargetNotes = useCallback(
    (customTargetId?: string) => {
      const tid = customTargetId || targetId;
      if (!tid) return;
      const updated = allNotes.filter((note) => note.targetId !== tid);
      persistNotes(updated);
    },
    [targetId, allNotes, persistNotes]
  );

  /**
   * Fetch a single note by ID
   */
  const getNoteById = useCallback(
    (id: string) => {
      return allNotes.find((n) => n.id === id);
    },
    [allNotes]
  );

  // Filter notes for the active targetId, sorted newest first
  const targetNotes = useMemo(() => {
    if (!targetId) return allNotes;
    return allNotes
      .filter((n) => n.targetId === targetId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [allNotes, targetId]);

  return {
    notes: targetNotes,
    allNotes,
    addNote,
    updateNote,
    deleteNote,
    clearTargetNotes,
    getNoteById,
    reloadNotes,
  };
}
