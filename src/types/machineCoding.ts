export type MachineCodingDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type MachineCodingCategory =
  | 'State & CRUD'
  | 'Async & Network'
  | 'UI Feedback & Overlays'
  | 'Data & Navigation'
  | 'Advanced DOM & Performance';

export interface MachineCodingConcept {
  name: string;
  description: string;
}

export interface MachineCodingRequirements {
  functional: string[];
  nonFunctional: string[];
}

export interface MachineCodingProblem {
  id: string;
  number: number;
  title: string;
  difficulty: MachineCodingDifficulty;
  category: MachineCodingCategory;
  tags: string[];
  estimatedTime?: string;
  summary: string;
  explanation: string;
  requirements: MachineCodingRequirements;
  conceptsUsed: MachineCodingConcept[];
  edgeCases: string[];
  solutionCode: string;
}
