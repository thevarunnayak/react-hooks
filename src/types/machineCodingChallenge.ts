export type ChallengeTrack = 'frontend' | 'backend' | 'fullstack';

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ChallengeCategory =
  | 'State Management'
  | 'Forms'
  | 'Lists'
  | 'Search'
  | 'Async & Hooks'
  | 'Drag & Drop'
  | 'Performance & Virtualization'
  | 'Trees & Hierarchy'
  | 'UI Components'
  | 'State Machines'
  | 'Algorithms & Data Structures'
  | 'Backend Architecture'
  | 'Concurrency & Async'
  | 'Caching & Rate Limiting'
  | 'Backend & APIs'
  | 'Data & State Management';

export interface TestExecutionHelpers {
  container: HTMLElement;
  getByText: (text: string | RegExp) => HTMLElement;
  queryByText: (text: string | RegExp) => HTMLElement | null;
  getByTestId: (id: string) => HTMLElement;
  queryByTestId: (id: string) => HTMLElement | null;
  getByRole: (role: string, name?: string | RegExp) => HTMLElement;
  queryByRole: (role: string, name?: string | RegExp) => HTMLElement | null;
  getByPlaceholderText: (placeholder: string | RegExp) => HTMLInputElement | HTMLTextAreaElement;
  queryByPlaceholderText: (placeholder: string | RegExp) => HTMLInputElement | HTMLTextAreaElement | null;
  getAllByRole: (role: string) => HTMLElement[];
  fireEvent: {
    click: (element: HTMLElement) => void;
    change: (element: HTMLElement, value: any) => void;
    input: (element: HTMLElement, value: any) => void;
    submit: (element: HTMLElement) => void;
    keyDown: (element: HTMLElement, key: string, options?: any) => void;
    focus: (element: HTMLElement) => void;
    blur: (element: HTMLElement) => void;
    scroll: (element: HTMLElement) => void;
    dragStart: (element: HTMLElement) => void;
    drop: (element: HTMLElement) => void;
  };
  type: (element: HTMLInputElement | HTMLTextAreaElement, text: string) => Promise<void>;
  waitFor: (assertionFn: () => boolean | void | Promise<boolean | void>, options?: { timeout?: number; interval?: number }) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  expect: (actual: any) => {
    toBe: (expected: any) => void;
    toEqual: (expected: any) => void;
    toContain: (item: any) => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toHaveLength: (len: number) => void;
    toBeGreaterThan: (n: number) => void;
    toBeLessThan: (n: number) => void;
    toBeNull: () => void;
    not: {
      toBe: (expected: any) => void;
      toContain: (item: any) => void;
      toBeTruthy: () => void;
    };
  };
  exports?: Record<string, any>;
}

export interface ChallengeTestCase {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
  weight?: number;
  expectedResult?: string;
  testFn: (helpers: TestExecutionHelpers) => Promise<void> | void;
}

export interface MachineCodingChallenge {
  id: string;
  title: string;
  slug: string;
  difficulty: ChallengeDifficulty;
  track?: ChallengeTrack;
  estimatedTime: string;
  category: ChallengeCategory;
  tags: string[];
  description: string;
  requirements: string[];
  functionalRequirements: string[];
  UIRequirements: string[];
  edgeCases: string[];
  hints: string[];
  starterCode: string;
  solutionCode: string;
  expectedSolutionStructure?: string;
  testCases: ChallengeTestCase[];
  sampleInput?: string;
  sampleOutput?: string;
  constraints: string[];
  interviewNotes: string;
  evaluationRules: string[];
}

export interface ChallengeSet {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty | 'Mixed';
  recommendedMinutes: number;
  challengeIds: string[];
  tags: string[];
}

export type ChallengeModeType = 'single' | 'random' | 'set';
export type ChallengeSessionMode = 'practice' | 'interview';

export interface ChallengeSessionConfig {
  type: ChallengeModeType;
  mode: ChallengeSessionMode;
  isTimed: boolean;
  durationMinutes: number;
  difficulty: ChallengeDifficulty | 'Mixed';
  category?: ChallengeCategory | 'All';
  questionCount?: number;
  setId?: string;
  allowPause: boolean;
}

export interface SingleTestResult {
  testId: string;
  name: string;
  description: string;
  hidden: boolean;
  passed: boolean;
  error?: string;
  expected?: string;
  received?: string;
  hint?: string;
  durationMs: number;
}

export interface TestExecutionResult {
  challengeId: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  compileError?: string;
  runtimeError?: string;
  results: SingleTestResult[];
  logs: Array<{ type: 'log' | 'info' | 'warn' | 'error'; message: string }>;
}

export interface ChallengeRecord {
  id: string;
  completedAt: number;
  bestTimeSeconds: number;
  attempts: number;
  passedAll: boolean;
  scorePercent: number;
  mode: ChallengeSessionMode;
}

export interface ChallengeEditorPreferences {
  fontSize: number; // 12, 13, 14, 15, 16, 18
  theme: 'apple-dark' | 'apple-light';
  wordWrap: 'on' | 'off';
  minimap: boolean;
  tabSize: number;
  autoClosingBrackets: 'always' | 'never';
  language: 'typescript' | 'javascript';
}

export interface ChallengeLayoutPreferences {
  problemPanelWidth: number; // e.g. 380px or 30%
  testPanelHeight: number; // e.g. 260px
  previewPanelWidth: number; // e.g. 50%
  isProblemCollapsed: boolean;
  isTestCollapsed: boolean;
  isEditorMaximized: boolean;
}
