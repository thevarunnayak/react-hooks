import { PlaygroundProject } from './playground';

export interface UserLessonNote {
  hookId: string;
  note: string;
  updatedAt: number;
}

export interface AppExportData {
  version: number;
  exportedAt: string;
  theme: 'system' | 'light' | 'dark';
  bookmarks: string[];
  completedLessons: string[];
  completedChallenges: string[];
  notes: Record<string, string>; // hookId -> note text
  savedProjects: PlaygroundProject[];
  preferences: {
    reducedMotion: boolean;
    autoRunPreview: boolean;
    fontSize: number;
  };
}
