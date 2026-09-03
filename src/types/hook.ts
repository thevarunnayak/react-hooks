export type HookCategory =
  | 'State'
  | 'Effects'
  | 'Context'
  | 'References'
  | 'Performance'
  | 'Concurrent'
  | 'Modern'
  | 'DOM / Ref';

export type HookDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface HookParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface HookReturnValue {
  type: string;
  description: string;
}

export interface HookCommonMistake {
  title: string;
  badCode: string;
  goodCode: string;
  explanation: string;
  dangerLevel: 'warning' | 'critical' | 'subtle';
}

export interface HookInterviewQuestion {
  question: string;
  answer: string;
  deepDive: string;
  difficulty: 'Junior' | 'Mid' | 'Senior';
}

export interface HookLessonData {
  id: string;
  name: string;
  tagline: string;
  category: HookCategory;
  difficulty: HookDifficulty;
  reactVersion: string;
  experimental?: boolean;

  // 20-Part Standard Lesson Format
  whatIsIt: string;
  whyExists: string;
  simpleExplanation: string;
  analogy: {
    metaphor: string;
    description: string;
  };
  syntax: string;
  arguments: HookParam[];
  returnValue: HookReturnValue;
  mentalModel: {
    summary: string;
    diagramSteps: string[];
    details: string;
  };
  visualExplanation: {
    title: string;
    description: string;
    phases: { phase: string; description: string }[];
  };
  primaryExample: {
    title: string;
    code: string;
    description: string;
  };
  secondaryExample?: {
    title: string;
    code: string;
    description: string;
  };
  tryItYourselfPrompt: string;
  internalMechanism: string;
  commonMistakes: HookCommonMistake[];
  performanceTips: string[];
  whenNotToUse: string[];
  alternatives: { name: string; reason: string }[];
  interviewQuestions: HookInterviewQuestion[];
  relatedHooks: string[];
  keyTakeaway: string;
  labId?: string; // Links directly to interactive lab
}
