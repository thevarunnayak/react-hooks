export type CustomHookCategory =
  | 'State'
  | 'Effects'
  | 'Storage'
  | 'Browser APIs'
  | 'DOM & Sensors'
  | 'Performance'
  | 'Async & Network'
  | 'Animation & UI'
  | 'Utilities';

export interface CustomHookItem {
  id: string;
  name: string;
  category: CustomHookCategory;
  description: string;
  problem: string;
  solution: string;
  tags: string[];
  parameters: { name: string; type: string; description: string }[];
  returns: { name: string; type: string; description: string }[];
  implementation: string;
  demoCode: string;
  useCases: string[];
  pitfalls: string[];
  unitTestExample?: string;
  relatedHooks: string[];
}
