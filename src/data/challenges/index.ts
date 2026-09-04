import { ChallengeItem } from '../../types/challenge';

export const CHALLENGES_BY_CATEGORY: Record<string, ChallengeItem[]> = {
  "State & Snapshots": [
  {
    id: 'ch-1',
    title: 'Predict the Count Output',
    type: 'predict',
    difficulty: 'Beginner',
    category: 'State & Snapshots',
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
    options: ['0', '1', '3', 'Error: Too many re-renders'],
    correctOptionIndex: 1,
    explanation: 'React state updates inside event handlers are batched. During this render snapshot, count is 0. All three setter calls evaluate setCount(0 + 1), so the final batched state is 1. To increment by 3, functional updates must be used: setCount(c => c + 1).',
    hint: 'Think about what value count holds inside handleClick during that specific render snapshot.',
  },
  {
    id: 'ch-2',
    title: 'Mixed Direct and Functional Updates',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'What value is displayed after clicking the button once?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 5);
    setCount(c => c + 1);
    setCount(count + 2);
    setCount(c => c + 10);
  }

  return <button onClick={handleClick}>{count}</button>;
}`,
    options: ['12', '18', '17', '15'],
    correctOptionIndex: 0,
    explanation: 'React queues updates in order: 1) setCount(count + 5) queues "replace with 5". 2) setCount(c => c + 1) queues "5 + 1 = 6". 3) setCount(count + 2) overwrites with "replace with 2" (because count was 0 in this snapshot!). 4) setCount(c => c + 10) queues "2 + 10 = 12". The final state is 12.',
    hint: 'Trace the update queue step-by-step: direct updates replace the base state with the snapshot value, while functional updates operate on the pending state.',
  },
  {
    id: 'ch-3',
    title: 'State Read After Async Timeout',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'The user clicks "Increment" (count becomes 1), then immediately clicks "Delayed Alert". While waiting, they click "Increment" twice more (count becomes 3). What does the alert display after the 2-second delay?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  function handleAlert() {
    setTimeout(() => {
      alert('Count: ' + count);
    }, 2000);
  }

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={handleAlert}>Delayed Alert</button>
    </>
  );
}`,
    options: ['Count: 3', 'Count: 1', 'Count: 0', 'Count: undefined'],
    correctOptionIndex: 1,
    explanation: '`handleAlert` was invoked in the render snapshot where `count` was 1. The setTimeout callback closes over the lexical scope of that specific render, so it alerts "Count: 1". Each render snapshot in React has its own immutable copy of props and state.',
    hint: 'What was the value of count in the specific render pass when the Delayed Alert button was clicked?',
  },
  {
    id: 'ch-4',
    title: 'Direct Array Mutation Bug',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'State & Snapshots',
    question: 'Why does clicking the "Add Item" button fail to update the list on screen?',
    codeSnippet: `function List() {
  const [items, setItems] = useState(['Apple', 'Banana']);

  function handleAdd() {
    items.push('Cherry');
    setItems(items);
  }

  return (
    <div>
      <button onClick={handleAdd}>Add Item</button>
      <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
    </div>
  );
}`,
    options: [
      'items.push returns the new array length instead of the array',
      'React compares state using Object.is. Mutating the array keeps the same memory reference, so React bails out of rendering',
      'Arrays cannot be stored in useState without useReducer',
      'The button needs an event.preventDefault()',
    ],
    correctOptionIndex: 1,
    explanation: '`items.push()` mutates the existing array in-place. When `setItems(items)` is called, React performs an eager comparison: `Object.is(previousState, nextState)`. Because both point to the same memory reference, React detects no change and completely skips re-rendering. To fix, write `setItems([...items, "Cherry"])`.',
    hint: 'How does React know whether a state update actually changed?',
  },
  {
    id: 'ch-5',
    title: 'Nested Object Mutation Bug',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'How should you update the nested `user.profile.city` property immutably?',
    codeSnippet: `const [user, setUser] = useState({
  name: 'Alex',
  profile: { age: 30, city: 'London' }
});`,
    options: [
      'setUser({ ...user, profile: { ...user.profile, city: "Paris" } })',
      'user.profile.city = "Paris"; setUser(user);',
      'setUser({ ...user, city: "Paris" })',
      'setUser(Object.assign(user, { city: "Paris" }))',
    ],
    correctOptionIndex: 0,
    explanation: 'Shallow spread (`...user`) only copies top-level properties. To update nested objects immutably, every level in the hierarchy up to the modified property must be copied into a new object: `{ ...user, profile: { ...user.profile, city: "Paris" } }`.',
    hint: 'Remember that spread syntax only clones one level deep.',
  },
  {
    id: 'ch-6',
    title: 'Lazy State Initialization Overhead',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'In this component, `loadFromStorage()` reads and parses a 5MB JSON file. Why is the current code a performance anti-pattern and how do you fix it?',
    codeSnippet: `function DataViewer() {
  const [data, setData] = useState(loadFromStorage());
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`,
    options: [
      'loadFromStorage() is executed on every single render pass; pass a function reference `useState(() => loadFromStorage())` instead',
      'useState cannot handle data larger than 1MB; use localStorage directly in render',
      'loadFromStorage must be called inside useLayoutEffect',
      'Wrap loadFromStorage in a setTimeout',
    ],
    correctOptionIndex: 0,
    explanation: 'Passing `loadFromStorage()` calls the function immediately during every render pass, even though React only uses the return value on the initial mount. Passing a function initializer `useState(() => loadFromStorage())` ensures the expensive function is called strictly once during mount.',
    hint: 'What is the difference between passing an expression versus a function initializer to useState?',
  },
  {
    id: 'ch-7',
    title: 'Automatic Batching Across Promises',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'In React 18+, how many total render passes occur when clicking "Fetch Data"?',
    codeSnippet: `function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [renders, setRenders] = useState(0);

  console.log('Rendering Dashboard');

  async function handleFetch() {
    setLoading(true);
    await fakeApi();
    setData({ id: 1 });
    setLoading(false);
  }

  return <button onClick={handleFetch}>Fetch Data</button>;
}`,
    options: [
      '2 renders (1 for setLoading(true), 1 batched for setData + setLoading(false))',
      '3 renders (1 for setLoading(true), 1 for setData, 1 for setLoading(false))',
      '1 render (all updates are batched together across the await)',
      '4 renders',
    ],
    correctOptionIndex: 0,
    explanation: 'In React 18 automatic batching: 1) `setLoading(true)` triggers render #1 before the await. 2) After `await fakeApi()` settles, `setData` and `setLoading(false)` are batched together in the same microtask, triggering render #2. Total: 2 renders. (In React 17, it would have been 3 renders).',
    hint: 'Automatic batching groups updates inside the same synchronous execution turn, but an `await` pauses execution.',
  },
  {
    id: 'ch-8',
    title: 'State Setter During Render Loop',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'State & Snapshots',
    question: 'What happens when this component attempts to render?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  if (count < 5) {
    setCount(count + 1);
  }

  return <div>{count}</div>;
}`,
    options: [
      'React immediately re-runs the component with the new state until count is 5, then commits <div>5</div> to the DOM without an infinite loop',
      'React immediately crashes with "Too many re-renders"',
      'React ignores the setter call during render',
      'The component displays 0 and logs an error',
    ],
    correctOptionIndex: 0,
    explanation: 'React specifically supports state updates during render for the SAME component (used for adjusting state from props). React immediately restarts the component render synchronously with the new state, up to a limit of 50 iterations. Since count reaches 5 in 5 iterations, it successfully commits `<div>5</div>` without hitting the limit!',
    hint: 'React allows same-component render-phase updates if they are bounded and terminate quickly.',
  },
  {
    id: 'ch-9',
    title: 'Eager Bailout on Identical Primitive',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'If the user clicks the button 5 times in a row, how many times does "Rendered!" log to the console after initial mount?',
    codeSnippet: `function Toggle() {
  const [status, setStatus] = useState('active');

  console.log('Rendered!');

  return <button onClick={() => setStatus('active')}>Keep Active</button>;
}`,
    options: ['0 times', '5 times', '1 time', 'Infinite loop'],
    correctOptionIndex: 0,
    explanation: 'On every click, `setStatus("active")` passes the same string. React performs an eager state update check: `Object.is("active", "active") === true`. Because the new state equals the current state and no other updates are pending, React bails out immediately without scheduling any render.',
    hint: 'Does React run the component if the new state is identical to the current state?',
  },
  {
    id: 'ch-10',
    title: 'State Reset via Key Prop',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'When `userId` changes from "user-1" to "user-2", what is displayed in the input field?',
    codeSnippet: `function UserForm({ userId }) {
  const [text, setText] = useState('Draft notes for ' + userId);
  return <input value={text} onChange={e => setText(e.target.value)} />;
}

// Parent:
<UserForm key={userId} userId={userId} />`,
  options: [
    '"Draft notes for user-2"',
    '"Draft notes for user-1"',
    'Empty string',
    'undefined',
  ],
  correctOptionIndex: 0,
  explanation: 'Because `key={userId}` changes, React treats the component as an entirely new element instance. It unmounts the old UserForm Fiber and mounts a fresh UserForm Fiber from scratch, re-initializing `useState` with "Draft notes for user-2".',
  hint: 'What does changing the key prop do to a component\'s internal state?',
},
  {
    id: 'ch-11',
    title: 'Derived State vs useEffect Sync',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'How should you calculate `filteredList` in this component?',
    codeSnippet: `function ProductList({ products, search }) {
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    setFilteredList(products.filter(p => p.name.includes(search)));
  }, [products, search]);

  return <div>{filteredList.length} items</div>;
}`,
    options: [
      'Calculate it directly during render: `const filteredList = products.filter(...)` (or wrap with useMemo if heavy)',
      'Keep useEffect and add a second useState for loading state',
      'Use useLayoutEffect instead of useEffect',
      'Put filteredList in a useRef',
    ],
    correctOptionIndex: 0,
    explanation: 'Calculating derived state inside `useEffect` causes a redundant second render pass and an intermediate flash of stale data. Calculating it directly during render is faster, simpler, and eliminates state synchronization bugs.',
    hint: 'If a value can be computed entirely from existing props and state, do you need a separate state variable for it?',
  },
  {
    id: 'ch-12',
    title: 'State Preservation at Same Tree Position',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'State & Snapshots',
    question: 'The user types "Hello" into the input while `isFancy` is false, then clicks toggle to set `isFancy` to true. What happens to the input text?',
    codeSnippet: `function App() {
  const [isFancy, setIsFancy] = useState(false);

  return (
    <div>
      {isFancy ? (
        <Counter isFancy={true} />
      ) : (
        <Counter isFancy={false} />
      )}
      <button onClick={() => setIsFancy(!isFancy)}>Toggle</button>
    </div>
  );
}

