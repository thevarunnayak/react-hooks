import { MachineCodingChallenge } from '../../types/machineCodingChallenge';

export const HARD_CHALLENGES: MachineCodingChallenge[] = [
  // 1. Virtualized List with Windowing
  {
    id: 'virtualized-list',
    title: 'List Virtualization Windowing Engine',
    slug: 'virtualized-list',
    difficulty: 'Hard',
    estimatedTime: '40 mins',
    category: 'Performance & Virtualization',
    tags: ['Virtualization', 'Performance', 'DOM Nodes', 'Scroll'],
    description:
      'Build a virtualized list component capable of rendering 1,000 items while only keeping visible DOM nodes (plus an overscan buffer) rendered in the DOM container.',
    requirements: [
      'Render a scrollable viewport container (height: 300px).',
      'Dataset consists of 1,000 items (itemHeight = 40px, total height = 40,000px).',
      'Calculate startIndex and endIndex based on scrollTop.',
      'Maintain an inner spacer element of 40,000px height to preserve scrollbar size.',
      'Render fewer than 25 DOM elements at any given time.',
    ],
    functionalRequirements: [
      'startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan).',
      'endIndex = Math.min(total, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan).',
      'Position visible items using absolute positioning top: index * itemHeight.',
    ],
    UIRequirements: [
      'Scrollable viewport with data-testid="virtual-viewport".',
      'Visible row items with data-testid="virtual-row".',
      'DOM node count indicator with data-testid="dom-node-count".',
    ],
    edgeCases: ['Scrolling rapidly to the very bottom', 'Scroll offset at 0'],
    hints: ['Compute visible items slice: items.slice(startIndex, endIndex).'],
    constraints: ['Vanilla React. Do not use react-window or react-virtualized.'],
    interviewNotes: 'Gold standard performance interview question asked at Meta, Google, Uber, Netflix.',
    evaluationRules: [
      'Renders < 25 rows at any time.',
      'Updates visible items when scrollTop changes.',
    ],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>List Virtualization</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const TOTAL_ITEMS = 1000;
const ITEM_HEIGHT = 40;
const VIEWPORT_HEIGHT = 300;
const OVERSCAN = 3;

export default function App() {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    TOTAL_ITEMS,
    Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleIndices: number[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleIndices.push(i);
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>List Virtualization</h2>
      <div data-testid="dom-node-count" style={{ marginBottom: 8, fontSize: 13, color: '#3b82f6' }}>
        Rendered DOM Nodes: {visibleIndices.length} / {TOTAL_ITEMS}
      </div>

      <div
        data-testid="virtual-viewport"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{
          height: VIEWPORT_HEIGHT,
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{ height: TOTAL_ITEMS * ITEM_HEIGHT, position: 'relative' }}>
          {visibleIndices.map((index) => (
            <div
              key={index}
              data-testid="virtual-row"
              style={{
                position: 'absolute',
                top: index * ITEM_HEIGHT,
                left: 0,
                right: 0,
                height: ITEM_HEIGHT,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            >
              Row Item #{index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-virtual-dom-count',
        name: 'Renders Less than 25 DOM Nodes for 1,000 Items',
        description: 'Verifies virtualization keeps DOM node count under 25.',
        expectedResult: '< 25 DOM nodes',
        testFn: ({ expect }) => {
          const rows = document.querySelectorAll('[data-testid="virtual-row"]');
          expect(rows.length).toBeLessThan(25);
          expect(rows.length).toBeGreaterThan(5);
        },
      },
      {
        id: 'scroll-updates-visible-indices',
        name: 'Scroll Updates Rendered Range',
        description: 'Scrolling to 1200px shifts visible item indices.',
        expectedResult: 'Row Item #30+ visible',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const viewport = getByTestId('virtual-viewport');
          viewport.scrollTop = 1200;
          fireEvent.scroll(viewport);

          const rows = document.querySelectorAll('[data-testid="virtual-row"]');
          expect(rows[0].textContent).toContain('Row Item #');
        },
      },
      {
        id: 'hidden-max-total-height',
        name: 'Maintains Full Scroll Height',
        description: 'Inner container height matches 40,000px.',
        hidden: true,
        weight: 2,
        expectedResult: '40000px spacer',
        testFn: ({ getByTestId, expect }) => {
          const viewport = getByTestId('virtual-viewport');
          const innerSpacer = viewport.firstElementChild as HTMLElement;
          expect(innerSpacer.style.height).toBe('40000px');
        },
      },
    ],
  },

  // 2. Concurrent Request Coordinator
  {
    id: 'request-coordinator',
    title: 'Concurrent Async Request Coordinator',
    slug: 'request-coordinator',
    difficulty: 'Hard',
    estimatedTime: '35 mins',
    category: 'Async & Hooks',
    tags: ['Concurrency', 'AbortController', 'Queue', 'Async'],
    description:
      'Build an async coordinator that throttles concurrent requests to a maximum of 2 in-flight requests at a time, queueing additional requests and canceling pending requests when an "Abort All" button is clicked.',
    requirements: [
      'Trigger button: "Spawn 5 Requests".',
      'At most 2 requests may run concurrently.',
      'Remaining requests wait in a queue until an active slot frees up.',
      'Provide an "Abort All" button canceling all active and queued requests.',
      'Show live status count: Active (max 2), Queued, Completed, Canceled.',
    ],
    functionalRequirements: [
      'Manage AbortController instances for active requests.',
      'Queue processor loop that dequeues when an active promise resolves.',
    ],
    UIRequirements: [
      'Spawn button with data-testid="spawn-requests-btn".',
      'Abort button with data-testid="abort-all-btn".',
      'Active count display with data-testid="active-requests-count".',
      'Completed count display with data-testid="completed-requests-count".',
    ],
    edgeCases: ['Aborting while queue is non-empty'],
    hints: ['Keep track of activeCount in state and queue: Array<() => Promise<void>>.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates advanced asynchronous lifecycle orchestration and AbortController integration.',
    evaluationRules: ['Enforces concurrency limit <= 2.', 'Abort button cancels operations.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Request Coordinator</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState, useRef } from 'react';

interface RequestTask {
  id: number;
  status: 'queued' | 'active' | 'completed' | 'aborted';
  controller: AbortController;
}

export default function App() {
  const [tasks, setTasks] = useState<RequestTask[]>([]);
  const activeCountRef = useRef(0);

  const spawnBatch = () => {
    const newTasks: RequestTask[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      status: 'queued',
      controller: new AbortController(),
    }));

    setTasks((prev) => [...prev, ...newTasks]);
    // Process next ticks
    setTimeout(processQueue, 10);
  };

  const processQueue = () => {
    setTasks((prev) => {
      const active = prev.filter((t) => t.status === 'active').length;
      const available = 2 - active;
      if (available <= 0) return prev;

      const toActivate = prev.filter((t) => t.status === 'queued').slice(0, available);
      if (toActivate.length === 0) return prev;

      toActivate.forEach((t) => {
        setTimeout(() => executeTask(t.id, t.controller.signal), 0);
      });

      const activateIds = new Set(toActivate.map((t) => t.id));
      return prev.map((t) => (activateIds.has(t.id) ? { ...t, status: 'active' } : t));
    });
  };

  const executeTask = (id: number, signal: AbortSignal) => {
    const timer = setTimeout(() => {
      if (!signal.aborted) {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t)));
        setTimeout(processQueue, 10);
      }
    }, 150);

    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'aborted' } : t)));
    });
  };

  const abortAll = () => {
    tasks.forEach((t) => t.controller.abort());
    setTasks((prev) =>
      prev.map((t) => (t.status === 'active' || t.status === 'queued' ? { ...t, status: 'aborted' } : t))
    );
  };

  const activeCount = tasks.filter((t) => t.status === 'active').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const queuedCount = tasks.filter((t) => t.status === 'queued').length;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>Request Coordinator</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button data-testid="spawn-requests-btn" onClick={spawnBatch} style={{ padding: '8px 14px', cursor: 'pointer' }}>
          Spawn 5 Requests
        </button>
        <button data-testid="abort-all-btn" onClick={abortAll} style={{ padding: '8px 14px', cursor: 'pointer', background: '#ef4444', color: '#fff', border: 'none' }}>
          Abort All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
        <div data-testid="active-requests-count">Active: {activeCount} (max 2)</div>
        <div>Queued: {queuedCount}</div>
        <div data-testid="completed-requests-count">Completed: {completedCount}</div>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'spawn-enforces-max-concurrency',
        name: 'Enforces Maximum 2 Active Requests',
        description: 'Spawning 5 tasks allows at most 2 active simultaneously.',
        expectedResult: 'Active <= 2',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('spawn-requests-btn'));
          await sleep(30);
          const activeText = getByTestId('active-requests-count').textContent;
          expect(activeText).toContain('Active: 2');
        },
      },
      {
        id: 'abort-stops-all',
        name: 'Aborts All Running Tasks',
        description: 'Clicking Abort All cancels active and queued tasks.',
        expectedResult: 'Active: 0',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('spawn-requests-btn'));
          await sleep(20);
          fireEvent.click(getByTestId('abort-all-btn'));
          expect(getByTestId('active-requests-count').textContent).toContain('Active: 0');
        },
      },
      {
        id: 'hidden-eventual-completion',
        name: 'Drains Queue to Completed Tasks',
        description: 'Spawning tasks without abort completes all 5.',
        hidden: true,
        weight: 2,
        expectedResult: '5 Completed',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('spawn-requests-btn'));
          await sleep(600);
          expect(getByTestId('completed-requests-count').textContent).toContain('5');
        },
      },
    ],
  },

  // 3. Interactive Drag-and-Drop Reorderer
  {
    id: 'drag-drop-reorder',
    title: 'Drag-and-Drop List Reorderer',
    slug: 'drag-drop-reorder',
    difficulty: 'Hard',
    estimatedTime: '35 mins',
    category: 'Drag & Drop',
    tags: ['Drag and Drop', 'HTML5 DnD', 'Reorder', 'Arrays'],
    description:
      'Build a reorderable list using HTML5 drag-and-drop events (onDragStart, onDragOver, onDrop) where users can drag items to rearrange list order.',
    requirements: [
      'Render a list of 4 draggable items: "Design System", "State Architecture", "Data Fetching", "Testing".',
      'Dragging an item and dropping onto another item moves it to the target index.',
      'Provide Up/Down move buttons as keyboard/accessible fallback.',
      'Show current list order.',
    ],
    functionalRequirements: [
      'HTML5 draggable={true} attribute on list items.',
      'Splice/swap array items immutably on reorder.',
    ],
    UIRequirements: [
      'Draggable item cards with data-testid="dnd-item-[index]".',
      'Move up button with data-testid="move-up-[index]".',
      'Move down button with data-testid="move-down-[index]".',
    ],
    edgeCases: ['Dropping on itself (no-op)'],
    hints: ['In onDrop: remove item from sourceIndex, insert at targetIndex.'],
    constraints: ['Vanilla React. No react-beautiful-dnd or dnd-kit.'],
    interviewNotes: 'Evaluates native browser drag & drop integration and list index mutation.',
    evaluationRules: ['Reorders list on drop.', 'Reorders on keyboard up/down.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Drag and Drop Reorder</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const INITIAL = ['Design System', 'State Architecture', 'Data Fetching', 'Testing'];

export default function App() {
  const [items, setItems] = useState<string[]>(INITIAL);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 420 }}>
      <h2>Drag and Drop Reorder</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, idx) => (
          <div
            key={item}
            draggable
            data-testid={\`dnd-item-\${idx}\`}
            onDragStart={() => setDraggedIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedIdx !== null) {
                move(draggedIdx, idx);
                setDraggedIdx(null);
              }
            }}
            style={{
              padding: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              backgroundColor: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'grab',
            }}
          >
            <span>{idx + 1}. {item}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                data-testid={\`move-up-\${idx}\`}
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                style={{ cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
              >
                ▲
              </button>
              <button
                data-testid={\`move-down-\${idx}\`}
                onClick={() => move(idx, idx + 1)}
                disabled={idx === items.length - 1}
                style={{ cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer' }}
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-dnd-order',
        name: 'Renders Initial Item Order',
        description: 'First item is 1. Design System.',
        expectedResult: 'Design System first',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('dnd-item-0').textContent).toContain('Design System');
        },
      },
      {
        id: 'reorder-item-down',
        name: 'Moves Item Down via Fallback Button',
        description: 'Moving item 0 down places State Architecture first.',
        expectedResult: 'State Architecture first',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('move-down-0'));
          expect(getByTestId('dnd-item-0').textContent).toContain('State Architecture');
        },
      },
      {
        id: 'hidden-dnd-drop-event',
        name: 'Reorders on Drop Event',
        description: 'Simulates drag and drop to reorder items.',
        hidden: true,
        weight: 2,
        expectedResult: 'Dropped item moved',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.dragStart(getByTestId('dnd-item-0'));
          fireEvent.drop(getByTestId('dnd-item-2'));
          expect(getByTestId('dnd-item-2')).toBeTruthy();
        },
      },
    ],
  },

  // 4. Recursive File System with CRUD
  {
    id: 'recursive-file-system',
    title: 'Recursive File System with Create & Delete',
    slug: 'recursive-file-system',
    difficulty: 'Hard',
    estimatedTime: '40 mins',
    category: 'Trees & Hierarchy',
    tags: ['CRUD', 'Trees', 'Recursion', 'Immutability'],
    description:
      'Build a full recursive file manager allowing users to add new files or folders inside any folder in the hierarchy, and delete items from any depth.',
    requirements: [
      'Render nested tree of folders and files.',
      'Folders have "+ File", "+ Folder", and "Delete" actions.',
      'Files have a "Delete" button.',
      'Adding creates item within that specific parent folder.',
      'Deleting removes the node and all its children.',
    ],
    functionalRequirements: [
      'Immutable recursive tree modification (add node, delete node).',
      'Unique ID generation for newly created items.',
    ],
    UIRequirements: [
      'Add file button with data-testid="add-file-[folderId]".',
      'Delete button with data-testid="delete-node-[nodeId]".',
      'File system root with data-testid="fs-root".',
    ],
    edgeCases: ['Deleting root folder (prevent or handle gracefully)'],
    hints: ['Recursive helper: const deleteNode = (tree, id) => ... filter and map.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Advanced tree algorithm and immutable nested state manipulation challenge.',
    evaluationRules: ['Creates child files.', 'Deletes nodes cleanly.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Recursive File Manager</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

interface FSNode {
  id: string;
  name: string;
  isFolder: boolean;
  children?: FSNode[];
}

const INITIAL_TREE: FSNode = {
  id: 'root',
  name: 'project',
  isFolder: true,
  children: [
    { id: 'src', name: 'src', isFolder: true, children: [{ id: 'app', name: 'App.tsx', isFolder: false }] },
    { id: 'pkg', name: 'package.json', isFolder: false },
  ],
};

function FSItem({
  node,
  onAdd,
  onDelete,
}: {
  node: FSNode;
  onAdd: (parentId: string, isFolder: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ paddingLeft: 16, margin: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{node.isFolder ? '📁' : '📄'} {node.name}</span>
        {node.isFolder && (
          <button data-testid={\`add-file-\${node.id}\`} onClick={() => onAdd(node.id, false)} style={{ fontSize: 11 }}>
            + File
          </button>
        )}
        {node.id !== 'root' && (
          <button data-testid={\`delete-node-\${node.id}\`} onClick={() => onDelete(node.id)} style={{ fontSize: 11, color: '#ef4444' }}>
            ✕
          </button>
        )}
      </div>
      {node.children && (
        <div>
          {node.children.map((child) => (
            <FSItem key={child.id} node={child} onAdd={onAdd} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tree, setTree] = useState<FSNode>(INITIAL_TREE);

  const addNode = (parentId: string, isFolder: boolean) => {
    const name = isFolder ? 'new_folder' : 'new_file.ts';
    const newNode: FSNode = { id: String(Date.now()), name, isFolder, children: isFolder ? [] : undefined };

    const insert = (curr: FSNode): FSNode => {
      if (curr.id === parentId) {
        return { ...curr, children: [...(curr.children || []), newNode] };
      }
      return { ...curr, children: curr.children ? curr.children.map(insert) : undefined };
    };

    setTree(insert(tree));
  };

  const deleteNode = (id: string) => {
    const remove = (curr: FSNode): FSNode => ({
      ...curr,
      children: curr.children
        ? curr.children.filter((c) => c.id !== id).map(remove)
        : undefined,
    });
    setTree(remove(tree));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>Recursive File Manager</h2>
      <div data-testid="fs-root" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <FSItem node={tree} onAdd={addNode} onDelete={deleteNode} />
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-tree-render',
        name: 'Renders Initial Root Tree',
        description: 'Verifies package.json and src folder render.',
        expectedResult: 'Initial files rendered',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('fs-root').textContent).toContain('package.json');
        },
      },
      {
        id: 'add-file-to-src',
        name: 'Adds New File to Folder',
        description: 'Clicking + File in src adds new_file.ts.',
        expectedResult: 'new_file.ts added',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('add-file-src'));
          expect(getByTestId('fs-root').textContent).toContain('new_file.ts');
        },
      },
      {
        id: 'hidden-delete-file',
        name: 'Deletes Node from Tree',
        description: 'Clicking delete on package.json removes it.',
        hidden: true,
        weight: 2,
        expectedResult: 'package.json removed',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('delete-node-pkg'));
          expect(getByTestId('fs-root').textContent).not.toContain('package.json');
        },
      },
    ],
  },

  // 5. Advanced Autocomplete with LRU Cache & Highlighting
  {
    id: 'advanced-autocomplete-lru',
    title: 'Autocomplete with Highlighting & LRU Cache',
    slug: 'advanced-autocomplete-lru',
    difficulty: 'Hard',
    estimatedTime: '35 mins',
    category: 'Search',
    tags: ['LRU Cache', 'Autocomplete', 'Regex Highlighting', 'Performance'],
    description:
      'Build an advanced search component that caches query results using an LRU (Least Recently Used) cache with max capacity 3, and highlights matching query text in bold within each suggestion.',
    requirements: [
      'Search input with suggestions.',
      'Highlight matched substring in bold (<mark> or <strong>).',
      'LRU Cache storing up to 3 queries to prevent redundant calculations.',
      'Show current cache size (e.g. "Cache items: 2 / 3").',
    ],
    functionalRequirements: [
      'LRU eviction when inserting a 4th unique query.',
      'Splitting text with regex to wrap matched segments in <strong>.',
    ],
    UIRequirements: [
      'Input with data-testid="lru-input".',
      'Cache indicator with data-testid="cache-size-display".',
      'Suggestion items with data-testid="lru-item".',
    ],
    edgeCases: ['Special characters in search query that break RegExp'],
    hints: ['Escape regex special characters before creating new RegExp(q, "gi").'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Advanced frontend interview problem testing data structure design (LRU Map) and AST/string slicing.',
    evaluationRules: ['Highlights matching letters.', 'Caches queries with LRU eviction.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Advanced Autocomplete (LRU)</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState, useRef } from 'react';

const WORDS = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry', 'Cherry'];

export default function App() {
  const [query, setQuery] = useState('');
  const [cacheSize, setCacheSize] = useState(0);
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  const getSuggestions = (q: string): string[] => {
    const key = q.trim().toLowerCase();
    if (!key) return [];

    if (cacheRef.current.has(key)) {
      // Refresh recency
      const cached = cacheRef.current.get(key)!;
      cacheRef.current.delete(key);
      cacheRef.current.set(key, cached);
      return cached;
    }

    const matched = WORDS.filter((w) => w.toLowerCase().includes(key));

    // Evict oldest if full
    if (cacheRef.current.size >= 3) {
      const oldestKey = cacheRef.current.keys().next().value;
      if (oldestKey) cacheRef.current.delete(oldestKey);
    }

    cacheRef.current.set(key, matched);
    setCacheSize(cacheRef.current.size);
    return matched;
  };

  const results = getSuggestions(query);

  const renderHighlighted = (text: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(\`(\${query})\`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? <strong key={i} style={{ color: '#3b82f6' }}>{part}</strong> : part
    );
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Advanced Autocomplete (LRU)</h2>
      <input
        data-testid="lru-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search fruit..."
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
      />
      <div data-testid="cache-size-display" style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
        Cache size: {cacheSize} / 3
      </div>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
        {results.map((word) => (
          <li key={word} data-testid="lru-item" style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
            {renderHighlighted(word)}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    testCases: [
      {
        id: 'highlights-query-match',
        name: 'Highlights Matching Letters in Suggestions',
        description: 'Typing "Berry" matches Blackberry and Blueberry with strong highlights.',
        expectedResult: 'Blackberry & Blueberry rendered',
        testFn: async ({ getByTestId, type, expect }) => {
          const input = getByTestId('lru-input') as HTMLInputElement;
          await type(input, 'berry');
          const items = document.querySelectorAll('[data-testid="lru-item"]');
          expect(items.length).toBe(2);
        },
      },
      {
        id: 'hidden-lru-capacity-cap',
        name: 'Caps LRU Cache at 3 Queries',
        description: 'Caches 3 unique queries and evicts oldest.',
        hidden: true,
        weight: 2,
        expectedResult: 'Cache size <= 3',
        testFn: async ({ getByTestId, type, expect }) => {
          const input = getByTestId('lru-input') as HTMLInputElement;
          await type(input, 'a');
          await type(input, 'b');
          await type(input, 'c');
          await type(input, 'd');
          expect(getByTestId('cache-size-display').textContent).toContain('3 / 3');
        },
      },
    ],
  },

  // 6. Optimistic UI Like & Comment Mutator
  {
    id: 'optimistic-ui-mutation',
    title: 'Optimistic UI Like & Post Mutator',
    slug: 'optimistic-ui-mutation',
    difficulty: 'Hard',
    estimatedTime: '30 mins',
    category: 'Async & Hooks',
    tags: ['useOptimistic', 'Optimistic UI', 'Rollback', 'Error Handling'],
    description:
      'Implement an Optimistic UI like button and comment poster. Updates the UI immediately upon click, but rolls back state and displays an error if the simulated network mutation fails.',
    requirements: [
      'Post with Like button and like count.',
      'Clicking Like updates count and heart icon instantly (+1).',
      'Simulated 200ms network request.',
      'Checkable "Simulate Network Failure" checkbox.',
      'If request fails, revert like count to original value and show alert.',
    ],
    functionalRequirements: [
      'State rollback pattern (snapshot previous state before mutation).',
      'Non-blocking UI response.',
    ],
    UIRequirements: [
      'Like button with data-testid="like-btn".',
      'Like count with data-testid="like-count".',
      'Failure toggle with data-testid="fail-toggle".',
      'Error toast with data-testid="error-banner".',
    ],
    edgeCases: ['Clicking multiple times before failure resolves'],
    hints: ['Keep previousCount snapshot. If network throws, setCount(previousCount).'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Core senior engineering pattern for responsive social media and productivity apps.',
    evaluationRules: ['Instantly updates UI.', 'Rolls back on simulated network failure.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Optimistic UI</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [likes, setLikes] = useState(42);
  const [isLiked, setIsLiked] = useState(false);
  const [shouldFail, setShouldFail] = useState(false);
  const [error, setError] = useState('');

  const handleLike = () => {
    const prevLikes = likes;
    const prevLiked = isLiked;

    // Optimistic update
    setLikes((l) => (isLiked ? l - 1 : l + 1));
    setIsLiked((l) => !l);
    setError('');

    // Simulate API
    setTimeout(() => {
      if (shouldFail) {
        // Rollback
        setLikes(prevLikes);
        setIsLiked(prevLiked);
        setError('Failed to update like. Rolling back changes.');
      }
    }, 150);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Optimistic UI</h2>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, cursor: 'pointer' }}>
          <input
            data-testid="fail-toggle"
            type="checkbox"
            checked={shouldFail}
            onChange={(e) => setShouldFail(e.target.checked)}
          />{' '}
          Simulate Network Failure
        </label>
      </div>

      <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <p style={{ margin: '0 0 12px 0' }}>React 19 makes optimistic updates declarative.</p>
        <button
          data-testid="like-btn"
          onClick={handleLike}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: isLiked ? '#ef4444' : '#f3f4f6',
            color: isLiked ? '#fff' : '#111',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isLiked ? '❤️ Liked' : '🤍 Like'} (<span data-testid="like-count">{likes}</span>)
        </button>
      </div>

      {error && (
        <div data-testid="error-banner" style={{ marginTop: 12, color: '#ef4444', fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'instant-optimistic-like',
        name: 'Instantly Increments Like Count',
        description: 'Clicking like immediately changes 42 to 43.',
        expectedResult: '43 immediately',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('like-btn'));
          expect(getByTestId('like-count').textContent).toBe('43');
        },
      },
      {
        id: 'rollback-on-network-failure',
        name: 'Rolls Back Count on Network Failure',
        description: 'When simulate failure is checked, count reverts back to 42.',
        expectedResult: 'Rolls back to 42',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('fail-toggle'));
          fireEvent.click(getByTestId('like-btn'));
          expect(getByTestId('like-count').textContent).toBe('43');
          await sleep(200);
          expect(getByTestId('like-count').textContent).toBe('42');
        },
      },
      {
        id: 'hidden-shows-error-on-rollback',
        name: 'Displays Rollback Error Message',
        description: 'Shows error banner when rollback occurs.',
        hidden: true,
        weight: 1,
        expectedResult: 'Error banner visible',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('fail-toggle'));
          fireEvent.click(getByTestId('like-btn'));
          await sleep(200);
          expect(getByTestId('error-banner')).toBeTruthy();
        },
      },
    ],
  },

  // 7. Dynamic JSON Form Schema Engine
  {
    id: 'dynamic-form-engine',
    title: 'Dynamic JSON Schema Form Engine',
    slug: 'dynamic-form-engine',
    difficulty: 'Hard',
    estimatedTime: '35 mins',
    category: 'Forms',
    tags: ['Schema', 'Dynamic Forms', 'JSON', 'Validation'],
    description:
      'Build a dynamic form engine that consumes a declarative JSON schema specifying fields (text, number, select, checkbox), required validations, and renders a reactive form producing valid JSON output.',
    requirements: [
      'Render dynamic fields based on schema definition.',
      'Support text inputs, number inputs, dropdown selects, and checkboxes.',
      'Validate required fields on submit.',
      'Output formatted JSON payload upon successful submission.',
    ],
    functionalRequirements: [
      'Generic field change handler: updateField(name, value).',
      'Check validation rules before calling onSubmit.',
    ],
    UIRequirements: [
      'Dynamic field inputs with data-testid="field-[name]".',
      'Submit button with data-testid="schema-submit-btn".',
      'JSON output display with data-testid="json-output".',
    ],
    edgeCases: ['Schema with missing default values', 'Numeric type casting'],
    hints: ['Store all form values in a single object record in state.'],
    constraints: ['Vanilla React. No Formik or React Hook Form.'],
    interviewNotes: 'Frequently evaluated for low-code platform and enterprise dashboard frontend roles.',
    evaluationRules: ['Generates form from schema.', 'Submits valid JSON.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Schema Form Engine</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const SCHEMA = [
  { name: 'username', label: 'Username', type: 'text', required: true },
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'role', label: 'Role', type: 'select', options: ['Developer', 'Designer', 'Manager'], required: true },
  { name: 'terms', label: 'Accept Terms', type: 'checkbox', required: true },
];

export default function App() {
  const [formData, setFormData] = useState<Record<string, any>>({
    username: '',
    age: '',
    role: 'Developer',
    terms: false,
  });
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.age || Number(formData.age) <= 0) {
      setError('Valid age is required');
      return;
    }
    if (!formData.terms) {
      setError('You must accept terms');
      return;
    }
    setError('');
    setOutput(JSON.stringify(formData, null, 2));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 420 }}>
      <h2>Schema Form Engine</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SCHEMA.map((field) => (
          <div key={field.name}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                data-testid={\`field-\${field.name}\`}
                value={formData[field.name]}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                style={{ width: '100%', padding: 6 }}
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <input
                data-testid={\`field-\${field.name}\`}
                type="checkbox"
                checked={formData[field.name]}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              />
            ) : (
              <input
                data-testid={\`field-\${field.name}\`}
                type={field.type}
                value={formData[field.name]}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                style={{ width: '100%', padding: 6, boxSizing: 'border-box' }}
              />
            )}
          </div>
        ))}

        {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}

        <button data-testid="schema-submit-btn" type="submit" style={{ padding: 8, cursor: 'pointer' }}>
          Generate JSON Payload
        </button>
      </form>

      {output && (
        <pre data-testid="json-output" style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, marginTop: 16 }}>
          {output}
        </pre>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-schema-fields',
        name: 'Renders Dynamic Fields from Schema',
        description: 'Verifies username, age, role, and terms fields are present.',
        expectedResult: 'All 4 fields rendered',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('field-username')).toBeTruthy();
          expect(getByTestId('field-age')).toBeTruthy();
          expect(getByTestId('field-role')).toBeTruthy();
          expect(getByTestId('field-terms')).toBeTruthy();
        },
      },
      {
        id: 'submit-valid-json',
        name: 'Generates Valid JSON Output',
        description: 'Fills form and submits to verify payload.',
        expectedResult: 'JSON payload output',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          await type(getByTestId('field-username') as HTMLInputElement, 'john_doe');
          await type(getByTestId('field-age') as HTMLInputElement, '28');
          fireEvent.click(getByTestId('field-terms'));
          fireEvent.click(getByTestId('schema-submit-btn'));

          const output = getByTestId('json-output');
          expect(output.textContent).toContain('john_doe');
        },
      },
      {
        id: 'hidden-validation-block',
        name: 'Blocks Submit if Terms Unchecked',
        description: 'Submitting without accepting terms blocks output.',
        hidden: true,
        weight: 1,
        expectedResult: 'No output generated',
        testFn: async ({ getByTestId, type, queryByTestId, fireEvent, expect }) => {
          await type(getByTestId('field-username') as HTMLInputElement, 'jane');
          await type(getByTestId('field-age') as HTMLInputElement, '25');
          fireEvent.click(getByTestId('schema-submit-btn'));
          expect(queryByTestId('json-output')).toBeNull();
        },
      },
    ],
  },

  // 8. Finite State Machine Checkout
  {
    id: 'fsm-checkout-flow',
    title: 'Finite State Machine UI (Checkout Flow)',
    slug: 'fsm-checkout-flow',
    difficulty: 'Hard',
    estimatedTime: '35 mins',
    category: 'State Machines',
    tags: ['State Machine', 'Transitions', 'Reducer', 'Workflow'],
    description:
      'Build a deterministic Finite State Machine (FSM) managing an e-commerce checkout flow: CART -> SHIPPING -> PAYMENT -> PROCESSING -> SUCCESS / ERROR.',
    requirements: [
      'States: "cart", "shipping", "payment", "processing", "success", "error".',
      'Only valid state transitions are allowed.',
      'Payment step includes a "Simulate Payment Failure" checkbox.',
      'Error state provides a "Retry Payment" button returning to payment.',
    ],
    functionalRequirements: [
      'Model state machine transitions cleanly using a lookup table or useReducer.',
      'Prevent illegitimate transitions (e.g. going from cart directly to success).',
    ],
    UIRequirements: [
      'Current state badge with data-testid="fsm-state-badge".',
      'Action button with data-testid="fsm-action-btn".',
      'Retry button with data-testid="fsm-retry-btn".',
    ],
    edgeCases: ['Invalid action dispatch while processing'],
    hints: ['Define TRANSITIONS = { cart: { NEXT: "shipping" }, ... }.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates architectural rigor, deterministic UI states, and robust error recovery.',
    evaluationRules: ['Follows transition table.', 'Handles retry on error state.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Checkout State Machine</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

type State = 'cart' | 'shipping' | 'payment' | 'processing' | 'success' | 'error';

export default function App() {
  const [state, setState] = useState<State>('cart');
  const [failPayment, setFailPayment] = useState(false);

  const transitionTo = (next: State) => setState(next);

  const processPayment = () => {
    setState('processing');
    setTimeout(() => {
      if (failPayment) setState('error');
      else setState('success');
    }, 150);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Checkout State Machine</h2>
      <div data-testid="fsm-state-badge" style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: 16 }}>
        Current State: {state.toUpperCase()}
      </div>

      {state === 'cart' && (
        <button data-testid="fsm-action-btn" onClick={() => transitionTo('shipping')} style={{ padding: 8 }}>
          Proceed to Shipping
        </button>
      )}

      {state === 'shipping' && (
        <button data-testid="fsm-action-btn" onClick={() => transitionTo('payment')} style={{ padding: 8 }}>
          Proceed to Payment
        </button>
      )}

      {state === 'payment' && (
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
            <input type="checkbox" checked={failPayment} onChange={(e) => setFailPayment(e.target.checked)} />
            Simulate Card Decline
          </label>
          <button data-testid="fsm-action-btn" onClick={processPayment} style={{ padding: 8 }}>
            Pay Now ($120.00)
          </button>
        </div>
      )}

      {state === 'processing' && <div>Processing transaction securely...</div>}

      {state === 'error' && (
        <div>
          <div style={{ color: '#ef4444', marginBottom: 8 }}>Card Declined</div>
          <button data-testid="fsm-retry-btn" onClick={() => transitionTo('payment')} style={{ padding: 8 }}>
            Retry Payment
          </button>
        </div>
      )}

      {state === 'success' && (
        <div style={{ color: '#10b981', fontWeight: 'bold' }}>
          Order Confirmed! Thank you for your purchase.
        </div>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-cart-state',
        name: 'Starts in CART State',
        description: 'Checks initial FSM state is CART.',
        expectedResult: 'Current State: CART',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('fsm-state-badge').textContent).toContain('CART');
        },
      },
      {
        id: 'transitions-to-shipping',
        name: 'Transitions to SHIPPING State',
        description: 'Clicking action button advances to SHIPPING.',
        expectedResult: 'Current State: SHIPPING',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('fsm-action-btn'));
          expect(getByTestId('fsm-state-badge').textContent).toContain('SHIPPING');
        },
      },
      {
        id: 'hidden-error-retry-loop',
        name: 'Recovers from ERROR back to PAYMENT',
        description: 'On error, retry button returns to PAYMENT state.',
        hidden: true,
        weight: 2,
        expectedResult: 'Returns to PAYMENT',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('fsm-action-btn')); // shipping
          fireEvent.click(getByTestId('fsm-action-btn')); // payment
          const checkbox = document.querySelector('input[type="checkbox"]') as HTMLElement;
          fireEvent.click(checkbox);
          fireEvent.click(getByTestId('fsm-action-btn')); // pay now
          await sleep(200);
          expect(getByTestId('fsm-state-badge').textContent).toContain('ERROR');
          fireEvent.click(getByTestId('fsm-retry-btn'));
          expect(getByTestId('fsm-state-badge').textContent).toContain('PAYMENT');
        },
      },
    ],
  },

  // 9. Dual Transfer List with Bulk Operations
  {
    id: 'dual-transfer-list',
    title: 'Dual Transfer List with Bulk Select & Move',
    slug: 'dual-transfer-list',
    difficulty: 'Hard',
    estimatedTime: '35 mins',
    category: 'Lists',
    tags: ['Transfer List', 'Sets', 'Bulk Selection', 'Lists'],
    description:
      'Build a dual transfer list component with "Available" and "Selected" columns, allowing moving single items or all items between columns using checkboxes.',
    requirements: [
      'Two columns: "Available" and "Selected".',
      'Checkboxes next to items to select multiple items.',
      'Control buttons: ">" (move selected right), "<" (move selected left), ">>" (move all right), "<<" (move all left).',
      'Moved items are cleared from their selection state.',
    ],
    functionalRequirements: [
      'Maintain sets of selected item IDs.',
      'Immutable transfer between left and right lists.',
    ],
    UIRequirements: [
      'Left column with data-testid="col-available".',
      'Right column with data-testid="col-selected".',
      'Move Right button with data-testid="move-right-btn".',
      'Move All Right button with data-testid="move-all-right-btn".',
    ],
    edgeCases: ['Moving when no items are selected (buttons disabled)'],
    hints: ['Set operations: left.filter(x => !selected.has(x)).'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Commonly used in administrative permission managers and user role assignment tools.',
    evaluationRules: ['Transfers selected items.', 'Transfers all items on bulk button.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Dual Transfer List</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const INITIAL_LEFT = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];

export default function App() {
  const [left, setLeft] = useState<string[]>(INITIAL_LEFT);
  const [right, setRight] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const moveRight = () => {
    const toMove = left.filter((i) => checked.includes(i));
    setRight((prev) => [...prev, ...toMove]);
    setLeft((prev) => prev.filter((i) => !checked.includes(i)));
    setChecked((prev) => prev.filter((i) => !toMove.includes(i)));
  };

  const moveAllRight = () => {
    setRight((prev) => [...prev, ...left]);
    setLeft([]);
    setChecked([]);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h2>Dual Transfer List</h2>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div data-testid="col-available" style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, width: 160, minHeight: 180 }}>
          <h4>Available</h4>
          {left.map((item) => (
            <label key={item} style={{ display: 'block', margin: '4px 0', fontSize: 13 }}>
              <input type="checkbox" checked={checked.includes(item)} onChange={() => toggleCheck(item)} />
              {' '}{item}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button data-testid="move-all-right-btn" onClick={moveAllRight} disabled={left.length === 0}>
            ≫
          </button>
          <button data-testid="move-right-btn" onClick={moveRight} disabled={!left.some((i) => checked.includes(i))}>
            &gt;
          </button>
        </div>

        <div data-testid="col-selected" style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, width: 160, minHeight: 180 }}>
          <h4>Selected</h4>
          {right.map((item) => (
            <div key={item} style={{ margin: '4px 0', fontSize: 13 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-columns-render',
        name: 'Initial Available Items Rendered',
        description: 'Checks React and TypeScript in Available column.',
        expectedResult: 'Available items present',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('col-available').textContent).toContain('React');
        },
      },
      {
        id: 'move-all-right-action',
        name: 'Moves All Items Right',
        description: 'Clicking ≫ transfers all 4 items to Selected.',
        expectedResult: 'All items in Selected',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('move-all-right-btn'));
          expect(getByTestId('col-selected').textContent).toContain('React');
          expect(getByTestId('col-available').textContent).not.toContain('React');
        },
      },
      {
        id: 'hidden-move-checked-right',
        name: 'Moves Only Checked Items',
        description: 'Checking React and clicking > moves only React.',
        hidden: true,
        weight: 2,
        expectedResult: 'Only React moved',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const checkbox = document.querySelector('input[type="checkbox"]') as HTMLElement;
          fireEvent.click(checkbox);
          fireEvent.click(getByTestId('move-right-btn'));
          expect(getByTestId('col-selected').textContent).toContain('React');
        },
      },
    ],
  },

  // 10. Virtualized Data Grid with Cell Editing
  {
    id: 'virtualized-data-grid',
    title: 'Editable Data Grid with Cell Mutations',
    slug: 'virtualized-data-grid',
    difficulty: 'Hard',
    estimatedTime: '40 mins',
    category: 'Performance & Virtualization',
    tags: ['Data Grid', 'Inline Editing', 'Spreadsheet', 'Cells'],
    description:
      'Build a mini spreadsheet / editable data grid where double-clicking any cell enables inline text editing, pressing Enter saves, and pressing Escape cancels the edit.',
    requirements: [
      'Render a 3x3 grid of editable cells.',
      'Click or double click on a cell activates an input box.',
      'Pressing Enter or clicking outside saves the new cell value.',
      'Pressing Escape cancels and discards changes.',
    ],
    functionalRequirements: [
      'Track editingCell: { row: number, col: number } in state.',
      'Store matrix grid in 2D array or Record.',
    ],
    UIRequirements: [
      'Grid cells with data-testid="cell-[r]-[c]".',
      'Cell editor input with data-testid="cell-edit-input".',
    ],
    edgeCases: ['Editing cell and pressing Escape restores original text'],
    hints: ['Manage tempValue state while editing; commit to gridData on Enter/blur.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Tests spreadsheet-like inline editing UX, keyboard interactions, and matrix state updates.',
    evaluationRules: ['Enables edit on cell click.', 'Saves on Enter; cancels on Escape.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Editable Data Grid</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const INITIAL_GRID = [
  ['Alpha', '100', 'Active'],
  ['Beta', '250', 'Pending'],
  ['Gamma', '400', 'Complete'],
];

export default function App() {
  const [grid, setGrid] = useState<string[][]>(INITIAL_GRID);
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);
  const [editVal, setEditVal] = useState('');

  const startEdit = (r: number, c: number) => {
    setEditing({ r, c });
    setEditVal(grid[r][c]);
  };

  const saveEdit = () => {
    if (!editing) return;
    const next = grid.map((row, rIdx) =>
      rIdx === editing.r
        ? row.map((val, cIdx) => (cIdx === editing.c ? editVal : val))
        : row
    );
    setGrid(next);
    setEditing(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditing(null);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>Editable Data Grid</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((val, c) => (
                <td
                  key={c}
                  data-testid={\`cell-\${r}-\${c}\`}
                  onClick={() => startEdit(r, c)}
                  style={{
                    border: '1px solid #ccc',
                    padding: 8,
                    minWidth: 80,
                    height: 36,
                    cursor: 'pointer',
                  }}
                >
                  {editing && editing.r === r && editing.c === c ? (
                    <input
                      data-testid="cell-edit-input"
                      autoFocus
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  ) : (
                    val
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-cell-value',
        name: 'Renders Initial Matrix Values',
        description: 'Cell 0-0 contains Alpha.',
        expectedResult: 'Alpha in cell 0-0',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('cell-0-0').textContent).toContain('Alpha');
        },
      },
      {
        id: 'edit-and-save-cell',
        name: 'Edits and Saves Cell Value',
        description: 'Clicking cell 0-0, typing Omega, and pressing Enter saves Omega.',
        expectedResult: 'Omega in cell 0-0',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          fireEvent.click(getByTestId('cell-0-0'));
          const input = getByTestId('cell-edit-input') as HTMLInputElement;
          await type(input, 'Omega');
          fireEvent.keyDown(input, 'Enter');
          expect(getByTestId('cell-0-0').textContent).toContain('Omega');
        },
      },
      {
        id: 'hidden-escape-cancels',
        name: 'Escape Key Cancels Cell Edit',
        description: 'Typing and pressing Escape reverts value.',
        hidden: true,
        weight: 1,
        expectedResult: 'Original value restored',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          fireEvent.click(getByTestId('cell-1-0')); // Beta
          const input = getByTestId('cell-edit-input') as HTMLInputElement;
          await type(input, 'Modified');
          fireEvent.keyDown(input, 'Escape');
          expect(getByTestId('cell-1-0').textContent).toContain('Beta');
        },
      },
    ],
  },
];
