export type ChallengeType =
  | 'predict'
  | 'find_bug'
  | 'fix_hook'
  | 'choose_hook'
  | 'optimize';

export interface ChallengeItem {
  id: string;
  title: string;
  type: ChallengeType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  question: string;
  codeSnippet?: string;
  options?: string[];
  correctOptionIndex?: number;
  expectedOutput?: string;
  explanation: string;
  hint: string;
}

export interface InterviewQuestionItem {
  id: string;
  category: string;
  question: string;
  difficulty: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  shortAnswer: string;
  deepDive: string;
  commonPitfalls: string[];
  codeExample?: string;
}