function Counter({ isFancy }) {
  const [text, setText] = useState('');
  return <input value={text} onChange={e => setText(e.target.value)} style={{ color: isFancy ? 'gold' : 'black' }} />;
}`,
    options: [
      'The text "Hello" is preserved because `<Counter />` is rendered at the exact same position in the tree with the same component type',
      'The text resets because the ternary condition switched branches',
      'The component unmounts and throws an error',
      'The text becomes undefined',
    ],
    correctOptionIndex: 0,
    explanation: 'React matches components by their position in the virtual DOM tree, not by JSX ternary syntax. Because `<Counter />` is rendered as the first child of `<div>` in both branches, React sees the same component type and preserves its Fiber state.',
    hint: 'Does React care about the ternary operator, or only the resulting tree position and element type?',
  },
  {
    id: 'ch-13',
    title: 'FlushSync Synchronous DOM Flushing',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'State & Snapshots',
    question: 'What gets logged to the console when `handleClick` runs?',
    codeSnippet: `function Chat() {
  const [messages, setMessages] = useState(['Hello']);
  const listRef = useRef(null);

  function handleClick() {
    ReactDOM.flushSync(() => {
      setMessages(prev => [...prev, 'New message']);
    });
    console.log(listRef.current.children.length);
  }

  return (
    <ul ref={listRef}>
      {messages.map((m, i) => <li key={i}>{m}</li>)}
    </ul>
  );
}`,
    options: ['2', '1', '0', 'undefined'],
    correctOptionIndex: 0,
    explanation: '`ReactDOM.flushSync` forces React to synchronously execute the state update and immediately flush the DOM commit before the next line of code executes. When `console.log` runs, the DOM has 2 `<li>` elements.',
    hint: 'What is the specific purpose of ReactDOM.flushSync?',
  },
  {
    id: 'ch-14',
    title: 'State Function Initializer with Function Value',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'State & Snapshots',
    question: 'Why does this attempt to store a function in `useState` fail or call the function immediately?',
    codeSnippet: `function ActionRunner({ actionFn }) {
  // We want to store actionFn in state:
  const [savedAction, setSavedAction] = useState(actionFn);

  return <button onClick={() => savedAction()}>Run</button>;
}`,
    options: [
      'If initial state is a function, React treats it as a lazy initializer and executes it immediately; to store a function, write `useState(() => actionFn)`',
      'useState cannot store functions under any circumstances',
      'Functions must be stored in useReducer',
      'actionFn must be converted to a string',
    ],
    correctOptionIndex: 0,
    explanation: 'Because `useState` interprets a function argument as a lazy initializer (`initialState()`), it invokes `actionFn` immediately on mount and stores its return value. To store a function itself in state, you must wrap it in another function: `useState(() => actionFn)`.',
    hint: 'How does useState distinguish between a lazy initialization function and a function value?',
  },
  {
    id: 'ch-15',
    title: 'Multiple Updates in Native DOM Event Listeners',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'In React 18, when a native `window.addEventListener("resize", onResize)` handler triggers three `setState` calls, how many re-renders occur?',
    codeSnippet: `useEffect(() => {
  function onResize() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
  }
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);`,
    options: ['1 render', '3 renders', '2 renders', '0 renders'],
    correctOptionIndex: 0,
    explanation: 'In React 18, automatic batching applies to ALL events, including native browser DOM event listeners (`window.addEventListener`), Promises, and timeouts. All three updates are batched into a single render pass.',
    hint: 'Did React 18 expand automatic batching to native event handlers?',
  },
  {
    id: 'ch-16',
    title: 'Functional Updater with Mutation Trap',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'What is the bug in this functional state updater?',
    codeSnippet: `function Cart() {
  const [cart, setCart] = useState({ total: 0, items: [] });

  function addItem(item) {
    setCart(prev => {
      prev.items.push(item);
      prev.total += item.price;
      return prev;
    });
  }
}`,
    options: [
      'It mutates `prev` in-place and returns the same object reference, so React bails out of rendering',
      'setCart only accepts object literals, not updater functions',
      'prev.total must be a BigInt',
      'addItem must be an async function',
    ],
    correctOptionIndex: 0,
    explanation: 'Functional updaters must be pure and return a brand new object reference: `return { ...prev, items: [...prev.items, item], total: prev.total + item.price }`. Mutating `prev` and returning it fails `Object.is` change detection.',
    hint: 'Even inside a functional updater, mutating the argument directly violates immutability.',
  },
  {
    id: 'ch-17',
    title: 'State Update Across Async Fetch',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'State & Snapshots',
    question: 'What value is rendered after the fetch completes?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  async function handleAsync() {
    setCount(count + 1);
    await new Promise(r => setTimeout(r, 100));
    setCount(count + 1);
  }

  return <button onClick={handleAsync}>{count}</button>;
}`,
    options: ['1', '2', '0', 'NaN'],
    correctOptionIndex: 0,
    explanation: 'When `handleAsync` was invoked, `count` was 0. The first call queues `setCount(0 + 1)`. After the 100ms pause, the second line still references the closed-over `count = 0`, queueing `setCount(0 + 1)` again! The final state is 1. To reach 2, the second call must be `setCount(c => c + 1)`.',
    hint: 'Does the variable `count` automatically update inside an async function after an `await`?',
  },
  {
    id: 'ch-18',
    title: 'Boolean Toggle Functional Updater',
    type: 'fix_hook',
    difficulty: 'Beginner',
    category: 'State & Snapshots',
    question: 'What is the cleanest, race-condition-free way to toggle a boolean state variable?',
    codeSnippet: `const [isOpen, setIsOpen] = useState(false);`,
    options: [
      'setIsOpen(prev => !prev)',
      'setIsOpen(!isOpen)',
      'setIsOpen(isOpen === false ? true : false)',
      'setIsOpen(!isOpen); setIsOpen(!isOpen);',
    ],
    correctOptionIndex: 0,
    explanation: '`setIsOpen(prev => !prev)` guarantees that the toggle always operates on the most up-to-date pending state, regardless of batching or rapid clicks.',
    hint: 'Which pattern ensures updates never depend on stale closure values?',
  },
  {
    id: 'ch-19',
    title: 'State Initialization from Props Trap',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'State & Snapshots',
    question: 'Why is `useState(initialScore)` problematic when the parent passes an updated `initialScore` prop later?',
    codeSnippet: `function Player({ initialScore }) {
  const [score, setScore] = useState(initialScore);
  return <div>Score: {score}</div>;
}`,
    options: [
      'useState only reads the initial argument on initial component mount; subsequent prop updates are ignored',
      'initialScore must be a string',
      'useState cannot accept props',
      'The component will crash on re-render',
    ],
    correctOptionIndex: 0,
    explanation: 'The argument passed to `useState(initial)` is only used on the initial mount. If the parent passes a new `initialScore`, React preserves the existing `score` state and ignores the prop. If you need state to reset on prop change, use `key={initialScore}` or compute derived state.',
    hint: 'When does useState evaluate its initial value argument?',
  },
  {
    id: 'ch-20',
    title: 'Nested State Updater Composition',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'State & Snapshots',
    question: 'What does the button display after a single click?',
    codeSnippet: `function QueueTest() {
  const [val, setVal] = useState(10);

  function handleTest() {
    setVal(v => v * 2);
    setVal(v => v - 5);
    setVal(100);
    setVal(v => v + 1);
  }

  return <button onClick={handleTest}>{val}</button>;
}`,
    options: ['101', '16', '30', '100'],
    correctOptionIndex: 0,
    explanation: 'The queue processes: 1) 10 * 2 = 20. 2) 20 - 5 = 15. 3) Direct update replaces state with 100. 4) 100 + 1 = 101. The final state committed is 101.',
    hint: 'A direct value update in the queue replaces whatever previous pending value existed.',
  },
],
  "Hook Rules": [
  {
    id: 'ch-21',
    title: 'Conditional Hook Call Before Early Return',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Hook Rules',
    question: 'Why does this component throw a React error when `isLoading` changes from true to false?',
    codeSnippet: `function UserProfile({ userId, isLoading }) {
  if (isLoading) {
    return <Spinner />;
  }

  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData(userId).then(setData);
  }, [userId]);

  return <div>{data?.name}</div>;
}`,
    options: [
      'Hooks are called after an early return, causing the number and order of hooks to change between renders',
      'Spinner must be rendered inside an effect',
      'useState cannot be initialized to null',
      'UserProfile must be a class component',
    ],
    correctOptionIndex: 0,
    explanation: 'When `isLoading` is true, 0 hooks are called. When `isLoading` is false, 2 hooks are called. React matches hooks to Fiber state nodes strictly by chronological order. Changing the number of hook calls between renders corrupts the internal hook linked list.',
    hint: 'Look at the return statement before the useState and useEffect hooks.',
  },
  {
    id: 'ch-22',
    title: 'Hooks Inside Loops',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Hook Rules',
    question: 'How should you refactor this code to fetch data for multiple IDs without violating the Rules of Hooks?',
    codeSnippet: `function UserList({ userIds }) {
  // INVALID: Hook called inside loop!
  const users = userIds.map(id => {
    return useFetchUser(id);
  });

  return <div>{users.map(u => u.name)}</div>;
}`,
    options: [
      'Extract an `<UserItem userId={id} />` child component that calls `useFetchUser(userId)` at its top level',
      'Wrap the loop in useMemo',
      'Put the loop inside a useEffect',
      'Use a while loop instead of map',
    ],
    correctOptionIndex: 0,
    explanation: 'Hooks cannot be called inside loops because if the array length changes, the total number of hook calls changes. Extracting a separate `<UserItem userId={id} />` component ensures each item gets its own independent Fiber with top-level hook invocations.',
    hint: 'How can you isolate the hook call so it executes at the top level of a distinct component instance?',
  },
  {
    id: 'ch-23',
    title: 'Hook Called in Event Handler',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Hook Rules',
    question: 'What error does this code produce when clicking the button?',
    codeSnippet: `function ExportButton() {
  function handleExport() {
    // Calling hook inside event handler:
    const theme = useContext(ThemeContext);
    downloadFile(theme);
  }

  return <button onClick={handleExport}>Export</button>;
}`,
    options: [
      '"Invalid hook call. Hooks can only be called inside of the body of a function component"',
      '"useContext requires a reducer"',
      '"Cannot read properties of undefined"',
      'No error; useContext works anywhere',
    ],
    correctOptionIndex: 0,
    explanation: 'Event handlers run after the render phase has finished, when no component is actively rendering. React\'s dispatcher throws "Invalid hook call". `useContext` must be called at the top level of the component, with `theme` referenced inside the handler.',
    hint: 'Can hooks be called inside asynchronous event callbacks?',
  },
  {
    id: 'ch-24',
    title: 'Conditional Hook Inside If Statement',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Hook Rules',
    question: 'Why does this conditional hook call violate React invariants?',
    codeSnippet: `function SearchBar({ hasFilter }) {
  if (hasFilter) {
    useEffect(() => {
      analytics.track('Filter active');
    }, []);
  }

  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}`,
    options: [
      'If hasFilter toggles, useState shifts position in the Fiber linked list, corrupting hook state',
      'useEffect cannot take an empty dependency array inside an if statement',
      'analytics cannot be called in useEffect',
      'SearchBar must receive props as an array',
    ],
    correctOptionIndex: 0,
    explanation: 'When `hasFilter` is true, hook #1 is useEffect and hook #2 is useState. When `hasFilter` becomes false, hook #1 is useState. React reads the effect node as state, misaligning state and throwing runtime errors.',
    hint: 'What happens to the position of useState when hasFilter changes?',
  },
  {
    id: 'ch-25',
    title: 'Early Return Restructuring',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Hook Rules',
    question: 'Where should the early return check be placed relative to the hooks?',
    codeSnippet: `function UserCard({ userId }) {
  // Line 1
  const [user, setUser] = useState(null);
  // Line 2
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  // Line 3
  if (!userId) return <div>Select a user</div>;
  // Line 4
  return <div>{user?.name}</div>;
}`,
    options: [
      'Line 3 is correct: all hooks are called unconditionally at the top before any early return',
      'Line 1: if (!userId) return should be placed before useState',
      'Between Line 1 and Line 2',
      'Early returns are forbidden in React components',
    ],
    correctOptionIndex: 0,
    explanation: 'All hooks MUST execute unconditionally on every render. Placing the early return at Line 3 ensures `useState` and `useEffect` are invoked in identical order regardless of whether `userId` is present or null.',
    hint: 'Rule of Hooks: always call hooks before any early return.',
  },
  {
    id: 'ch-26',
    title: 'Custom Hook Name Convention',
    type: 'choose_hook',
    difficulty: 'Beginner',
    category: 'Hook Rules',
    question: 'Why does React require custom hooks to follow the "use" naming convention (e.g. `useWindowSize`)?',
    options: [
      'It enables the React linter (eslint-plugin-react-hooks) to identify the function and enforce the Rules of Hooks on it automatically',
      'JavaScript syntax reserves the keyword "use" for internal macros',
      'Custom hooks will not compile without it',
      'The browser runtime needs it for garbage collection',
    ],
    correctOptionIndex: 0,
    explanation: 'Without the "use" prefix, static analysis tools cannot distinguish a regular utility function from a hook that contains stateful React logic. The prefix allows ESLint to enforce the Rules of Hooks inside the custom hook.',
    hint: 'How does the ESLint plugin know whether a function is allowed to call useState?',
  },
  {
    id: 'ch-27',
    title: 'Hooks Inside Try Catch Blocks',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Hook Rules',
    question: 'Why is wrapping a hook call in a try/catch block invalid?',
    codeSnippet: `function FragileComponent() {
  let state;
  try {
    state = useState(0)[0];
  } catch (err) {
    state = -1;
  }
  return <div>{state}</div>;
}`,
    options: [
      'If an error occurs, the hook linked list may be partially traversed or skipped, breaking hook alignment on next render',
      'try/catch is not supported in JSX files',
      'useState never throws errors',
      'state must be declared with const',
    ],
    correctOptionIndex: 0,
    explanation: 'Conditional or uncertain hook execution breaks the fundamental guarantee that every render evaluates the exact same sequence of hooks. Catching errors around hook calls destabilizes the internal Fiber pointer.',
    hint: 'Does try/catch guarantee deterministic execution order across renders?',
  },
  {
    id: 'ch-28',
    title: 'Dynamic Hook Branching',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Hook Rules',
    question: 'Why is this dynamic hook selection invalid?',
    codeSnippet: `function DynamicStore({ isOnline }) {
  const store = isOnline ? useOnlineStore() : useOfflineStore();
  return <div>{store.data}</div>;
}`,
    options: [
      'If isOnline toggles, the internal hooks inside useOnlineStore and useOfflineStore execute conditionally, corrupting Fiber state',
      'Ternary operators cannot return objects',
      'Both stores must be combined into Redux',
      'Custom hooks cannot return data properties',
    ],
    correctOptionIndex: 0,
    explanation: 'Custom hooks contain built-in hooks (`useState`, `useEffect`). Calling one custom hook or the other based on a condition dynamically changes the sequence of underlying hooks executed on that component\'s Fiber.',
    hint: 'Remember that custom hooks are inlined into the component\'s own hook linked list.',
  },
  {
    id: 'ch-29',
    title: 'Hook Called in Callback Passed to useMemo',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Hook Rules',
    question: 'What is wrong with this useMemo calculation?',
    codeSnippet: `function Calculator({ a, b }) {
  const result = useMemo(() => {
    // Calling hook inside useMemo factory:
    const theme = useContext(ThemeContext);
    return a + b + (theme === 'dark' ? 10 : 0);
  }, [a, b]);

  return <div>{result}</div>;
}`,
    options: [
      'Hooks cannot be called inside factory functions passed to other hooks; useContext must be called at the component top level',
      'useMemo cannot access theme',
      'a and b cannot be added',
      'useMemo must return a promise',
    ],
    correctOptionIndex: 0,
    explanation: 'Hooks must only be called directly at the top level of the component body. A factory callback passed to `useMemo` is an inner function, violating the Rules of Hooks.',
    hint: 'Where must all hook calls be located?',
  },
  {
    id: 'ch-30',
    title: 'Custom Hook Instance State Isolation',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Hook Rules',
    question: 'Component A and Component B both call `useCounter()`. When Component A increments, what happens to Component B\'s counter?',
    codeSnippet: `function useCounter() {
  const [count, setCount] = useState(0);
  const inc = () => setCount(c => c + 1);
  return { count, inc };
}

function ComponentA() {
  const { count, inc } = useCounter();
  return <button onClick={inc}>A: {count}</button>;
}

function ComponentB() {
  const { count } = useCounter();
  return <div>B: {count}</div>;
}`,
    options: [
      'Component B remains 0; each component gets its own independent state copy',
      'Component B updates to 1; custom hooks share global state',
      'Component B throws an error',
      'Both components reset to 0',
    ],
    correctOptionIndex: 0,
    explanation: 'Custom hooks share stateful LOGIC, not state itself. Each component calling `useCounter` allocates its own separate Hook records on its own independent Fiber node.',
    hint: 'Do custom hooks create singletons or new instances per component?',
  },
  {
    id: 'ch-31',
    title: 'Hook in Class Component Error',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Hook Rules',
    question: 'What happens when calling `useState` inside a Class Component\'s `render()` method?',
    codeSnippet: `class MyComponent extends React.Component {
  render() {
    const [count, setCount] = useState(0);
    return <div>{count}</div>;
  }
}`,
    options: [
      'React throws an error: Hooks can only be called inside the body of a function component',
      'It works normally like this.state',
      'It converts the class to a function',
      'It causes a memory leak without errors',
    ],
    correctOptionIndex: 0,
    explanation: 'Hooks require the Fiber to be set up as a FunctionComponent. Class components manage state via `this.state` and `this.setState`; calling hooks inside a class throws an invariant error.',
    hint: 'Can hooks be used in class components?',
  },
  {
    id: 'ch-32',
    title: 'Nested Helper Function Calling Hook',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Hook Rules',
    question: 'Why is `formatWithState` invalid here?',
    codeSnippet: `function Label({ text }) {
  function formatWithState(str) {
    const [prefix] = useState('Item: ');
    return prefix + str;
  }

  return <span>{formatWithState(text)}</span>;
}`,
    options: [
      'useState is called inside a nested function rather than the top level of the component',
      'prefix cannot be a string',
      'formatWithState must return JSX',
      'text must be sanitized first',
    ],
    correctOptionIndex: 0,
    explanation: 'Even if the helper function is synchronous and called immediately, declaring and calling hooks inside nested functions violates the Rules of Hooks. Hooks must be declared directly in the component body or extracted into a custom hook starting with `use`.',
    hint: 'Rule 1: Only call hooks at the top level of React functions.',
  },
  {
    id: 'ch-33',
    title: 'Hook After Dynamic Array Length',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Hook Rules',
    question: 'What will happen when `tags` array length changes from 2 to 3?',
    codeSnippet: `function TagEditor({ tags }) {
  tags.forEach(t => {
    useMemo(() => computeHash(t), [t]);
  });

  const [active, setActive] = useState(false);
  return <div>{tags.length}</div>;
}`,
    options: [
      'React throws: "Rendered more hooks than during the previous render"',
      'React automatically extends the hook array',
      'computeHash is cached correctly',
      'The component renders with active = undefined',
    ],
    correctOptionIndex: 0,
    explanation: 'On render #1, 2 `useMemo` hooks are called before `useState`. On render #2, 3 `useMemo` hooks run. When React reaches the 3rd iteration, it expects `useState` but finds `useMemo`, throwing an invariant violation error.',
    hint: 'How does React know which hook node to read on re-render?',
  },
  {
    id: 'ch-34',
    title: 'Valid Custom Hook Extraction',
    type: 'fix_hook',
    difficulty: 'Beginner',
    category: 'Hook Rules',
    question: 'What is the correct way to turn repetitive title synchronization logic into a reusable custom hook?',
    options: [
      'function useDocumentTitle(title) { useEffect(() => { document.title = title; }, [title]); }',
      'function setDocumentTitle(title) { useEffect(() => { document.title = title; }, [title]); }',
      'const documentTitle = () => { useEffect(() => { document.title = title; }); }',
      'function documentTitleHook(title) { document.title = title; }',
    ],
    correctOptionIndex: 0,
    explanation: 'A custom hook must be a JavaScript function whose name starts with "use" and that calls other hooks like `useEffect`.',
    hint: 'What naming convention and hook are required?',
  },
  {
    id: 'ch-35',
    title: 'Hook Inside Array Reduce Callback',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Hook Rules',
    question: 'Identify the rule violation in this component:',
    codeSnippet: `function PriceSummary({ items }) {
  const total = items.reduce((acc, item) => {
    const rate = useContext(CurrencyRateContext);
    return acc + item.price * rate;
  }, 0);

  return <div>Total: {total}</div>;
}`,
    options: [
      'useContext is called inside the reduce callback instead of at the component top level',
      'reduce cannot take 0 as initial value',
      'CurrencyRateContext must be a string',
      'Total must be rounded with Math.round',
    ],
    correctOptionIndex: 0,
    explanation: 'Calling `useContext` inside `.reduce()` invokes the hook N times (where N is `items.length`). If the array length changes, the hook call count changes. The rate should be retrieved ONCE at the top level: `const rate = useContext(CurrencyRateContext);` and passed into the reduce.',
    hint: 'How many times would useContext be called if items had 5 elements?',
  },
],
  "useEffect": [
  {
    id: 'ch-36',
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
    id: 'ch-37',
    title: 'Async Effect Signature Bug',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'useEffect',
    question: 'Why does React warn against passing an `async` function directly to `useEffect`?',
    codeSnippet: `useEffect(async () => {
  const res = await fetch('/api/data');
  setData(await res.json());
}, []);`,
    options: [
      'Async functions implicitly return a Promise, but React expects an effect to return either nothing or a cleanup function',
      'Async/await is not supported in React',
      'useEffect only accepts generator functions',
      'fetch cannot be awaited in JavaScript',
    ],
    correctOptionIndex: 0,
    explanation: 'An async function always returns a Promise (`Promise<void>`). React expects the return value of an effect to be a cleanup function (`() => void`). If React attempted to call `promise()` on unmount, it would crash. The correct pattern is declaring an async function inside the effect and invoking it.',
    hint: 'What does an async function return in JavaScript?',
  },
  {
    id: 'ch-38',
    title: 'Network Race Condition Fix',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'useEffect',
    question: 'When the user types "cat" then quickly types "dog", the slower "cat" response can arrive second and overwrite "dog" results. How do you prevent this race condition?',
    codeSnippet: `useEffect(() => {
  fetchResults(query).then(setResults);
}, [query]);`,
    options: [
      'Use an AbortController (or an active boolean flag in cleanup) to cancel in-flight requests when query changes',
      'Increase setTimeout delay',
      'Wrap setResults in useCallback',
      'Change query to a useRef',
    ],
    correctOptionIndex: 0,
    explanation: 'Using an `AbortController` or a boolean `let ignore = false; return () => { ignore = true; }` ensures that when `query` changes or unmounts, the previous in-flight promise is ignored or aborted at the network level, preventing stale responses from overwriting newer state.',
    hint: 'How can an effect cleanup discard or cancel in-flight asynchronous operations?',
  },
  {
    id: 'ch-39',
    title: 'Effect Cleanup Execution Order',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'When `id` changes from 1 to 2, in what exact order do logs appear in the console?',
    codeSnippet: `useEffect(() => {
  console.log('Connect:', id);
  return () => {
    console.log('Cleanup:', id);
  };
}, [id]);`,
    options: [
      'Cleanup: 1, then Connect: 2',
      'Connect: 2, then Cleanup: 1',
      'Connect: 1, then Connect: 2',
      'Cleanup: 2, then Connect: 2',
    ],
    correctOptionIndex: 0,
    explanation: 'React runs the cleanup of the PREVIOUS effect (closing over `id = 1`) before running the setup of the NEW effect (with `id = 2`). The output is: "Cleanup: 1", followed by "Connect: 2".',
    hint: 'Does cleanup run before or after the next setup?',
  },
  {
    id: 'ch-40',
    title: 'Strict Mode Double Invocation',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'In development with React StrictMode enabled, what is logged when this component mounts for the first time?',
    codeSnippet: `useEffect(() => {
  console.log('Subscribed');
  return () => {
    console.log('Unsubscribed');
  };
}, []);`,
    options: [
      'Subscribed -> Unsubscribed -> Subscribed',
      'Subscribed',
      'Subscribed -> Subscribed',
      'Unsubscribed -> Subscribed',
    ],
    correctOptionIndex: 0,
    explanation: 'In development Strict Mode, React intentionally mounts, unmounts, and re-mounts every component to verify that effect cleanup symmetrically undoes setup. The sequence is: Setup ("Subscribed") -> Cleanup ("Unsubscribed") -> Setup ("Subscribed"). In production, it runs once.',
    hint: 'Strict Mode stress-tests effect cleanups by mounting and unmounting immediately.',
  },
  {
    id: 'ch-41',
    title: 'Function in Dependency Array Loop',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'Why does this component re-fetch endlessly and how do you fix it?',
    codeSnippet: `function Search({ query }) {
  const [results, setResults] = useState([]);

  function fetchResults() {
    api.search(query).then(setResults);
  }

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);
}`,
    options: [
      'Move fetchResults inside the useEffect, or wrap fetchResults in useCallback(..., [query])',
      'Remove fetchResults from the dependency array and ignore ESLint',
      'Change fetchResults to a variable',
      'Wrap setResults in useMemo',
    ],
    correctOptionIndex: 0,
    explanation: '`fetchResults` is re-created as a new function reference on every render. Because it is in the dependency array, the effect runs, calls `setResults`, causes a re-render, creating a new `fetchResults`, looping infinitely. Moving it inside the effect or wrapping it in `useCallback` fixes the reference.',
    hint: 'Does a function declared inside a component body have a stable reference?',
  },
  {
    id: 'ch-42',
    title: 'Missing Window Event Cleanup',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'useEffect',
    question: 'What is the critical bug in this key listener effect?',
    codeSnippet: `function KeyTracker() {
  const [key, setKey] = useState('');

  useEffect(() => {
    window.addEventListener('keydown', e => setKey(e.key));
  }, []);

  return <div>Last key: {key}</div>;
}`,
    options: [
      'The event listener is never removed in a cleanup function, leaking memory and leaving listeners attached after unmount',
      'keydown cannot be attached to window',
      'setKey is synchronous',
      'e.key is not supported in modern browsers',
    ],
    correctOptionIndex: 0,
    explanation: 'Every time `KeyTracker` mounts, an event listener is registered on `window`. Because no cleanup function `() => window.removeEventListener("keydown", handler)` is returned, the listener persists forever in the global window object, causing memory leaks.',
    hint: 'What happens to the window event listener when the component unmounts?',
  },
  {
    id: 'ch-43',
    title: 'Tooltip Positioning with useLayoutEffect',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'useEffect',
    question: 'You measure a DOM button using `getBoundingClientRect()` to position a floating tooltip adjacent to it. Using `useEffect` causes a brief visual flicker where the tooltip jumps. Which hook solves this?',
    options: [
      'useLayoutEffect: it runs synchronously before browser paint, ensuring the tooltip is positioned before pixels render',
      'useInsertionEffect',
      'useMemo',
      'useCallback',
    ],
    correctOptionIndex: 0,
    explanation: '`useEffect` runs asynchronously after the browser has already painted the initial frame at (0, 0), causing a visible jump when updated. `useLayoutEffect` runs synchronously before paint, allowing DOM measurements and style adjustments to render seamlessly without flicker.',
    hint: 'Which hook executes synchronously after DOM mutations but before the browser paints?',
  },
  {
    id: 'ch-44',
    title: 'Derived State via Effect Anti-Pattern',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'Why is this code considered a major anti-pattern in React?',
    codeSnippet: `function FullName({ firstName, lastName }) {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);

  return <h1>{fullName}</h1>;
}`,
    options: [
      'It causes an unnecessary second render cycle and an intermediate flash of stale state; calculate `const fullName = firstName + " " + lastName` directly in render',
      'useState cannot hold strings',
      'useEffect must have an empty dependency array',
      'firstName and lastName must be joined with concat',
    ],
    correctOptionIndex: 0,
    explanation: 'Derived state should be calculated directly during render. Using `useEffect` to sync derived state causes the component to render once with old data, commit to DOM, fire the effect, and render a second time with the new string.',
    hint: 'Can fullName be computed directly from existing props without state?',
  },
  {
    id: 'ch-45',
    title: 'Object Property vs Object Reference in Deps',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'Which dependency array is more resilient to unnecessary re-runs when passing `user` prop?',
    codeSnippet: `// Option A:
useEffect(() => {
  fetchAnalytics(user.id);
}, [user]);

// Option B:
useEffect(() => {
  fetchAnalytics(user.id);
}, [user.id]);`,
    options: [
      'Option B: passing the primitive `user.id` avoids re-running when unrelated properties on `user` change',
      'Option A: passing the whole object is always faster',
      'Both options behave identically in all scenarios',
      'Neither is valid in React',
    ],
    correctOptionIndex: 0,
    explanation: 'Passing `user.id` (a primitive string/number) ensures the effect only re-runs when the actual ID changes. Passing the entire `user` object will cause the effect to re-run whenever any other field (name, avatar) updates or whenever the parent creates a new user object reference.',
    hint: 'Does the effect care about the whole user object or only the id?',
  },
  {
    id: 'ch-46',
    title: 'Interval State Stale Closure in useEffect',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'This counter ticks every second, but stays stuck at 1! How do you fix it without re-creating the interval every second?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{count}</div>;
}`,
    options: [
      'Use functional updater: `setCount(prev => prev + 1)`',
      'Add count to dependencies (which tears down and recreates the timer every second)',
      'Change setInterval to setTimeout',
      'Wrap count in a Promise',
    ],
    correctOptionIndex: 0,
    explanation: '`setCount(count + 1)` closes over `count = 0` from mount and never updates. Using the functional updater `setCount(prev => prev + 1)` removes all dependencies on `count`, keeping the interval timer alive continuously without restarting.',
    hint: 'How can you update state based on previous state without reading the outer variable?',
  },
  {
    id: 'ch-47',
    title: 'Parent and Child Effect Execution Order',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'useEffect',
    question: 'In what order do useEffect hooks execute on initial mount between Parent and Child?',
    codeSnippet: `function Parent() {
  useEffect(() => console.log('Parent effect'), []);
  return <Child />;
}

function Child() {
  useEffect(() => console.log('Child effect'), []);
  return <div>Hello</div>;
}`,
    options: [
      'Child effect, then Parent effect',
      'Parent effect, then Child effect',
      'Simultaneously in parallel',
      'Parent effect only',
    ],
    correctOptionIndex: 0,
    explanation: 'React renders and completes children first (bottom-up in the commit phase). A parent component\'s layout and passive effects only execute after all of its children have completed and mounted their effects. Output: "Child effect", then "Parent effect".',
    hint: 'Does React complete a tree top-down or bottom-up during commit?',
  },
  {
    id: 'ch-48',
    title: 'useLayoutEffect SSR Warning',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'Why does React throw a console warning when `useLayoutEffect` is executed during Server-Side Rendering (SSR)?',
    options: [
      'The server has no DOM or layout engine, so synchronous pre-paint measurements cannot run on the server',
      'useLayoutEffect is deprecated in modern React',
      'Server rendering only supports class components',
      'Layout effects require HTTPS',
    ],
    correctOptionIndex: 0,
    explanation: '`useLayoutEffect` is designed to measure DOM layout before browser paint. On the server, there is no browser, DOM, or layout engine. To avoid warnings, use `useEffect` or guard layout effects with `typeof window !== "undefined"`.',
    hint: 'Does a Node.js server have a layout and paint pipeline?',
  },
  {
    id: 'ch-49',
    title: 'Ref in useEffect Dependency Array',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'Why is `[inputRef.current]` in a useEffect dependency array a code smell or bug?',
    codeSnippet: `const inputRef = useRef(null);

useEffect(() => {
  if (inputRef.current) inputRef.current.focus();
}, [inputRef.current]);`,
    options: [
      'Mutating a ref does not trigger a re-render, so React will not detect when ref.current changes and will not re-run the effect',
      'Refs are forbidden in dependency arrays by TypeScript',
      'inputRef must be a state variable',
      'focus() cannot be called in useEffect',
    ],
    correctOptionIndex: 0,
    explanation: 'Mutating `ref.current` is a silent in-memory assignment that does not notify React or schedule a render. Because no render occurs when the ref attaches to the DOM node, the dependency comparison never runs! To respond to DOM node attachment, use a callback ref (`ref={node => ...}`).',
    hint: 'Does changing ref.current cause a component to re-render?',
  },
  {
    id: 'ch-50',
    title: 'IntersectionObserver Cleanup',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'What is the required cleanup for an `IntersectionObserver` inside `useEffect`?',
    codeSnippet: `useEffect(() => {
  const observer = new IntersectionObserver(handleIntersect);
  if (targetRef.current) observer.observe(targetRef.current);
  // MISSING CLEANUP
}, []);`,
    options: [
      'return () => observer.disconnect();',
      'return () => observer.unobserve();',
      'return () => observer = null;',
      'No cleanup needed for IntersectionObserver',
    ],
    correctOptionIndex: 0,
    explanation: 'Calling `observer.disconnect()` stops observing all watched elements and cleans up browser observer resources when the component unmounts.',
    hint: 'What method on IntersectionObserver unhooks all observed elements at once?',
  },
  {
    id: 'ch-51',
    title: 'Effect Events for Non-Reactive State',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'useEffect',
    question: 'You want an effect to reconnect to a chat room when `roomId` changes, and log the current `theme` without re-connecting whenever `theme` changes. What is the modern React pattern?',
    options: [
      'Use an Effect Event (`useEffectEvent`) for the logging logic so it reads latest theme without being a reactive dependency',
      'Remove theme from dependencies and disable ESLint',
      'Store theme in a global variable',
      'Call window.location.reload()',
    ],
    correctOptionIndex: 0,
    explanation: '`useEffectEvent` extracts non-reactive logic out of the effect. It always sees the latest props and state when called, but does not trigger effect re-synchronization when those values change.',
    hint: 'Which experimental/modern pattern separates reactive synchronization from non-reactive logic?',
  },
  {
    id: 'ch-52',
    title: 'AbortController vs Boolean Flag',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'Why is `AbortController` superior to a simple `let ignore = false` flag for cancelling fetch requests in effects?',
    options: [
      'AbortController physically cancels the network request in the browser HTTP stack, saving bandwidth and server resources',
      'Boolean flags are not supported in JavaScript closures',
      'AbortController works synchronously on the server',
      'Boolean flags prevent components from unmounting',
    ],
    correctOptionIndex: 0,
    explanation: 'A boolean flag `ignore = true` only ignores the response AFTER it has downloaded. `controller.abort()` terminates the HTTP request immediately over the wire, freeing up socket connections and bandwidth.',
    hint: 'What happens over the network wire when an AbortController is aborted?',
  },
  {
    id: 'ch-53',
    title: 'Syncing Tabs with Storage Event',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'How do you listen to localStorage changes made by other browser tabs?',
    options: [
      'window.addEventListener("storage", handleStorage) inside useEffect with cleanup',
      'window.addEventListener("change", handleStorage)',
      'localStorage.onChange(handleStorage)',
      'setInterval polling every 10ms',
    ],
    correctOptionIndex: 0,
    explanation: 'The browser fires the `"storage"` event on the `window` object of other open tabs whenever `localStorage` is updated. Registering this in `useEffect` and removing it in cleanup provides cross-tab synchronization.',
    hint: 'What native browser event fires across tabs when localStorage is mutated?',
  },
  {
    id: 'ch-54',
    title: 'Multiple Dependent Effects Chaining',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'useEffect',
    question: 'What problem occurs when chaining multiple state updates across dependent effects?',
    codeSnippet: `// Effect 1:
useEffect(() => { setB(computeB(a)); }, [a]);
// Effect 2:
useEffect(() => { setC(computeC(b)); }, [b]);`,
    options: [
      'It causes 3 sequential render passes and intermediate visual layout shifts instead of computing B and C directly in render',
      'React merges all effects into one automatically',
      'Effects cannot depend on state from other effects',
      'TypeScript throws a compiler error',
    ],
    correctOptionIndex: 0,
    explanation: 'Chaining effects causes a cascading waterfall: Render 1 (a changes) -> Commit -> Effect 1 -> setState(b) -> Render 2 -> Commit -> Effect 2 -> setState(c) -> Render 3. Calculate both `b` and `c` directly during render to do it in 1 pass!',
    hint: 'How many times does the component render before reaching steady state?',
  },
  {
    id: 'ch-55',
    title: 'Document Title Synchronization',
    type: 'fix_hook',
    difficulty: 'Beginner',
    category: 'useEffect',
    question: 'What is the correct implementation to update `document.title` and restore the previous title on unmount?',
    options: [
      'useEffect(() => { const prev = document.title; document.title = title; return () => { document.title = prev; }; }, [title]);',
      'useEffect(() => { document.title = title; }, []);',
      'document.title = title; inside render',
      'useLayoutEffect(() => { window.title = title; })',
    ],
    correctOptionIndex: 0,
    explanation: 'Saving `const prev = document.title` and returning a cleanup `() => { document.title = prev; }` ensures the document title is restored when the component leaves the screen.',
    hint: 'How does cleanup capture the previous title?',
  },
  {
    id: 'ch-56',
    title: 'Outside Click Listener Pattern',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'How should a modal detect clicks outside its boundary element?',
    codeSnippet: `function Modal({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return <div ref={ref}>Modal Content</div>;
}`,
    options: [
      'The code is correct: it checks `!ref.current.contains(e.target)` and cleans up the event listener',
      'mousedown should be changed to hover',
      'ref.current.contains is not a valid DOM method',
      'onClose must be called with async',
    ],
    correctOptionIndex: 0,
    explanation: '`node.contains(e.target)` is the standard DOM API to determine whether the clicked target is a descendant of the modal container. If false, the click was outside.',
    hint: 'What DOM method checks if a target node is inside an element?',
  },
  {
    id: 'ch-57',
    title: 'Unnecessary Effect with Form Submission',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'A developer writes `useEffect(() => { if (submitted) sendPost(); }, [submitted])`. Why is this an anti-pattern?',
    options: [
      'The network request is triggered by a specific user interaction and should be called directly inside the form\'s `handleSubmit` handler',
      'sendPost must run in useLayoutEffect',
      'submitted must be a ref',
      'Forms cannot use useEffect',
    ],
    correctOptionIndex: 0,
    explanation: 'Operations caused by a specific user action (submitting a form, clicking a button) belong inside the event handler itself, not in an effect triggered by a intermediate boolean state.',
    hint: 'Did the update happen because of screen synchronization, or because of a user click?',
  },
  {
    id: 'ch-58',
    title: 'WebSocket Connection Management',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'useEffect',
    question: 'Why does opening a WebSocket inside `useEffect` without closing it cause duplicate message delivery?',
    options: [
      'Every time dependencies change or component remounts, a new socket connection is created while old connections stay open in the background',
      'WebSockets automatically duplicate messages in React',
      'WebSocket requires redux',
      'React closes WebSockets automatically',
    ],
    correctOptionIndex: 0,
    explanation: 'Without `return () => socket.close()`, every re-render or re-mount opens an additional connection to the server. The server broadcasts messages to all open sockets, causing the user to receive duplicate notifications.',
    hint: 'What happens to the existing socket connection if cleanup is omitted?',
  },
  {
    id: 'ch-59',
    title: 'Immediate State Read After Effect Call',
    type: 'predict',
    difficulty: 'Beginner',
    category: 'useEffect',
    question: 'What is logged in the console during the initial render pass?',
    codeSnippet: `function App() {
  const [val, setVal] = useState(10);

  useEffect(() => {
    setVal(20);
  }, []);

  console.log('Value:', val);
  return <div>{val}</div>;
}`,
    options: [
      'Value: 10, then Value: 20',
      'Value: 20 only',
      'Value: 10 only',
      'Value: undefined',
    ],
    correctOptionIndex: 0,
    explanation: 'On initial render, the component body runs with `val = 10` ("Value: 10"). After DOM paint, `useEffect` runs and calls `setVal(20)`. This queues a re-render, executing the component body a second time with `val = 20` ("Value: 20").',
    hint: 'Does useEffect run before or after the initial render body executes?',
  },
  {
    id: 'ch-60',
    title: 'Scroll Restoration Effect',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useEffect',
    question: 'How do you scroll the window to the top whenever `pathname` changes in a Single Page App?',
    options: [
      'useEffect(() => { window.scrollTo(0, 0); }, [pathname]);',
      'window.scrollTo(0, 0) inside component render body',
      'useMemo(() => window.scrollTo(0, 0), [pathname])',
      'window.onload = () => window.scrollTo(0, 0)',
    ],
    correctOptionIndex: 0,
    explanation: 'Side effects interacting with browser DOM window APIs must run inside `useEffect`. Putting `window.scrollTo` in `useEffect` keyed on `[pathname]` ensures it executes after route changes.',
    hint: 'Where do browser window mutations belong in React?',
  },
],
  "Closures & Scope": [
  {
    id: 'ch-61',
    title: 'Fix the Stale Timer Closure',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
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
    id: 'ch-62',
    title: 'Stale State in setTimeout Callback',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'The user clicks "Delayed Check", and immediately changes the message input to "Goodbye". What does the alert display after 3 seconds?',
    codeSnippet: `function MessageSender() {
  const [message, setMessage] = useState('Hello');

  function handleSend() {
    setTimeout(() => {
      alert('Sent: ' + message);
    }, 3000);
  }

  return (
    <div>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSend}>Delayed Check</button>
    </div>
  );
}`,
    options: [
      '"Sent: Hello"',
      '"Sent: Goodbye"',
      '"Sent: undefined"',
      'Error: message is not defined',
    ],
    correctOptionIndex: 0,
    explanation: '`handleSend` captures `message` from the render snapshot when the button was clicked ("Hello"). Even though `setMessage("Goodbye")` triggers a new render with a new `message` variable, the scheduled setTimeout timer closes over the lexical environment of the earlier render pass.',
    hint: 'Which render snapshot was active when handleSend was invoked?',
  },
  {
    id: 'ch-63',
    title: 'Stale Closure in useCallback Hook',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'Why does `logValue` always print "Value: 0" even after `value` changes?',
    codeSnippet: `function Tracker({ value }) {
  const logValue = useCallback(() => {
    console.log('Value:', value);
  }, []); // BUG: empty dependencies

  return <button onClick={logValue}>Log</button>;
}`,
    options: [
      'The dependency array is empty `[]`, so useCallback caches the first function instance closing over initial `value = 0` forever',
      'useCallback cannot access props',
      'console.log is asynchronous',
      'value must be stored in localStorage',
    ],
    correctOptionIndex: 0,
    explanation: 'Passing `[]` instructs React to cache the function created during mount indefinitely. That function captured the lexical scope of render #1 where `value` was 0. To fix, add `[value]` to the dependency array.',
    hint: 'What tells useCallback to invalidate its cached function and create a fresh closure?',
  },
  {
    id: 'ch-64',
    title: 'WebSocket Message Handler Stale State',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'A WebSocket `onmessage` handler appends new incoming messages to `messages` state, but only ever keeps the last single message. Why?',
    codeSnippet: `useEffect(() => {
  const socket = new WebSocket(url);
  socket.onmessage = (e) => {
    // Stale closure bug:
    setMessages([...messages, e.data]);
  };
  return () => socket.close();
}, []);`,
    options: [
      'It closes over the initial empty `messages` array; use functional update: `setMessages(prev => [...prev, e.data])`',
      'WebSocket messages must be decoded with JSON.parse',
      'setMessages is not allowed in socket handlers',
      'URL must be updated with timestamp',
    ],
    correctOptionIndex: 0,
    explanation: 'Because the effect runs only on mount (`[]`), `socket.onmessage` forever closes over the initial empty `messages` array `[]`. Calling `setMessages(prev => [...prev, e.data])` receives the true current state from the queue at the moment of update.',
    hint: 'How can you append to an array state without reading the state variable from outer scope?',
  },
  {
    id: 'ch-65',
    title: 'useLatest Callback Hook Pattern',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'Which custom hook pattern provides a stable function reference that NEVER changes while ALWAYS reading the freshest props and state when called?',
    options: [
      'A ref-based wrapper: `const ref = useRef(fn); ref.current = fn; return useCallback((...args) => ref.current(...args), [])`',
      'useMemo(() => fn, [])',
      'useCallback(fn, [Infinity])',
      'useReducer without an initial state',
    ],
    correctOptionIndex: 0,
    explanation: 'This is the canonical "latest callback" pattern (or `useEffectEvent`). Storing the callback in a ref keeps it synchronized to the latest render on every pass, while the returned `useCallback` has a stable reference `[]` that never changes.',
    hint: 'How can a mutable ref container bridge between stable callbacks and fresh closures?',
  },
  {
    id: 'ch-66',
    title: 'Debounced Search Query Stale Closure',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'What goes wrong when a debounce function is defined inline inside a component body?',
    codeSnippet: `function Search() {
  const [query, setQuery] = useState('');

  // BUG: Recreated on every keystroke!
  const debouncedSearch = debounce((q) => {
    sendSearch(q);
  }, 500);

  return <input onChange={e => debouncedSearch(e.target.value)} />;
}`,
    options: [
      'A brand new debounced function (with its own new 500ms timer) is created on every render, so debouncing fails and every keystroke fires',
      'debounce cannot accept arrow functions',
      'e.target.value is garbage collected',
      'query is not passed to sendSearch',
    ],
    correctOptionIndex: 0,
    explanation: 'Because `debouncedSearch` is declared inline, every keystroke updates state, re-renders the component, creates a brand new debounced function with a brand new timer, completely defeating debouncing. It must be wrapped in `useMemo` or stored in a ref.',
    hint: 'Does an inline function preserve its internal setTimeout across renders?',
  },
  {
    id: 'ch-67',
    title: 'Stale Closure in Document Event Listener',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'The user toggles `isEnabled` to true, then presses the Escape key. What is logged to the console?',
    codeSnippet: `function Tool() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        console.log('Enabled?', isEnabled);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <button onClick={() => setIsEnabled(true)}>Enable</button>;
}`,
    options: [
      '"Enabled? false"',
      '"Enabled? true"',
      '"Enabled? undefined"',
      'Nothing is logged',
    ],
    correctOptionIndex: 0,
    explanation: 'The effect runs only on mount (`[]`). The `handleKeyDown` function closed over the initial `isEnabled = false` and was never re-attached. When Escape is pressed, it still logs the original captured value: "Enabled? false". To fix, add `[isEnabled]` to the effect dependencies.',
    hint: 'Did the keydown event listener get re-bound when isEnabled changed?',
  },
  {
    id: 'ch-68',
    title: 'Stale State in requestAnimationFrame Loop',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'In an animation loop using `requestAnimationFrame`, `pos` stays stuck at 1. How do you ensure the loop increments smoothly?',
    codeSnippet: `useEffect(() => {
  let frameId;
  function loop() {
    setPos(pos + 1); // Stale closure!
    frameId = requestAnimationFrame(loop);
  }
  frameId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frameId);
}, []);`,
    options: [
      'Use functional updater: `setPos(p => p + 1)` or maintain position in a `useRef`',
      'Add pos to dependencies and restart the animation loop 60 times a second',
      'Change requestAnimationFrame to setInterval',
      'Wrap pos in a Promise',
    ],
    correctOptionIndex: 0,
    explanation: 'Because `loop` closes over `pos = 0`, every frame executes `setPos(0 + 1)`. Using `setPos(p => p + 1)` receives the latest updated position on every frame, or using `posRef.current += 1` allows 60fps tracking without triggering re-renders.',
    hint: 'How can you increment state without closing over the previous render snapshot?',
  },
  {
    id: 'ch-69',
    title: 'Promise Race Condition Closure',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'User clicks tab "Profile", then immediately clicks "Settings". If Profile takes 2 seconds and Settings takes 500ms, what bug occurs?',
    codeSnippet: `function Tabs({ activeTab }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchTabData(activeTab).then(res => {
      setData(res);
    });
  }, [activeTab]);

  return <div>{data?.title}</div>;
}`,
    options: [
      'The slower Profile response resolves last and overwrites the active Settings data, displaying the wrong tab content',
      'The Settings request is automatically cancelled by React',
      'activeTab cannot be passed to fetch',
      'setData throws an unmounted error',
    ],
    correctOptionIndex: 0,
    explanation: 'Even though Settings loaded first, the Profile promise was still in flight. When it finishes, its `.then()` fires and calls `setData(profileData)`, displaying Profile data on the Settings tab! A cleanup boolean or AbortController is required.',
    hint: 'What happens when an earlier slow network request completes after a newer fast request?',
  },
  {
    id: 'ch-70',
    title: 'Stale Props in useMemo Computation',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'What is the bug in this memoized price calculation?',
    codeSnippet: `function PriceTag({ price, discount, currency }) {
  const formatted = useMemo(() => {
    return (price * (1 - discount)).toFixed(2) + ' ' + currency;
  }, [price, discount]); // Missing currency!

  return <span>{formatted}</span>;
}`,
    options: [
      '`currency` is missing from the dependency array, so changing currency will not update the formatted string',
      'toFixed cannot be called on numbers',
      'currency cannot be concatenated',
      'useMemo cannot return strings',
    ],
    correctOptionIndex: 0,
    explanation: '`currency` is read inside the `useMemo` factory function but omitted from the dependency array. If `currency` changes from USD to EUR, `useMemo` does not re-compute, returning the stale USD string.',
    hint: 'Check if all variables used in the memoization callback are declared in dependencies.',
  },
  {
    id: 'ch-71',
    title: 'Async Callback After Prop Change',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'User clicks "Save" when `name = "Alice"`. While the 1-second network call is saving, user changes `name` to "Bob". What name is saved to the server?',
    codeSnippet: `function Editor({ name }) {
  async function handleSave() {
    await delay(1000);
    api.saveUser(name);
  }

  return <button onClick={handleSave}>Save</button>;
}`,
    options: [
      '"Alice": handleSave captured name from the render snapshot when clicked',
      '"Bob": JavaScript variables are always live references',
      'null',
      'Error: name was mutated',
    ],
    correctOptionIndex: 0,
    explanation: 'In React, props and state are constants within each render snapshot. `handleSave` captured the immutable `name = "Alice"` from the specific render pass in which the user clicked "Save".',
    hint: 'Do async functions read the snapshot from when they were called or the future snapshot?',
  },
  {
    id: 'ch-72',
    title: 'Stale State in Throttled Scroll Handler',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'A throttled scroll handler needs to read the current `activeSection`. How do you prevent it from reading a stale activeSection without re-binding the window scroll listener on every section change?',
    options: [
      'Store `activeSection` in a `useRef` updated during render/effects, and read `ref.current` inside the scroll handler',
      'Re-bind the scroll listener on every scroll event',
      'Use document.write()',
      'Make activeSection a global window variable',
    ],
    correctOptionIndex: 0,
    explanation: 'Refs provide a mutable container whose `.current` property can be read at any time without creating a new function closure or re-registering event listeners.',
    hint: 'How can you read current values without changing function identity?',
  },
  {
    id: 'ch-73',
    title: 'Closure in Custom Hook useInterval',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'Dan Abramov\'s canonical `useInterval` custom hook uses a ref for the callback: `savedCallback.current = callback`. Why is this necessary?',
    options: [
      'It allows the interval to run uninterrupted without resetting its timer, while always executing the latest version of the callback with fresh state and props',
      'setInterval only accepts refs in modern browsers',
      'Refs speed up JavaScript execution by 10x',
      'Without a ref, the component will crash on unmount',
    ],
    correctOptionIndex: 0,
    explanation: 'If `callback` were an effect dependency, changing any state used by the callback would tear down and restart the interval timer every render. Storing it in a ref decouples the timer lifecycle from the state lifecycle.',
    hint: 'What happens to an interval timer if its effect dependencies change on every render?',
  },
  {
    id: 'ch-74',
    title: 'Multiple setState Calls in Async Event',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'What is the value of `count` after clicking the button once?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  async function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
  }

  return <button onClick={handleClick}>{count}</button>;
}`,
    options: ['1', '2', '0', 'Error'],
    correctOptionIndex: 0,
    explanation: 'Both calls evaluate `setCount(0 + 1)` synchronously before the function yields. Because `count` was 0 in this snapshot, both calls request a new state of 1. React batches them and updates count to 1.',
    hint: 'Does count change mid-execution inside handleClick?',
  },
  {
    id: 'ch-75',
    title: 'Stale Closure in IntersectionObserver Callback',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'An `IntersectionObserver` callback logs `count`, but always logs 0. The observer is instantiated in `useEffect(..., [])`. How to fix?',
    options: [
      'Store count in `countRef.current = count` and read `countRef.current` inside the observer callback',
      'Re-create the IntersectionObserver on every count change',
      'Remove IntersectionObserver',
      'Change count to an object',
    ],
    correctOptionIndex: 0,
    explanation: 'Re-creating the observer on every count change breaks smooth intersection tracking and hurts performance. Reading from a ref lets the long-lived observer callback access the latest state snapshot without re-instantiation.',
    hint: 'How can you read current state from a callback initialized once on mount?',
  },
  {
    id: 'ch-76',
    title: 'Async Token Refresh Closure',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'A background sync function calls `api.sync(token)`. A token refresh occurs while sync is waiting. Why might sync send the expired token?',
    options: [
      'The sync function closed over the old `token` variable from its initial invocation snapshot instead of reading the refreshed token from a ref or store',
      'Tokens are automatically cleared by the browser',
      'React does not allow tokens in state',
      'fetch automatically expires tokens',
    ],
    correctOptionIndex: 0,
    explanation: 'If `token` is held in component state or closed over in an async closure, any async delay preserves the captured variable. A shared store or ref must be queried to get the freshest token dynamically.',
    hint: 'Are variables captured at function call time or refreshed automatically?',
  },
  {
    id: 'ch-77',
    title: 'Stale Closure with Array Accumulation',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'If `addItem("A")` and `addItem("B")` are called in the same render pass, what is the final `items` array?',
    codeSnippet: `function List() {
  const [items, setItems] = useState([]);

  function addItem(item) {
    setItems([...items, item]);
  }
}`,
    options: [
      '["B"] (overwrites ["A"])',
      '["A", "B"]',
      '["B", "A"]',
      '[]',
    ],
    correctOptionIndex: 0,
    explanation: 'In this render pass, `items` is `[]`. The first call queues `setItems([...[], "A"])` -> `["A"]`. The second call still sees `items = []`, queueing `setItems([...[], "B"])` -> `["B"]`. The second call completely overwrites the first! To append both, write `setItems(prev => [...prev, item])`.',
    hint: 'What does each call see as the value of items?',
  },
  {
    id: 'ch-78',
    title: 'Stale Closure in Web Worker Listener',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Closures & Scope',
    question: 'A Web Worker `worker.onmessage` callback needs to update state based on current filter settings. How to avoid stale closures without restarting the worker?',
    options: [
      'Use functional state updaters or read filter settings from a ref updated on each render',
      'Terminate and recreate the Worker on every keystroke',
      'Workers cannot communicate with React',
      'Post messages synchronously',
    ],
    correctOptionIndex: 0,
    explanation: 'Workers are expensive OS-level threads. Terminating and re-spawning them on every prop change destroys performance. Keeping the worker alive and reading current React state via refs or functional updates cleanly bridges the boundaries.',
    hint: 'Why is restarting a Web Worker on every render bad for performance?',
  },
  {
    id: 'ch-79',
    title: 'Stale Closure in Custom Event Dispatcher',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Closures & Scope',
    question: 'Why does this custom event listener log old user data?',
    codeSnippet: `useEffect(() => {
  function onCustomEvent() {
    console.log('User:', user.name);
  }
  emitter.on('sync', onCustomEvent);
  return () => emitter.off('sync', onCustomEvent);
}, []);`,
    options: [
      '`user` is missing from the dependency array, so the listener is bound once on mount with the initial user value',
      'emitter cannot take callbacks',
      'user.name must be serialized',
      'Custom events require Redux',
    ],
    correctOptionIndex: 0,
    explanation: 'The listener is registered once with an empty dependency array `[]`. It closes over the initial `user` reference forever. When the user profile changes, the listener still references the original object.',
    hint: 'What is missing from the useEffect dependency array?',
  },
  {
    id: 'ch-80',
    title: 'Effect Event Resolving Closure Without Re-subscribing',
    type: 'choose_hook',
    difficulty: 'Expert',
    category: 'Closures & Scope',
    question: 'What is the primary architectural purpose of the `useEffectEvent` proposal in React?',
    options: [
      'To allow effect code to read fresh props and state without declaring them as reactive dependencies that cause the effect to re-run',
      'To replace all custom hooks',
      'To execute effects on a background web worker thread',
      'To allow hooks to be called conditionally',
    ],
    correctOptionIndex: 0,
    explanation: '`useEffectEvent` solves the tension between exhaustive dependencies and unnecessary re-subscriptions: reactive values like room IDs trigger re-connections, while non-reactive callbacks (logging, notifications) access fresh state without restarting the connection.',
    hint: 'How do you read fresh state in an effect without making it re-run when that state changes?',
  },
],
  "useRef & DOM": [
  {
    id: 'ch-81',
    title: 'Ref Mutation Does Not Re-render',
    type: 'predict',
    difficulty: 'Beginner',
    category: 'useRef & DOM',
    question: 'The user clicks "Add Count" 3 times. What is displayed on screen?',
    codeSnippet: `function Tracker() {
  const countRef = useRef(0);

  function handleClick() {
    countRef.current += 1;
    console.log('Count:', countRef.current);
  }

  return <button onClick={handleClick}>Display: {countRef.current}</button>;
}`,
    options: [
      '"Display: 0" (the UI never updates because mutating a ref does not trigger a re-render)',
      '"Display: 3"',
      '"Display: 1"',
      'Error: Cannot mutate ref',
    ],
    correctOptionIndex: 0,
    explanation: '`useRef` returns a plain JavaScript object `{ current: value }`. Mutating `countRef.current` silently changes the property in memory, but React is not notified and schedules no re-render. The UI remains stuck at "Display: 0".',
    hint: 'Does modifying ref.current tell React to re-render the component?',
  },
  {
    id: 'ch-82',
    title: 'Reading/Writing Ref in Render Body',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useRef & DOM',
    question: 'Why does the React documentation explicitly forbid reading or writing `ref.current` during the render phase?',
    codeSnippet: `function BadComponent() {
  const renderCount = useRef(0);
  // Reading and writing ref during render:
  renderCount.current += 1;

  return <div>Renders: {renderCount.current}</div>;
}`,
    options: [
      'Render must be a pure function with no side effects; concurrent mode may render a component multiple times or discard renders, causing unpredictable ref values',
      'useRef can only be used inside loops',
      'renderCount must be initialized to 1',
      'The browser DOM crashes if refs are read in render',
    ],
    correctOptionIndex: 0,
    explanation: 'React expects the render phase to be pure and idempotent. In concurrent rendering, React may start rendering, pause, abandon the work, or re-render several times before committing. Mutating refs during render makes component output nondeterministic and buggy.',
    hint: 'What happens to side effects in render if React abandons a concurrent render?',
  },
  {
    id: 'ch-83',
    title: 'Focus Input on Mount',
    type: 'fix_hook',
    difficulty: 'Beginner',
    category: 'useRef & DOM',
    question: 'What is the correct way to automatically focus an `<input>` element when the component mounts?',
    options: [
      'const inputRef = useRef(null); useEffect(() => { inputRef.current?.focus(); }, []); return <input ref={inputRef} />;',
      'const inputRef = useRef(null); inputRef.current?.focus(); return <input ref={inputRef} />;',
      'document.getElementById("my-input").focus() in render',
      '<input autoFocus={true} ref={useRef()} />',
    ],
    correctOptionIndex: 0,
    explanation: 'DOM elements are only attached to refs after the commit phase. Calling `inputRef.current?.focus()` inside `useEffect` ensures the DOM node exists and has mounted before attempting to focus it.',
    hint: 'When does the DOM node actually become available on ref.current?',
  },
  {
    id: 'ch-84',
    title: 'usePrevious Custom Hook Implementation',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useRef & DOM',
    question: 'How does the canonical `usePrevious` hook capture the value from the previous render?',
    codeSnippet: `function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}`,
    options: [
      'Because useEffect runs AFTER the component finishes rendering, the hook returns the old value during render and updates to the new value afterwards',
      'useRef stores history of all renders automatically',
      'React inverts the order of hooks',
      'It uses JavaScript generators',
    ],
    correctOptionIndex: 0,
    explanation: 'During the render phase, `ref.current` still holds the value stored by the PREVIOUS render\'s effect. Only after the current render is painted does the new `useEffect` run to update `ref.current = value`, making it ready for the next cycle.',
    hint: 'When does useEffect execute relative to the return statement of usePrevious?',
  },
  {
    id: 'ch-85',
    title: 'Callback Ref for Dynamic List Nodes',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'useRef & DOM',
    question: 'You need to measure the DOM height of items in a dynamic list where items can mount and unmount. Why is a Callback Ref (`ref={node => ...}`) better than `useRef`?',
    options: [
      'A callback ref fires whenever the DOM node attaches (node !== null) and detaches (node === null), providing a guaranteed lifecycle hook without polling',
      'useRef cannot be used on HTML elements',
      'Callback refs prevent garbage collection',
      'Callback refs run on the server',
    ],
    correctOptionIndex: 0,
    explanation: 'Mutating `ref.current` does not notify your component. A callback ref function is invoked by React whenever the DOM node is attached or removed, allowing instant recalculation of heights or positioning.',
    hint: 'How can you be notified immediately when a DOM element is mounted or unmounted?',
  },
  {
    id: 'ch-86',
    title: 'Lazy Ref Initialization',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useRef & DOM',
    question: 'In this component, `new HeavyAudioEngine()` initializes an expensive Web Audio context. Why is the current code wasteful and how do you fix it?',
    codeSnippet: `function AudioPlayer() {
  // BUG: Instantiates a new HeavyAudioEngine on EVERY render!
  const audioRef = useRef(new HeavyAudioEngine());
}`,
    options: [
      'useRef creates a new instance on every render even though only the first is saved; initialize with `useRef(null)` and populate in an `if (!audioRef.current)` check',
      'Audio engines must be stored in useState',
      'AudioPlayer must be an async function',
      'useRef cannot store class instances',
    ],
    correctOptionIndex: 0,
    explanation: '`useRef(initialValue)` evaluates the argument on every single render pass, discarding all subsequent instances. To avoid waste, initialize with `null` and lazily instantiate: `if (audioRef.current === null) { audioRef.current = new HeavyAudioEngine(); }`.',
    hint: 'Does useRef evaluate its argument expression on every render?',
  },
  {
    id: 'ch-87',
    title: 'useImperativeHandle Custom Method Exposure',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'useRef & DOM',
    question: 'What is the purpose of `useImperativeHandle` combined with `forwardRef`?',
    options: [
      'To customize and restrict the imperative methods/properties exposed to the parent component ref, rather than exposing the entire raw DOM node',
      'To make state updates synchronous',
      'To bypass React strict mode',
      'To connect to Redux',
    ],
    correctOptionIndex: 0,
    explanation: '`useImperativeHandle` lets a child component define an intentional API (e.g. `{ focus, scrollIntoView, reset }`) on the ref passed by the parent, hiding internal DOM implementation details and encapsulating component internals.',
    hint: 'How can a child component control what the parent sees on ref.current?',
  },
  {
    id: 'ch-88',
    title: 'Storing Timer ID for Reliable Cleanup',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useRef & DOM',
    question: 'How should you store a timer ID across user click handlers so it can be cancelled later?',
    options: [
      'In a useRef: `const timerRef = useRef(null); timerRef.current = setTimeout(...); clearTimeout(timerRef.current);`',
      'In a component-level `let timer;` variable outside useState',
      'In component state: `setTimer(setTimeout(...))`',
      'In document.cookie',
    ],
    correctOptionIndex: 0,
    explanation: 'A plain module or component variable fails when multiple instances of the component mount simultaneously. Component state causes an unnecessary re-render just to store a number. `useRef` holds the mutable timer ID cleanly with zero re-renders.',
    hint: 'Which hook stores mutable instance variables without triggering re-renders?',
  },
  {
    id: 'ch-89',
    title: 'State vs Ref vs Memo: Choosing the Right Tool',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'useRef & DOM',
    question: 'You need to track the number of times the user has scrolled the page to send analytics when they leave. You do NOT want scrolling to re-render the page. Where should the scroll count be stored?',
    options: [
      'useRef: it persists across renders and mutates silently without triggering re-renders',
      'useState',
      'useMemo',
      'useReducer',
    ],
    correctOptionIndex: 0,
    explanation: 'When information is needed across renders or in callbacks, but changing it does NOT affect what is rendered on screen, `useRef` is the correct, performant choice.',
    hint: 'Does changing the value require the UI to update visually?',
  },
  {
    id: 'ch-90',
    title: 'Managing a Map of Dynamic Refs',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'useRef & DOM',
    question: 'You have a dynamic list of 100 items and need to scroll to any arbitrary item by ID. What is the recommended pattern for holding their DOM refs?',
    options: [
      'A single ref containing a Map: `const itemsRef = useRef(new Map()); <li ref={el => el ? itemsRef.current.set(id, el) : itemsRef.current.delete(id)} />`',
      'Call useRef 100 times in a loop',
      'Use document.getElementById for all items',
      'Store DOM elements in useState',
    ],
    correctOptionIndex: 0,
    explanation: 'You cannot call `useRef` inside loops. Storing a `Map` inside a single ref and using a callback ref to set/delete elements as they mount and unmount is the official React pattern for dynamic collections of refs.',
    hint: 'How can one ref hold references to multiple DOM nodes identified by key?',
  },
  {
    id: 'ch-91',
    title: 'Direct DOM Mutation Pitfall',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useRef & DOM',
    question: 'What bug occurs if you mutate `ref.current.style.display = "none"` directly, while React also manages visibility via `{isVisible && <Child />}`?',
    options: [
      'React\'s virtual DOM and the real DOM become out of sync; React will not know the element was hidden and layout calculations or reconciliation may conflict',
      'The browser crashes immediately',
      'React uninstalls the component',
      'useRef becomes undefined',
    ],
    correctOptionIndex: 0,
    explanation: 'Avoid manually manipulating DOM nodes that React manages. Modifying DOM attributes directly creates inconsistency between React\'s internal Fiber tree and the actual DOM state. Use declarative state for visual presentation.',
    hint: 'What happens when imperative DOM changes fight declarative React rendering?',
  },
  {
    id: 'ch-92',
    title: 'forwardRef in React 19',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'useRef & DOM',
    question: 'How does ref passing change in modern React (React 19) compared to React 18 and earlier?',
    options: [
      'In React 19, `ref` is passed as a standard prop to function components without needing `forwardRef()` wrapper',
      'Refs are completely deprecated in React 19',
      'useRef is replaced with useId',
      'forwardRef is now mandatory for all components',
    ],
    correctOptionIndex: 0,
    explanation: 'In React 19, function components can accept `ref` directly as a regular prop: `function MyInput({ placeholder, ref })`. The `forwardRef` higher-order wrapper is no longer required and will eventually be deprecated.',
    hint: 'How did React 19 simplify passing refs to custom components?',
  },
  {
    id: 'ch-93',
    title: 'Ref Value Preserved Across Renders',
    type: 'predict',
    difficulty: 'Beginner',
    category: 'useRef & DOM',
    question: 'If the parent re-renders 10 times, what does `ref.current` contain?',
    codeSnippet: `function Counter() {
  const [dummy, setDummy] = useState(0);
  const myRef = useRef('initial');

  useEffect(() => {
    myRef.current = 'updated';
  }, []);

  return <button onClick={() => setDummy(d => d + 1)}>{myRef.current}</button>;
}`,
    options: [
      '"updated" (the ref retains the updated value across all subsequent re-renders)',
      '"initial"',
      'undefined',
      'null',
    ],
    correctOptionIndex: 0,
    explanation: '`useRef` returns the exact same object reference on every render for the entire lifetime of the component. The value `"updated"` set in the effect persists through all 10 re-renders.',
    hint: 'Does useRef reset its value when the component re-renders?',
  },
  {
    id: 'ch-94',
    title: 'Merger of Multiple Refs',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'useRef & DOM',
    question: 'When a component needs its own internal ref to an input AND must forward a ref passed from a parent, how should both refs be attached to the single `<input />`?',
    options: [
      'Use a callback ref that updates both refs: `ref={(node) => { internalRef.current = node; if (typeof forwardedRef === "function") forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; }}`',
      'Pass two ref props: `<input ref1={internalRef} ref2={forwardedRef} />`',
      'Merge them with Object.assign',
      'Wrap the input in two divs',
    ],
    correctOptionIndex: 0,
    explanation: 'A callback ref can assign the DOM node to both the internal `useRef` and the forwarded ref (handling both callback refs and object refs cleanly). Utility libraries often call this `useMergeRefs`.',
    hint: 'How can a single callback ref function assign a DOM node to multiple destinations?',
  },
  {
    id: 'ch-95',
    title: 'IsMounted Anti-pattern Replacement',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'useRef & DOM',
    question: 'Why did developers historically use `isMountedRef.current` to guard `setState` calls, and why is it no longer recommended in modern React?',
    options: [
      'React 18 removed the "Can\'t perform a React state update on an unmounted component" warning; proper cancellation (e.g. AbortController) should be used instead of silencing the update',
      'isMountedRef crashes the browser in React 18',
      'Unmounted components never release memory',
      'setState is synchronous in React 18',
    ],
    correctOptionIndex: 0,
    explanation: 'Using `isMountedRef` hides memory leaks instead of fixing them. If an async task continues running after unmount, the network request or timer is still leaking. The correct solution is cancelling the in-flight work with `AbortController` or cleanup functions.',
    hint: 'Does checking isMounted cancel the underlying leaked asynchronous work?',
  },
],
  "Memoization": [
  {
    id: 'ch-96',
    title: 'Choose the Correct Optimization Hook',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'A parent component passes a callback to a child wrapped in React.memo. Which hook should wrap the callback to prevent the child from re-rendering?',
    codeSnippet: `const Child = React.memo(({ onSelect }) => {
  return <button onClick={onSelect}>Select</button>;
});`,
    options: ['useMemo', 'useCallback', 'useTransition', 'useRef'],
    correctOptionIndex: 1,
    explanation: '`useCallback` caches the function definition between renders so that `onSelect` maintains referential equality (`prev === next`), allowing `React.memo` on `Child` to skip re-rendering.',
    hint: 'Which hook is specialized for caching function definitions?',
  },
  {
    id: 'ch-97',
    title: 'Inline Object Prop Breaking React.memo',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'Why does `<Chart />` still re-render on every parent render even though it is wrapped in `React.memo`?',
    codeSnippet: `const Chart = React.memo(({ config }) => {
  return <canvas id={config.theme} />;
});

function Dashboard() {
  const [count, setCount] = useState(0);

  // Rendered in Dashboard:
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <Chart config={{ theme: 'dark', animated: true }} />
    </>
  );
}`,
    options: [
      '`config={{ ... }}` creates a brand new object in memory on every render; React.memo\'s shallow equality check `Object.is(prevConfig, nextConfig)` is always false',
      'React.memo does not work with canvas elements',
      'count is not passed to Chart',
      'Chart needs an id prop',
    ],
    correctOptionIndex: 0,
    explanation: '`React.memo` performs shallow equality (`===`) on all props. Writing an inline object literal `{ theme: "dark" }` creates a new object on every render pass. Because `{} !== {}`, React.memo assumes props changed and re-renders Chart every time.',
    hint: 'What does an inline object literal `{ ... }` evaluate to on every render pass?',
  },
  {
    id: 'ch-98',
    title: 'Inline Arrow Function in Props',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'How do you fix this button callback so that `MemoizedButton` skips re-rendering when the parent updates unrelated state?',
    codeSnippet: `function Parent() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <MemoizedButton onClick={() => setCount(c => c + 1)} label="Add" />
    </div>
  );
}`,
    options: [
      'Wrap the handler in `useCallback`: `const handleAdd = useCallback(() => setCount(c => c + 1), []); <MemoizedButton onClick={handleAdd} />`',
      'Wrap MemoizedButton in a div',
      'Change setCount to count + 1',
      'Memoize the input instead',
    ],
    correctOptionIndex: 0,
    explanation: 'Passing `onClick={() => setCount(...)}` creates a new function reference every time `text` changes. Using `useCallback` with empty dependencies `[]` (enabled by the functional updater `c => c + 1`) produces a permanently stable function reference.',
    hint: 'How can you stabilize the function reference passed to MemoizedButton?',
  },
  {
    id: 'ch-99',
    title: 'Unnecessary useMemo on Cheap Operations',
    type: 'optimize',
    difficulty: 'Beginner',
    category: 'Memoization',
    question: 'Is wrapping `price + tax` in `useMemo` a good optimization?',
    codeSnippet: `function Receipt({ price, tax }) {
  const total = useMemo(() => price + tax, [price, tax]);
  return <div>Total: {total}</div>;
}`,
    options: [
      'No: the overhead of array allocation, dependency checks, and function instantiation in useMemo costs more than adding two numbers',
      'Yes: every calculation in React should always be memoized',
      'Yes: it prevents React from re-rendering the component',
      'No: useMemo only works for arrays',
    ],
    correctOptionIndex: 0,
    explanation: 'Simple arithmetic (`price + tax`) takes less than a nanosecond. `useMemo` adds hook storage, dependency array allocation, and closure comparisons. Only use `useMemo` for computationally heavy calculations (sorting thousands of items) or preserving reference identity for child memoization.',
    hint: 'Does memoizing a single addition operation save more CPU time than the hook overhead costs?',
  },
  {
    id: 'ch-100',
    title: 'useCallback vs useMemo Equivalence',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'What is the exact relationship between `useCallback(fn, deps)` and `useMemo`?',
    options: [
      '`useCallback(fn, deps)` is syntactic sugar for `useMemo(() => fn, deps)`',
      'useCallback runs asynchronously; useMemo runs synchronously',
      'useCallback is only for DOM events; useMemo is for server state',
      'They are completely unrelated APIs with different execution pipelines',
    ],
    correctOptionIndex: 0,
    explanation: 'In React\'s source code, `useCallback(fn, deps)` returns the function `fn` directly, which is functionally identical to `useMemo(() => fn, deps)`. `useCallback` exists to provide cleaner syntax without nested arrow functions.',
    hint: 'What does useMemo return when its factory function returns a function?',
  },
  {
    id: 'ch-101',
    title: 'React.memo with Custom arePropsEqual Comparator',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Memoization',
    question: 'In `React.memo(Component, arePropsEqual)`, what should `arePropsEqual` return to SKIP re-rendering?',
    options: [
      'Return `true` if previous and next props are equal (skips render); return `false` to re-render',
      'Return `false` to skip re-rendering; return `true` to re-render (like shouldComponentUpdate)',
      'Return 0 to skip, 1 to render',
      'Return void',
    ],
    correctOptionIndex: 0,
    explanation: 'Unlike class `shouldComponentUpdate` (which returns `true` to render), `arePropsEqual(prevProps, nextProps)` returns `true` if the props are equal (meaning NO render is needed, skipping the update). Returning `false` triggers a re-render.',
    hint: 'Notice the function name: arePropsEqual. If props ARE equal, should React re-render?',
  },
  {
    id: 'ch-102',
    title: 'Children Prop Breaking React.memo',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Memoization',
    question: 'Why does `<Card>` still re-render on every parent update despite being wrapped in `React.memo`?',
    codeSnippet: `const Card = React.memo(({ children }) => {
  return <div className="card">{children}</div>;
});

function Page() {
  const [val, setVal] = useState(0);

  return (
    <div>
      <button onClick={() => setVal(v => v + 1)}>Click</button>
      <Card>
        <span>Static Content</span>
      </Card>
    </div>
  );
}`,
    options: [
      'JSX syntax `<Card><span>...</span></Card>` is syntactic sugar for `children: React.createElement("span", ...)` which produces a new object on every parent render',
      'React.memo does not support children props',
      'span tags cannot be memoized',
      'The card class triggers a reflow',
    ],
    correctOptionIndex: 0,
    explanation: 'Every JSX tag `<tag />` compiles to `React.createElement(...)`, which returns a brand new JavaScript object literal on every render. Because `children` is a new object reference every time `Page` renders, `React.memo` sees changed props and re-renders Card.',
    hint: 'What does JSX syntax `<Child />` compile down to in JavaScript?',
  },
  {
    id: 'ch-103',
    title: 'Inline Style Object Prop Trap',
    type: 'optimize',
    difficulty: 'Beginner',
    category: 'Memoization',
    question: 'Why does `style={{ marginTop: 20 }}` on a memoized component defeat memoization?',
    options: [
      'The style object literal is re-instantiated with a new reference on every render, failing shallow prop equality',
      'Styles must be declared in CSS files only',
      'React does not compare style props',
      'marginTop requires pixel units',
    ],
    correctOptionIndex: 0,
    explanation: '`style={{ ... }}` is a new object on every render. To keep it stable, extract it to a constant outside the component: `const BTN_STYLE = { marginTop: 20 };` or use CSS classes.',
    hint: 'Is `{ marginTop: 20 } === { marginTop: 20 }` true or false in JavaScript?',
  },
  {
    id: 'ch-104',
    title: 'Heavy Array Transformation with useMemo',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'When is `useMemo` genuinely recommended for transforming an array?',
    options: [
      'When filtering or sorting a large dataset (e.g. thousands of items) or running an expensive algorithmic transformation that causes measurable frame drops',
      'For every array.map call regardless of array size',
      'Only when connecting to Redux',
      'Only on initial page load',
    ],
    correctOptionIndex: 0,
    explanation: 'Filtering or sorting 5,000 items takes noticeable CPU time (e.g. 10-30ms). `useMemo` caches the sorted array and skips execution when unrelated props change, keeping UI interactions responsive.',
    hint: 'What characterizes an expensive calculation worth memoizing?',
  },
  {
    id: 'ch-105',
    title: 'React Compiler (Forget) Role',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'Memoization',
    question: 'What is the primary goal of the React Compiler (formerly React Forget)?',
    options: [
      'To automatically memoize values, functions, and JSX elements at build time, eliminating the need for manual useMemo, useCallback, and React.memo',
      'To compile React to WebAssembly',
      'To replace Vite and Webpack',
      'To convert React into a server-only language',
    ],
    correctOptionIndex: 0,
    explanation: 'The React Compiler analyzes JavaScript semantics and automatically injects fine-grained memoization for values, functions, and components, freeing developers from manual dependency array maintenance and memoization boilerplate.',
    hint: 'What does the React compiler automate for developers?',
  },
  {
    id: 'ch-106',
    title: 'Context Consumption Bypassing React.memo',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Memoization',
    question: '`const MemoItem = React.memo(Item);` is rendered. Inside `Item`, it calls `const theme = useContext(ThemeContext)`. When `ThemeContext` updates, does `MemoItem` re-render?',
    options: [
      'Yes: useContext bypasses React.memo entirely; components consuming context re-render whenever the context value changes',
      'No: React.memo blocks context updates from reaching children',
      'Only if props also changed',
      'It throws a React warning',
    ],
    correctOptionIndex: 0,
    explanation: '`React.memo` only checks if the component\'s own PROPS have changed. When a context that the component subscribes to updates, React schedules an update directly on that component\'s Fiber, bypassing the prop memoization bailout completely.',
    hint: 'Does React.memo guard against useContext value changes?',
  },
  {
    id: 'ch-107',
    title: 'Stable Callback via Functional Updater',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'How can `handleDelete` remove an item from `items` state while maintaining a completely empty dependency array `[]` in `useCallback`?',
    options: [
      'Use functional updater: `useCallback((id) => setItems(prev => prev.filter(it => it.id !== id)), [])`',
      'useCallback((id) => setItems(items.filter(it => it.id !== id)), [items])',
      'Put items in a global variable',
      'Use window.confirm',
    ],
    correctOptionIndex: 0,
    explanation: 'By writing `setItems(prev => prev.filter(...))`, the callback does not read `items` from the outer render scope. This allows the dependency array to be empty `[]`, keeping `handleDelete` referentially stable forever!',
    hint: 'How does a functional state update eliminate dependencies from useCallback?',
  },
  {
    id: 'ch-108',
    title: 'Parameterized Callback in List Items',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'Memoization',
    question: 'In a list of 1,000 items, passing `onClick={() => onDelete(item.id)}` breaks `React.memo` on every item. What is the most performant architectural fix?',
    options: [
      'Pass the stable `onDelete` callback directly to `<Item id={item.id} onDelete={onDelete} />` and let the Item component call `onDelete(id)` internally',
      'Wrap each inline arrow function in useMemo inside the parent map',
      'Remove React.memo from Item',
      'Use eval()',
    ],
    correctOptionIndex: 0,
    explanation: 'Passing a single stable `onDelete` function down to `<Item id={item.id} onDelete={onDelete} />` ensures that all 1,000 items receive the EXACT SAME callback reference. Inside `Item`, it simply invokes `onClick={() => onDelete(id)}`.',
    hint: 'Where should the item ID be attached: in the parent loop or inside the item component?',
  },
  {
    id: 'ch-109',
    title: 'Non-Primitive Dependency in useMemo',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'Why does this `useMemo` recalculate on every parent render despite `filters.category` never changing?',
    codeSnippet: `function Catalog({ filters }) {
  // filters is { category: 'books', page: 1 } passed as a new object each render
  const filteredData = useMemo(() => {
    return applyFilters(data, filters.category);
  }, [filters]);
}`,
    options: [
      'The dependency is the entire `filters` object reference instead of the specific primitive `filters.category`',
      'applyFilters is not pure',
      'Catalog must be a class component',
      'useMemo cannot take objects',
    ],
    correctOptionIndex: 0,
    explanation: 'Because `[filters]` compares the object reference with `Object.is`, any parent render that creates a new `filters` object invalidates the cache. Changing the dependency to `[filters.category]` ensures it only recalculates when the category string actually changes.',
    hint: 'Should the dependency be the object or the primitive property used in the calculation?',
  },
  {
    id: 'ch-110',
    title: 'Expensive Regex Compilation Memoization',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'Compiling a complex RegExp `new RegExp(pattern, "gi")` on every render pass slows down typing. How should it be cached?',
    options: [
      'const regex = useMemo(() => new RegExp(pattern, "gi"), [pattern]);',
      'useCallback(() => new RegExp(pattern), [pattern])',
      'const regex = new RegExp(pattern, "gi") inside render',
      'Store regex in localStorage',
    ],
    correctOptionIndex: 0,
    explanation: '`useMemo` caches the compiled RegExp object and only re-compiles it when `pattern` changes, saving CPU cycles on every keystroke or render pass.',
    hint: 'Which hook caches computed objects and returns the cached result?',
  },
  {
    id: 'ch-111',
    title: 'Memoized Component with Primitive vs Object Props',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'Parent renders with `user = { name: "Sam" }` (new object reference, identical content). Child is `React.memo(Child)`. Does Child re-render?',
    codeSnippet: `const Child = React.memo(({ user }) => {
  console.log('Child rendered');
  return <div>{user.name}</div>;
});`,
    options: [
      'Yes: React.memo uses shallow equality (Object.is), and { name: "Sam" } !== { name: "Sam" } across different object instances',
      'No: React inspects the properties inside user and sees they match',
      'No: React.memo does deep comparison by default',
      'It logs an error',
    ],
    correctOptionIndex: 0,
    explanation: '`React.memo` only performs shallow equality checks: `Object.is(prevProps.user, nextProps.user)`. In JavaScript, two distinct object instances with identical properties are never strictly equal (`{} !== {}`).',
    hint: 'Does React.memo do deep property comparison by default?',
  },
  {
    id: 'ch-112',
    title: 'Subtree Memoization via useMemo JSX',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'Memoization',
    question: 'How can you memoize a heavy child component subtree without creating a separate `React.memo` file definition?',
    options: [
      'const memoizedChild = useMemo(() => <HeavyVisualizer data={data} />, [data]);',
      'useCallback(() => <HeavyVisualizer />, [])',
      'useRef(<HeavyVisualizer />)',
      'useLayoutEffect(() => <HeavyVisualizer />)',
    ],
    correctOptionIndex: 0,
    explanation: 'Because JSX produces plain virtual element objects, `useMemo(() => <HeavyVisualizer data={data} />, [data])` preserves the exact same element reference across parent renders. When React diffs the parent, it sees the identical element object reference and skips diffing that subtree.',
    hint: 'Can React virtual element objects returned from JSX be memoized in useMemo?',
  },
  {
    id: 'ch-113',
    title: 'When to Avoid Memoization',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'In which scenario is adding `useMemo` or `React.memo` HARMFUL or counterproductive?',
    options: [
      'Wrapping a simple component that only renders a few HTML elements and whose props change on almost every render anyway',
      'Sorting a list of 10,000 products',
      'Stabilizing an object passed into a custom hook dependency array',
      'Preventing a heavy chart from re-drawing canvas pixels',
    ],
    correctOptionIndex: 0,
    explanation: 'If a component is cheap to render (e.g. `<Button>{label}</Button>`) and its props change frequently, `React.memo` adds the cost of prop comparison on every render on top of the inevitable render cost, wasting memory and CPU.',
    hint: 'What happens when memoization props change on 99% of render passes?',
  },
  {
    id: 'ch-114',
    title: 'Function Returning Object in useMemo Trap',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Memoization',
    question: 'What is wrong with this useMemo usage?',
    codeSnippet: `const getStyles = useMemo(() => {
  return () => ({ color: 'red', fontSize: 16 });
}, []);`,
    options: [
      '`getStyles` is a function that generates a new object every time it is called; use `useMemo(() => ({ color: "red", fontSize: 16 }), [])` directly to cache the object itself',
      'useMemo cannot return functions',
      'fontSize must be a string with px',
      'color must be a hex code',
    ],
    correctOptionIndex: 0,
    explanation: 'Returning a function from `useMemo` means whenever you call `getStyles()`, you still execute an arrow function creating a new `{ ... }` object. The object itself should be returned directly from `useMemo`.',
    hint: 'Is the memoized value the function or the object returned by the function?',
  },
  {
    id: 'ch-115',
    title: 'Custom arePropsEqual Shallow Array Check',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Memoization',
    question: 'A component receives `tags: string[]`. Even if the parent creates a new array `["react", "hooks"]`, the content is the same. How should `arePropsEqual` be written?',
    options: [
      '(prev, next) => prev.tags.length === next.tags.length && prev.tags.every((t, i) => t === next.tags[i])',
      '(prev, next) => prev.tags === next.tags',
      '(prev, next) => JSON.stringify(prev) !== JSON.stringify(next)',
      '(prev, next) => false',
    ],
    correctOptionIndex: 0,
    explanation: 'A custom comparator that checks length and shallow equality of each element (`every((t, i) => t === next.tags[i])`) allows `React.memo` to skip re-rendering when array contents are identical even if array references differ.',
    hint: 'How do you check if two arrays contain the exact same primitive elements in the same order?',
  },
],
  "Context": [
  {
    id: 'ch-116',
    title: 'Inline Object in Context Provider Value',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Context',
    question: 'Why does this Context Provider force every single consumer in the entire app to re-render whenever `App` re-renders?',
    codeSnippet: `function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);

  // BUG: Inline object literal
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        <MainContent />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}`,
    options: [
      '`value={{ ... }}` creates a brand new object reference on every render of App; React detects a new context reference and marks all consumer Fibers to re-render',
      'Nested providers are not supported in React',
      'ThemeContext must be declared inside App',
      'setTheme cannot be passed through context',
    ],
    correctOptionIndex: 0,
    explanation: 'Whenever `App` re-renders, `{{ theme, setTheme }}` allocates a new object in heap memory. `Object.is(prevVal, nextVal)` returns `false`, forcing all components calling `useContext(ThemeContext)` to re-render unconditionally, bypassing `React.memo`.',
    hint: 'Does `{ theme, setTheme } === { theme, setTheme }` return true or false across renders?',
  },
  {
    id: 'ch-117',
    title: 'Splitting State and Dispatch Contexts',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'Context',
    question: 'In a shopping cart, components that only dispatch "ADD_ITEM" keep re-rendering every time the cart items update. What is the standard architectural solution?',
    options: [
      'Split into two contexts: `CartStateContext` (contains items) and `CartDispatchContext` (contains the stable dispatch function)',
      'Wrap all cart components in React.memo',
      'Move cart state to a global window variable',
      'Use useLayoutEffect instead of useContext',
    ],
    correctOptionIndex: 0,
    explanation: 'By splitting state and dispatch into separate contexts, components that only need to trigger actions consume `CartDispatchContext`. Because the `dispatch` reference never changes, action-only components NEVER re-render when cart items change!',
    hint: 'How can you separate the frequently-changing cart data from the permanently-stable dispatch function?',
  },
  {
    id: 'ch-118',
    title: 'Context Lack of Selectors Limitation',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Context',
    question: 'A Context value is `{ user, theme, notifications }`. Component A only renders `{theme}`. When `notifications` changes, why does Component A still re-render?',
    options: [
      'React Context has no built-in selector mechanism; if ANY property on the context value object changes, EVERY consumer re-renders',
      'Component A has a broken dependency array',
      'Theme must be an integer',
      'useContext only works for primitives',
    ],
    correctOptionIndex: 0,
    explanation: 'Unlike Redux or Zustand, React Context checks whether the single `value` object reference changed. It cannot know which specific properties a component destructured inside `const { theme } = useContext(AppContext)`.',
    hint: 'Can useContext subscribe to only a specific property of a context object?',
  },
  {
    id: 'ch-119',
    title: 'Custom Hook with Context Guard',
    type: 'fix_hook',
    difficulty: 'Beginner',
    category: 'Context',
    question: 'What is the best-practice pattern for exposing `useAuth` to prevent undefined errors when used outside `AuthProvider`?',
    options: [
      'function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within an AuthProvider"); return ctx; }',
      'function useAuth() { return useContext(AuthContext) || {}; }',
      'function useAuth() { try { return useContext(AuthContext); } catch { return null; } }',
      'const useAuth = useContext(AuthContext);',
    ],
    correctOptionIndex: 0,
    explanation: 'Wrapping `useContext` in a dedicated custom hook with a null/undefined check provides fail-fast debugging. Developers who accidentally render a consumer outside the provider receive an immediate, descriptive error message.',
    hint: 'How can a custom hook fail fast with a helpful error when a context provider is missing?',
  },
  {
    id: 'ch-120',
    title: 'Context Default Value Semantics',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Context',
    question: 'What value does `useContext(ThemeContext)` return when a component is rendered without ANY `<ThemeContext.Provider>` in its ancestor tree?',
    codeSnippet: `const ThemeContext = createContext('light');

function Display() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}`,
    options: [
      '"light" (the defaultValue passed to createContext is used as fallback when no matching Provider is found)',
      'null',
      'undefined',
      'Throws a runtime error',
    ],
    correctOptionIndex: 0,
    explanation: 'The argument passed to `createContext(defaultValue)` is the fallback value used ONLY when a component reads context without having a matching Provider above it in the tree. Passing `value={undefined}` to a Provider will override this default with `undefined`.',
    hint: 'What does the argument in createContext("light") represent?',
  },
  {
    id: 'ch-121',
    title: 'Nested Context Providers Override',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Context',
    question: 'What color does `<InnerButton />` display in this nested provider setup?',
    codeSnippet: `const ColorContext = createContext('black');

function App() {
  return (
    <ColorContext.Provider value="red">
      <ColorContext.Provider value="blue">
        <InnerButton />
      </ColorContext.Provider>
    </ColorContext.Provider>
  );
}

function InnerButton() {
  const color = useContext(ColorContext);
  return <button style={{ color }}>Click</button>;
}`,
    options: ['blue', 'red', 'black', 'purple'],
    correctOptionIndex: 0,
    explanation: '`useContext` always resolves to the value of the NEAREST matching Provider above the calling component in the tree. The nearest ancestor is `<ColorContext.Provider value="blue">`, so the color is "blue".',
    hint: 'Which provider takes precedence when multiple providers of the same context are nested?',
  },
  {
    id: 'ch-122',
    title: 'Stabilizing Context Value with useMemo',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Context',
    question: 'How do you prevent a Context Provider from re-rendering all consumers when the provider component re-renders due to unrelated state?',
    options: [
      'Memoize the context value object: `const value = useMemo(() => ({ user, login, logout }), [user]); <AuthContext.Provider value={value}>`',
      'Wrap the Context.Provider in React.memo',
      'Pass value as an array instead of an object',
      'Call useContext inside useMemo',
    ],
    correctOptionIndex: 0,
    explanation: 'Wrapping the value object in `useMemo` guarantees that the object reference remains identical across renders unless its actual dependencies (e.g. `user`) change, allowing consumer components to avoid wasted re-renders.',
    hint: 'How can you stabilize an object reference across component re-renders?',
  },
  {
    id: 'ch-123',
    title: 'Context vs External Store (Zustand)',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'Context',
    question: 'Why do high-scale applications often choose an external store like Zustand over React Context for large application state?',
    options: [
      'Zustand uses selector-based subscriptions (`useStore(s => s.count)`), so components only re-render when their specific selected slice changes',
      'Context does not work in React 18',
      'Zustand runs on Web Workers',
      'Context cannot store arrays',
    ],
    correctOptionIndex: 0,
    explanation: 'External stores use `useSyncExternalStore` with selectors to provide surgical subscriptions: 100 components can read from the store, but when property X updates, only the 2 components reading property X re-render.',
    hint: 'What feature allows components to subscribe only to a sub-slice of state?',
  },
  {
    id: 'ch-124',
    title: 'High-Frequency Updates in Context Anti-Pattern',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Context',
    question: 'Why is putting mouse cursor coordinates `(x, y)` in a top-level React Context an architectural anti-pattern?',
    options: [
      'At 60fps/120fps mouse movement, every coordinate update triggers app-wide context propagation, flooding the reconciler and causing massive stutter',
      'Context cannot hold numeric coordinates',
      'Mouse events cannot be listened to in React',
      'createContext requires strings',
    ],
    correctOptionIndex: 0,
    explanation: 'Context is designed for low-frequency updates (themes, user auth, locales). Putting 60Hz-120Hz continuous events into Context triggers constant top-down tree diffs across all consumers.',
    hint: 'What update frequency is React Context designed for?',
  },
  {
    id: 'ch-125',
    title: 'Multiple Scoped Context Instances',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Context',
    question: 'You are building a dashboard where users can open multiple independent Form modal dialogs simultaneously. Each form has its own fields, validation, and submission status. How does Context support this?',
    options: [
      'Render an independent `<FormProvider>` inside each modal component; each modal\'s children subscribe to their own scoped provider instance with complete state isolation',
      'Context is strictly a global singleton and cannot be instantiated multiple times',
      'You must use localStorage',
      'Multiple providers of the same context overwrite each other globally',
    ],
    correctOptionIndex: 0,
    explanation: 'React Context is tree-scoped, not global. Rendering `<FormProvider>` inside Modal A and another `<FormProvider>` inside Modal B creates two completely independent, isolated state subtrees with zero cross-talk.',
    hint: 'Is Context bound to the global window or to the component tree hierarchy?',
  },
],
  "useReducer": [
  {
    id: 'ch-126',
    title: 'State Mutation Inside Reducer',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useReducer',
    question: 'Why does this reducer fail to update the UI when `ADD_TODO` is dispatched?',
    codeSnippet: `function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      state.todos.push(action.payload); // BUG
      return state;
    default:
      return state;
  }
}`,
    options: [
      '`state.todos.push()` mutates the existing state in-place and returns the same object reference; React\'s `Object.is` check detects no change and bails out',
      'switch statements are not supported in React reducers',
      'action.payload must be a string',
      'Reducers cannot return state',
    ],
    correctOptionIndex: 0,
    explanation: 'Reducers must be 100% pure functions. Mutating `state` directly means `Object.is(oldState, newState)` is true, so React skips rendering. Immutability is mandatory: `return { ...state, todos: [...state.todos, action.payload] }`.',
    hint: 'What happens when a reducer returns the same state object reference that it received?',
  },
  {
    id: 'ch-127',
    title: 'Stability of Dispatch Function',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'useReducer',
    question: 'Does the `dispatch` function returned from `useReducer` change identity between renders?',
    codeSnippet: `const [state, dispatch] = useReducer(reducer, initial);

useEffect(() => {
  console.log('Effect ran');
}, [dispatch]);`,
    options: [
      'No: React guarantees that `dispatch` is referentially stable and will never change across the component lifetime',
      'Yes: dispatch changes on every state change',
      'Yes: dispatch changes on unmount',
      'It changes only when reducer logic changes',
    ],
    correctOptionIndex: 0,
    explanation: 'React explicitly guarantees that the `dispatch` function identity is stable and will not change on re-renders. That is why it is safe to omit from `useEffect` or `useCallback` dependency lists (though including it is harmless).',
    hint: 'Does React regenerate the dispatch function reference on each render pass?',
  },
  {
    id: 'ch-128',
    title: 'Lazy Initialization with Third Argument',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useReducer',
    question: 'How do you lazily initialize a reducer state using an `init` function so that expensive initialization runs only on initial mount?',
    options: [
      'Pass the init function as the 3rd argument: `useReducer(reducer, initialArg, init)`',
      'Wrap useReducer in useMemo',
      'Call init inside useEffect',
      'Pass init inside the reducer function',
    ],
    correctOptionIndex: 0,
    explanation: '`useReducer(reducer, initialArg, init)` allows you to extract the initial state calculation into an `init(initialArg)` function that only executes on mount. It also makes it easy to reset state later by dispatching an action that calls `init(action.payload)`.',
    hint: 'What is the purpose of the optional 3rd argument to useReducer?',
  },
  {
    id: 'ch-129',
    title: 'Side Effects Inside Reducer Anti-Pattern',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useReducer',
    question: 'What is wrong with triggering an analytics call or localStorage save inside a reducer function?',
    codeSnippet: `function cartReducer(state, action) {
  switch (action.type) {
    case 'CHECKOUT':
      // Side effects in reducer:
      localStorage.setItem('cart', JSON.stringify(state));
      analytics.track('checkout');
      return { ...state, status: 'complete' };
  }
}`,
    options: [
      'Reducers must be pure calculation functions; in Concurrent React or Strict Mode, reducers can be invoked multiple times without committing, causing duplicate side effects',
      'localStorage cannot be accessed from JavaScript functions',
      'analytics cannot track checkout',
      'action.type must be lowercase',
    ],
    correctOptionIndex: 0,
    explanation: 'React reducers run during the render phase and must be completely free of side effects. Strict Mode intentionally invokes reducers twice in development to uncover unintended side effects. Side effects belong in event handlers or `useEffect`.',
    hint: 'Are reducers executed in the commit phase or the pure render phase?',
  },
  {
    id: 'ch-130',
    title: 'Event-Centric vs Setter-Centric Actions',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'useReducer',
    question: 'When designing actions for a shopping cart, why is `dispatch({ type: "ITEM_PURCHASED", payload: item })` better than `dispatch({ type: "SET_CART_ITEMS_AND_TOTAL", payload: { items, total } })`?',
    options: [
      'Event-centric actions describe "what happened" in the business domain, centralizing complex state calculations inside the reducer rather than scattering state logic across UI event handlers',
      'React only supports capitalized action names with underscores',
      'Setter-centric actions are faster to execute',
      'useReducer requires ITEM_PURCHASED',
    ],
    correctOptionIndex: 0,
    explanation: 'Event-driven action design models domain events ("what happened") and keeps business logic centralized and testable inside the reducer, making actions self-documenting and easier to debug via action logs.',
    hint: 'Should action names describe UI setters or business domain events?',
  },
  {
    id: 'ch-131',
    title: 'Default Case in Reducer',
    type: 'fix_hook',
    difficulty: 'Beginner',
    category: 'useReducer',
    question: 'What should a reducer\'s `default` case return when an unrecognized action is dispatched?',
    codeSnippet: `function counterReducer(state, action) {
  switch (action.type) {
    case 'INC': return state + 1;
    case 'DEC': return state - 1;
    default:
      // What belongs here?
  }
}`,
    options: [
      'return state; (or throw new Error(`Unknown action: ${action.type}`) in strict setups)',
      'return null;',
      'return 0;',
      'return undefined;',
    ],
    correctOptionIndex: 0,
    explanation: 'If an action is not handled, returning the existing `state` unchanged ensures React bails out of rendering without corrupting the state tree. In TypeScript or strict teams, throwing a descriptive error prevents unhandled typos.',
    hint: 'What should happen to existing state if an unrecognized action is received?',
  },
  {
    id: 'ch-132',
    title: 'Finite State Machine with useReducer',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'useReducer',
    question: 'How does `useReducer` prevent invalid state transitions (e.g. going from "submitting" to "idle" without passing through "success" or "error")?',
    options: [
      'By modeling transitions as a Finite State Machine where action handlers explicitly check `state.status` and ignore invalid actions',
      'useReducer automatically installs XState',
      'React blocks all actions during submission',
      'By using setTimeout',
    ],
    correctOptionIndex: 0,
    explanation: 'A reducer can enforce a state transition table: `if (state.status !== "submitting") return state;`. This guarantees impossible states (like clicking submit twice or editing a form while it is actively sending) cannot occur.',
    hint: 'How can the reducer enforce valid transition paths between states?',
  },
  {
    id: 'ch-133',
    title: 'useState vs useReducer Rule of Thumb',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'useReducer',
    question: 'When is `useReducer` clearly preferable over multiple `useState` calls?',
    options: [
      'When state involves multiple sub-values, complex next-state logic depending on previous state, or when updating state requires updating other related state variables simultaneously',
      'Whenever a component has more than 1 button',
      'Only when building games',
      'When state is a primitive number',
    ],
    correctOptionIndex: 0,
    explanation: '`useReducer` consolidates complex, interdependent state mutations into a single predictable state transition function, eliminating bugs where one state variable updates while another remains out of sync.',
    hint: 'What kind of state transitions benefit from a consolidated reducer?',
  },
  {
    id: 'ch-134',
    title: 'Passing Dispatch via Context to Deep Children',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'useReducer',
    question: 'Why is passing `dispatch` through Context to deep children considered a major architectural advantage?',
    options: [
      'Because `dispatch` is stable and never changes reference, child components reading dispatch never re-render when state changes, completely eliminating callback prop drilling',
      'Because dispatch is an asynchronous generator',
      'It automatically memoizes all DOM nodes',
      'It allows children to bypass React security checks',
    ],
    correctOptionIndex: 0,
    explanation: 'Instead of passing 10 different callbacks (`onAdd`, `onEdit`, `onDelete`, etc.) down multiple component layers, exposing a stable `dispatch` via context allows any nested component to trigger actions with zero prop drilling and zero wasted re-renders.',
    hint: 'Why does passing a stable dispatch reference prevent re-renders in consumer components?',
  },
  {
    id: 'ch-135',
    title: 'Resetting State to Initial in useReducer',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useReducer',
    question: 'What is the cleanest way to support a "RESET" action when `useReducer` was initialized with an `init` function?',
    codeSnippet: `function init(initialCount) {
  return { count: initialCount, history: [initialCount] };
}`,
    options: [
      'In the reducer: `case "RESET": return init(action.payload);`',
      'Set state = null',
      'Reload the browser page with window.location.reload()',
      'Call useReducer again',
    ],
    correctOptionIndex: 0,
    explanation: 'Re-using the `init` function inside the reducer: `case "RESET": return init(action.payload)` guarantees that the reset state precisely mirrors the initial state structure without duplicating initialization code.',
    hint: 'Can the reducer call the same init function used on initial mount?',
  },
],
  "Custom Hooks": [
  {
    id: 'ch-136',
    title: 'Custom Hook Returning Unmemoized Object Trap',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Custom Hooks',
    question: 'Why does using this custom hook in a component cause infinite effect re-runs?',
    codeSnippet: `function useUserData(userId) {
  const [user, setUser] = useState(null);

  // BUG: returns a brand new object on every render!
  return { user, isLoaded: user !== null };
}

function Profile({ userId }) {
  const { user, isLoaded } = useUserData(userId);

  useEffect(() => {
    analytics.track('User loaded', { isLoaded });
  }, [isLoaded]); // Or depending on the returned object
}`,
    options: [
      'If a consumer passes the returned object (or an unmemoized callback from the hook) into a useEffect dependency array, a new reference triggers the effect on every render',
      'Custom hooks cannot return objects',
      'user is not initialized to string',
      'analytics cannot be called in useEffect',
    ],
    correctOptionIndex: 0,
    explanation: 'When custom hooks return object literals or callbacks, functions should be wrapped in `useCallback` and compound objects wrapped in `useMemo` if consumers might use them in dependency arrays.',
    hint: 'What happens when a consumer puts an unmemoized object or function returned by a custom hook into their useEffect dependencies?',
  },
  {
    id: 'ch-137',
    title: 'Object vs Tuple Return Value Convention',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Custom Hooks',
    question: 'When should a custom hook return a tuple `[value, setValue]` instead of an object `{ value, setValue }`?',
    options: [
      'Return a tuple when the hook is a generalized utility (like `useState` or `useToggle`) that a component may want to instantiate multiple times with custom variable names',
      'Tuples are always faster than objects in JavaScript',
      'Tuples must be used whenever TypeScript is enabled',
      'Objects are deprecated in React 19',
    ],
    correctOptionIndex: 0,
    explanation: 'Tuples allow easy renaming: `const [isOpen, toggleOpen] = useToggle(); const [isModal, toggleModal] = useToggle();`. Objects are preferred when returning 3+ properties to avoid remembering parameter order.',
    hint: 'Why does useState return an array tuple while useQuery returns an object?',
  },
  {
    id: 'ch-138',
    title: 'useDebounce Custom Hook Design',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Custom Hooks',
    question: 'What is the correct implementation of a `useDebounce(value, delay)` hook?',
    codeSnippet: `function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // MISSING CLEANUP
  }, [value, delay]);

  return debouncedValue;
}`,
    options: [
      'return () => clearTimeout(handler);',
      'return () => cancelAnimationFrame(handler);',
      'return () => handler = null;',
      'No cleanup needed',
    ],
    correctOptionIndex: 0,
    explanation: 'Returning `() => clearTimeout(handler)` ensures that every time `value` changes before `delay` milliseconds elapse, the previous timer is cancelled and a fresh timer is started.',
    hint: 'How do you cancel a pending setTimeout when dependencies change?',
  },
  {
    id: 'ch-139',
    title: 'useEventListener Auto-Cleanup Hook',
    type: 'fix_hook',
    difficulty: 'Advanced',
    category: 'Custom Hooks',
    question: 'How should `useEventListener(eventName, handler, element)` handle the `handler` reference so that changing the handler does not constantly remove and re-add the DOM listener?',
    options: [
      'Store `handler` in a `useRef` updated on every render, and attach a stable wrapper function `(e) => savedHandler.current(e)` to the DOM element',
      'Wrap handler in useMemo',
      'Add window.removeEventListener to render',
      'Pass handler as a string',
    ],
    correctOptionIndex: 0,
    explanation: 'Keeping a `savedHandler` ref synchronized to the latest handler ensures the DOM listener is only bound once (or when `element` or `eventName` changes), while always executing the latest callback with fresh closure state.',
    hint: 'How can a ref decouple event listener binding from handler closure changes?',
  },
  {
    id: 'ch-140',
    title: 'useMediaQuery Responsive Hook',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Custom Hooks',
    question: 'How should a `useMediaQuery(query)` hook subscribe to media query changes in modern browsers?',
    options: [
      'Use `window.matchMedia(query)` and listen to `mediaQueryList.addEventListener("change", listener)` with cleanup',
      'Listen to window "resize" and recalculate on every pixel',
      'Poll window.innerWidth every 100ms',
      'Check CSS stylesheets directly',
    ],
    correctOptionIndex: 0,
    explanation: '`window.matchMedia(query)` creates a `MediaQueryList`. Listening to its `"change"` event fires only when the media query boundary is crossed (e.g. crossing 768px), which is vastly more performant than listening to continuous window resize events.',
    hint: 'What browser API listens to CSS media query breakpoint crossings?',
  },
  {
    id: 'ch-141',
    title: 'Custom Hook Stateful Logic Isolation',
    type: 'predict',
    difficulty: 'Beginner',
    category: 'Custom Hooks',
    question: 'Two completely different components call `useOnlineStatus()`. When Component A goes offline, does Component B also see the offline state?',
    codeSnippet: `function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handle = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handle);
    window.addEventListener('offline', handle);
    return () => {
      window.removeEventListener('online', handle);
      window.removeEventListener('offline', handle);
    };
  }, []);
  return isOnline;
}`,
    options: [
      'Yes, because both components have event listeners attached to the same browser window offline event',
      'No, custom hooks are singletons and share memory',
      'Only if they share a common parent',
      'Component B crashes',
    ],
    correctOptionIndex: 0,
    explanation: 'Each component has its own independent `useState` hook, but both listen to the shared browser `window` online/offline events. When the browser connectivity changes, the event fires on both components, updating both independent states.',
    hint: 'Do both components listen to the global window event?',
  },
  {
    id: 'ch-142',
    title: 'Avoiding Side Effects in Custom Hook Body',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Custom Hooks',
    question: 'Why is modifying localStorage directly inside a custom hook body (outside useEffect) problematic?',
    codeSnippet: `function usePersistentState(key, initial) {
  const [val, setVal] = useState(initial);

  // BUG: Side effect in render body!
  localStorage.setItem(key, JSON.stringify(val));

  return [val, setVal];
}`,
    options: [
      'The render phase must be pure; in concurrent rendering or discarded renders, writing to localStorage during render causes unpredictable writes and degrades render performance',
      'localStorage only accepts numbers',
      'usePersistentState cannot return an array',
      'JSON.stringify is forbidden in hooks',
    ],
    correctOptionIndex: 0,
    explanation: 'Custom hook bodies execute during the component\'s render phase. Synchronous disk I/O like `localStorage.setItem` blocks the main thread during rendering and violates the purity of the render phase. It must be placed in `useEffect` or an updater callback.',
    hint: 'Are custom hook bodies executed during the render phase or commit phase?',
  },
  {
    id: 'ch-143',
    title: 'useIsMounted Anti-Pattern',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Custom Hooks',
    question: 'Why is creating a `useIsMounted()` custom hook to suppress React unmounted state update warnings discouraged?',
    options: [
      'It silences the warning without fixing the underlying memory leak; real fixes involve aborting async tasks with AbortController or clearing timers in cleanup',
      'useIsMounted is a reserved keyword',
      'Refs do not work inside custom hooks',
      'Unmounted components cannot cause memory leaks',
    ],
    correctOptionIndex: 0,
    explanation: 'If a component unmounts while a network request is downloading, checking `if (isMounted.current) setState(...)` simply throws away the result after it downloads. The request was never cancelled, leaking network bandwidth and CPU cycles.',
    hint: 'Does checking isMounted cancel the underlying network request?',
  },
  {
    id: 'ch-144',
    title: 'Composing Hooks Inside Custom Hooks',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Custom Hooks',
    question: 'Can a custom hook call other custom hooks?',
    options: [
      'Yes: custom hooks can compose built-in hooks and other custom hooks freely, provided all hook rules are respected',
      'No: custom hooks can only call built-in React hooks',
      'Only if wrapped in React.forwardRef',
      'Only up to 2 levels of nesting',
    ],
    correctOptionIndex: 0,
    explanation: 'Hook composition is one of React\'s greatest strengths. A `useChatRoom` custom hook can internally call `useOnlineStatus()`, `useLocalStorage()`, and `useWindowSize()` to assemble higher-level abstractions cleanly.',
    hint: 'Can custom hooks be composed like regular JavaScript functions?',
  },
  {
    id: 'ch-145',
    title: 'Clean API Surface for Custom Hooks',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Custom Hooks',
    question: 'Which custom hook API design provides the best forward-compatibility and maintainability for complex hooks with many options?',
    options: [
      'Accepting a single options object: `useFetch(url, { method, headers, cache, retry })`',
      'Accepting 10 positional arguments: `useFetch(url, method, headers, cache, retry, timeout, auth, ...)`',
      'Setting options via window global variables',
      'Passing options as a JSON string',
    ],
    correctOptionIndex: 0,
    explanation: 'Using an options object allows optional arguments, easy defaults, clear call sites, and the ability to add new configuration parameters in future versions without breaking existing positional parameter signatures.',
    hint: 'Which parameter style handles optional configuration without breaking call sites?',
  },
],
  "Reconciliation": [
  {
    id: 'ch-146',
    title: 'Index as Key Insertion Bug',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: 'A list renders inputs using array index `key={index}`: ["Task A", "Task B"]. The user types "123" into Task A\'s input. Then, "Task Zero" is prepended to the array: ["Task Zero", "Task A", "Task B"]. Where does the typed "123" text appear?',
    codeSnippet: `function TaskList({ tasks }) {
  return (
    <ul>
      {tasks.map((task, index) => (
        <li key={index}>
          {task.title} <input defaultValue="" />
        </li>
      ))}
    </ul>
  );
}`,
    options: [
      'In "Task Zero"\'s input! (Because Task Zero now has key=0, React matches it to the previous key=0 input and preserves its DOM state)',
      'In "Task A"\'s input',
      'The text resets and clears in all inputs',
      'Task A disappears',
    ],
    correctOptionIndex: 0,
    explanation: 'With index keys, React matches the new item at index 0 (`key=0`) with the old item at index 0 (`key=0`). It updates the title text but preserves the uncontrolled `<input>` DOM node and its typed text "123", transferring Task A\'s text to Task Zero!',
    hint: 'What does React use to match elements between renders when keys are indices?',
  },
  {
    id: 'ch-147',
    title: 'Random Key State Destruction',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Reconciliation',
    question: 'Why does this input lose focus and reset after every single keystroke?',
    codeSnippet: `function Form() {
  const [text, setText] = useState('');

  // BUG: Math.random() as key
  return (
    <input
      key={Math.random()}
      value={text}
      onChange={e => setText(e.target.value)}
    />
  );
}`,
    options: [
      '`Math.random()` generates a new key on every keystroke, forcing React to completely destroy the old DOM node and mount a fresh one, losing focus and state',
      'input cannot take a key prop',
      'Math.random is asynchronous',
      'setText must be a debounce',
    ],
    correctOptionIndex: 0,
    explanation: 'When an element\'s key changes between renders, React treats it as an entirely different entity. It unmounts the previous DOM node (wiping out browser focus) and mounts a brand-new DOM node from scratch.',
    hint: 'What does React do when an element has a completely different key on the next render?',
  },
  {
    id: 'ch-148',
    title: 'Intentional State Reset via Key',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: 'A user switches between editing different customer profiles in a form. You want the form\'s internal draft state to reset cleanly for the new customer. What is the cleanest, most idiomatic React solution?',
    options: [
      'Pass `key={customer.id}` to the `<CustomerForm key={customer.id} customer={customer} />` component',
      'Write a useEffect with 15 setState calls to reset every field when customer.id changes',
      'Reload the browser page',
      'Store all fields in window global variables',
    ],
    correctOptionIndex: 0,
    explanation: 'Using `key={customer.id}` tells React that each customer is a distinct conceptual instance. When `customer.id` changes, React automatically unmounts the old form and mounts a fresh one with reset initial state, eliminating manual cleanup effects.',
    hint: 'How can you instruct React to treat a component as a brand new instance when an ID changes?',
  },
  {
    id: 'ch-149',
    title: 'Container Tag Change Destroys Descendants',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: '`isHeader` toggles from false to true, changing the outer wrapper from `<div>` to `<header>`. What happens to the internal state of the nested `<SearchBar />` component?',
    codeSnippet: `function Layout({ isHeader }) {
  return isHeader ? (
    <header><SearchBar /></header>
  ) : (
    <div><SearchBar /></div>
  );
}`,
    options: [
      'The `<SearchBar />` state is completely destroyed and re-initialized because its ancestor container type changed from "div" to "header"',
      'The `<SearchBar />` state is preserved because SearchBar is the same component',
      'The browser throws a reconciliation exception',
      'SearchBar renders twice',
    ],
    correctOptionIndex: 0,
    explanation: 'React diffs elements by type. Because `"header" !== "div"`, React destroys the old `<div>` and all of its descendants, unmounting `<SearchBar />` and wiping out its internal state. To preserve state, keep the container tag consistent.',
    hint: 'What happens to descendant components when their parent DOM element type changes?',
  },
  {
    id: 'ch-150',
    title: 'Key Placement on Outermost JSX in Map',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Reconciliation',
    question: 'Where must the `key` prop be placed when mapping an array of items?',
    codeSnippet: `// Option A:
items.map(item => (
  <div key={item.id}>
    <Card item={item} />
  </div>
))

// Option B:
items.map(item => (
  <div>
    <Card key={item.id} item={item} />
  </div>
))`,
    options: [
      'Option A: the key must always be on the outermost element directly returned by the map callback',
      'Option B: the key must be on the custom component',
      'Both are equally valid',
      'Neither: keys are optional in React',
    ],
    correctOptionIndex: 0,
    explanation: 'React expects keys on the direct children of the collection being mapped. Placing the key on `<Card>` in Option B leaves the outer `<div>` without a key, triggering the "Each child in a list should have a unique key" warning.',
    hint: 'Which element is the immediate child of the array container?',
  },
  {
    id: 'ch-151',
    title: 'Key on React Fragments',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: 'You need to map an array where each item returns multiple sibling table cells (`<td>`), requiring a Fragment. How do you attach a key to a Fragment?',
    options: [
      'Use the explicit syntax: `<React.Fragment key={item.id}><td>{item.a}</td><td>{item.b}</td></React.Fragment>`',
      'Use shorthand: `< key={item.id}><td>{item.a}</td><td>{item.b}</td></>`',
      'Fragments do not support keys under any circumstances',
      'Put the key on the first td tag',
    ],
    correctOptionIndex: 0,
    explanation: 'The shorthand `<>...</>` syntax does NOT support attributes or keys. When mapping fragments in a list, you must use the explicit `<React.Fragment key={id}>` syntax.',
    hint: 'Does the empty <>...</> shorthand accept props?',
  },
  {
    id: 'ch-152',
    title: 'Reconciliation of Reordered Items',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'Reconciliation',
    question: 'A list with stable unique keys `["A", "B", "C"]` is reordered to `["C", "A", "B"]`. Does React unmount any DOM nodes?',
    options: [
      'No: React finds the existing Fiber by key in its internal map and moves the existing DOM node using `insertBefore`, preserving component state and DOM nodes',
      'Yes: all 3 items are unmounted and recreated',
      'Only "C" is unmounted',
      'Only "A" and "B" are unmounted',
    ],
    correctOptionIndex: 0,
    explanation: 'With stable keys, React enters its second pass of reconciliation. It looks up existing Fibers in a key-indexed Map. When it finds matching keys, it reuses the Fibers and applies the `Placement` flag to reorder the physical DOM nodes without unmounting.',
    hint: 'How does React\'s two-pass reconciliation handle reordered items with stable keys?',
  },
  {
    id: 'ch-153',
    title: 'Duplicate Keys Warning and Behavior',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: 'What happens when two sibling items share the exact same key: `<Item key="1" />` and `<Item key="1" />`?',
    options: [
      'React logs a console warning, and updates/deletions will become buggy or target the wrong component instance',
      'React immediately crashes with a fatal JavaScript syntax error',
      'React silently generates a random key for the second item',
      'The browser ignores the second item completely',
    ],
    correctOptionIndex: 0,
    explanation: 'Keys must be unique among siblings. If keys collide, React\'s internal reconciliation map overwrites the duplicate entry, causing subsequent renders, reorders, and state updates to target the wrong Fiber.',
    hint: 'What does React\'s console warning warn against regarding duplicate sibling keys?',
  },
  {
    id: 'ch-154',
    title: 'Declaring Components Inside Component Render Bug',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Reconciliation',
    question: 'Why is defining `ChildComponent` inside the body of `ParentComponent` a catastrophic React anti-pattern?',
    codeSnippet: `function ParentComponent() {
  // BUG: Component definition inside render!
  function ChildComponent() {
    const [val, setVal] = useState('');
    return <input value={val} onChange={e => setVal(e.target.value)} />;
  }

  return <ChildComponent />;
}`,
    options: [
      'A new component function reference is created on every render of Parent; React sees a brand new component type and completely unmounts/remounts Child on every single render pass',
      'JavaScript does not allow nested functions',
      'ChildComponent cannot use useState',
      'ParentComponent will run out of memory',
    ],
    correctOptionIndex: 0,
    explanation: 'React compares component identity by reference: `current.elementType === element.type`. Because `ChildComponent` is re-declared on every parent render, it is a brand-new function reference every time. React destroys the old Fiber and mounts a fresh one on every stroke, losing focus and state.',
    hint: 'Is `function Child() {}` the same function reference across renders when declared inside the component body?',
  },
  {
    id: 'ch-155',
    title: 'Props.key is Undefined in Child Component',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Reconciliation',
    question: 'Why is `console.log(props.key)` undefined inside `<Card key={item.id} />`?',
    options: [
      '`key` (like `ref`) is reserved by React for internal reconciliation and is not passed into the component\'s `props` object',
      'The key was not passed correctly',
      'key must be a number',
      'Props only support string values',
    ],
    correctOptionIndex: 0,
    explanation: 'React extracts `key` and `ref` during `createElement` and stores them on the React element object itself. They are deliberately omitted from `element.props`. If the child needs the ID, pass it explicitly as a separate prop: `<Card key={item.id} id={item.id} />`.',
    hint: 'Does React pass the key attribute down through props to the child component?',
  },
  {
    id: 'ch-156',
    title: 'State Preservation with Same Type at Same Position',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: 'When `isPrimary` toggles from false to true, does `<Button />` retain its internal state?',
    codeSnippet: `<div>
  {isPrimary ? (
    <Button variant="primary" />
  ) : (
    <Button variant="secondary" />
  )}
</div>`,
    options: [
      'Yes: it is the same component type (`Button`) at the exact same position in the tree, so React updates its props and preserves internal state',
      'No: the ternary branches force an unmount',
      'Only if variant is memoized',
      'It resets to initial state',
    ],
    correctOptionIndex: 0,
    explanation: 'React looks at the tree position and the component type. In both branches, `<Button />` is the first child of `<div>`. Because the component type is identical, React keeps the existing Fiber and merely updates its props.',
    hint: 'Does React diff based on ternary branches or the resulting element tree position?',
  },
  {
    id: 'ch-157',
    title: 'Forcing State Reset in Same Position',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: 'In the previous question, what is the cleanest way to FORCE `<Button />` to unmount and reset its state when `isPrimary` toggles?',
    options: [
      'Give them distinct keys: `<Button key="primary" />` vs `<Button key="secondary" />`',
      'Wrap one in a setTimeout',
      'Change Button to a class component',
      'Add a second div',
    ],
    correctOptionIndex: 0,
    explanation: 'Assigning distinct keys (`key="primary"` and `key="secondary"`) tells React that the two elements are distinct instances, forcing React to unmount the old instance and mount a fresh one when the key changes.',
    hint: 'What prop can you add to make React treat identical components in the same position as different instances?',
  },
  {
    id: 'ch-158',
    title: 'Stable Keys in Virtualized Lists',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Reconciliation',
    question: 'Why are stable database IDs essential as keys in virtualized lists (`react-window` / `@tanstack/react-virtual`) rather than row index numbers?',
    options: [
      'As the user scrolls, rows are dynamically mounted, unmounted, and recycled; index keys cause DOM inputs, animations, and temporary state to jump between different data rows',
      'Virtualization libraries crash if index keys are used',
      'Database IDs take less memory than integers',
      'Index keys only work up to 100 rows',
    ],
    correctOptionIndex: 0,
    explanation: 'In a virtualized list, row index 5 may represent Item #5 at the top of the scroll, and later represent Item #85 when scrolled. Index keys cause React to match the wrong item state to recycled DOM rows.',
    hint: 'What happens to row index numbers as the viewport scrolls through dynamic data?',
  },
  {
    id: 'ch-159',
    title: 'Conditional Element Shifting Position',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'Reconciliation',
    question: 'When `showBanner` changes from false to true, what happens to `<Counter />` state?',
    codeSnippet: `<div>
  {showBanner && <Banner />}
  <Counter />
</div>`,
    options: [
      'Counter retains its state because React identifies it by type, but if Counter had a sibling of the same type without keys, its position index would shift',
      'Counter always unmounts when any sibling is added',
      'Banner takes Counter\'s state',
      'The component throws a key error',
    ],
    correctOptionIndex: 0,
    explanation: 'When `showBanner` is false, children is `[false, <Counter />]`. When true, it is `[<Banner />, <Counter />]`. Because `Counter` has a different component type from `Banner`, React matches `Counter` to its counterpart and updates it without unmounting.',
    hint: 'Does React match components by type when types differ between sibling positions?',
  },
  {
    id: 'ch-160',
    title: 'Key on Dialog Modal for Fresh State',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Reconciliation',
    question: 'When opening an "Edit Product" modal with product `id = 42`, why is `<EditProductModal key={product.id} id={product.id} />` cleaner than handling form resets in `useEffect`?',
    options: [
      'It guarantees that every time a different product is opened, the entire modal state starts completely fresh without stale data leaks or tricky useEffect dependency synchronization',
      'key makes the modal render 10x faster',
      'Modals cannot use useEffect in React',
      'key enables CSS transitions automatically',
    ],
    correctOptionIndex: 0,
    explanation: 'Key-based component instantiation is a core declarative React pattern. It eliminates complex "reset state on prop change" effects and ensures zero residual draft state leaks between different records.',
    hint: 'Why is declarative recreation better than imperative state reset synchronization?',
  },
],
  "Concurrent React": [
  {
    id: 'ch-161',
    title: 'Prevent UI Freeze with Concurrent React',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'Concurrent React',
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
    explanation: '`useTransition` marks `setList` as a non-blocking transition. React prioritizes the urgent `setQuery` update (for immediate input typing) and computes `setList` concurrently in the background, yielding to user input.',
    hint: 'React 18 introduced a hook specifically for interruptible background transitions.',
  },
  {
    id: 'ch-162',
    title: 'Single-Threaded Cooperative Multitasking',
    type: 'predict',
    difficulty: 'Expert',
    category: 'Concurrent React',
    question: 'Does Concurrent React execute component rendering on multiple CPU threads in parallel via Web Workers?',
    options: [
      'No: JavaScript in the browser is single-threaded; React achieves concurrency by time-slicing render work into ~5ms chunks on the main thread and yielding via MessageChannel',
      'Yes: React spawns 4 background Web Workers for every Fiber tree',
      'Yes: React uses WebAssembly threads',
      'Only on mobile devices',
    ],
    correctOptionIndex: 0,
    explanation: 'React runs entirely on the browser\'s single main UI thread. Concurrent rendering is cooperative multitasking: React checks `shouldYieldToHost()` after processing each Fiber node. If a 5ms deadline is reached, it yields control to the browser event loop to handle user input and animations.',
    hint: 'Is the browser\'s JavaScript engine multithreaded or single-threaded for React rendering?',
  },
  {
    id: 'ch-163',
    title: 'Urgent vs Non-Urgent Priority',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Concurrent React',
    question: 'Which of the following updates should be treated as URGENT rather than a transition?',
    options: [
      'Direct user typing, clicking a checkbox, or dragging a slider',
      'Filtering a table of 10,000 items',
      'Switching between analytics tabs',
      'Fetching subsequent search results',
    ],
    correctOptionIndex: 0,
    explanation: 'Urgent updates reflect immediate physical user interactions (typing, clicking, dragging) where any delay feels like lag or stutter. Non-urgent transitions are updates where the user expects to wait briefly for content to recalculate.',
    hint: 'Which interactions need immediate sub-16ms visual confirmation on screen?',
  },
  {
    id: 'ch-164',
    title: 'Abandoned Renders in Concurrent Mode',
    type: 'find_bug',
    difficulty: 'Expert',
    category: 'Concurrent React',
    question: 'In Concurrent React, a user types "A" then quickly types "B" while a heavy transition is rendering. What happens to the in-progress render for "A"?',
    options: [
      'React immediately abandons the in-progress render for "A" in memory, discards the unfinished virtual tree, and restarts rendering with "B"',
      'React finishes rendering "A" completely, commits it to the DOM, then renders "B"',
      'React crashes with an unhandled transition error',
      'React merges the DOM diffs of A and B',
    ],
    correctOptionIndex: 0,
    explanation: 'Because transitions are interruptible, when a higher-priority update arrives, React tosses out the uncommitted work-in-progress Fiber tree for "A" and immediately pivots to rendering the newest state. This is why render functions must be pure with no external side effects!',
    hint: 'Why spend time committing an outdated render that will immediately be replaced?',
  },
  {
    id: 'ch-165',
    title: 'React 18 Lanes Concept',
    type: 'architecture',
    difficulty: 'Expert',
    category: 'Concurrent React',
    question: 'Why did React replace numeric priorities with a 31-bit integer bitmask system called "Lanes"?',
    options: [
      'Lanes allow updates to be grouped into independent sets that can be decoupled, parallelized, or merged using fast bitwise operations (e.g. `lane & mask`)',
      'Lanes increase browser memory by 4GB',
      'Lanes convert JSX into binary WebAssembly',
      'Numeric priorities were too fast for the browser',
    ],
    correctOptionIndex: 0,
    explanation: 'Numeric priorities (like 1, 2, 3) forced a strictly linear order where work at level 2 blocked level 3. Lanes represent multiple independent streams of work (e.g. SyncLane, InputContinuousLane, DefaultLane, TransitionLanes) that can be checked, combined, or skipped via bitwise operations.',
    hint: 'How do bitmasks allow flexible grouping and filtering of tasks?',
  },
  {
    id: 'ch-166',
    title: 'Tearing and useSyncExternalStore',
    type: 'find_bug',
    difficulty: 'Expert',
    category: 'Concurrent React',
    question: 'What is "visual tearing" in concurrent React applications?',
    options: [
      'When an external store mutates while a concurrent render is paused, causing different components in the same render pass to read different versions of state and display inconsistent UI',
      'When CSS animations tear across multiple displays',
      'When React throws an out-of-memory exception',
      'When a component unmounts mid-render',
    ],
    correctOptionIndex: 0,
    explanation: 'If Component 1 reads state at time T0, React pauses to let the browser process an event, an outside store mutates, and Component 2 reads state at time T1, the single screen renders inconsistent data (tearing). `useSyncExternalStore` detects this and forces a synchronous re-render.',
    hint: 'What happens if external non-React state changes while React has paused a render?',
  },
  {
    id: 'ch-167',
    title: 'startTransition vs setTimeout',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'Concurrent React',
    question: 'Why is `startTransition` superior to `setTimeout(..., 0)` for deferring non-urgent work?',
    options: [
      '`startTransition` executes immediately and can be interrupted by urgent updates; `setTimeout` delays execution until the timer fires and runs synchronously, blocking the main thread during that tick',
      'setTimeout does not work in React 18',
      'startTransition creates Web Workers',
      'setTimeout bypasses React event batching',
    ],
    correctOptionIndex: 0,
    explanation: '`startTransition` begins rendering immediately without arbitrary millisecond delays, and remains interruptible throughout. `setTimeout` delays work until later, but once it starts, it blocks the main thread synchronously just like any regular state update.',
    hint: 'Can setTimeout be interrupted once its callback starts executing?',
  },
  {
    id: 'ch-168',
    title: 'Starvation Prevention via Expiration Times',
    type: 'predict',
    difficulty: 'Expert',
    category: 'Concurrent React',
    question: 'What prevents a low-priority transition from being interrupted forever if the user continuously clicks or types without stopping?',
    options: [
      'Every lane is assigned an expiration time; once expired, React elevates the transition to a synchronous blocking update to prevent starvation',
      'React drops all new clicks until the transition finishes',
      'The browser automatically kills the tab',
      'React caps user clicks at 5 per second',
    ],
    correctOptionIndex: 0,
    explanation: 'To prevent starvation, React attaches a timestamp to pending lanes. If a transition is interrupted for longer than its expiration budget, React promotes it to urgent priority and commits it synchronously.',
    hint: 'How does a scheduler ensure low-priority tasks eventually finish?',
  },
  {
    id: 'ch-169',
    title: 'Legacy ReactDOM.render vs createRoot',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Concurrent React',
    question: 'Why do concurrent features like `useTransition` and `useDeferredValue` fail to work when an app is mounted with legacy `ReactDOM.render`?',
    options: [
      'Concurrent rendering and automatic batching are only enabled when mounting with React 18\'s `ReactDOM.createRoot()`; legacy root runs in synchronous legacy mode',
      'ReactDOM.render was removed in React 16',
      'useTransition requires jQuery',
      'createRoot only works on macOS',
    ],
    correctOptionIndex: 0,
    explanation: 'React 18 kept backwards compatibility: apps mounted via `ReactDOM.render(<App />, root)` run in synchronous mode with concurrent features disabled. To opt in to concurrent features and automatic batching, you must call `ReactDOM.createRoot(root).render(<App />)`.',
    hint: 'What React 18 API replaces ReactDOM.render to unlock concurrent mode?',
  },
  {
    id: 'ch-170',
    title: 'Bypassing Concurrency with flushSync',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'Concurrent React',
    question: 'You need an immediate DOM measurement of an element right after updating state, before the browser paints. Which API forces React to flush updates synchronously?',
    options: [
      'ReactDOM.flushSync(() => { setState(newValue); })',
      'useLayoutEffect(async () => {})',
      'window.requestAnimationFrame()',
      'setTimeout(..., 0)',
    ],
    correctOptionIndex: 0,
    explanation: '`ReactDOM.flushSync` opts out of batching and concurrent scheduling, forcing React to synchronously update state, diff the Fiber tree, and mutate the physical DOM before the next line of code runs.',
    hint: 'Which ReactDOM method flushes pending work synchronously?',
  },
  {
    id: 'ch-171',
    title: 'Render-Phase Side Effects in Concurrent React',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Concurrent React',
    question: 'Why does triggering an analytics event `analytics.track("Page Rendered")` directly inside a component function body cause duplicate metrics in Concurrent React?',
    options: [
      'React may render a component, pause, abandon the render due to user input, and restart it later, firing the analytics call multiple times without ever committing to the screen',
      'Analytics services cannot read React component bodies',
      'Concurrent React runs components 100 times per second',
      'Track functions must be async',
    ],
    correctOptionIndex: 0,
    explanation: 'In concurrent mode, rendering is no longer a 1:1 match with screen commits. A component may render 3 times before finally committing once. Side effects must always be placed in `useEffect` (which only runs after a successful commit).',
    hint: 'Is every render pass guaranteed to result in a physical screen commit?',
  },
  {
    id: 'ch-172',
    title: 'Long Tasks Blocking Concurrent Yielding',
    type: 'optimize',
    difficulty: 'Expert',
    category: 'Concurrent React',
    question: 'A single component runs a synchronous 150ms `for` loop inside its render body. Does Concurrent React interrupt this loop to keep typing smooth?',
    options: [
      'No: React only yields BETWEEN Fiber nodes, not inside synchronous JavaScript loops; a 150ms loop in one component blocks the main thread for 150ms',
      'Yes: Concurrent React preempts JavaScript functions mid-execution',
      'Yes: The loop is automatically moved to a Web Worker',
      'React throws an infinite loop exception',
    ],
    correctOptionIndex: 0,
    explanation: 'React can only check `shouldYieldToHost()` after finishing a Fiber node. If a single component\'s function takes 150ms of synchronous JS execution, the browser cannot interrupt it. Move heavy calculations to Web Workers or memoize them.',
    hint: 'Can React interrupt a single synchronous JavaScript loop mid-execution?',
  },
  {
    id: 'ch-173',
    title: 'Concurrent Mode Strict Mode Checks',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Concurrent React',
    question: 'Why does Strict Mode double-invoke component render functions and state updaters in development?',
    options: [
      'To help developers spot impure functions, mutations, and side effects that would break when React renders or discards work concurrently',
      'To benchmark the computer\'s CPU performance',
      'To test network connection speed',
      'Strict Mode is a development bug',
    ],
    correctOptionIndex: 0,
    explanation: 'Double rendering in development exposes mutations and side effects: if a component modifies an external variable during render, calling the function twice makes the bug instantly obvious.',
    hint: 'What does double-invoking pure functions uncover in impure code?',
  },
  {
    id: 'ch-174',
    title: 'Transition State Visibility During Work',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'Concurrent React',
    question: 'While `startTransition(() => setTab("analytics"))` is rendering in the background, what does the UI show?',
    options: [
      'The current tab content remains visible and fully interactive on screen until the new tab finishes rendering',
      'The screen immediately blanks out with a blank page',
      'The browser tab freezes until rendering completes',
      'The app reverts to the home page',
    ],
    correctOptionIndex: 0,
    explanation: 'One of the greatest UX benefits of transitions is preventing jarring layout flashes: React leaves the existing UI fully visible and interactive on screen while preparing the new UI concurrently in memory.',
    hint: 'Does startTransition destroy the existing screen before the new screen is ready?',
  },
  {
    id: 'ch-175',
    title: 'Time-Slicing Verification in Chrome DevTools',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Concurrent React',
    question: 'In Chrome DevTools Performance panel, how does a concurrent transition render appear compared to a legacy blocking render?',
    options: [
      'A concurrent render shows multiple small JS task slices separated by browser idle periods (yielding), while a legacy render shows a single solid continuous yellow "Long Task" bar',
      'A concurrent render shows blue network bars only',
      'A concurrent render does not appear in DevTools',
      'Both appear identical in the performance flame chart',
    ],
    correctOptionIndex: 0,
    explanation: 'In the Performance timeline, time-slicing breaks up work into ~5ms slices with gaps between them, allowing browser style recalculations and user input events to slip into the gaps.',
    hint: 'How does yielding to the event loop look on a flamegraph timeline?',
  },
],
  "useTransition": [
  {
    id: 'ch-176',
    title: 'useTransition Signature and isPending',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'useTransition',
    question: 'What are the two values returned by the `useTransition()` hook?',
    options: [
      '`[isPending, startTransition]` where `isPending` is a boolean indicating whether the transition is rendering, and `startTransition` is a function wrapping state updates',
      '`[startTransition, isPending]` in reversed order',
      '`{ transition, status }` object',
      '`[progress, cancel]`',
    ],
    correctOptionIndex: 0,
    explanation: '`useTransition` returns a tuple `[isPending, startTransition]`. `isPending` is true while the background transition render is actively in flight, allowing you to dim the existing UI or show a subtle spinner.',
    hint: 'Which boolean indicates that background transition work is in progress?',
  },
  {
    id: 'ch-177',
    title: 'Controlled Input State Inside Transition Bug',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useTransition',
    question: 'Why should controlled `<input value={text} />` state updates NEVER be wrapped in `startTransition`?',
    codeSnippet: `function SearchInput() {
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    // BUG: Wrapping input typing in startTransition!
    startTransition(() => {
      setText(e.target.value);
    });
  }

  return <input value={text} onChange={handleChange} />;
}`,
    options: [
      'Transitions are non-urgent and can be deferred or interrupted; wrapping the input setter causes keystroke lag and cursor jumping',
      'Inputs cannot take transitions in HTML',
      'e.target.value is deleted by React',
      'Controlled inputs require Redux',
    ],
    correctOptionIndex: 0,
    explanation: 'Typing into an input must be synchronous and urgent so the browser can immediately display the pressed character at the cursor position. The input state `text` should update urgently (`setText(e.target.value)`), while downstream heavy filtering should be wrapped in `startTransition`.',
    hint: 'What happens to typing responsiveness if the input setter itself is marked non-urgent?',
  },
  {
    id: 'ch-178',
    title: 'Passing Non-State Work to startTransition',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'useTransition',
    question: 'What is the bug in this `startTransition` call?',
    codeSnippet: `function Analytics() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      // BUG: Performing calculation without state update
      const result = heavyCalculation();
      console.log(result);
    });
  }
}`,
    options: [
      '`startTransition` must wrap a React state updater function (e.g. `setResult(...)`) to schedule a low-priority render; synchronous JS code without a state setter runs synchronously with no effect',
      'startTransition cannot call functions',
      'console.log is forbidden in transitions',
      'heavyCalculation must be an async function',
    ],
    correctOptionIndex: 0,
    explanation: '`startTransition` works by setting an internal priority flag while its callback executes, tagging any `setState` calls queued inside it as low-priority lanes. If no state setter is called, `startTransition` does nothing.',
    hint: 'How does React know which state updates belong to the transition?',
  },
  {
    id: 'ch-179',
    title: 'Async Transitions in React 19',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'useTransition',
    question: 'How do transitions evolve in React 19 regarding asynchronous functions (Actions)?',
    options: [
      'In React 19, `startTransition` natively accepts `async () => { await api(); setState(...); }`, keeping `isPending` true across the entire async operation',
      'React 19 removes startTransition',
      'Async functions crash React 19 transitions',
      'startTransition only works on the server in React 19',
    ],
    correctOptionIndex: 0,
    explanation: 'In React 19, `startTransition` supports async functions (called "Actions"). `isPending` stays `true` from the moment the async function starts until all network calls and state updates have completed and committed.',
    hint: 'What capability did React 19 add to startTransition callbacks?',
  },
  {
    id: 'ch-180',
    title: 'isPending for Subtle Loading Indicators',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useTransition',
    question: 'How should `isPending` be used to improve tab switching UX without replacing the entire screen with a blank spinner?',
    codeSnippet: `const [isPending, startTransition] = useTransition();

function selectTab(nextTab) {
  startTransition(() => setTab(nextTab));
}`,
    options: [
      'Keep the current tab rendered and apply a reduced opacity style: `<div style={{ opacity: isPending ? 0.7 : 1 }}>` with a small inline spinner',
      'Replace the entire page with `<Spinner />` whenever isPending is true',
      'Disable the monitor',
      'Block all user clicks with an invisible backdrop',
    ],
    correctOptionIndex: 0,
    explanation: 'Replacing content with full-screen spinners is jarring. `isPending` lets you leave the current UI visible and interactive, dimming it slightly to communicate background progress smoothly.',
    hint: 'Why is keeping existing content visible with a subtle indicator better than full-page loaders?',
  },
  {
    id: 'ch-181',
    title: 'Rapid Tab Switching Transition Interruption',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'useTransition',
    question: 'User is on Tab A. They click Tab B (a heavy page), and 50ms later click Tab C. What does the user see?',
    options: [
      'React discards the unfinished background render of Tab B and renders Tab C directly, avoiding wasting time rendering Tab B',
      'Tab B renders completely, then Tab C renders',
      'Tab B and Tab C render simultaneously in split screen',
      'The browser crashes',
    ],
    correctOptionIndex: 0,
    explanation: 'Because transitions are interruptible, the second click on Tab C cancels the in-progress transition for Tab B. React skips Tab B entirely and focuses resources on committing Tab C.',
    hint: 'Does React finish superseded transitions or discard them?',
  },
  {
    id: 'ch-182',
    title: 'standalone startTransition vs useTransition',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'useTransition',
    question: 'When should you import the standalone `startTransition` function directly from `"react"` instead of using the `useTransition()` hook?',
    options: [
      'When you are outside of a React component (e.g. in a data store, router, or utility function) or when you do not need the `isPending` boolean flag',
      'Standalone startTransition is deprecated',
      'Only on Node.js server',
      'Standalone startTransition runs on GPU',
    ],
    correctOptionIndex: 0,
    explanation: 'The standalone `startTransition(callback)` function from "react" does not require hook rules and can be called in third-party libraries, stores, or routers where the `isPending` state is not needed.',
    hint: 'Can hooks be called outside component functions?',
  },
  {
    id: 'ch-183',
    title: 'Combining Urgent and Transition Updates',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useTransition',
    question: 'What is the correct dual-state pattern for an autocomplete search box?',
    options: [
      'Immediate state `input` updated synchronously (`setInput(val)`), and filtered state `query` updated in `startTransition(() => setQuery(val))`',
      'Both input and query updated in startTransition',
      'Both input and query updated synchronously in render',
      'Remove input state and read DOM directly',
    ],
    correctOptionIndex: 0,
    explanation: 'Separating user input state (urgent) from filtered results state (transition) provides the gold standard React 18 UX: typing never drops frames, and heavy filtering catches up smoothly in the background.',
    hint: 'How do you separate the urgent keystroke state from the non-urgent filtered results?',
  },
  {
    id: 'ch-184',
    title: 'Transition with Suspense Boundaries',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'useTransition',
    question: 'A user navigates to a new route that suspends while loading data. If the navigation was wrapped in `startTransition`, what does React do?',
    options: [
      'React delays revealing the Suspense fallback and keeps the previous page visible while waiting for data to load',
      'React immediately shows the full-screen Suspense fallback',
      'React throws an error because transitions cannot suspend',
      'React reloads the browser',
    ],
    correctOptionIndex: 0,
    explanation: 'Transitions coordinate seamlessly with Suspense: when a transition suspends, React avoids hiding existing content with an undesirable fallback spinner, keeping the old page visible until the new page has loaded.',
    hint: 'How do transitions improve Suspense loading transitions between screens?',
  },
  {
    id: 'ch-185',
    title: 'When NOT to Use useTransition',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useTransition',
    question: 'In which scenario is `useTransition` UNNECESSARY or improper?',
    options: [
      'Toggling a simple boolean modal flag or clicking a counter button that renders almost instantly (< 5ms)',
      'Filtering 10,000 table rows',
      'Switching between complex dashboard charts',
      'Navigating between rich pages',
    ],
    correctOptionIndex: 0,
    explanation: 'If an update is fast (< 5ms), wrapping it in `useTransition` adds unnecessary scheduling overhead and complexity without any noticeable user benefit.',
    hint: 'Should fast, lightweight state updates be marked as transitions?',
  },
],
  "useDeferredValue": [
  {
    id: 'ch-186',
    title: 'useDeferredValue Core Mechanism',
    type: 'predict',
    difficulty: 'Intermediate',
    category: 'useDeferredValue',
    question: 'When `query` state changes from "A" to "AB", what does `useDeferredValue(query)` return on the very first re-render pass?',
    codeSnippet: `function SearchPage() {
  const [query, setQuery] = useState('A');
  const deferredQuery = useDeferredValue(query);

  console.log('Query:', query, '| Deferred:', deferredQuery);
}`,
    options: [
      'Query: "AB" | Deferred: "A" (React immediately renders with old deferred value first, then schedules a background render with "AB")',
      'Query: "AB" | Deferred: "AB"',
      'Query: "A" | Deferred: "AB"',
      'Query: undefined | Deferred: "AB"',
    ],
    correctOptionIndex: 0,
    explanation: '`useDeferredValue` lags behind. On the initial render triggered by state change, React renders urgently with the new `query = "AB"` and the old `deferredQuery = "A"`. Then, in the background, React re-renders with `deferredQuery = "AB"`.',
    hint: 'Does useDeferredValue update immediately or lag by one render cycle?',
  },
  {
    id: 'ch-187',
    title: 'useDeferredValue vs Debounce Distinction',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'useDeferredValue',
    question: 'Why is `useDeferredValue` NOT the same as a debounce (e.g. `setTimeout(..., 300)`)?',
    options: [
      '`useDeferredValue` has no fixed millisecond timer; it adapts dynamically to device speed, rendering immediately on fast machines and deferring interruptibly on slow devices',
      'Debounce is a React hook while useDeferredValue is a CSS property',
      'useDeferredValue cancels HTTP requests over the network',
      'They are identical under the hood',
    ],
    correctOptionIndex: 0,
    explanation: 'A debounce forces users on high-end hardware to wait an artificial 300ms. `useDeferredValue` starts rendering as fast as the device can handle, yielding to user input if new keystrokes arrive without arbitrary fixed delays.',
    hint: 'Does useDeferredValue use a fixed millisecond delay?',
  },
  {
    id: 'ch-188',
    title: 'useDeferredValue Requires Memoized Child',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'useDeferredValue',
    question: 'Why must the child component consuming `deferredValue` be wrapped in `React.memo` for the optimization to work?',
    codeSnippet: `function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {/* BUG: HeavyList is NOT memoized! */}
      <HeavyList query={deferredQuery} />
    </div>
  );
}`,
    options: [
      'If HeavyList is not memoized, it will still re-render on the first pass when SearchPage re-renders, rendering with the old query and blocking the UI anyway!',
      'HeavyList will crash without React.memo',
      'useDeferredValue only works on strings',
      'React.memo is required for all components in React 18',
    ],
    correctOptionIndex: 0,
    explanation: 'When `SearchPage` renders with the new `query`, it re-evaluates its JSX. If `<HeavyList />` is not wrapped in `React.memo`, it re-renders unconditionally on that urgent first pass, completely defeating the purpose of deferral! `React.memo` allows it to bail out on pass #1 because `deferredQuery` has not changed yet.',
    hint: 'What does a parent re-render do to un-memoized child components?',
  },
  {
    id: 'ch-189',
    title: 'Detecting Stale State for Dimmed UI Styling',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'useDeferredValue',
    question: 'How can you detect that a deferred value is currently stale to visually dim the results list?',
    options: [
      'Compare current and deferred values: `const isStale = query !== deferredQuery; <div style={{ opacity: isStale ? 0.6 : 1 }}>`',
      'useDeferredValue returns an isPending flag',
      'Check if window.isDeferred is true',
      'Check if deferredQuery === null',
    ],
    correctOptionIndex: 0,
    explanation: 'Because `useDeferredValue` does not return an `isPending` boolean, checking `query !== deferredQuery` is the idiomatic way to detect when a background update is lagging behind current state.',
    hint: 'How can you tell if the deferred value hasn\'t caught up to the current value yet?',
  },
  {
    id: 'ch-190',
    title: 'Initial Value Parameter in React 19',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'useDeferredValue',
    question: 'What new parameter did React 19 add to `useDeferredValue` to improve initial SSR hydration and mounting?',
    options: [
      '`initialValue`: `useDeferredValue(value, initialValue)` allowing components to render a lightweight placeholder on initial mount before deferring',
      'timeoutMs',
      'priorityLane',
      'debounceRate',
    ],
    correctOptionIndex: 0,
    explanation: 'In React 19, `useDeferredValue(value, initialValue)` allows you to specify what value to return on initial component mount, deferring the first heavy render pass until after initial paint.',
    hint: 'What optional second argument can provide a placeholder on initial mount in React 19?',
  },
  {
    id: 'ch-191',
    title: 'useDeferredValue vs useTransition Choice',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'useDeferredValue',
    question: 'You receive a prop `searchTerm` from a parent component that you cannot modify. You need to defer filtering based on this prop. Which hook do you choose?',
    options: [
      'useDeferredValue: because you receive a value and do not have access to the upstream `setState` call needed by `useTransition`',
      'useTransition',
      'useLayoutEffect',
      'useRef',
    ],
    correctOptionIndex: 0,
    explanation: '`useTransition` requires access to the state setter (`startTransition(() => setState(...))`). When you only receive a value (via props or external hooks) and cannot wrap the source setter, `useDeferredValue` is the tool designed specifically for this.',
    hint: 'Do you have access to the state setter or only the prop value?',
  },
  {
    id: 'ch-192',
    title: 'useDeferredValue with Suspense Fallbacks',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'useDeferredValue',
    question: 'How does passing a deferred value to a Suspense-enabled query prevent jarring fallback spinners?',
    options: [
      'React sees that the deferred value is pending and keeps the previous query results on screen instead of triggering the Suspense fallback skeleton',
      'Suspense is disabled by useDeferredValue',
      'It downloads data before rendering',
      'It caches data in indexedDB',
    ],
    correctOptionIndex: 0,
    explanation: 'When a deferred value causes a component to suspend, React prevents the Suspense boundary from falling back to a loading indicator. It keeps the existing content visible until the new deferred data has resolved.',
    hint: 'How does deferring values interact with already-visible Suspense content?',
  },
  {
    id: 'ch-193',
    title: 'Deferring Complex Graphs and Canvas',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'useDeferredValue',
    question: 'A slider controls zoom level on a massive SVG chart with 10,000 nodes. How does `useDeferredValue` improve user experience?',
    options: [
      'The slider thumb moves with 0 latency at 60fps immediately, while the complex SVG chart re-renders smoothly at its own pace without stuttering the thumb',
      'It reduces the number of SVG nodes to 10',
      'It converts SVG to PNG automatically',
      'It disables user dragging',
    ],
    correctOptionIndex: 0,
    explanation: 'By deferring the zoom prop passed to the SVG chart, user dragging events remain completely unblocked and fluid. React computes new chart positions in the background and renders updates whenever the main thread has idle time.',
    hint: 'How does separating urgent thumb movement from heavy SVG recalculation help?',
  },
],
  "Suspense": [
  {
    id: 'ch-194',
    title: 'Thrown Promise Protocol in Suspense',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'Suspense',
    question: 'How does a data fetching library or hook notify React Suspense that data is still pending?',
    options: [
      'The component function throws a `Promise` (or uses `use(promise)` in React 19); React catches the thrown promise at the nearest `<Suspense>` boundary and renders its fallback',
      'The component returns `<Suspense>`',
      'The component calls window.suspend()',
      'React polls the component every 10ms',
    ],
    correctOptionIndex: 0,
    explanation: 'Suspense works via JavaScript\'s exception mechanism: when data is missing, the reading function throws the pending `Promise`. React catches it, mounts the `<Suspense fallback={...}>`, attaches a `.then()` listener to the promise, and restarts the render when it resolves.',
    hint: 'What does a suspended component throw during its render phase?',
  },
  {
    id: 'ch-195',
    title: 'Granular Suspense Boundaries Placement',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Suspense',
    question: 'A dashboard contains Header (fast), Profile (fast), and AnalyticsChart (takes 3s). Where should the `<Suspense>` boundary be placed?',
    options: [
      'Wrap only `<AnalyticsChart />` in its own `<Suspense fallback={<ChartSkeleton />}>` so Header and Profile appear immediately without delay',
      'Wrap the entire `<App />` in a single Suspense boundary',
      'Suspense boundaries should never be used on charts',
      'Wrap every single HTML div in its own boundary',
    ],
    correctOptionIndex: 0,
    explanation: 'Granular Suspense boundaries prevent fast components from being held hostage by slow components. The header and profile render instantly, while only the chart displays a targeted skeleton.',
    hint: 'Should fast parts of the UI wait for slow parts to finish loading?',
  },
  {
    id: 'ch-196',
    title: 'Transitions Prevent Suspense Fallback Flickers',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'Suspense',
    question: 'When navigating to a new tab that suspends, how does wrapping the navigation in `startTransition` affect the visual experience?',
    options: [
      'React keeps the current screen visible and interactive while loading the new tab in the background, avoiding showing a jarring loading skeleton',
      'React immediately clears the screen and shows the fallback',
      'React aborts the navigation',
      'The transition fails with an error',
    ],
    correctOptionIndex: 0,
    explanation: 'Without a transition, suspending hides the existing UI and renders the fallback skeleton. With `startTransition`, React avoids hiding already-visible content, keeping the old tab on screen until the new tab has finished loading.',
    hint: 'What does startTransition do when a suspended render is triggered?',
  },
  {
    id: 'ch-197',
    title: 'Code Splitting with React.lazy and Suspense',
    type: 'fix_hook',
    difficulty: 'Beginner',
    category: 'Suspense',
    question: 'What is required around a component imported with `React.lazy()`?',
    codeSnippet: `const HeavyEditor = React.lazy(() => import('./HeavyEditor'));

function Page() {
  return <HeavyEditor />; // BUG: Missing boundary!
}`,
    options: [
      'Wrap it in a `<Suspense fallback={<Spinner />}>` boundary to catch the lazy chunk download',
      'Wrap it in a try/catch block',
      'Add a useEffect with import()',
      'React.lazy does not work in function components',
    ],
    correctOptionIndex: 0,
    explanation: '`React.lazy()` throws a promise while the JavaScript bundle chunk is downloading over the network. If there is no `<Suspense>` boundary above it in the tree, React throws an error.',
    hint: 'What React component must wrap lazy-loaded components to provide a fallback during download?',
  },
  {
    id: 'ch-198',
    title: 'Error Boundary Combined with Suspense',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Suspense',
    question: 'Why should every `<Suspense>` boundary typically be accompanied by or nested within an `<ErrorBoundary>`?',
    options: [
      'If the underlying promise rejects (e.g. 500 error or network failure), the ErrorBoundary catches the rejection and renders an error state instead of crashing the application',
      'Suspense will not compile without an ErrorBoundary',
      'Error boundaries speed up promise resolution',
      'They are required by HTML5 standards',
    ],
    correctOptionIndex: 0,
    explanation: 'Suspense handles the pending state of a Promise. If that Promise rejects with an error, it is re-thrown as an exception. An `ErrorBoundary` catches the failure and shows an error retry UI.',
    hint: 'What happens when a suspended promise rejects with a network error?',
  },
  {
    id: 'ch-199',
    title: 'Streaming SSR with Suspense HTML Chunks',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Suspense',
    question: 'How does Suspense work during Server-Side Streaming (`renderToPipeableStream`)?',
    options: [
      'The server immediately sends the fast HTML and Suspense fallback skeleton; when the slow data resolves on the server, it streams an inline `<script>` that replaces the fallback in-place with real content',
      'The server waits for all components to finish before sending any HTML',
      'Suspense only works in the browser',
      'The server converts the React app to static images',
    ],
    correctOptionIndex: 0,
    explanation: 'Streaming SSR sends an initial HTML document with fallback markup immediately. As slow components finish loading on the server, React streams subsequent chunks with the resolved HTML and an inline JS snippet to swap the template seamlessly into the DOM.',
    hint: 'How does the server stream content in chunks as data resolves?',
  },
  {
    id: 'ch-200',
    title: 'React 19 use(Promise) Hook',
    type: 'choose_hook',
    difficulty: 'Advanced',
    category: 'Suspense',
    question: 'How does React 19\'s new `use()` hook handle reading promises inside function components?',
    options: [
      '`const data = use(dataPromise);` unwraps the resolved value, or suspends the component if the promise is still pending',
      'use() replaces useState',
      'use() runs promises synchronously on the GPU',
      'use() is only allowed in loops',
    ],
    correctOptionIndex: 0,
    explanation: 'React 19 introduces the `use()` hook for consuming promises and contexts. Calling `use(promise)` pauses rendering and suspends the component until the promise settles, resolving directly to the promise\'s value.',
    hint: 'What new React 19 hook unwraps promises directly in render?',
  },
  {
    id: 'ch-201',
    title: 'Network Waterfall in Nested Suspense Boundaries',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Suspense',
    question: 'What performance issue occurs when Child Suspense components start fetching data ONLY after Parent Suspense finishes?',
    options: [
      'A sequential network waterfall: Child fetch is blocked until Parent finishes, doubling the total time to render compared to initiating fetches in parallel',
      'React crashes with a deadlock error',
      'Both components load simultaneously',
      'The child component will never mount',
    ],
    correctOptionIndex: 0,
    explanation: 'If Component B is rendered inside Component A, and B starts fetching only when it mounts, B cannot begin downloading until A has finished loading and mounted. Initiating requests in parallel at route level eliminates waterfalls.',
    hint: 'What happens when data fetching is tied to component render lifecycles sequentially?',
  },
],
  "Performance": [
  {
    id: 'ch-202',
    title: 'Profiler Base vs Actual Duration',
    type: 'predict',
    difficulty: 'Advanced',
    category: 'Performance',
    question: 'In the React DevTools Profiler, what does it indicate when a component\'s "Actual duration" is 1ms while its "Base duration" is 45ms?',
    options: [
      'The component\'s memoization succeeded: React reused previously rendered children or bailed out of expensive calculations during this commit',
      'The component was unmounted',
      'The component failed to render due to an error',
      'Base duration is always smaller than actual duration',
    ],
    correctOptionIndex: 0,
    explanation: 'Base duration represents the estimated time to render the entire subtree from scratch with zero memoization. An actual duration of 1ms means memoization (like `React.memo` or `useMemo`) successfully skipped almost all the work in that commit.',
    hint: 'What does a low actual duration relative to base duration tell you about memoization?',
  },
  {
    id: 'ch-203',
    title: 'Render Bottleneck vs Commit Bottleneck',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Performance',
    question: 'A page is sluggish. In React Profiler, render time is 2ms, but the commit phase takes 120ms. What is the actual bottleneck?',
    options: [
      'The DOM mutation or browser layout/paint phase: too many DOM nodes are being inserted/removed at once, or `useLayoutEffect` is running heavy synchronous DOM measurements',
      'The JavaScript component logic is slow',
      'useMemo is missing on array calculations',
      'useState is executing too many math operations',
    ],
    correctOptionIndex: 0,
    explanation: 'A 2ms render time means JavaScript diffing is extremely fast. A 120ms commit time indicates the browser is choked by manipulating thousands of physical DOM nodes, layout thrashing, or heavy synchronous `useLayoutEffect` operations. Solution: virtualize DOM nodes or eliminate synchronous DOM reflows.',
    hint: 'Does commit time measure JavaScript calculations or DOM mutation and layout effects?',
  },
  {
    id: 'ch-204',
    title: 'Profiling Development vs Production Builds',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'Performance',
    question: 'Why must performance profiling ALWAYS be conducted on a Production build with profiling enabled (`react-dom/profiling`) rather than a Development build?',
    options: [
      'Development builds contain heavy debugging checks, Strict Mode double renders, warning validation, and unminified code that completely distort real-world timings',
      'The Profiler tab is disabled in development',
      'Production builds have no JavaScript',
      'Timings are identical in both environments',
    ],
    correctOptionIndex: 0,
    explanation: 'React development mode is 3x to 10x slower than production due to prop validation, internal Fiber safety assertions, and dev warnings. Profiling development builds leads to chasing false bottlenecks.',
    hint: 'How do development safety checks impact timing measurements?',
  },
  {
    id: 'ch-205',
    title: 'State Colocation Optimization',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'Performance',
    question: 'A modal dialog\'s `isOpen` state is declared in the root `<Dashboard />` component. Every time the modal opens, the entire dashboard and all 20 charts re-render. How do you fix this without memoization?',
    options: [
      'Colocate state: move `isOpen` down into the specific button/modal subcomponent that actually needs it, so opening the modal does not re-render `<Dashboard />`',
      'Add React.memo to all 20 chart components',
      'Move isOpen to localStorage',
      'Change useState to useRef',
    ],
    correctOptionIndex: 0,
    explanation: 'State colocation is the most effective optimization in React: push state as close as possible to the components that consume it. If only the modal cares about `isOpen`, moving state down prevents the root parent and siblings from re-rendering at all.',
    hint: 'Where should state live relative to the components that actually use it?',
  },
  {
    id: 'ch-206',
    title: 'Children as Props Lifted Tree Optimization',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'Performance',
    question: 'In this component, `<ExpensiveChild />` re-renders every time `ScrollContainer` updates its scroll position. How can you prevent `ExpensiveChild` from re-rendering WITHOUT using `React.memo`?',
    codeSnippet: `function ScrollContainer() {
  const [scroll, setScroll] = useState(0);

  return (
    <div onScroll={e => setScroll(e.target.scrollTop)}>
      <Header scroll={scroll} />
      <ExpensiveChild />
    </div>
  );
}`,
    options: [
      'Pass `ExpensiveChild` as a `children` prop from a parent: `function Page() { return <ScrollContainer><ExpensiveChild /></ScrollContainer>; }`',
      'Wrap setScroll in setTimeout',
      'Change ExpensiveChild to a pure HTML tag',
      'Remove onScroll',
    ],
    correctOptionIndex: 0,
    explanation: 'When `ExpensiveChild` is instantiated in `Page` and passed as `children` into `ScrollContainer`, its React element was created in `Page`. When `ScrollContainer` re-renders due to scroll state, `children` retains the exact same element reference, so React skips diffing `<ExpensiveChild />`!',
    hint: 'What happens when child elements are created in a parent component that does not re-render?',
  },
  {
    id: 'ch-207',
    title: 'Virtualization for 10,000 Rows',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'Performance',
    question: 'A table displays 10,000 transactions. Rendering all 10,000 rows causes the browser to freeze for 2 seconds and consume 300MB of RAM. What is the correct solution?',
    options: [
      'Windowing / Virtualization (`@tanstack/react-virtual` or `react-window`) to render only the ~25 rows currently visible inside the viewport',
      'Wrapping every row in React.memo',
      'Wrapping the rows in useMemo',
      'Using CSS opacity: 0 on offscreen rows',
    ],
    correctOptionIndex: 0,
    explanation: 'No amount of `useMemo` or `React.memo` helps if 10,000 DOM nodes must be inserted into the DOM. Virtualization maintains only ~25-30 DOM elements at any time, positioning them dynamically as the user scrolls.',
    hint: 'How can you render only the items visible on screen?',
  },
  {
    id: 'ch-208',
    title: 'Forced Synchronous Layout Thrashing',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Performance',
    question: 'Why is reading `element.offsetHeight` and writing `element.style.height` inside a loop in `useLayoutEffect` terrible for performance?',
    options: [
      'It triggers "Layout Thrashing": the browser is forced to synchronously recalculate layout and styles on every loop iteration instead of batching reflows at the end',
      'useLayoutEffect does not support style mutations',
      'offsetHeight returns undefined in React',
      'The browser ignores style writes in loops',
    ],
    correctOptionIndex: 0,
    explanation: 'Alternating between reading layout geometry (`offsetHeight`) and writing layout properties (`style.height`) invalidates the browser\'s layout cache and forces a full synchronous layout reflow on each iteration (Layout Thrashing). Batch all reads first, then batch all writes.',
    hint: 'What happens when you alternate between reading and writing DOM geometry in a loop?',
  },
  {
    id: 'ch-209',
    title: 'CSS content-visibility Optimization',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'Performance',
    question: 'How can modern CSS improve the rendering speed of long pages with hundreds of complex cards without JavaScript virtualization libraries?',
    options: [
      'Apply CSS `content-visibility: auto; contain-intrinsic-size: 0 500px;` to allow the browser to skip layout and painting for offscreen cards',
      'Apply `display: none` to all cards',
      'Use `filter: blur(5px)`',
      'Set `z-index: 9999`',
    ],
    correctOptionIndex: 0,
    explanation: '`content-visibility: auto` instructs the browser engine to skip layout, painting, and rendering for offscreen elements until they approach the viewport, dramatically improving initial render and scroll performance with pure CSS.',
    hint: 'What CSS property allows the browser engine to skip rendering offscreen elements?',
  },
  {
    id: 'ch-210',
    title: 'Highlight Updates in React DevTools',
    type: 'architecture',
    difficulty: 'Beginner',
    category: 'Performance',
    question: 'What does enabling "Highlight updates when components render" in React DevTools do?',
    options: [
      'Draws colored rectangles around components on the live webpage whenever they re-render, visually highlighting unexpected or cascading re-renders',
      'Highlights syntax errors in your code editor',
      'Changes the theme to dark mode',
      'Measures network download speeds',
    ],
    correctOptionIndex: 0,
    explanation: 'Highlight Updates flashes colored boxes around DOM elements on screen when their React components render. If typing in an input causes the entire navbar, sidebar, and footer to flash, you immediately see render cascades visually.',
    hint: 'How does React DevTools visually show components that are actively rendering?',
  },
  {
    id: 'ch-211',
    title: 'Identifying Long Tasks (> 50ms)',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Performance',
    question: 'In browser performance standards, why is a JavaScript execution task exceeding 50ms considered a "Long Task"?',
    options: [
      'Tasks longer than 50ms block the browser main thread from processing user inputs, clicks, and frame rendering, directly degrading the INP (Interaction to Next Paint) metric',
      '50ms is the maximum memory allocation for Chrome',
      'Tasks over 50ms are terminated by the operating system',
      'React cannot execute tasks longer than 50ms',
    ],
    correctOptionIndex: 0,
    explanation: 'To maintain a responsive 60fps (16.6ms/frame) UI and respond to user inputs within 100ms, tasks must yield to the event loop quickly. Any task running > 50ms produces noticeable UI delay and is flagged as a Long Task.',
    hint: 'How does a 50ms+ continuous task on the main thread affect user input responsiveness?',
  },
  {
    id: 'ch-212',
    title: 'Offloading Heavy Calculations to Web Workers',
    type: 'optimize',
    difficulty: 'Advanced',
    category: 'Performance',
    question: 'A photo filter algorithm takes 400ms of synchronous CPU time. Even with `useTransition`, the browser freezes for 400ms. How do you prevent main-thread freezing?',
    options: [
      'Offload the calculation to a Web Worker (e.g. using `Comlink` or `workerize`) so it runs on a true separate OS thread without blocking the UI main thread',
      'Wrap it in useMemo',
      'Wrap it in useCallback',
      'Change the image format to SVG',
    ],
    correctOptionIndex: 0,
    explanation: 'React runs on the single main UI thread. Long synchronous calculations cannot be interrupted by React mid-function. Moving heavy computational workloads to a Web Worker executes the work on a background OS thread, keeping the main thread free for 60fps rendering.',
    hint: 'How can you run heavy JavaScript computations completely outside the main browser thread?',
  },
  {
    id: 'ch-213',
    title: 'INP (Interaction to Next Paint) Metric',
    type: 'architecture',
    difficulty: 'Expert',
    category: 'Performance',
    question: 'What does Google\'s Core Web Vital metric INP (Interaction to Next Paint) measure in a React application?',
    options: [
      'The time between a user interaction (click, keypress, tap) and the next frame where the browser presents the updated visual pixels on screen',
      'How fast server-side HTML downloads',
      'The time taken to download JavaScript bundles',
      'The duration of CSS transition animations',
    ],
    correctOptionIndex: 0,
    explanation: 'INP assesses page responsiveness across the entire session: Input Delay (waiting for main thread) + Processing Time (React render & layout effects) + Presentation Delay (browser compositing & painting).',
    hint: 'Does INP measure the latency from user interaction to pixel presentation on screen?',
  },
  {
    id: 'ch-214',
    title: 'Memory Leak from Detached DOM Tree',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Performance',
    question: 'What causes a "Detached DOM tree" memory leak when unmounting a React component?',
    options: [
      'A global event listener, timer, or outside JavaScript closure retains a reference to a DOM node that React has removed from the document, preventing the garbage collector from freeing it and its parents',
      'React forgot to call unmount()',
      'DOM nodes can never be garbage collected',
      'The browser tab ran out of disk space',
    ],
    correctOptionIndex: 0,
    explanation: 'If React removes a DOM element from the page, but an active global listener or ref variable still references that element, the browser cannot garbage collect it or its entire ancestor tree, causing hidden memory leaks.',
    hint: 'What happens to garbage collection if a removed DOM node is still referenced by an active closure?',
  },
  {
    id: 'ch-215',
    title: 'Dynamic Import Chunk Splitting',
    type: 'optimize',
    difficulty: 'Intermediate',
    category: 'Performance',
    question: 'A 2MB PDF rendering library is only needed when users click "Export PDF". How do you prevent it from inflating the initial bundle size for all users?',
    options: [
      'Load it dynamically on demand: `const { renderPDF } = await import("./pdfRenderer");` inside the export button click handler',
      'Import it statically at the top of the App file',
      'Include it in index.html as a synchronous script tag',
      'Compress it with zip',
    ],
    correctOptionIndex: 0,
    explanation: 'Dynamic `import()` splits the module into a separate JavaScript bundle chunk that is only downloaded when the user actually clicks the export button, keeping the initial page load fast and lean.',
    hint: 'How can you delay importing code until the user clicks a specific button?',
  },
  {
    id: 'ch-216',
    title: 'Performance Budget Enforcement in CI/CD',
    type: 'architecture',
    difficulty: 'Expert',
    category: 'Performance',
    question: 'What is the most effective way to prevent performance regressions in a large team codebase?',
    options: [
      'Establish quantitative automated performance budgets (e.g. bundle size limits via bundlesize/Lighthouse CI) in pull request CI checks to block regressions before merging',
      'Ask developers to manually check page speed once a year',
      'Disable all animations',
      'Write comments in code asking developers to keep it fast',
    ],
    correctOptionIndex: 0,
    explanation: 'Enforcing automated PR gates with bundle analyzers and Lighthouse CI ensures that any commit exceeding bundle size or interaction latency thresholds is flagged and blocked automatically before reaching production.',
    hint: 'How can performance standards be automatically validated on every pull request?',
  },
],
  "SSR & Hydration": [
  {
    id: 'ch-217',
    title: 'Hydration Mismatch Core Rule',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'SSR & Hydration',
    question: 'Why does React throw a hydration mismatch warning on this component?',
    codeSnippet: `function Clock() {
  // BUG: Server timestamp differs from client timestamp!
  return <div>{new Date().toLocaleTimeString()}</div>;
}`,
    options: [
      'The server renders HTML at timestamp T0, but the client renders at timestamp T1; React detects that the initial client virtual DOM does not match the server HTML',
      'toLocaleTimeString is not a valid JavaScript method',
      'Dates cannot be rendered in JSX',
      'Clock must be a class component',
    ],
    correctOptionIndex: 0,
    explanation: 'During hydration, React walks the pre-rendered server DOM and expects the client\'s initial render to produce the exact same HTML tree. If they differ, React warns of a mismatch and is forced to discard the server HTML.',
    hint: 'Will new Date() evaluate to the exact same millisecond on both server and browser?',
  },
  {
    id: 'ch-218',
    title: 'Window Undefined on Server Crash',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'SSR & Hydration',
    question: 'Why does this component crash during Server-Side Rendering?',
    codeSnippet: `function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth); // BUG
  return <div>Width: {width}</div>;
}`,
    options: [
      'The `window` global object only exists in web browsers; Node.js server environments throw `ReferenceError: window is not defined`',
      'innerWidth cannot be stored in state',
      'useState does not work on the server',
      'setWidth must be called immediately',
    ],
    correctOptionIndex: 0,
    explanation: 'Server environments (Node.js/Bun) have no browser window or screen geometry. Accessing browser globals (`window`, `document`, `localStorage`) directly in the render body causes server crashes. Read them inside `useEffect` or guard with `typeof window !== "undefined"`.',
    hint: 'Does a Node.js server have a window object?',
  },
  {
    id: 'ch-219',
    title: 'suppressHydrationWarning Attribute',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'SSR & Hydration',
    question: 'When rendering unavoidable server/client differences (e.g. current date or localized currency), what React attribute silences the mismatch warning on that element?',
    options: [
      '`suppressHydrationWarning={true}` on the specific DOM element',
      '`ignoreErrors={true}`',
      '`data-hydrate="false"`',
      '`noWarning={true}`',
    ],
    correctOptionIndex: 0,
    explanation: 'React provides `suppressHydrationWarning={true}` (one level deep on HTML elements) to tell the reconciler that a mismatch in text content or attributes is expected and should not trigger console warnings.',
    hint: 'What React prop is specifically built to silence expected hydration discrepancies?',
  },
  {
    id: 'ch-220',
    title: 'Client-Only Component Mount Pattern',
    type: 'fix_hook',
    difficulty: 'Intermediate',
    category: 'SSR & Hydration',
    question: 'What is the standard two-pass pattern to render a component ONLY on the client browser without hydration mismatch warnings?',
    options: [
      'const [hasMounted, setHasMounted] = useState(false); useEffect(() => setHasMounted(true), []); if (!hasMounted) return null; return <ClientOnlyComponent />;',
      'if (typeof window !== "undefined") return <ClientOnlyComponent />;',
      'Use useMemo with empty dependencies',
      'Wrap in setTimeout',
    ],
    correctOptionIndex: 0,
    explanation: 'During SSR and initial hydration, `hasMounted` is false, so both server and client render `null` (matching 100%). After hydration completes, `useEffect` fires only on the browser and sets `hasMounted(true)`, rendering the client-only feature cleanly.',
    hint: 'How can you guarantee that both the server and the initial browser render pass output the exact same markup?',
  },
  {
    id: 'ch-221',
    title: 'useId for Server-Client ID Consistency',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'SSR & Hydration',
    question: 'Why was the `useId()` hook introduced in React 18 instead of using `Math.random()` or a global incrementing counter for accessibility IDs?',
    options: [
      '`useId` generates unique, deterministic IDs based on component tree position that match IDENTICALLY between the server render and client hydration',
      'useId is faster than Math.random',
      'Math.random does not work in TypeScript',
      'useId is only for CSS class names',
    ],
    correctOptionIndex: 0,
    explanation: 'If a global counter or `Math.random()` generates IDs, the server and client will generate conflicting numbers, breaking hydration and accessibility links. `useId` derives stable IDs from Fiber tree position, guaranteeing server-client match.',
    hint: 'How can you guarantee that an accessible label ID generated on the server matches the client ID?',
  },
  {
    id: 'ch-222',
    title: 'Selective Hydration with Suspense',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'SSR & Hydration',
    question: 'How does React 18 Selective Hydration prioritize which component to hydrate first when a user clicks on an un-hydrated section of the page?',
    options: [
      'React catches the user click, pauses hydrating other sections, and immediately prioritizes hydrating the clicked component synchronously to respond to the interaction',
      'React blocks the click until the entire page is hydrated',
      'React ignores the click completely',
      'React reloads the webpage',
    ],
    correctOptionIndex: 0,
    explanation: 'With `<Suspense>` boundaries during streaming SSR, React does not need to hydrate the whole page all at once. If a user clicks an unhydrated comment while the sidebar is hydrating, React pivots and hydrates the comment section immediately to handle the click.',
    hint: 'What does React do when a user interacts with a component that hasn\'t been hydrated yet?',
  },
  {
    id: 'ch-223',
    title: 'renderToString vs renderToPipeableStream',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'SSR & Hydration',
    question: 'Why is `renderToPipeableStream` preferred over legacy `renderToString` in modern React Server environments?',
    options: [
      '`renderToPipeableStream` supports streaming Suspense HTML chunks as they resolve, without blocking the entire initial HTML response on slow backend queries',
      'renderToString was removed in React 17',
      'renderToPipeableStream only works on Apache servers',
      'renderToString cannot render images',
    ],
    correctOptionIndex: 0,
    explanation: '`renderToString` is an all-or-nothing synchronous call: if one slow database query takes 3 seconds, the entire response is blocked. `renderToPipeableStream` sends the initial shell immediately and streams slow pieces as they finish.',
    hint: 'Does streaming allow sending HTML before all database calls complete?',
  },
  {
    id: 'ch-224',
    title: 'HTML Tag Nesting Hydration Crash',
    type: 'find_bug',
    difficulty: 'Intermediate',
    category: 'SSR & Hydration',
    question: 'Why does nesting a `<div>` inside a `<p>` tag (`<p><div>Hello</div></p>`) trigger severe hydration warnings in browsers?',
    options: [
      'HTML specification forbids block elements inside `<p>`; the browser HTML parser automatically closes the `<p>` before `<div>`, corrupting the DOM structure that React expects to hydrate',
      'React only supports paragraph tags in CSS',
      'div tags cannot contain text',
      'div tags require a role attribute',
    ],
    correctOptionIndex: 0,
    explanation: 'The browser\'s native HTML parser will auto-repair `<p><div>` into `<p></p><div></div>`. When React\'s client reconciler hydrates the tree, the actual DOM no longer matches the JSX hierarchy, triggering mismatch errors.',
    hint: 'What does the browser\'s HTML parser do when a block element is placed inside a paragraph tag?',
  },
],
  "Server Components": [
  {
    id: 'ch-225',
    title: 'Zero Bundle Size in Server Components',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Server Components',
    question: 'A React Server Component imports a 300KB markdown parsing library (`marked`) and an internal database client. How much of this code is included in the client JavaScript bundle sent to the browser?',
    options: [
      '0 KB: Server Components run strictly on the server; their code, dependencies, and imports are never downloaded by the client browser',
      '300 KB',
      '150 KB (gzipped)',
      'The entire database client is sent to the browser',
    ],
    correctOptionIndex: 0,
    explanation: 'Because Server Components execute exclusively on the server, their npm dependencies and source code are stripped from client bundles. Only the serialized rendered output (JSX virtual representation) is streamed over the wire.',
    hint: 'Do React Server Components send their JavaScript dependencies to the client browser?',
  },
  {
    id: 'ch-226',
    title: 'useState Forbidden in Server Components',
    type: 'find_bug',
    difficulty: 'Beginner',
    category: 'Server Components',
    question: 'What happens if you attempt to call `useState` or `useEffect` inside a React Server Component (without `"use client"`)?',
    codeSnippet: `// Server Component (default):
import db from './db';

export default function Feed() {
  const [likes, setLikes] = useState(0); // BUG!
  return <div>Likes: {likes}</div>;
}`,
    options: [
      'React throws an error: `useState` and `useEffect` can only be used in Client Components; you must add the `"use client"` directive at the top of the file',
      'useState works normally on the server',
      'The server converts useState to database queries',
      'The component is ignored',
    ],
    correctOptionIndex: 0,
    explanation: 'Server Components have no browser lifecycle, event listeners, or client-side re-render loop. Stateful interactive hooks (`useState`, `useReducer`, `useEffect`) are only permitted in Client Components marked with `"use client"`.',
    hint: 'Can server-rendered components maintain browser state or lifecycles?',
  },
  {
    id: 'ch-227',
    title: 'Passing Functions Across use client Boundary',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'Server Components',
    question: 'A Server Component renders a Client Component `<ClientButton onClick={handleClick} />`. What happens when `handleClick` is a function defined in the Server Component?',
    options: [
      'React throws an error: Functions cannot be serialized across the network boundary between Server and Client Components (unless declared as a "use server" Server Action)',
      'The function executes seamlessly on the client',
      'The function is converted to text',
      'React converts the button to a link',
    ],
    correctOptionIndex: 0,
    explanation: 'Props passed from Server Components to Client Components must be serializable over JSON (strings, numbers, arrays, plain objects, JSX elements). Arbitrary JavaScript functions cannot be serialized across the network boundary unless they are explicitly marked as Server Actions (`"use server"`).',
    hint: 'Can plain JavaScript functions be serialized into a JSON-like network payload?',
  },
  {
    id: 'ch-228',
    title: 'Async Function Server Components',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Server Components',
    question: 'How do React Server Components fetch data without `useEffect` or client-side fetch hooks?',
    codeSnippet: `// Server Component:
export default async function ProductPage({ id }) {
  const product = await db.products.findById(id);
  return <h1>{product.name}</h1>;
}`,
    options: [
      'Server Components can be native `async` JavaScript functions that directly `await` database queries, microservices, or filesystems right in their render body',
      'Server Components require Redux Thunks',
      'Async functions are forbidden in React components',
      'db.query must be called inside setTimeout',
    ],
    correctOptionIndex: 0,
    explanation: 'Because Server Components run on the backend, they can be `async` functions that directly query databases or internal APIs using standard `await`, completely eliminating client fetch waterfalls, loading spinners, and boilerplate `useEffect` hooks.',
    hint: 'Can a Server Component function be declared as async?',
  },
  {
    id: 'ch-229',
    title: 'Passing Server Component as Children to Client Component',
    type: 'architecture',
    difficulty: 'Advanced',
    category: 'Server Components',
    question: 'How can an interactive Client Component (e.g. `<CollapsiblePanel>`) wrap a non-interactive Server Component (e.g. `<HeavyServerTable />`) without converting the table into a Client Component?',
    options: [
      'Pass the Server Component as a `children` prop: `<CollapsiblePanel><HeavyServerTable /></CollapsiblePanel>` in a Server Component parent',
      'It is impossible: importing anything into a Client Component makes it a Client Component',
      'Wrap it in an iframe',
      'Convert HeavyServerTable to CSS',
    ],
    correctOptionIndex: 0,
    explanation: 'Component composition preserves boundaries! The Server Component parent renders `<HeavyServerTable />` on the server and passes the resulting virtual element as `children` into `<CollapsiblePanel>`. The table code never gets shipped to the client!',
    hint: 'How does the children prop allow server-rendered elements to be passed into client wrappers?',
  },
  {
    id: 'ch-230',
    title: 'The RSC Stream Format Nature',
    type: 'architecture',
    difficulty: 'Expert',
    category: 'Server Components',
    question: 'When a Server Component re-renders on the server, what is the format of the response streamed to the client browser?',
    options: [
      'A compact JSON-like representation of the virtual element tree (RSC payload) containing client component boundary references, props, and DOM tags, NOT raw HTML',
      'A raw HTML file that completely replaces the DOM',
      'A compiled WebAssembly binary',
      'A base64 encoded screenshot',
    ],
    correctOptionIndex: 0,
    explanation: 'The RSC protocol streams a special JSON-like virtual representation. When it arrives, React merges the updated elements into the client Fiber tree without wiping out active client state (such as input focus, form text, or scroll position).',
    hint: 'Does RSC return raw HTML or a serializable representation of virtual React elements?',
  },
  {
    id: 'ch-231',
    title: 'Meaning of use client Directive',
    type: 'architecture',
    difficulty: 'Beginner',
    category: 'Server Components',
    question: 'What does the `"use client"` directive at the top of a file actually mean in React Server Component architecture?',
    options: [
      'It defines a "boundary" between server and client modules, instructing the bundler to package this file and its dependencies into the client JavaScript bundle',
      'It means this component NEVER renders on the server under any circumstances',
      'It enables client-side cookies only',
      'It is a comment ignored by bundlers',
    ],
    correctOptionIndex: 0,
    explanation: '`"use client"` does NOT mean "only render on client". Client components still pre-render to HTML on the server during initial SSR! It simply marks the cutoff boundary where modules must be bundled and sent to the browser for client interactivity.',
    hint: 'Do Client Components still pre-render to HTML during server-side rendering?',
  },
  {
    id: 'ch-232',
    title: 'Direct Database Access Security',
    type: 'architecture',
    difficulty: 'Intermediate',
    category: 'Server Components',
    question: 'Why is reading API secret keys (`process.env.STRIPE_SECRET_KEY`) safe inside a Server Component but dangerous in a Client Component?',
    options: [
      'Server Components run exclusively on your secure server and are never sent to the browser; Client Components are bundled and visible to anyone in browser DevTools',
      'React encrypts client components with AES-256',
      'Browser DevTools cannot inspect Client Components',
      'Secret keys are deleted after build',
    ],
    correctOptionIndex: 0,
    explanation: 'Any code in a Client Component file is compiled into client JS bundles, exposing secret keys to anyone inspecting the Network tab. Server Components run in your secure backend infrastructure where environment secrets stay protected.',
    hint: 'Which component type has its source code bundled and shipped to public user browsers?',
  },
],
  "External Stores": [
  {
    id: 'ch-233',
    title: 'useSyncExternalStore getSnapshot Mutation Loop',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'External Stores',
    question: 'Why does this `useSyncExternalStore` subscription enter an infinite re-render loop?',
    codeSnippet: `function useOnlineUserCount() {
  return useSyncExternalStore(
    subscribeToStore,
    // BUG in getSnapshot:
    () => ({ count: store.getCount() })
  );
}`,
    options: [
      '`getSnapshot` returns a brand new object literal `{ count: ... }` on every invocation; React compares previous and next snapshots with `Object.is`, sees they differ, and triggers endless re-renders',
      'useSyncExternalStore does not support objects',
      'subscribeToStore must be async',
      'store.getCount() must be an array',
    ],
    correctOptionIndex: 0,
    explanation: '`getSnapshot` must return an immutable cached reference or a primitive value. Because `() => ({ ... })` creates a new object in memory every time React checks for store mutations, `Object.is(prevSnapshot, nextSnapshot)` is ALWAYS false, looping infinitely.',
    hint: 'Does returning a new object reference from getSnapshot tell React that the store changed?',
  },
  {
    id: 'ch-234',
    title: 'Why useEffect and useState Subscriptions Cause Tearing',
    type: 'architecture',
    difficulty: 'Expert',
    category: 'External Stores',
    question: 'Why does subscribing to an external store using legacy `useState` + `useEffect` fail in Concurrent React?',
    options: [
      'In concurrent mode, renders can be paused or deferred; if an external store mutates while a render is paused, components render conflicting data (tearing) because useEffect runs after the commit',
      'useEffect cannot access variables outside React',
      'useState is deprecated for stores',
      'External stores crash if useEffect is used',
    ],
    correctOptionIndex: 0,
    explanation: '`useSyncExternalStore` was specifically introduced in React 18 for Redux, Zustand, and external stores to guarantee that store reads are synchronized with concurrent time-slicing and SSR hydration, completely preventing visual tearing.',
    hint: 'What happens if a non-React store updates while React has paused a concurrent render?',
  },
  {
    id: 'ch-235',
    title: 'useSyncExternalStore for Browser Online Status',
    type: 'choose_hook',
    difficulty: 'Intermediate',
    category: 'External Stores',
    question: 'What is the modern, tear-free React 18+ hook to subscribe to browser `navigator.onLine`?',
    codeSnippet: `function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true // SSR snapshot
  );
}`,
    options: [
      'The code is correct: useSyncExternalStore subscribes to browser events, reads client snapshot, and provides a server fallback',
      'useOnlineStatus should use useLayoutEffect instead',
      'navigator.onLine cannot be read synchronously',
      'window.addEventListener is forbidden in React',
    ],
    correctOptionIndex: 0,
    explanation: 'This is the official recommended implementation from the React documentation for subscribing to native browser APIs with concurrent safety and SSR support.',
    hint: 'Does useSyncExternalStore cleanly wrap browser event subscriptions?',
  },
  {
    id: 'ch-236',
    title: 'getServerSnapshot Requirement for SSR',
    type: 'find_bug',
    difficulty: 'Advanced',
    category: 'External Stores',
    question: 'Why is omitting the 3rd argument (`getServerSnapshot`) in `useSyncExternalStore` an error when using Server-Side Rendering (SSR)?',
    options: [
      'The server has no browser window/store; without `getServerSnapshot`, React cannot determine the initial state to render during HTML generation, throwing an error',
      'The 3rd argument is only for CSS styles',
      'getServerSnapshot is optional and never needed',
      'It causes client-side memory leaks',
    ],
    correctOptionIndex: 0,
    explanation: 'During SSR, React calls `getServerSnapshot()` to generate matching HTML on the server. If this function is missing, React throws a warning during server rendering and falls back to client rendering.',
    hint: 'How does the server know what value to pre-render when the client store doesn\'t exist on the server?',
  },
  {
    id: 'ch-237',
    title: 'Selector Subscriptions via useSyncExternalStore',
    type: 'architecture',
    difficulty: 'Expert',
    category: 'External Stores',
    question: 'How do libraries like Zustand and Redux achieve selector-based subscription efficiency using `useSyncExternalStore`?',
    options: [
      'The `getSnapshot` callback passes the raw store through the selector (`() => selector(store.getState())`); React only schedules a re-render if the selected value changed according to `Object.is`',
      'They re-render the entire component tree on every store change',
      'They compile selectors to WebAssembly',
      'They inject script tags into the document head',
    ],
    correctOptionIndex: 0,
    explanation: 'By returning the result of the selector from `getSnapshot`, React compares `Object.is(prevSelected, nextSelected)`. If unrelated parts of the store update, the selector returns the exact same reference, and React completely skips re-rendering!',
    hint: 'How does comparing the selector result with Object.is prevent re-renders?',
  },
],
  "Production Bugs": [
  {
    id: 'ch-238',
    title: 'Incident: Dashboard 4x Slower After Adding Context',
    type: 'debug',
    difficulty: 'Advanced',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: Following the introduction of a global `<AppContext>`, the dashboard frame rate dropped from 60fps to 14fps. The context holds `{ user, theme, notifications, telemetry }`. Real-time telemetry updates arrive every 500ms. What is the root cause?',
    options: [
      'Every telemetry update changes the context object reference, forcing hundreds of unrelated dashboard widgets to re-render twice a second regardless of whether they consume telemetry',
      'Context has an internal 10MB memory ceiling',
      'Telemetry data cannot be serialized by React',
      'The browser throttles WebSocket connections',
    ],
    correctOptionIndex: 0,
    explanation: 'Putting high-frequency telemetry in a monolithic Context that wraps the entire dashboard forces every single consumer to re-render on every tick. Solution: split `TelemetryContext` into its own isolated provider, or use a selector store like Zustand.',
    hint: 'How often does telemetry update, and what does that do to the context value reference?',
  },
  {
    id: 'ch-239',
    title: 'Incident: Users Seeing Previous Account Data',
    type: 'debug',
    difficulty: 'Expert',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: When User A logs out and User B logs in on the same browser, User B briefly sees User A\'s cached profile settings. What architectural flaw causes this cross-user data leak?',
    options: [
      'The client cache (e.g. TanStack Query or module-level store) was not invalidated/cleared on logout, and the component tree was not remounted with a new `key={userId}`',
      'The browser refused to clear cookies',
      'React shares Fiber nodes between different browser sessions',
      'JavaScript closures leak across different devices',
    ],
    correctOptionIndex: 0,
    explanation: 'Module-scoped stores and query caches persist in browser memory as long as the page is not hard-reloaded. On logout, `queryClient.clear()` must be called, and the root authenticated tree should be keyed with `key={user.id}` to cleanly destroy and reset all internal state.',
    hint: 'What happens to in-memory module state when a user logs out without a full browser reload?',
  },
  {
    id: 'ch-240',
    title: 'Incident: Search Input Freezes on 50,000 Items',
    type: 'debug',
    difficulty: 'Advanced',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: An internal inventory search input drops keystrokes and freezes the browser for 400ms when filtering a catalogue of 50,000 items. What is the immediate, non-blocking fix?',
    options: [
      'Separate urgent input typing from non-urgent list filtering using `useTransition` or `useDeferredValue`, and virtualize the rendered list with `@tanstack/react-virtual`',
      'Add React.memo to the input element',
      'Wrap the entire component in useMemo',
      'Convert the input to a submit form',
    ],
    correctOptionIndex: 0,
    explanation: 'The freeze is caused by rendering 50,000 items synchronously on every keystroke. Using `useTransition` allows input typing to remain immediate and urgent, while virtualization ensures only the ~30 visible items are rendered to the DOM.',
    hint: 'How can you decouple the urgent input keystrokes from the heavy list rendering?',
  },
  {
    id: 'ch-241',
    title: 'Incident: Duplicate WebSocket Connections',
    type: 'debug',
    difficulty: 'Intermediate',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: The backend team reports that single users are maintaining 2 to 4 simultaneous WebSocket connections, causing server resource exhaustion. Where is the bug?',
    codeSnippet: `useEffect(() => {
  const ws = new WebSocket(WS_URL);
  ws.onmessage = handleMsg;
  // Missing return cleanup function!
}, [roomId]);`,
    options: [
      'The effect lacks a cleanup function `return () => ws.close();`, so every time `roomId` changes or the component remounts, old connections stay open indefinitely',
      'WebSocket protocol is incompatible with useEffect',
      'The browser creates 2 sockets per tab automatically',
      'roomId must be passed in the constructor',
    ],
    correctOptionIndex: 0,
    explanation: 'Without `return () => ws.close();`, the previous WebSocket connection is abandoned but remains connected at the TCP/network level. Every time the component re-mounts or `roomId` changes, an additional connection is spawned.',
    hint: 'What closes the previous WebSocket connection when roomId changes?',
  },
  {
    id: 'ch-242',
    title: 'Incident: Form Inputs Scrambled After Item Deletion',
    type: 'debug',
    difficulty: 'Intermediate',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: In an invoice line-item builder, deleting Row #1 causes the text typed into Row #1 to jump to Row #2! What caused this bug?',
    options: [
      'The list uses array index `key={index}`: deleting index 0 causes index 1 to become index 0, so React matches it to the previous DOM input and preserves its uncontrolled text',
      'Row components must be pure CSS',
      'Deleting array items requires localStorage',
      'React deleted the wrong row internally',
    ],
    correctOptionIndex: 0,
    explanation: 'Index keys instruct React to reuse DOM nodes by index position. When item 0 is deleted, the old item 1 is now at index 0. React preserves the DOM node for index 0 (along with its uncontrolled text), corrupting the user input. Fix: use `key={item.id}`.',
    hint: 'What happens to element indices when an item at the beginning of an array is removed?',
  },
  {
    id: 'ch-243',
    title: 'Incident: Memoized Chart Rerendering Constantly',
    type: 'debug',
    difficulty: 'Intermediate',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: An expensive `<StockChart data={data} options={options} />` is wrapped in `React.memo`, but React DevTools Profiler shows it renders on every single parent state tick. What is the bug?',
    codeSnippet: `function Parent() {
  const [ticker, setTicker] = useState(0);
  const data = useMemo(() => fetchStockData(), []);

  return (
    <StockChart
      data={data}
      options={{ responsive: true, gridLines: false }} // BUG
    />
  );
}`,
    options: [
      '`options={{ ... }}` creates a new object on every render of Parent; React.memo\'s shallow equality check fails every time',
      'StockChart cannot use canvas',
      'useMemo cannot be used for data',
      'React.memo is broken in production',
    ],
    correctOptionIndex: 0,
    explanation: 'Passing inline object literals `{ responsive: true }` passes a new object reference on every render. Because `prevProps.options !== nextProps.options`, `React.memo` bails out of its optimization. Stabilize with `const OPTIONS = { ... }` outside the component.',
    hint: 'Inspect the props passed to StockChart: is any prop an inline object or function?',
  },
  {
    id: 'ch-244',
    title: 'Incident: 10,000 API Requests in 10 Seconds',
    type: 'debug',
    difficulty: 'Advanced',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: An infinite API fetch loop brought down the staging backend. Inspect the code and identify the fatal loop mechanism:',
    codeSnippet: `function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [users]); // Look closely
}`,
    options: [
      '`users` is declared in the dependency array: the effect fetches data, calls `setUsers(data)`, which updates `users`, which triggers the effect again, looping endlessly',
      'fetch cannot be called inside useEffect',
      'setUsers must be synchronous',
      'The API URL is malformed',
    ],
    correctOptionIndex: 0,
    explanation: 'Placing `users` in the dependency array of the effect that mutates `users` creates a vicious cycle: Render -> Effect runs -> setUsers -> New users array -> Effect triggers again -> setUsers -> Infinite loop. Dependencies should be `[]` (run once on mount).',
    hint: 'What does calling setUsers inside the effect do to the [users] dependency array?',
  },
  {
    id: 'ch-245',
    title: 'Incident: Flash of Broken Content on Production SSR',
    type: 'debug',
    difficulty: 'Intermediate',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: In production Next.js/SSR, the navbar briefly renders in English for 200ms before suddenly snapping to German, causing layout shift and console hydration warnings. What caused this?',
    options: [
      'The language was read directly from `localStorage.getItem("lang")` during render; because localStorage is missing on the server, the server rendered fallback English, while the client hydrated with German',
      'The German translation file was corrupted',
      'Next.js does not support German',
      'The user clicked the language switcher twice',
    ],
    correctOptionIndex: 0,
    explanation: 'Client-only storage (`localStorage`, cookies) not accessible to the server during SSR creates divergent markup. The server sends English HTML, and the client tries to hydrate German HTML. Solution: store language in cookies accessible to both server and client.',
    hint: 'Can the server read client browser localStorage during HTML generation?',
  },
  {
    id: 'ch-246',
    title: 'Incident: Duplicate Stripe Charges in Production',
    type: 'debug',
    difficulty: 'Expert',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: Users are occasionally charged twice when purchasing an item. The checkout call was placed in a `useEffect` triggered by `isSubmitting = true`. How does Strict Mode or concurrent rendering cause this, and what is the fix?',
    options: [
      'Effects can be executed multiple times or re-run on remount; payments are imperative user events and must be executed directly in the button\'s `onClick` handler, not in `useEffect`',
      'Stripe does not support React',
      'Buttons must be type="submit"',
      'useEffect is deprecated for payments',
    ],
    correctOptionIndex: 0,
    explanation: 'Rule of thumb: mutations, purchases, and transactional actions must ALWAYS live in UI event handlers (`handlePurchase`), never in `useEffect`. Effects are for synchronization with screen state, not for handling user clicks.',
    hint: 'Should payment transactions be triggered by an effect or directly inside the button click handler?',
  },
  {
    id: 'ch-247',
    title: 'Incident: Transition Yields No Performance Gain',
    type: 'debug',
    difficulty: 'Advanced',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: A team wrapped a heavy map calculation in `startTransition`, but the UI still freezes completely for 300ms. Why did `startTransition` fail to keep the UI responsive?',
    options: [
      'The component performs a synchronous, monolithic 300ms calculation inside a single JavaScript function; React yields between Fiber nodes, not mid-function execution',
      'startTransition is disabled on Google Chrome',
      'The state setter was missing from startTransition',
      'Transitions only work with numbers',
    ],
    correctOptionIndex: 0,
    explanation: 'React concurrency is cooperative: React checks if it should yield after processing a component Fiber. If a single component spends 300ms running a synchronous calculation, React cannot yield to the browser. The heavy work must be offloaded to a Web Worker or memoized.',
    hint: 'Can React interrupt a single long synchronous JavaScript loop inside a component body?',
  },
  {
    id: 'ch-248',
    title: 'Incident: Tab Crashes After 2 Hours of Usage',
    type: 'debug',
    difficulty: 'Intermediate',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: Customer support reports that the application tab crashes with "Out of Memory" after being open for a few hours. Chrome DevTools Heap Snapshot shows 500,000 event listeners on `window`. What bug caused this?',
    options: [
      'A component with `window.addEventListener("scroll", handleScroll)` re-rendered frequently or mounted repeatedly without removing the listener in an effect cleanup function',
      'Chrome has a bug with event listeners',
      'window.scroll requires WebGL',
      'The app was attacked by DDoS',
    ],
    correctOptionIndex: 0,
    explanation: 'Failing to clean up global event listeners (`window.removeEventListener`) leaves listeners attached in browser memory forever. Every time the component mounts or re-runs the effect, an additional listener is leaked.',
    hint: 'What happens when window.addEventListener is called without window.removeEventListener in cleanup?',
  },
  {
    id: 'ch-249',
    title: 'Incident: Stale Closure in Chat Messaging Room',
    type: 'debug',
    difficulty: 'Advanced',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: In a customer support chat app, messages typed by customers while receiving agent replies are occasionally overwritten or lost. What bug in the state update caused this?',
    codeSnippet: `function onReceiveMessage(newMsg) {
  // Overwriting state bug:
  setMessages([...messages, newMsg]);
}`,
    options: [
      '`onReceiveMessage` closed over a stale snapshot of `messages`; it must use the functional updater: `setMessages(prev => [...prev, newMsg])`',
      'newMsg must be converted to JSON',
      'setMessages cannot be called from callbacks',
      'The network connection was lost',
    ],
    correctOptionIndex: 0,
    explanation: 'If multiple messages arrive quickly or an event listener closes over an older render snapshot, `[...messages, newMsg]` writes over updates that occurred after that snapshot. Functional updates (`prev => [...prev, newMsg]`) guarantee append operations on the current state queue.',
    hint: 'Why should rapid concurrent state appends always use functional updates?',
  },
  {
    id: 'ch-250',
    title: 'Incident: Fast Typing Overwrites Search Results',
    type: 'debug',
    difficulty: 'Advanced',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: A user searches for "react", then quickly changes to "vue". The UI displays results for "react" after "vue" was typed. What is this bug called and how is it resolved?',
    options: [
      'Asynchronous Network Race Condition: the slower "react" request settled after the faster "vue" request; fix with an `AbortController` in `useEffect` cleanup to cancel obsolete requests',
      'Stale closure bug in CSS',
      'Browser DNS caching bug',
      'React state corruption',
    ],
    correctOptionIndex: 0,
    explanation: 'Network responses can resolve in any order regardless of when they were sent. An earlier slow request can resolve after a newer fast request. Cancelling in-flight requests with `AbortController` guarantees that only the active query\'s response commits to state.',
    hint: 'What ensures that obsolete network requests do not overwrite newer responses?',
  },
  {
    id: 'ch-251',
    title: 'Incident: Mobile Form Input Stutter on Keystroke',
    type: 'debug',
    difficulty: 'Intermediate',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: On low-end mobile devices, typing into an address input stutters severely. React Profiler reveals that the parent `<CheckoutPage>` and all 35 form sections re-render on every single keystroke. What is the diagnosis?',
    options: [
      'The input state was hoisted all the way up to `<CheckoutPage>`, causing the entire page and all sibling components to re-render on every character typed; colocate input state locally',
      'Mobile keyboards do not support React',
      'The phone ran out of battery',
      'React is not compatible with mobile screens',
    ],
    correctOptionIndex: 0,
    explanation: 'State was placed too high in the tree. Typing into a single address input triggered re-renders of the shopping cart summary, payment options, shipping methods, and coupon code components. Colocating state or using uncontrolled form inputs restores 60fps typing.',
    hint: 'What happens when a top-level parent component holds the state of an active text input?',
  },
  {
    id: 'ch-252',
    title: 'Incident: Production Build Hydration Error 418',
    type: 'debug',
    difficulty: 'Expert',
    category: 'Production Bugs',
    question: 'INCIDENT REPORT: In minified production React, the browser console shows "Minified React error #418; visit https://react.dev/errors/418". What does Error #418 indicate in production?',
    options: [
      'Hydration failed because the initial UI does not match what was rendered on the server (e.g. mismatched HTML tags or client-only logic during SSR)',
      'A component exceeded the 418 kilobyte memory quota',
      'An HTTP 418 I\'m a teapot response from the backend',
      'The React license key has expired',
    ],
    correctOptionIndex: 0,
    explanation: 'React Error #418 in production is the minified code for: "Hydration failed because the server-rendered HTML didn\'t match the client". In development it prints a full diff; in production it links to error #418.',
    hint: 'What does React Error #418 refer to regarding server-client rendering?',
  },
],
};

export const CHALLENGE_CATEGORIES: string[] = [
  'All',
  ...Object.keys(CHALLENGES_BY_CATEGORY),
];

export const CHALLENGES_LIST: ChallengeItem[] = Object.values(
  CHALLENGES_BY_CATEGORY
).flat();
