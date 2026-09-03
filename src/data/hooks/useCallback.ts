import { HookLessonData } from '../../types/hook';

export const useCallbackData: HookLessonData = {
  id: 'useCallback',
  name: 'useCallback',
  tagline: 'Cache a function definition between renders to maintain referential equality.',
  category: 'Performance',
  difficulty: 'Intermediate',
  reactVersion: '16.8+',
  labId: 'useMemoCallbackLab',

  whatIsIt: 'useCallback is a React Hook that lets you cache a function definition between re-renders until one of its dependencies changes.',

  whyExists: 'In JavaScript, functions are objects. Defining a function inside a component body creates a brand-new function reference in memory every single render. When passed as props to a memoized child (<MemoizedChild onClick={fn} />), the child sees a different prop reference and re-renders anyway.',

  simpleExplanation: 'useCallback gives you the exact same function reference between renders unless its dependencies change. It is syntax sugar for: useMemo(() => fn, deps).',

  analogy: {
    metaphor: 'The Laminated ID Badge',
    description: 'If security at an office building checked your signature every day, but your signature looked slightly different every morning, they would have to re-verify your identity from scratch. A laminated ID badge (useCallback) provides the exact same recognizable badge every day, allowing you through security without inspection.',
  },

  syntax: `const cachedFn = useCallback(fn, [dependencies]);`,

  arguments: [
    {
      name: 'fn',
      type: 'Function',
      required: true,
      description: 'The function value you want to cache.',
    },
    {
      name: 'dependencies',
      type: 'any[]',
      required: true,
      description: 'The list of reactive values referenced inside the function.',
    },
  ],

  returnValue: {
    type: 'T',
    description: 'On initial render, the function you passed. On subsequent renders, either the already-stored function from the previous render (if deps match) or the newly passed function.',
  },

  mentalModel: {
    summary: 'Function Object Allocation -> Retain Stable Memory Address for Props Equality',
    diagramSteps: [
      'Parent renders.',
      'useCallback checks dependencies.',
      'If unchanged, returns the previous function pointer (e.g. 0x00FF).',
      '<MemoizedChild onClick={cachedFn} /> receives 0x00FF === 0x00FF (true).',
      'Child skips re-rendering entirely!',
    ],
    details: 'useCallback does not prevent the function from being created in your code; it prevents the function reference from changing across renders.',
  },

  visualExplanation: {
    title: 'Function Reference Stability',
    description: 'Why React.memo fails without useCallback:',
    phases: [
      { phase: 'Without useCallback', description: 'Inline () => {} created on every render. Props shallow comparison fails. Child re-renders.' },
      { phase: 'With useCallback', description: 'Same function memory reference returned. Props comparison passes. Child re-render skipped.' },
    ],
  },

  primaryExample: {
    title: 'Optimizing Child Re-renders with React.memo & useCallback',
    code: `import React, { useState, useCallback } from 'react';

const ExpensiveList = React.memo(function ExpensiveList({ onItemClick }) {
  console.log('Rendering ExpensiveList...');
  return <div>List content</div>;
});

export function Dashboard() {
  const [count, setCount] = useState(0);

  // Stable function reference
  const handleClick = useCallback(() => {
    console.log('Item clicked');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveList onItemClick={handleClick} />
    </div>
  );
}`,
    description: 'Clicking the button updates count, but ExpensiveList does not re-render because onItemClick maintains referential equality.',
  },

  tryItYourselfPrompt: 'In the Performance Lab, toggle useCallback ON and OFF. Observe how <MemoizedChild /> re-renders whenever the parent re-renders when useCallback is disabled!',

  internalMechanism: 'useCallback(fn, deps) is practically identical to useMemo(() => fn, deps). React stores [fn, deps] in hook.memoizedState.',

  commonMistakes: [
    {
      title: 'Wrapping Every Function in useCallback',
      badCode: `const handleClick = useCallback(() => console.log('click'), []); // Passed to plain <button />`,
      goodCode: `const handleClick = () => console.log('click');`,
      explanation: 'DOM elements (<button>, <div>) do not care about referential equality. Wrapping callbacks passed only to native HTML tags adds overhead with zero benefit.',
      dangerLevel: 'subtle',
    },
  ],

  performanceTips: [
    'Pair useCallback with React.memo on the receiving child component. Without React.memo, useCallback provides no re-render prevention.',
    'Use functional state updates inside callbacks: setCount(c => c + 1) lets you leave count out of the dependency array!',
  ],

  whenNotToUse: [
    'When passing the callback to native HTML tags (<button>, <input>).',
    'When the receiving component is not wrapped in React.memo.',
  ],

  alternatives: [
    { name: 'useMemo', reason: 'useCallback(fn, deps) is shorthand for useMemo(() => fn, deps).' },
  ],

  interviewQuestions: [
    {
      question: 'Does useCallback prevent the function from being created?',
      answer: 'No! The inline function is still defined on every render. useCallback simply decides whether to discard it and return the cached reference instead.',
      deepDive: 'Because JavaScript creates the function in memory during component execution, useCallback is about referential stability, not avoiding function creation cost.',
      difficulty: 'Senior',
    },
  ],

  relatedHooks: ['useMemo', 'useEffect'],
  keyTakeaway: 'useCallback caches a function definition to preserve referential equality. It is only useful when passing callbacks to memoized children or as dependencies to other hooks.',
};
