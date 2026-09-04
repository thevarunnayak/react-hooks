import { PlaygroundProject } from './playground';

export interface UserLessonNote {
  hookId: string;
  note: string;
  updatedAt: number;
}

export interface NoteEntry {
  id: string;
  targetId: string; // hook ID or custom hook ID, e.g. "useState", "useLocalStorage"
  content: string;
  createdAt: number;
  updatedAt?: number;
}

export interface AppExportData {
  version: number;
  exportedAt: string;
  theme: 'system' | 'light' | 'dark';
  bookmarks: string[];
  completedLessons: string[];
  completedChallenges: string[];
  notes?: Record<string, string>; // legacy backward compatibility
  notesTable?: NoteEntry[]; // unified multi-entry notes table
  savedProjects: PlaygroundProject[];
  preferences: {
    reducedMotion: boolean;
    autoRunPreview: boolean;
    fontSize: number;
  };
}
