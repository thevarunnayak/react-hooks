import { PlaygroundProject } from './playground';

export interface TutorialStep {
  title: string;
  instruction: string;
  hint?: string;
}

export interface BreakItScenario {
  title: string;
  bugDescription: string;
  symptoms: string[];
  diagnosticHint: string;
  solutionExplanation: string;
  brokenNodes: any[];
  brokenConnections: any[];
  fixedNodes: any[];
  fixedConnections: any[];
}

export interface TutorialProject {
  id: string;
  title: string;
  tagline: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced';
  hooksUsed: string[];
  concepts: string[];
  initialProject: PlaygroundProject;
  steps: TutorialStep[];
  breakIt: BreakItScenario;
}
