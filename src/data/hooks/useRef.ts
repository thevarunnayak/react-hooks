import { HookLessonData } from '../../types/hook';

export const useRefData: HookLessonData = {
  id: 'useRef',
  name: 'useRef',
  tagline: 'Hold mutable values across renders without triggering re-renders, and access DOM elements.',
  category: 'References',
  difficulty: 'Beginner',
  reactVersion: '16.8+',
  labId: 'useRefLab',

  whatIsIt: 'useRef returns a mutable ref object whose .current property is initialized to the passed argument. The returned object persists for the full lifetime of the component and mutating it does not trigger a re-render.',

  whyExists: 'Components frequently need to remember information across renders that does not affect the visual output (such as timer IDs, previous prop values, scroll positions) or directly reference native DOM nodes.',

  simpleExplanation: 'Think of useRef as a secret compartment in your component. You can store anything inside .current, read it or change it at any time, and React will never re-render because of it.',

  analogy: {
    metaphor: 'The Sticky Note on Your Monitor',
    description: 'Unlike writing on the whiteboard that changes what everyone in the room sees (useState), a sticky note on your personal desk (useRef) lets you jot down a temporary phone number or timer ID for yourself without notifying the room or changing the meeting agenda.',
  },

  syntax: `const ref = useRef(initialValue);`,

  arguments: [
    {
      name: 'initialValue',
      type: 'any',
      required: true,
      description: 'The initial value stored in ref.current. Ignored on subsequent renders.',
    },
  ],

  returnValue: {
    type: '{ current: T }',
    description: 'A plain JavaScript object with a mutable .current property.',
  },

  mentalModel: {
    summary: 'Persistent Memory Box -> Mutate in-place -> Zero Re-renders',
    diagramSteps: [
      'useRef creates an object { current: initialValue } once during mount.',
      'On every re-render, React returns the exact same object reference.',
      'Mutating ref.current changes the value immediately in memory.',
      'No component re-render is requested or scheduled.',
    ],
    details: 'If you attach the ref to a JSX element via <div ref={myRef} />, React sets myRef.current to the underlying DOM node after mounting and null on unmount.',
  },

  visualExplanation: {
    title: 'useState vs useRef Matrix',
    description: 'Choose useState for values that show on screen; useRef for internal bookkeeping.',
    phases: [
      { phase: 'useState mutation', description: 'value changes -> triggers component re-render -> DOM updates.' },
      { phase: 'useRef mutation', description: 'ref.current changes -> 0 re-renders -> component remains unchanged.' },
    ],
  },

  primaryExample: {
    title: 'Focusing an Input on Mount',
    code: `import React, { useRef, useEffect } from 'react';

export function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Directly interact with the browser DOM node
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="Focused automatically!" />;
}`,
    description: 'Accesses the native HTML DOM input element and triggers browser focus upon mount.',
  },

  secondaryExample: {
    title: 'Storing Timer IDs Without Re-renders',
    code: `const timerIdRef = useRef<number | null>(null);

const start = () => {
  timerIdRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
};

const stop = () => {
  if (timerIdRef.current) clearInterval(timerIdRef.current);
};`,
    description: 'Holds the numeric interval ID across renders without causing extra renders when starting or stopping.',
  },

  tryItYourselfPrompt: 'In the useRef lab, click the "Mutate ref.current" button. Notice how the total render count stays completely flat!',

  internalMechanism: 'useRef is essentially implemented under the hood as: useMemo(() => ({ current: initialValue }), []). Because the object wrapper itself is never re-allocated, .current can be freely read and mutated.',

  commonMistakes: [
    {
      title: 'Writing or Reading ref.current During Rendering',
      badCode: `function Component() {\n  const count = useRef(0);\n  count.current += 1; // WRONG: Side-effect during render!\n  return <div>{count.current}</div>;\n}`,
      goodCode: `// Use useState for values displayed in JSX, or update ref in useEffect/event handlers`,
      explanation: 'React components must be pure during the render phase. Mutating refs during render leads to unpredictable bugs with Concurrent React.',
      dangerLevel: 'critical',
    },
  ],

  performanceTips: [
    'Use useRef instead of useState for values that do not impact JSX output to eliminate unnecessary re-renders.',
  ],

  whenNotToUse: [
    'When the value must appear dynamically in the rendered JSX: Use useState instead.',
  ],

  alternatives: [
    { name: 'useState', reason: 'When you need the UI to update in response to changes.' },
  ],

  interviewQuestions: [
    {
      question: 'Why does changing ref.current not trigger a re-render?',
      answer: 'React has no reactivity or proxy watching ref.current. It is a plain JavaScript object. React only re-renders when state or props change via dispatchers.',
      deepDive: 'useRef is designed specifically as an escape hatch for imperative mutations and DOM access.',
      difficulty: 'Junior',
    },
  ],

  relatedHooks: ['useState', 'useImperativeHandle'],
  keyTakeaway: 'useRef is your escape hatch for holding values that persist across renders without causing re-renders, and for directly referencing DOM nodes.',
};
