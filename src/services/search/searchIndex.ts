import { SearchDocument } from '../../types/search';
import { HOOKS_CATALOG } from '../../data/hooks';
import { CUSTOM_HOOKS_CATALOG } from '../../data/custom-hooks/catalog';
import { TUTORIAL_PROJECTS } from '../../components/playground/tutorials/tutorialConfigs';
import { CHALLENGES_LIST } from '../../data/challenges';
import { INTERVIEW_QUESTIONS_LIST } from '../../data/interviews';

let cachedIndex: SearchDocument[] | null = null;

/**
 * Builds and returns the comprehensive universal search index across the entire ReactLabz platform.
 */
export function getSearchIndex(): SearchDocument[] {
  if (cachedIndex) return cachedIndex;

  const docs: SearchDocument[] = [];

  // 1. Primary Pages & Interactive Studios
  const pages = [
    {
      id: 'page-playground',
      title: 'Visual Component Builder',
      subtitle: 'Interactive drag & drop architecture studio, reactive nodes, and live visual sandbox.',
      route: 'playground',
      tags: ['builder', 'playground', 'canvas', 'visual', 'interactive', 'nodes', 'wire', 'studio'],
      content: 'Create, edit, and experiment with reactive node architectures, wiring events, state hooks, and UI displays in real-time.',
    },
    {
      id: 'page-hook-map',
      title: 'Visual React Hooks Map',
      subtitle: 'Interactive dependency graph and hierarchical mind map of all React 19 hooks.',
      route: 'hook-map',
      tags: ['map', 'graph', 'hierarchy', 'visualization', 'dependency', 'relationships'],
      content: 'Explore how React hooks connect, relate, and transition across state, effects, refs, context, and modern concurrency.',
    },
    {
      id: 'page-custom-hooks',
      title: 'Custom Hooks Library',
      subtitle: 'Production-ready catalog of 40+ custom React hooks with live sandbox and copyable source.',
      route: 'custom-hooks',
      tags: ['custom hooks', 'library', 'catalog', 'utilities', 'storage', 'ui', 'network', 'sensors'],
      content: 'Browse 40+ high quality custom hooks including useLocalStorage, useDebounce, useInterval, usePrevious, and useMediaQuery.',
    },
    {
      id: 'page-examples',
      title: 'Real-Time Architectures',
      subtitle: '50 production-grade architecture blueprints across 8 categories with live interactive execution.',
      route: 'examples',
      tags: ['architectures', 'blueprints', 'examples', 'projects', '50', 'real-world', 'production'],
      content: 'Explore 50 production-ready architectural presets with 0 card overlaps, multi-column reactive dataflows, and live HUD output.',
    },
    {
      id: 'page-challenges',
      title: 'Interactive Challenges',
      subtitle: 'Hands-on snapshot prediction, bug fixing, and optimization challenges with instant scoring.',
      route: 'challenges',
      tags: ['challenges', 'quiz', 'exercises', 'practice', 'predict', 'debug', 'scoring'],
      content: 'Test your mastery of React mental models, closure captures, re-render lifecycles, and concurrency with interactive puzzles.',
    },
    {
      id: 'page-interview',
      title: 'Senior Interview Preparation',
      subtitle: 'Staff & senior-level React architectural interview questions, deep dives, and pitfalls.',
      route: 'interview',
      tags: ['interview', 'senior', 'staff', 'prep', 'architecture', 'fiber', 'reconciliation', 'concurrency'],
      content: 'Master senior frontend interview questions covering Fiber reconciliation, render vs commit phases, Virtual DOM, and state queues.',
    },
    {
      id: 'page-hook-builder',
      title: 'Scaffold Hook Wizard',
      subtitle: 'Guided interactive generator for scaffolding typed, robust custom React hooks.',
      route: 'hook-builder',
      tags: ['wizard', 'generator', 'scaffold', 'typescript', 'create', 'tool'],
      content: 'Generate production-ready custom hook templates with TypeScript types, tests, documentation, and error boundaries.',
    },
  ];

  for (const page of pages) {
    docs.push({
      id: page.id,
      title: page.title,
      subtitle: page.subtitle,
      category: 'page',
      categoryLabel: 'Studio Page',
      route: page.route,
      tags: page.tags,
      keywords: [page.title, ...page.tags],
      content: `${page.title} — ${page.subtitle} ${page.content}`,
      iconType: 'page',
    });
  }

  // 2. React Hooks Catalog (15 Core & Modern Hooks)
  for (const h of HOOKS_CATALOG) {
    const mentalModelText = h.mentalModel
      ? `${h.mentalModel.summary} ${h.mentalModel.details || ''}`
      : '';
    const analogyText = h.analogy
      ? `${h.analogy.metaphor}: ${h.analogy.description}`
      : '';
    const mistakesText = (h.commonMistakes || [])
      .map((m) => `Mistake: ${m.title}. ${m.explanation}`)
      .join(' ');
    const perfText = (h.performanceTips || []).join(' ');
    const whenNotText = (h.whenNotToUse || []).join(' ');
    const interviewsText = (h.interviewQuestions || [])
      .map((q) => `${q.question} ${q.answer}`)
      .join(' ');

    const fullContent = [
      h.tagline,
      h.whatIsIt,
      h.whyExists,
      h.simpleExplanation,
      analogyText,
      mentalModelText,
      h.keyTakeaway,
      mistakesText,
      perfText,
      whenNotText,
      interviewsText,
      h.internalMechanism || '',
    ].filter(Boolean).join(' ');

    docs.push({
      id: `hook-${h.id}`,
      title: `${h.name}()`,
      subtitle: h.tagline,
      category: 'hook',
      categoryLabel: `React Hook (${h.category})`,
      route: 'hook',
      param: h.id,
      difficulty: h.difficulty,
      badge: h.category,
      tags: [h.name, h.category, h.difficulty, 'react', 'hook', 'react 19', ...(h.relatedHooks || [])],
      keywords: [h.name, h.category, ...(h.relatedHooks || [])],
      content: fullContent,
      iconType: 'hook',
    });
  }

  // 3. Custom Hooks Catalog (40+ Hooks)
  for (const c of CUSTOM_HOOKS_CATALOG) {
    const useCasesText = (c.useCases || []).join(', ');
    const pitfallsText = (c.pitfalls || []).join(' ');
    const paramsText = (c.parameters || []).map((p) => `${p.name} (${p.type}): ${p.description}`).join(' ');
    const returnsText = (c.returns || []).map((r) => `${r.name} (${r.type}): ${r.description}`).join(' ');

    const fullContent = [
      c.description,
      `Problem: ${c.problem}`,
      `Solution: ${c.solution}`,
      useCasesText ? `Use Cases: ${useCasesText}` : '',
      pitfallsText ? `Pitfalls: ${pitfallsText}` : '',
      paramsText ? `Parameters: ${paramsText}` : '',
      returnsText ? `Returns: ${returnsText}` : '',
    ].filter(Boolean).join(' ');

    docs.push({
      id: `custom-hook-${c.id}`,
      title: `${c.name}()`,
      subtitle: c.description,
      category: 'custom_hook',
      categoryLabel: `Custom Hook (${c.category})`,
      route: 'custom-hook-detail',
      param: c.id,
      badge: c.category,
      tags: [c.name, c.category, 'custom hook', ...(c.tags || []), ...(c.relatedHooks || [])],
      keywords: [...(c.tags || []), c.name, c.category],
      content: fullContent,
      iconType: 'custom_hook',
    });
  }

  // 4. Architecture Lab Presets (All 50 Presets)
  for (const p of Object.values(TUTORIAL_PROJECTS)) {
    const category = p.category || 'Architecture';
    const difficulty = p.difficulty || 'Intermediate';
    const description = p.description || '';
    const nodeLabels = (p.nodes || []).map((n) => `${n.label} (${n.subtype || ''})`).join(', ');
    const hooksText = (p.hooks || []).join(', ');

    const fullContent = [
      description,
      hooksText ? `Hooks: ${hooksText}` : '',
      nodeLabels ? `Components: ${nodeLabels}` : '',
      `Category: ${category}`,
      `Difficulty: ${difficulty}`,
    ].filter(Boolean).join(' ');

    const tags: string[] = ['architecture', 'preset', 'lab', category, difficulty, ...(p.hooks || [])];
    const keywords: string[] = [
      p.name,
      category,
      ...(p.hooks || []),
      ...(p.nodes || []).map((n) => String(n.subtype || '')).filter(Boolean),
    ];

    docs.push({
      id: `arch-${p.id}`,
      title: p.name,
      subtitle: description,
      category: 'architecture',
      categoryLabel: `Architecture (${category})`,
      route: 'playground',
      param: p.id,
      difficulty,
      badge: `${p.nodes?.length || 0} Nodes`,
      tags,
      keywords,
      content: fullContent,
      iconType: 'architecture',
    });
  }

  // 5. Interactive Challenges (50+ Challenges)
  for (const ch of CHALLENGES_LIST) {
    const fullContent = [
      ch.question,
      `Explanation: ${ch.explanation}`,
      ch.hint ? `Hint: ${ch.hint}` : '',
      `Category: ${ch.category}`,
      `Difficulty: ${ch.difficulty}`,
    ].filter(Boolean).join(' ');

    docs.push({
      id: `ch-${ch.id}`,
      title: ch.title,
      subtitle: ch.question.length > 130 ? ch.question.slice(0, 130) + '...' : ch.question,
      category: 'challenge',
      categoryLabel: `Challenge (${ch.category})`,
      route: 'challenges',
      param: ch.id,
      difficulty: ch.difficulty,
      badge: ch.type,
      tags: ['challenge', 'quiz', 'practice', ch.category, ch.difficulty, ch.type],
      keywords: [ch.title, ch.category, ch.difficulty],
      content: fullContent,
      iconType: 'challenge',
    });
  }

  // 6. Senior & Staff Interview Questions
  for (const q of INTERVIEW_QUESTIONS_LIST) {
    const pitfallsText = (q.commonPitfalls || []).join(' ');
    const followUpText = q.followUp ? `${q.followUp.question} ${q.followUp.answer}` : '';

    const fullContent = [
      q.question,
      `Short Answer: ${q.shortAnswer}`,
      `Deep Dive: ${q.deepDive}`,
      pitfallsText ? `Common Pitfalls: ${pitfallsText}` : '',
      followUpText ? `Follow Up: ${followUpText}` : '',
      `Category: ${q.category}`,
      `Difficulty: ${q.difficulty}`,
    ].filter(Boolean).join(' ');

    docs.push({
      id: `int-${q.id}`,
      title: q.question,
      subtitle: q.shortAnswer.length > 130 ? q.shortAnswer.slice(0, 130) + '...' : q.shortAnswer,
      category: 'interview',
      categoryLabel: `Interview (${q.category})`,
      route: 'interview',
      param: q.id,
      difficulty: q.difficulty,
      badge: q.difficulty,
      tags: ['interview', 'senior', 'staff', 'question', q.category, q.difficulty],
      keywords: [q.question, q.category, q.difficulty],
      content: fullContent,
      iconType: 'interview',
    });
  }

  cachedIndex = docs;
  return docs;
}
