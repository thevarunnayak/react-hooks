import { MachineCodingProblem } from '../../types/machineCoding';

export const PROBLEMS_PART1: MachineCodingProblem[] = [
  // 1. Todo / Task Manager
  {
    id: 'todo-task-manager',
    number: 1,
    title: 'Todo / Task Manager',
    difficulty: 'Beginner',
    category: 'State & CRUD',
    tags: ['useState', 'useReducer', 'localStorage', 'CRUD', 'Filtering', 'Sorting'],
    summary: 'CRUD operations, filtering by status, priority tags, sorting by date/priority, and local storage persistence.',
    explanation:
      'A canonical frontend machine coding problem testing your ability to manage normalized list state, avoid redundant re-renders, handle keyboard interactions, and implement declarative filter pipelines.',
    requirements: {
      functional: [
        'Add new tasks with title, priority (Low, Medium, High), and due date.',
        'Inline editing: double-click or click edit icon to modify task title.',
        'Toggle task completion status with visual strikethrough and timestamp.',
        'Filter tasks by All, Active, or Completed.',
        'Sort tasks by creation date, due date, or priority weight.',
        'Batch actions: Clear completed tasks and Mark all as completed.',
        'Persist task list across browser sessions in localStorage.',
      ],
      nonFunctional: [
        'Prevent blank or duplicate whitespace submissions.',
        'Smooth CSS transitions on add/delete.',
        'Accessible input labels and ARIA live regions for task count updates.',
      ],
    },
    conceptsUsed: [
      {
        name: 'useReducer for Atomic Actions',
        description: 'Encapsulates complex state transitions (ADD, TOGGLE, EDIT, DELETE, CLEAR_COMPLETED) in a pure reducer function.',
      },
      {
        name: 'Custom useLocalStorage Synchronization',
        description: 'Initializes state from browser storage and writes updates safely with try/catch fallback.',
      },
      {
        name: 'Memoized Derived State (useMemo)',
        description: 'Derives filtered and sorted task lists dynamically without polluting the primary state object.',
      },
    ],
    edgeCases: [
      'Empty strings or strings containing only spaces should be rejected.',
      'Editing an item and pressing Escape should revert to previous text without saving.',
      'Deleting the last active task should update filter counters immediately.',
      'Rapidly toggling completion should not cause desynchronization or race conditions.',
    ],
    solutionCode: `import React, { useState, useReducer, useEffect, useMemo } from 'react';

export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

type TaskAction =
  | { type: 'ADD'; payload: { title: string; priority: Priority } }
  | { type: 'TOGGLE'; payload: { id: string } }
  | { type: 'EDIT'; payload: { id: string; title: string } }
  | { type: 'DELETE'; payload: { id: string } }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'MARK_ALL_COMPLETED' }
  | { type: 'LOAD'; payload: Task[] };

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD':
      return [
        {
          id: crypto.randomUUID?.() || String(Date.now()),
          title: action.payload.title.trim(),
          completed: false,
          priority: action.payload.priority,
          createdAt: Date.now(),
        },
        ...state,
      ];
    case 'TOGGLE':
      return state.map((t) => (t.id === action.payload.id ? { ...t, completed: !t.completed } : t));
    case 'EDIT':
      return state.map((t) => (t.id === action.payload.id ? { ...t, title: action.payload.title.trim() } : t));
    case 'DELETE':
      return state.filter((t) => t.id !== action.payload.id);
    case 'CLEAR_COMPLETED':
      return state.filter((t) => !t.completed);
    case 'MARK_ALL_COMPLETED':
      return state.map((t) => ({ ...t, completed: true }));
    case 'LOAD':
      return action.payload;
    default:
      return state;
  }
}

export function TodoManager() {
  const [tasks, dispatch] = useReducer(taskReducer, [], () => {
    try {
      const saved = localStorage.getItem('mc_todos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputTitle, setInputTitle] = useState('');
  const [inputPriority, setInputPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('mc_todos', JSON.stringify(tasks));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    });
  }, [tasks, filter]);

  const activeCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    dispatch({ type: 'ADD', payload: { title: inputTitle, priority: inputPriority } });
    setInputTitle('');
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      dispatch({ type: 'EDIT', payload: { id, title: editingTitle } });
    }
    setEditingId(null);
  };

  return (
    <div className="todo-app" style={{ maxWidth: 540, margin: '0 auto' }}>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={{ flex: 1, padding: '8px 12px' }}
        />
        <select value={inputPriority} onChange={(e) => setInputPriority(e.target.value as Priority)}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      {/* Filter tabs and list omitted for brevity - see full working implementation */}
    </div>
  );
}`,
  },

  // 2. Debounced Search
  {
    id: 'debounced-search',
    number: 2,
    title: 'Debounced Search & Auto-Suggest',
    difficulty: 'Beginner',
    category: 'Async & Network',
    tags: ['useDebounce', 'useRef', 'AbortController', 'Caching', 'Race Conditions'],
    summary: 'API call debouncing, response caching, stale request cancellation, loading indicators, and error fallbacks.',
    explanation:
      'Tests your ability to manage asynchronous state, throttle network requests when users type rapidly, prevent out-of-order race conditions using AbortController, and cache results for instant backspacing.',
    requirements: {
      functional: [
        'Delay search API dispatch until user stops typing for 300ms (configurable).',
        'Cache query results in memory to serve immediate results on backspace.',
        'Cancel pending in-flight requests if a new search is initiated before response arrives.',
        'Display loading spinner during network request latency.',
        'Provide instant clear button (X) that resets query and active results.',
      ],
      nonFunctional: [
        'Prevent race conditions where slower early queries overwrite faster later queries.',
        'Gracefully display empty states and error notices.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Custom useDebounce Hook',
        description: 'Delays updating debounced query value using setTimeout and cleanup function on every keystroke.',
      },
      {
        name: 'AbortController for Fetch Cancellation',
        description: 'Aborts pending HTTP fetch signals when a new query arrives or when component unmounts.',
      },
      {
        name: 'In-Memory Cache (Ref or Map)',
        description: 'Caches query results to eliminate redundant API calls for previously searched strings.',
      },
    ],
    edgeCases: [
      'User types "react", deletes back to "re", and retypes "react" — should serve from cache instantly.',
      'Network failure should show an inline retry button without freezing input state.',
      'Rapid backspacing to an empty string should cancel pending requests and clear the list immediately.',
    ],
    solutionCode: `import React, { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function DebouncedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    if (cacheRef.current.has(trimmed)) {
      setResults(cacheRef.current.get(trimmed)!);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    // Simulated API fetch with cancellation support
    fetch(\`/api/search?q=\${encodeURIComponent(trimmed)}\`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: string[]) => {
        cacheRef.current.set(trimmed, data);
        setResults(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
      {loading && <span>Loading...</span>}
      <ul>{results.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
    </div>
  );
}`,
  },

  // 3. Autocomplete / Typeahead
  {
    id: 'autocomplete-typeahead',
    number: 3,
    title: 'Autocomplete / Typeahead Component',
    difficulty: 'Intermediate',
    category: 'Async & Network',
    tags: ['Keyboard Navigation', 'A11y', 'Click Outside', 'Highlight Match', 'Portals'],
    summary: 'Async search suggestions, Arrow key navigation, Enter selection, Escape dismissal, and substring highlighting.',
    explanation:
      'Tests compound component design, full accessibility keyboard support (ArrowUp, ArrowDown, Enter, Escape, Home, End), scrolling active items into view, and clean outside-click handling.',
    requirements: {
      functional: [
        'Async suggestion fetching as user types with debouncing.',
        'Keyboard navigation: Arrow Down/Up moves highlight through suggestions list.',
        'Pressing Enter selects highlighted suggestion; Escape closes menu.',
        'Highlight matched character substrings in suggestions.',
        'Clicking outside or blurring safely closes the suggestions dropdown.',
        'Ensure selected suggestion is automatically scrolled into view in long lists.',
      ],
      nonFunctional: [
        'ARIA combobox role attributes (`aria-autocomplete="list"`, `aria-activedescendant`).',
        'Zero layout shifts when suggestions dropdown opens or closes.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Keyboard Event Handling (onKeyDown)',
        description: 'Listens for ArrowUp, ArrowDown, Enter, and Escape to navigate virtual selection index.',
      },
      {
        name: 'scrollIntoView for Active Option',
        description: 'Keeps keyboard-highlighted list items visible within the scrollable dropdown container.',
      },
      {
        name: 'Regex Substring Highlighting',
        description: 'Splits suggestion text by query match and wraps matching spans in bold/colored marks.',
      },
    ],
    edgeCases: [
      'Pressing Arrow Down on the last suggestion wraps around to the first item (or back to input).',
      'Suggestions list containing 0 matches should render an accessible "No results found" banner.',
      'Pasting long text into input should not break highlighting or overflow the dropdown.',
    ],
    solutionCode: `import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteProps {
  options: string[];
  placeholder?: string;
  onSelect?: (item: string) => void;
}

export function Autocomplete({ options, placeholder = 'Search...', onSelect }: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      setQuery(filtered[highlightedIndex]);
      onSelect?.(filtered[highlightedIndex]);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {isOpen && filtered.length > 0 && (
        <ul ref={listRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}>
          {filtered.map((item, idx) => (
            <li
              key={item}
              style={{ backgroundColor: idx === highlightedIndex ? '#e2e8f0' : 'transparent' }}
              onClick={() => { setQuery(item); setIsOpen(false); onSelect?.(item); }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
  },

  // 4. Infinite Scroll
  {
    id: 'infinite-scroll',
    number: 4,
    title: 'Infinite Scroll Feed',
    difficulty: 'Intermediate',
    category: 'Advanced DOM & Performance',
    tags: ['IntersectionObserver', 'Pagination', 'Async Data', 'Error Skeletons'],
    summary: 'Infinite list pagination using IntersectionObserver, sentinel node refs, skeleton card loaders, and end-of-list detection.',
    explanation:
      'Evaluates modern DOM observation patterns over legacy scroll listeners. Tests viewport threshold triggering, error retry recovery, unmount cleanup, and preventing duplicate fetches when user scrolls rapidly.',
    requirements: {
      functional: [
        'Automatically fetch next page of items when bottom sentinel enters the viewport.',
        'Render skeleton placeholder cards while next batch is loading.',
        'Detect end of list (hasMore = false) and render "You have reached the end".',
        'Handle API failure gracefully with an inline "Retry" button without breaking previous items.',
        'Preserve scroll position when new items are appended.',
      ],
      nonFunctional: [
        'Use IntersectionObserver instead of window scroll event listener to avoid scroll thread jank.',
        'Guard against duplicate requests triggered while a fetch is already in-flight.',
      ],
    },
    conceptsUsed: [
      {
        name: 'IntersectionObserver API',
        description: 'Observes sentinel element with rootMargin to trigger pre-fetching before sentinel hits visible bottom.',
      },
      {
        name: 'useCallback for Sentinel Ref',
        description: 'Disconnects and attaches observer accurately when sentinel DOM element mounts or unmounts.',
      },
      {
        name: 'In-Flight Request Guarding',
        description: 'Prevents multiple concurrent page fetch invocations when scrolling quickly past trigger zones.',
      },
    ],
    edgeCases: [
      'Initial page load where items do not fill viewport height must automatically load page 2 until scrollable.',
      'Network offline during middle of feed: should display retry CTA without resetting already loaded items.',
      'Component unmount during in-flight fetch: should cleanly abort without memory leak state warnings.',
    ],
    solutionCode: `import React, { useState, useEffect, useRef, useCallback } from 'react';

export function InfiniteScrollFeed() {
  const [items, setItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    }, { rootMargin: '200px' });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Simulated paginated fetch
    setTimeout(() => {
      if (cancelled) return;
      const newItems = Array.from({ length: 10 }, (_, i) => \`Item #\${(page - 1) * 10 + i + 1}\`);
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(page < 5); // Capped at 50 items for demo
      setLoading(false);
    }, 600);

    return () => { cancelled = true; };
  }, [page]);

  return (
    <div>
      {items.map((item, idx) => (
        <div key={idx} ref={idx === items.length - 1 ? lastElementRef : undefined}>
          {item}
        </div>
      ))}
      {loading && <div>Loading more items...</div>}
      {!hasMore && <div>All items loaded!</div>}
    </div>
  );
}`,
  },

  // 5. File Uploader
  {
    id: 'file-uploader',
    number: 5,
    title: 'File Uploader with Progress & Queue',
    difficulty: 'Intermediate',
    category: 'Async & Network',
    tags: ['Drag and Drop', 'FileReader', 'Progress Tracking', 'File Validation', 'Queue'],
    summary: 'Drag & drop zone, MIME/size validation, multi-file upload queue, simulated progress, pause, retry, and cancel.',
    explanation:
      'Tests native HTML5 drag-and-drop file handling, validation logic (file size limits, permitted extensions), asynchronous chunked upload simulation, and individual upload lifecycle states (queued, uploading, paused, error, success).',
    requirements: {
      functional: [
        'Drag-and-drop dropzone with visual hover feedback and fallback file picker button.',
        'File validation: reject files exceeding max size (e.g. 5MB) or unpermitted MIME types.',
        'Multi-file queue: upload multiple files simultaneously or in sequenced batches.',
        'Progress bar: live animated upload percentage for each active file.',
        'Actions per item: Pause, Resume, Cancel, and Retry on failed uploads.',
        'Thumbnail preview for images and file size display in KB/MB.',
      ],
      nonFunctional: [
        'Prevent browser default behavior on dragover / drop.',
        'Accessible file input with keyboard triggers.',
      ],
    },
    conceptsUsed: [
      {
        name: 'HTML5 Drag and Drop API',
        description: 'Handles onDragEnter, onDragLeave, onDragOver, and onDrop with e.preventDefault().',
      },
      {
        name: 'FileReader / URL.createObjectURL',
        description: 'Generates instant client-side thumbnail previews without uploading to server.',
      },
      {
        name: 'Upload State Machine',
        description: 'Manages individual file status: "queued" | "uploading" | "paused" | "completed" | "error".',
      },
    ],
    edgeCases: [
      'Dropping non-file items (e.g. highlighted text or bookmarks) should be safely ignored.',
      'Uploading duplicate files should either generate unique tracking IDs or alert user.',
      'Canceling an upload mid-progress should stop timers/network streams immediately and free resources.',
    ],
    solutionCode: `import React, { useState } from 'react';

export interface QueuedFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'paused' | 'completed' | 'error';
  previewUrl?: string;
}

export function FileUploader() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: QueuedFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID?.() || String(Math.random()),
      file,
      progress: 0,
      status: 'queued',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{ border: isDragging ? '2px dashed #3b82f6' : '2px dashed #ccc', padding: 24 }}
      >
        <p>Drag & drop files here or click to browse</p>
        <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
      </div>
      <ul>
        {queue.map((item) => (
          <li key={item.id}>
            {item.file.name} ({(item.file.size / 1024).toFixed(1)} KB) - {item.progress}%
          </li>
        ))}
      </ul>
    </div>
  );
}`,
  },
];
