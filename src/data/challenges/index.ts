import { ChallengeItem } from '../../types/challenge';

export const CHALLENGES_LIST: ChallengeItem[] = [
  {
    id: 'ch-1',
    title: 'Predict the Count Output',
    type: 'predict',
    difficulty: 'Beginner',
    category: 'useState',
    question: 'What is the value of count displayed in the UI after clicking the button once?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return <button onClick={handleClick}>Count: {count}</button>;
}`,
    options: ['0', '1', '3', 'Error'],
    correctOptionIndex: 1,
    explanation: 'React state updates in event handlers are batched. In this render run, count is 0. All three calls read setCount(0 + 1), so the final state is 1. To increment by 3, use functional updates: setCount(c => c + 1).',
    hint: 'Think about what value count holds inside handleClick during that specific render snapshot.',
  },
  {
    id: 'ch-2',
    title: 'Find the Infinite Loop Bug',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'Why does this component enter an infinite re-render loop?',
    codeSnippet: `function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  const options = { timeout: 5000 };

  useEffect(() => {
    fetchUser(userId, options).then(setUser);
  }, [options]);

  return <div>{user?.name}</div>;
}`,
    options: [
      'fetchUser is asynchronous',
      'options is a new object on every render, so the dependency array always sees a changed reference',
      'setUser cannot be called inside useEffect',
      'userId is missing from the dependency array',
    ],
    correctOptionIndex: 1,
    explanation: 'Every time UserCard re-renders, const options = { timeout: 5000 } allocates a brand-new object in memory (e.g. 0x01 then 0x02). React checks Object.is(prevOptions, nextOptions) which is FALSE, re-running the effect, calling setUser, which triggers another render infinitely!',
    hint: 'Look closely at where the options object is declared.',
  },
  {
    id: 'ch-3',
    title: 'Fix the Stale Timer Closure',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'useRef & Closures',
    question: 'How do you fix this interval callback so it always reads the fresh count without restarting the timer on every tick?',
    codeSnippet: `function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // BUG: Always reads count as 0 from initial mount!
      console.log('Current count:', count);
    }, 1000);
    return () => clearInterval(id);
  }, []); // Needs to run once on mount

  return <button onClick={() => setCount(c => c + 1)}>+1</button>;
}`,
    options: [
      'Store count in a useRef (e.g. countRef.current = count) and read countRef.current inside the interval',
      'Remove the dependency array entirely',
      'Change setInterval to setTimeout',
      'Wrap count in useMemo',
    ],
    correctOptionIndex: 0,
    explanation: 'Using a mutable ref (countRef.current = count) allows the interval callback to read the latest count value on each tick without having to recreate the interval timer on every count change.',
    hint: 'Which hook provides a mutable container that persists across renders without restarting effects?',
  },
  {
    id: 'ch-4',
    title: 'Choose the Correct Optimization Hook',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'Performance',
    question: 'A parent component passes a callback to a child wrapped in React.memo. Which hook should wrap the callback to prevent the child from re-rendering?',
    codeSnippet: `const Child = React.memo(({ onSelect }) => {
  return <button onClick={onSelect}>Select</button>;
});`,
    options: ['useMemo', 'useCallback', 'useTransition', 'useRef'],
    correctOptionIndex: 1,
    explanation: 'useCallback caches the function definition so that onSelect passes shallow equality (===) on each parent render, allowing React.memo to skip rendering the child.',
    hint: 'Which hook is specialized for caching function definitions?',
  },
  {
    id: 'ch-5',
    title: 'Prevent UI Freeze with Concurrent React',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'Concurrent',
    question: 'When a user types into an input that immediately filters a list of 20,000 items, keystrokes stutter. How do you keep the input typing responsive?',
    codeSnippet: `function Search() {
  const [query, setQuery] = useState('');
  const [list, setList] = useState(bigData);

  function handleChange(e) {
    setQuery(e.target.value);
    setList(filterData(e.target.value)); // Heavy!
  }
}`,
    options: [
      'Wrap setList in startTransition(() => setList(...)) using useTransition',
      'Wrap filterData in useEffect with no dependencies',
      'Call window.requestIdleCallback inside handleChange',
      'Change useState to useRef',
    ],
    correctOptionIndex: 0,
    explanation: 'useTransition marks setList as a non-blocking transition. React prioritizes the urgent setQuery update (for immediate input typing) and computes setList concurrently in the background.',
    hint: 'React 18 introduced a hook specifically for interruptible background transitions.',
  },
];
