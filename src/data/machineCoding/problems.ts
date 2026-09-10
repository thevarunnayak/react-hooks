import { MachineCodingProblem, MachineCodingCategory } from '../../types/machineCoding';
import { PROBLEMS_PART1 } from './problemsPart1';
import { PROBLEMS_PART2 } from './problemsPart2';
import { PROBLEMS_PART3 } from './problemsPart3';
import { PROBLEMS_PART4 } from './problemsPart4';
import { PROBLEMS_PART5 } from './problemsPart5';

export const MACHINE_CODING_PROBLEMS: MachineCodingProblem[] = [
  ...PROBLEMS_PART1,
  ...PROBLEMS_PART2,
  ...PROBLEMS_PART3,
  ...PROBLEMS_PART4,
  ...PROBLEMS_PART5,
];

export const MACHINE_CODING_PROBLEMS_BY_ID = new Map<string, MachineCodingProblem>(
  MACHINE_CODING_PROBLEMS.map((p) => [p.id, p])
);

export const MACHINE_CODING_CATEGORIES: (MachineCodingCategory | 'All')[] = [
  'All',
  'State & CRUD',
  'Async & Network',
  'UI Feedback & Overlays',
  'Data & Navigation',
  'Advanced DOM & Performance',
];
