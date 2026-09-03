import { HookLessonData } from '../../types/hook';

export const useMemoData: HookLessonData = {
  id: 'useMemo',
  name: 'useMemo',
  tagline: 'Cache the result of an expensive calculation between re-renders.',
  category: 'Performance',
  difficulty: 'Intermediate',
  reactVersion: '16.8+',
  labId: 'useMemoCallbackLab',

  whatIsIt: 'useMemo is a React Hook that lets you cache the result of an expensive calculation between re-renders until one of its dependencies changes.',

  whyExists: 'When a component re-renders, every function and expression in its body re-evaluates by default. For CPU-intensive operations (filtering thousands of items, calculating cryptographic hashes, transforming large arrays), recalculating on every unrelated render wastes CPU cycles and degrades frame rates.',

  simpleExplanation: 'Give useMemo a function and a list of dependencies. On the first render, it runs the function and saves the result. On future renders, if dependencies have not changed, it skips running the function and hands you the cached result instantly.',

  analogy: {
    metaphor: 'The Math Scratchpad with Cached Answers',
    description: 'If someone asks you for 347 × 892, you work it out on paper and write the answer 309,524 on your desk. If they ask you the exact same problem 5 minutes later, you don’t recalculate it; you read the number already written down. Only when the numbers change do you do the math again.',
  },

  syntax: `const cachedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);`,

  arguments: [
    {
      name: 'calculateValue',
      type: '() => any',
      required: true,
      description: 'A pure function with no arguments that calculates the value you want to cache.',
    },
    {
      name: 'dependencies',
      type: 'any[]',
      required: true,
      description: 'The list of reactive values referenced inside calculateValue.',
    },
  ],

  returnValue: {
    type: 'T',
    description: 'On initial render, the result of calculateValue(). On subsequent renders, either the stored value from the last render (if deps match) or the result of calculateValue() called again.',
  },

  mentalModel: {
    summary: 'Check Dependencies -> Unchanged? Return Cache : Recompute & Store',
    diagramSteps: [
      'Component renders.',
      'React inspects dependency array using Object.is comparison.',
      'If dependencies are identical to previous render: return cached result.',
      'If any dependency changed: execute compute function, update cache, return fresh result.',
    ],
    details: 'Memoization is an optimization, not a semantic guarantee. In future React versions, React may "forget" some memoized values to free memory.',
  },

  visualExplanation: {
    title: 'Referential Stability & Computation Cost',
    description: 'useMemo solves two problems: expensive CPU work and unstable object references passed to React.memo children.',
    phases: [
      { phase: 'First Render', description: 'Runs calculation (e.g. 50ms). Stores result.' },
      { phase: 'Unrelated Re-render', description: 'Dependencies identical -> 0.01ms instant return from memory.' },
      { phase: 'Dependency Change', description: 'Dependencies changed -> Recalculates and updates memory.' },
    ],
  },

  primaryExample: {
    title: 'Filtering a Large Dataset with useMemo',
    code: `import React, { useState, useMemo } from 'react';

export function ProductList({ products }) {
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('light');

  // Expensive filter only recalculates when products or query change
  const visibleProducts = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  return (
    <div>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme: {theme}
      </button>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{visibleProducts.map(p => <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  );
}`,
    description: 'Clicking "Toggle Theme" re-renders ProductList, but visibleProducts is retrieved instantly from cache without re-filtering.',
  },

  tryItYourselfPrompt: 'Visit the Performance Lab. Turn useMemo ON and OFF while calculating the 5,000th prime number, and observe the render duration stopwatch live!',

  internalMechanism: 'On mount, React saves [result, dependencies] in hook.memoizedState. On re-render, React walks hook.memoizedState and calls areHookInputsEqual(nextDeps, prevDeps). If true, it returns prevResult without invoking the factory.',

  commonMistakes: [
    {
      title: 'Memoizing Cheap Everyday Operations',
      badCode: `const sum = useMemo(() => a + b, [a, b]);`,
      goodCode: `const sum = a + b;`,
      explanation: 'useMemo has overhead: storing dependencies, doing array comparisons, and function allocations. For cheap calculations, useMemo is slower than just running the code!',
      dangerLevel: 'subtle',
    },
  ],

  performanceTips: [
    'Measure before you memoize using React DevTools Profiler or performance.now().',
    'Use useMemo to stabilize object references passed as props to components wrapped in React.memo.',
  ],

  whenNotToUse: [
    'For simple arithmetic or string concatenations: Just compute them inline.',
    'For side effects: Use useEffect instead.',
  ],

  alternatives: [
    { name: 'useCallback', reason: 'Used when caching a function definition rather than a calculated value.' },
  ],

  interviewQuestions: [
    {
      question: 'When should you NOT use useMemo?',
      answer: 'You should not use useMemo for trivial operations (like adding numbers or string formatting) because the cost of array comparison and hook overhead outweighs the computation cost.',
      deepDive: 'Also do not use useMemo if you need a guaranteed cache that is never garbage collected; use a persistent Map/store for that.',
      difficulty: 'Mid',
    },
  ],

  relatedHooks: ['useCallback', 'useRef', 'useEffect'],
  keyTakeaway: 'useMemo caches expensive calculations between renders. Only use it when the calculation is measurably slow or to stabilize object references for React.memo.',
};
