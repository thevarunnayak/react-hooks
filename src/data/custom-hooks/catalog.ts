import { CustomHookItem } from '../../types/customHook';

export const CUSTOM_HOOKS_CATALOG: CustomHookItem[] = [
  {
    id: 'useToggle',
    name: 'useToggle',
    category: 'State',
    description: 'Toggle a boolean value easily between true and false, or force to a specific value.',
    problem: 'Managing simple boolean states (modals, dropdowns, switches) requires repeating `const [open, setOpen] = useState(false); const toggle = () => setOpen(o => !o);`.',
    solution: 'Encapsulates boolean state and returns a clean [value, toggle] tuple.',
    tags: ['boolean', 'ui', 'modal', 'state'],
    parameters: [{ name: 'initialValue', type: 'boolean = false', description: 'Starting boolean state' }],
    returns: [
      { name: 'value', type: 'boolean', description: 'Current boolean state' },
      { name: 'toggle', type: '(nextValue?: boolean) => void', description: 'Function to flip boolean or force to specific value' },
    ],
    implementation: `import { useState, useCallback } from 'react';

export function useToggle(initialValue = false): [boolean, (next?: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback((next?: boolean) => {
    setValue(prev => (typeof next === 'boolean' ? next : !prev));
  }, []);
  return [value, toggle];
}`,
    demoCode: `function Demo() {
  const [isOn, toggle] = useToggle(false);
  return (
    <button onClick={() => toggle()}>
      Status: {isOn ? 'ACTIVE' : 'INACTIVE'}
    </button>
  );
}`,
    useCases: ['Modals and Dialogs', 'Accordion items', 'Theme dark/light toggles', 'Mobile menu drawers'],
    pitfalls: ['Do not use for multi-state flags (e.g. status "idle" | "loading" | "error"); use useState or useReducer for enums.'],
    relatedHooks: ['useBoolean', 'useState'],
  },
  {
    id: 'useLocalStorage',
    name: 'useLocalStorage',
    category: 'Storage',
    description: 'Persist state in browser localStorage with JSON serialization and multi-tab synchronization.',
    problem: 'Directly accessing window.localStorage in components leads to repetitive JSON parsing, SSR window errors, and missing cross-tab updates.',
    solution: 'Provides a useState-compatible API that writes to and reads from localStorage with safety guards and custom storage event dispatching.',
    tags: ['storage', 'persistence', 'json', 'client'],
    parameters: [
      { name: 'key', type: 'string', description: 'localStorage storage key' },
      { name: 'initialValue', type: 'T', description: 'Fallback value if key does not exist' },
    ],
    returns: [
      { name: 'value', type: 'T', description: 'Stored value' },
      { name: 'setValue', type: '(value: T | ((val: T) => T)) => void', description: 'Updater function persisting to storage' },
    ],
    implementation: `import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((v: T) => T)) => void] {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [stored, setStored] = useState<T>(read);

  const set = useCallback((val: T | ((v: T) => T)) => {
    const next = val instanceof Function ? val(stored) : val;
    setStored(next);
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event('local-storage'));
  }, [key, stored]);

  return [stored, set];
}`,
    demoCode: `function Demo() {
  const [name, setName] = useLocalStorage('user_name', 'Guest');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}`,
    useCases: ['Remembering user theme preferences', 'Form drafts & auto-save', 'Cart items for unauthenticated users'],
    pitfalls: ['localStorage has a ~5MB quota; avoid storing giant binary files or large data tables.'],
    relatedHooks: ['useSessionStorage'],
  },
  {
    id: 'useDebounce',
    name: 'useDebounce',
    category: 'Performance',
    description: 'Delay updating a value until a specified wait time has elapsed since the last change.',
    problem: 'Searching an API or filtering heavy lists on every single keystroke causes network spam and interface lag.',
    solution: 'Delays updating the debounced value until the user pauses typing for the specified millisecond duration.',
    tags: ['performance', 'search', 'delay', 'timer'],
    parameters: [
      { name: 'value', type: 'T', description: 'The reactive value to debounce' },
      { name: 'delayMs', type: 'number', description: 'Wait duration in milliseconds' },
    ],
    returns: [{ name: 'debouncedValue', type: 'T', description: 'The delayed value' }],
    implementation: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}`,
    demoCode: `function Demo() {
  const [text, setText] = useState('');
  const debouncedText = useDebounce(text, 300);

  useEffect(() => {
    if (debouncedText) fetchResults(debouncedText);
  }, [debouncedText]);

  return <input value={text} onChange={e => setText(e.target.value)} />;
}`,
    useCases: ['Typeahead search inputs', 'Window resize calculations', 'Auto-saving document edits'],
    pitfalls: ['For search queries, also consider AbortController in your fetch effect to handle out-of-order network responses.'],
    relatedHooks: ['useThrottle', 'useTransition'],
  },
  {
    id: 'usePrevious',
    name: 'usePrevious',
    category: 'State',
    description: 'Track the value of a prop or state variable from the previous render.',
    problem: 'Components frequently need to compare current values against their previous values (e.g. "Did count increase or decrease?").',
    solution: 'Stores the value in a useRef and updates it inside a useEffect after each render completes.',
    tags: ['history', 'comparison', 'ref', 'render'],
    parameters: [{ name: 'value', type: 'T', description: 'Current value to remember' }],
    returns: [{ name: 'previousValue', type: 'T | undefined', description: 'The value from the previous render' }],
    implementation: `import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}`,
    demoCode: `function Demo({ count }) {
  const prevCount = usePrevious(count);
  const diff = count - (prevCount ?? 0);
  return <p>Count: {count} (Changed by: {diff >= 0 ? '+' + diff : diff})</p>;
}`,
    useCases: ['Detecting value transitions (open -> closed)', 'Price tickers (+/- delta indicators)', 'Animation triggers on prop changes'],
    pitfalls: ['On initial mount, previousValue will be undefined.'],
    relatedHooks: ['useRef'],
  },
  {
    id: 'useInterval',
    name: 'useInterval',
    category: 'Effects',
    description: 'A declarative setInterval wrapper that cleanly captures fresh state without stale closures.',
    problem: 'Using plain setInterval inside useEffect leads to stale closures or restarting the timer every render.',
    solution: 'Saves the callback in a mutable ref (Dan Abramov pattern) so the interval remains stable while always executing the freshest callback.',
    tags: ['timer', 'interval', 'animation', 'clock'],
    parameters: [
      { name: 'callback', type: '() => void', description: 'Function to execute each tick' },
      { name: 'delayMs', type: 'number | null', description: 'Interval in ms, or null to pause' },
    ],
    returns: [],
    implementation: `import { useRef, useEffect } from 'react';

