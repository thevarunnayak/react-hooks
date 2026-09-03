import { InterviewQuestionItem } from '../../types/challenge';

export const INTERVIEW_QUESTIONS_LIST: InterviewQuestionItem[] = [
  {
    id: 'int-1',
    category: 'Core Hooks',
    question: 'Why must React Hooks only be called at the top level of function components?',
    difficulty: 'Senior',
    shortAnswer: 'React relies on call order to match hook state to the underlying Fiber linked list between renders.',
    deepDive: 'React does not associate hooks with names or string identifiers; it stores them as a singly-linked list on the Fiber node (fiber.memoizedState). If a hook is placed inside an if-statement or loop, the order shifts on subsequent renders, misaligning state and causing catastrophic bugs.',
    commonPitfalls: ['Placing hooks inside helper functions called from loops or conditions.'],
  },
  {
    id: 'int-2',
    category: 'Rendering & Lifecycle',
    question: 'What is the exact sequence of events during a React component re-render with useEffect and useLayoutEffect?',
    difficulty: 'Senior',
    shortAnswer: 'Render -> Mutate DOM -> useLayoutEffect (sync) -> Browser Paint -> useEffect Cleanup (async) -> useEffect (async).',
    deepDive: 'During the commit phase, React mutates the DOM. Next, it synchronously executes useLayoutEffect callbacks and their cleanups. Once complete, the browser paints the pixels on screen. Finally, passive effects (useEffect cleanup and effect callback) run in a scheduled microtask/macrotask.',
    commonPitfalls: ['Assuming useEffect runs before the user sees the page update.'],
  },
  {
    id: 'int-3',
    category: 'Closures & Scope',
    question: 'What is a stale closure in React and how do you resolve it?',
    difficulty: 'Mid',
    shortAnswer: 'A stale closure happens when an asynchronous callback or effect captures an older snapshot of state and never reads the updated value.',
    deepDive: 'Because JavaScript functions close over variables in their lexical scope at creation time, an effect with empty dependencies [] only ever sees state from render #1. Solutions include: 1) Functional state updates (setCount(c => c + 1)), 2) Adding the reactive variable to the dependency array, 3) Using a mutable useRef.',
    commonPitfalls: ['Removing dependencies from the dependency array to silence ESLint warnings without fixing the closure.'],
  },
  {
    id: 'int-4',
    category: 'Performance',
    question: 'Why does wrapping a component in React.memo not guarantee it will skip re-rendering when props seem identical?',
    difficulty: 'Senior',
    shortAnswer: 'React.memo uses shallow equality (Object.is). If any prop is an unmemoized object, array, or inline function, it is a new reference and React.memo triggers a re-render.',
    deepDive: 'To make React.memo effective, all non-primitive props must be stabilized with useMemo or useCallback by the parent component, or a custom arePropsEqual comparator must be provided.',
    commonPitfalls: ['Passing inline style objects style={{ margin: 10 }} or inline callbacks () => {} to memoized children.'],
  },
  {
    id: 'int-5',
    category: 'Concurrent React',
    question: 'How does React 18 automatic batching work and how does it affect state updates in setTimeout or Promises?',
    difficulty: 'Mid',
    shortAnswer: 'In React 18+, all state updates (including inside promises, timeouts, and native DOM event handlers) are automatically batched into a single re-render.',
    deepDive: 'Prior to React 18, React only batched updates inside React synthetic event handlers. Now, React uses a unified batching queue across all execution contexts. If you need synchronous DOM flushing, you must explicitly opt out with ReactDOM.flushSync().',
    commonPitfalls: ['Writing code that expects state to update synchronously after an await.'],
  },
];
