import { EASY_CHALLENGES } from './easyChallenges';
import { MEDIUM_CHALLENGES } from './mediumChallenges';
import { HARD_CHALLENGES } from './hardChallenges';
import { ALL_BACKEND_CHALLENGES } from './backendChallenges';
import { CHALLENGE_SETS } from './challengeSets';
import {
  MachineCodingChallenge,
  ChallengeDifficulty,
  ChallengeCategory,
} from '../../types/machineCodingChallenge';

export { CHALLENGE_SETS } from './challengeSets';
export { ALL_BACKEND_CHALLENGES } from './backendChallenges';

export const ALL_CHALLENGES: MachineCodingChallenge[] = [
  ...EASY_CHALLENGES,
  ...MEDIUM_CHALLENGES,
  ...HARD_CHALLENGES,
  ...ALL_BACKEND_CHALLENGES,
];

export const CHALLENGES_BY_ID = new Map<string, MachineCodingChallenge>(
  ALL_CHALLENGES.map((c) => [c.id, c])
);

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
  'State Management',
  'Forms',
  'Lists',
  'Search',
  'Async & Hooks',
  'Drag & Drop',
  'Performance & Virtualization',
  'Trees & Hierarchy',
  'UI Components',
  'State Machines',
  'Backend & APIs',
  'Algorithms & Data Structures',
  'Data & State Management',
];

export function getChallengeById(id: string): MachineCodingChallenge | undefined {
  return CHALLENGES_BY_ID.get(id);
}

export function getRandomChallenges(
  count: number,
  difficulty: ChallengeDifficulty | 'Mixed' = 'Mixed',
  category: ChallengeCategory | 'All' = 'All'
): MachineCodingChallenge[] {
  let pool = [...ALL_CHALLENGES];

  if (difficulty !== 'Mixed') {
    pool = pool.filter((c) => c.difficulty === difficulty);
  }

  if (category !== 'All') {
    pool = pool.filter((c) => c.category === category);
  }

  // Fallback if filter is too narrow
  if (pool.length === 0) {
    pool = [...ALL_CHALLENGES];
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
}