export function useInterval(callback: () => void, delayMs: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => savedCallback.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}`,
    demoCode: `function Demo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useInterval(() => setSeconds(s => s + 1), running ? 1000 : null);

  return <button onClick={() => setRunning(!running)}>Elapsed: {seconds}s</button>;
}`,
    useCases: ['Stopwatches & countdown timers', 'Polling backend endpoints', 'Carousel auto-play'],
    pitfalls: ['Setting delayMs to 0 will spam execution; use null to pause the timer.'],
    relatedHooks: ['useTimeout', 'useEffect'],
  },
  {
    id: 'useMediaQuery',
    name: 'useMediaQuery',
    category: 'DOM & Sensors',
    description: 'Listen to CSS media queries dynamically in JavaScript for responsive component logic.',
    problem: 'Rendering different components for mobile vs desktop requires querying window.matchMedia and listening for resize events.',
    solution: 'Subscribes to window.matchMedia and returns a live boolean updating whenever viewport crosses the breakpoint.',
    tags: ['responsive', 'mobile', 'css', 'layout'],
    parameters: [{ name: 'query', type: 'string', description: 'CSS media query string like "(max-width: 768px)"' }],
    returns: [{ name: 'matches', type: 'boolean', description: 'True if media query currently matches' }],
    implementation: `import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}`,
    demoCode: `function Demo() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  return <p>Current Viewport: {isMobile ? 'Mobile (<640px)' : 'Desktop (>=640px)'}</p>;
}`,
    useCases: ['Conditional rendering of mobile drawers vs desktop sidebars', 'Responsive charts with fewer data points on small screens'],
    pitfalls: ['Prefer CSS media queries where possible for layout styling; use this hook only for conditional component rendering.'],
    relatedHooks: ['useWindowSize'],
  },
  {
    id: 'useClickOutside',
    name: 'useClickOutside',
    category: 'DOM & Sensors',
    description: 'Detect clicks outside of a referenced DOM element to close dropdowns, menus, and modals.',
    problem: 'Popovers, custom select menus, and dialogs need to close when the user clicks anywhere else on the page.',
    solution: 'Listens to document mousedown/touchstart events and fires a callback if the click target is not contained in the element ref.',
    tags: ['dom', 'modal', 'dropdown', 'click'],
    parameters: [
      { name: 'ref', type: 'React.RefObject<HTMLElement>', description: 'Ref attached to the container element' },
      { name: 'handler', type: '(event: MouseEvent) => void', description: 'Callback fired on outside click' },
    ],
    returns: [],
    implementation: `import { useEffect, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}`,
    demoCode: `function Demo() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setOpen(false));

  return (
    <div>
      <button onClick={() => setOpen(!open)}>Menu</button>
      {open && <div ref={menuRef} className="dropdown">Dropdown Content</div>}
    </div>
  );
}`,
    useCases: ['Closing dropdown menus', 'Closing modal dialogues', 'Dismissing tooltips'],
    pitfalls: ['Make sure the toggle button itself is either inside the ref or handles event stopPropagation, otherwise clicking the toggle button immediately re-closes the menu.'],
    relatedHooks: ['useEventListener'],
  },
  {
    id: 'useClipboard',
    name: 'useClipboard',
    category: 'Browser APIs',
    description: 'Copy text to the system clipboard with automatic "Copied!" timeout feedback.',
    problem: 'Copying code snippets or tokens requires writing navigator.clipboard.writeText with error handling and managing a temporary copied flag.',
    solution: 'Exposes copy(text) and a boolean hasCopied flag that automatically resets after a delay.',
    tags: ['clipboard', 'copy', 'browser', 'feedback'],
    parameters: [{ name: 'timeout', type: 'number = 2000', description: 'Duration in ms before hasCopied resets to false' }],
    returns: [
      { name: 'hasCopied', type: 'boolean', description: 'True for timeout ms after successful copy' },
      { name: 'copy', type: '(text: string) => Promise<boolean>', description: 'Function to copy text to clipboard' },
    ],
    implementation: `import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), timeout);
      return true;
    } catch {
      return false;
    }
  }, [timeout]);

  return { hasCopied, copy };
}`,
    demoCode: `function Demo() {
  const { hasCopied, copy } = useClipboard();
  return (
    <button onClick={() => copy('npm install react-hooks-lab')}>
      {hasCopied ? 'COPIED!' : 'Copy Install Command'}
    </button>
  );
}`,
    useCases: ['Code block copy buttons', 'Share link copying', 'API key token copying'],
    pitfalls: ['Clipboard API requires a secure HTTPS context and user interaction.'],
    relatedHooks: ['useToggle'],
  },
];
