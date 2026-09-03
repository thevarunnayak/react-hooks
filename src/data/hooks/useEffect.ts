import { HookLessonData } from '../../types/hook';

export const useEffectData: HookLessonData = {
  id: 'useEffect',
  name: 'useEffect',
  tagline: 'Synchronize your component with external systems and side effects.',
  category: 'Effects',
  difficulty: 'Beginner',
  reactVersion: '16.8+',
  labId: 'useEffectLab',

  whatIsIt: 'useEffect lets you synchronize a component with an external system (such as browser APIs, timers, network subscriptions, or manual DOM manipulations) after React renders and paints the screen.',

  whyExists: 'React rendering must remain pure (input props -> output JSX). Side effects like fetching data, attaching global event listeners, or setting intervals must run outside the render calculation.',

  simpleExplanation: 'After React finishes updating the DOM and the browser paints the screen, useEffect runs your effect callback. If your component re-renders or unmounts, React runs your cleanup function first.',

  analogy: {
    metaphor: 'The Hotel Room Service',
    description: 'When you check into a hotel room (mount), room service delivers fresh towels (effect). When you check out (unmount or change guests), housekeeping cleans up the room (cleanup) so it stays spotless for the next guest.',
  },

  syntax: `useEffect(() => {\n  // 1. Run effect\n  return () => {\n    // 2. Optional cleanup\n  };\n}, [dependencies]);`,

  arguments: [
    {
      name: 'setupFunction',
      type: '() => (() => void) | void',
      required: true,
      description: 'The effect function containing side-effect logic. May return an optional cleanup function.',
    },
    {
      name: 'dependencies',
      type: 'any[] | undefined',
      required: false,
      description: 'Array of reactive values (props, state, declared functions). If omitted, effect runs on every render. If empty [], runs only on mount.',
    },
  ],

  returnValue: {
    type: 'void',
    description: 'useEffect returns undefined.',
  },

  mentalModel: {
    summary: 'Render JSX -> Commit to DOM -> Paint -> Cleanup Old Effect -> Run New Effect',
    diagramSteps: [
      'React renders component and evaluates JSX.',
      'React updates actual DOM nodes.',
      'Browser paints screen pixels.',
      'Previous render cleanup runs (if dependencies changed).',
      'New effect callback executes asynchronously.',
    ],
    details: 'Unlike useLayoutEffect, useEffect is non-blocking and executes after the browser paints so your app stays fast and responsive.',
  },

  visualExplanation: {
    title: 'Symmetric Lifecycle & Cleanup Loop',
    description: 'Every effect that sets up a subscription or timer must tear it down cleanly.',
    phases: [
      { phase: 'Mount', description: 'Effect runs for the first time.' },
      { phase: 'Re-render', description: 'Deps changed -> Cleanup from previous render runs -> New effect runs.' },
      { phase: 'Unmount', description: 'Final cleanup executes before component disappears from DOM.' },
    ],
  },

  primaryExample: {
    title: 'Window Resize Listener with Cleanup',
    code: `import React, { useState, useEffect } from 'react';

export function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Symmetric cleanup avoids memory leaks
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty deps: listen for entire component lifetime

  return <p>Window Width: {width}px</p>;
}`,
    description: 'Attaches an event listener on mount and removes it on unmount to prevent memory leaks.',
  },

  secondaryExample: {
    title: 'Data Fetching with AbortController',
    code: `useEffect(() => {
  const controller = new AbortController();

  fetch('/api/user/' + id, { signal: controller.signal })
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(err => { if (err.name !== 'AbortError') setError(err); });

  return () => controller.abort(); // Cancel in-flight request if id changes!
}, [id]);`,
    description: 'Prevents race conditions by cancelling the previous fetch when the user ID parameter changes.',
  },

  tryItYourselfPrompt: 'Go to the interactive useEffect lab below. Test what happens when you pass an unstable object like [{}] into the dependency array!',

  internalMechanism: 'React stores effects on the Fiber node update queue. During the commit phase, React checks Object.is between previous and current dependency items. If any item differs, React schedules passive effects to run in a flush task after paint.',

  commonMistakes: [
    {
      title: 'Missing Dependencies in Array',
      badCode: `useEffect(() => {\n  console.log(count);\n}, []); // Missing count!`,
      goodCode: `useEffect(() => {\n  console.log(count);\n}, [count]);`,
      explanation: 'Omitting reactive values causes stale closures where your effect continues reading the initial snapshot value forever.',
      dangerLevel: 'critical',
    },
    {
      title: 'Infinite Effect Re-render Loop',
      badCode: `useEffect(() => {\n  setCount(c => c + 1);\n}); // No dependency array!`,
      goodCode: `useEffect(() => {\n  // Guard with dependencies or use an event handler instead\n}, [someCondition]);`,
      explanation: 'An effect updating state without dependencies runs every render, updating state, causing another render indefinitely.',
      dangerLevel: 'critical',
    },
  ],

  performanceTips: [
    'Do not use useEffect for calculating data derived from props or state. Compute it during rendering with useMemo or normal variables instead.',
    'Do not use useEffect to handle user actions (like submitting a form or clicking a button). Put that logic in the event handler.',
  ],

  whenNotToUse: [
    'For transforming data for rendering: Compute it inline or with useMemo.',
    'For user interactions: Use onClick/onChange event handlers instead.',
    'For synchronous DOM measurements before paint: Use useLayoutEffect instead.',
  ],

  alternatives: [
    { name: 'useLayoutEffect', reason: 'Runs synchronously before the browser paints for DOM measurements.' },
    { name: 'Event Handlers', reason: 'Better for user-triggered actions.' },
  ],

  interviewQuestions: [
    {
      question: 'When does the cleanup function in useEffect run?',
      answer: 'The cleanup function runs: 1) Before the effect runs again on re-renders if dependencies have changed, and 2) When the component unmounts.',
      deepDive: 'In React Strict Mode (development), React mounts, unmounts (runs cleanup), and remounts components to verify cleanup completeness.',
      difficulty: 'Mid',
    },
    {
      question: 'What is the difference between useEffect and useLayoutEffect?',
      answer: 'useEffect runs asynchronously after the browser paints the screen, avoiding blocking UI rendering. useLayoutEffect runs synchronously immediately after DOM mutations, before paint.',
      deepDive: 'Use useLayoutEffect only when you need to read DOM layout (like element size or scroll position) and immediately make another DOM mutation to prevent visual flickering.',
      difficulty: 'Senior',
    },
  ],

  relatedHooks: ['useLayoutEffect', 'useInsertionEffect', 'useRef'],
  keyTakeaway: 'useEffect is for synchronizing with external systems after paint. Always include all reactive dependencies, write symmetric cleanups, and avoid using effects for derived calculations.',
};
