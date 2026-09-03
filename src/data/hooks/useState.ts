import { HookLessonData } from '../../types/hook';

export const useStateData: HookLessonData = {
  id: 'useState',
  name: 'useState',
  tagline: 'Declare and track reactive local component state across renders.',
  category: 'State',
  difficulty: 'Beginner',
  reactVersion: '16.8+',
  labId: 'useStateLab',

  whatIsIt: 'useState is the primary React Hook for adding reactive local state to function components. It stores a value between renders and provides an updater function to request a re-render with new state.',

  whyExists: 'Before hooks, function components were stateless presentational functions. useState gives function components memory without needing ES6 classes or lifecycle methods.',

  simpleExplanation: 'When you call useState, React sets aside a slot in memory for your component. When you update the value with its setter, React schedules a re-render and hands you the fresh value on the next run.',

  analogy: {
    metaphor: 'The Kitchen Whiteboard',
    description: 'Imagine a whiteboard in your kitchen. Anyone can read the current note (state). To change it, you erase and write a new note (setter). The whiteboard retains the message even when you leave and re-enter the room (between re-renders).',
  },

  syntax: `const [state, setState] = useState(initialState);`,

  arguments: [
    {
      name: 'initialState',
      type: 'any | (() => any)',
      required: true,
      description: 'The initial value, or an initializer function evaluated only once during mount.',
    },
  ],

  returnValue: {
    type: '[T, React.Dispatch<React.SetStateAction<T>>]',
    description: 'An array with two elements: [currentValue, updaterFunction].',
  },

  mentalModel: {
    summary: 'Component Render Snapshot -> Dispatch Action -> Batching Queue -> Re-render with New Snapshot',
    diagramSteps: [
      'Component function called with current state snapshot.',
      'User triggers event: calls setCount(c => c + 1).',
      'React queues update in the fiber node work queue.',
      'React flushes batch and renders component with fresh state.',
    ],
    details: 'State is tied to the component instance in the React Fiber tree. State updates do not mutate the current variable in-place; they schedule an update for the next render snapshot.',
  },

  visualExplanation: {
    title: 'Render Snapshot Model',
    description: 'Variables declared inside your component are fixed constants for that specific render run.',
    phases: [
      { phase: 'Render #1', description: 'count = 0. onClick schedules update to 1.' },
      { phase: 'Render #2', description: 'count = 1. onClick schedules update to 2.' },
    ],
  },

  primaryExample: {
    title: 'Interactive Counter with Functional Updates',
    code: `import React, { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment (+1)
      </button>
    </div>
  );
}`,
    description: 'Uses a functional update setCount(c => c + 1) to guarantee fresh state when multiple updates are queued.',
  },

  secondaryExample: {
    title: 'Form Inputs with Object State',
    code: `const [user, setUser] = useState({ name: '', email: '' });

const updateField = (field, val) => {
  setUser(prev => ({ ...prev, [field]: val }));
};`,
    description: 'Always spread previous state (...prev) because useState does not automatically merge objects like class this.setState did.',
  },

  tryItYourselfPrompt: 'Try calling setCount(count + 1) three times in a row inside the interactive lab below. Why does it only increase by 1? Then switch to setCount(c => c + 1).',

  internalMechanism: 'React internally stores hook states as a singly-linked list on the Fiber node (fiber.memoizedState). Each hook call advances the pointer to the next hook in the list. This is why hooks must never be placed inside conditionals or loops.',

  commonMistakes: [
    {
      title: 'Mutating State In-Place',
      badCode: `user.name = 'Alice';\nsetUser(user);`,
      goodCode: `setUser({ ...user, name: 'Alice' });`,
      explanation: 'React compares state using Object.is. If you mutate the object in place, the reference is identical and React cancels the re-render!',
      dangerLevel: 'critical',
    },
    {
      title: 'Reading State Immediately After Setting',
      badCode: `setCount(5);\nconsole.log(count); // Still logs old count!`,
      goodCode: `// Use the value directly or inside a useEffect([count])\nconst nextCount = 5;\nsetCount(nextCount);\nconsole.log(nextCount);`,
      explanation: 'Setting state is asynchronous with respect to the current render. count in current scope is a constant snapshot.',
      dangerLevel: 'subtle',
    },
  ],

  performanceTips: [
    'Use lazy initial state useState(() => expensiveCalc()) when calculating initial value to prevent running the calculation on every re-render.',
    'Split unrelated state variables instead of keeping one giant monolithic object to minimize unnecessary re-renders.',
  ],

  whenNotToUse: [
    'When a value does not affect the UI: Use useRef instead to avoid unnecessary re-renders.',
    'When state transitions are complex or interrelated: Use useReducer instead.',
  ],

  alternatives: [
    { name: 'useRef', reason: 'Stores mutable values that do not trigger UI re-renders.' },
    { name: 'useReducer', reason: 'Better for complex state transitions with multiple actions.' },
  ],

  interviewQuestions: [
    {
      question: 'Why does setCount(count + 1) three times only increment by 1?',
      answer: 'React batches state updates. Each call reads count from the current render snapshot (e.g. 0). So all three calls execute setCount(0 + 1). To queue updates, use functional updates: setCount(c => c + 1).',
      deepDive: 'In React 18+, automatic batching groups all state updates (even in setTimeout, promises, and native event handlers) into a single re-render.',
      difficulty: 'Junior',
    },
    {
      question: 'How does React preserve hook state between renders without a key or ID?',
      answer: 'React relies on call order. Hooks are stored as a singly-linked list on the fiber node. On re-renders, React walks the list in the exact same sequence.',
      deepDive: 'This is why the Rules of Hooks require hooks to be called at the top level of your component, never inside loops, conditions, or nested functions.',
      difficulty: 'Senior',
    },
  ],

  relatedHooks: ['useReducer', 'useRef', 'useTransition'],
  keyTakeaway: 'useState holds your component memory across render snapshots. Never mutate state directly, use functional updates for dependent states, and remember updates are batched.',
};
