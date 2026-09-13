import { MachineCodingChallenge } from '../../types/machineCodingChallenge';

export const EASY_CHALLENGES: MachineCodingChallenge[] = [
  // 1. Counter with Step and Limits
  {
    id: 'counter-step-limit',
    title: 'Counter with Step & Limit Controls',
    slug: 'counter-step-limit',
    difficulty: 'Easy',
    estimatedTime: '15 mins',
    category: 'State Management',
    tags: ['useState', 'Numbers', 'Clamping', 'Disabled States'],
    description:
      'Build a feature-complete Counter component supporting custom step increments, configurable min/max bounds, and reset capability.',
    requirements: [
      'Render the current count display with initial value 0.',
      'Provide Increment (+) and Decrement (-) buttons.',
      'Allow configuring a custom "Step" value via a numeric input (default step 1).',
      'Enforce min limit (-10) and max limit (10). Disable buttons when limits are reached.',
      'Provide a Reset button that resets count to 0.',
    ],
    functionalRequirements: [
      'Increment increases count by current step.',
      'Decrement decreases count by current step.',
      'Count cannot exceed 10 or fall below -10.',
      'Buttons must be visually or functionally disabled at boundaries.',
    ],
    UIRequirements: [
      'Show count prominently with data-testid="count-value".',
      'Buttons for increment ("+"), decrement ("-"), and "Reset".',
      'Step input field with data-testid="step-input".',
    ],
    edgeCases: [
      'Step is greater than remaining distance to limit (must clamp to limit).',
      'Negative step inputs (should be treated as absolute positive or defaulted).',
    ],
    hints: [
      'Use Math.min and Math.max to clamp values cleanly.',
      'Derive the disabled state for buttons from the current count and step.',
    ],
    constraints: ['Use pure React with standard hooks.', 'Do not use external UI libraries.'],
    interviewNotes:
      'Tests fundamental useState, controlled numeric inputs, clamping logic, and accessible button state handling.',
    evaluationRules: [
      'Correct state updates on increment/decrement.',
      'Boundary enforcement at min and max limits.',
      'Reset works predictably.',
    ],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  // Your implementation here
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Counter with Step & Limits</h2>
      <div data-testid="count-value">0</div>
      {/* Controls here */}
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const MIN = -10;
  const MAX = 10;

  const handleIncrement = () => setCount((c) => Math.min(MAX, c + step));
  const handleDecrement = () => setCount((c) => Math.max(MIN, c - step));
  const handleReset = () => setCount(0);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Counter with Step & Limits</h2>
      <div
        data-testid="count-value"
        style={{ fontSize: 40, fontWeight: 'bold', margin: '16px 0', color: '#3b82f6' }}
      >
        {count}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8, fontSize: 14 }}>Step:</label>
        <input
          data-testid="step-input"
          type="number"
          min="1"
          value={step}
          onChange={(e) => setStep(Math.max(1, Number(e.target.value) || 1))}
          style={{ width: 60, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleDecrement}
          disabled={count <= MIN}
          style={{ padding: '8px 16px', borderRadius: 6, cursor: count <= MIN ? 'not-allowed' : 'pointer' }}
        >
          -
        </button>
        <button
          onClick={handleIncrement}
          disabled={count >= MAX}
          style={{ padding: '8px 16px', borderRadius: 6, cursor: count >= MAX ? 'not-allowed' : 'pointer' }}
        >
          +
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '8px 16px', borderRadius: 6, background: '#f3f4f6', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'render-initial-state',
        name: 'Renders Initial Count at 0',
        description: 'Verifies the counter displays 0 when first mounted.',
        expectedResult: '0',
        testFn: ({ getByTestId, expect }) => {
          const el = getByTestId('count-value');
          expect(el.textContent?.trim()).toBe('0');
        },
      },
      {
        id: 'increment-count',
        name: 'Increments Count by Step',
        description: 'Clicking + increments count by current step.',
        expectedResult: '1',
        testFn: ({ getByText, getByTestId, fireEvent, expect }) => {
          const incBtn = getByText('+');
          fireEvent.click(incBtn);
          const el = getByTestId('count-value');
          expect(el.textContent?.trim()).toBe('1');
        },
      },
      {
        id: 'custom-step-change',
        name: 'Applies Custom Step Value',
        description: 'Changing step to 3 and clicking + increments by 3.',
        expectedResult: '3',
        testFn: async ({ getByTestId, getByText, type, fireEvent, expect }) => {
          const stepInput = getByTestId('step-input') as HTMLInputElement;
          await type(stepInput, '3');
          const incBtn = getByText('+');
          fireEvent.click(incBtn);
          const el = getByTestId('count-value');
          expect(el.textContent?.trim()).toBe('3');
        },
      },
      {
        id: 'reset-functionality',
        name: 'Resets to Zero',
        description: 'Clicking Reset restores count to 0.',
        expectedResult: '0',
        testFn: ({ getByText, getByTestId, fireEvent, expect }) => {
          const incBtn = getByText('+');
          fireEvent.click(incBtn);
          fireEvent.click(incBtn);
          const resetBtn = getByText(/Reset/i);
          fireEvent.click(resetBtn);
          const el = getByTestId('count-value');
          expect(el.textContent?.trim()).toBe('0');
        },
      },
      {
        id: 'hidden-max-bound-clamping',
        name: 'Clamps to Max Limit (+10)',
        description: 'Count cannot exceed 10 even if increment is pressed repeatedly.',
        hidden: true,
        weight: 2,
        expectedResult: '10',
        testFn: ({ getByText, getByTestId, fireEvent, expect }) => {
          const incBtn = getByText('+');
          for (let i = 0; i < 15; i++) {
            fireEvent.click(incBtn);
          }
          const el = getByTestId('count-value');
          expect(Number(el.textContent?.trim())).toBe(10);
        },
      },
      {
        id: 'hidden-min-bound-clamping',
        name: 'Clamps to Min Limit (-10)',
        description: 'Count cannot go below -10 when decrement is pressed repeatedly.',
        hidden: true,
        weight: 2,
        expectedResult: '-10',
        testFn: ({ getByText, getByTestId, fireEvent, expect }) => {
          const decBtn = getByText('-');
          for (let i = 0; i < 15; i++) {
            fireEvent.click(decBtn);
          }
          const el = getByTestId('count-value');
          expect(Number(el.textContent?.trim())).toBe(-10);
        },
      },
    ],
  },

  // 2. Filterable Todo List
  {
    id: 'todo-filter-list',
    title: 'Filterable Todo Task List',
    slug: 'todo-filter-list',
    difficulty: 'Easy',
    estimatedTime: '20 mins',
    category: 'Lists',
    tags: ['useState', 'Forms', 'Filter', 'Derived State'],
    description:
      'Build an interactive Todo application where users can add tasks, toggle completion, delete tasks, and filter by All, Active, and Completed.',
    requirements: [
      'Input field and Add button to create a new task.',
      'List rendering all tasks with a checkbox and delete button.',
      'Filter buttons: "All", "Active", "Completed".',
      'Show count of remaining active items ("X items left").',
      'Prevent adding empty or whitespace-only tasks.',
    ],
    functionalRequirements: [
      'Adding task appends to task list and clears input.',
      'Clicking checkbox toggles item between active and completed.',
      'Filtering displays only tasks matching current filter tab.',
      'Delete button removes the specific item.',
    ],
    UIRequirements: [
      'Input with data-testid="todo-input".',
      'Add button or Enter key submission.',
      'Filter buttons with data-testid="filter-all", "filter-active", "filter-completed".',
      'Task items with data-testid="todo-item".',
    ],
    edgeCases: ['Submitting empty string', 'Deleting while a filter is active'],
    hints: [
      'Derive the filtered list on render rather than maintaining multiple synced arrays.',
      'Store each todo as { id, text, completed }.',
    ],
    constraints: ['Pure React. No external state management libraries.'],
    interviewNotes:
      'Classic interview problem testing controlled inputs, immutable list updates, and derived filtering state.',
    evaluationRules: [
      'Proper addition of new items.',
      'Correct toggling of completed status.',
      'Filters accurately reflect active/completed subsets.',
    ],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  // Your implementation here
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Todo List</h2>
      <input data-testid="todo-input" placeholder="What needs to be done?" />
      <button>Add</button>
      {/* Filters and list */}
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Buy groceries', completed: false },
    { id: '2', text: 'Read React 19 docs', completed: true },
  ]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setTodos((prev) => [...prev, { id: String(Date.now()), text: text.trim(), completed: false }]);
    setText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>Todo List</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          data-testid="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
          Add
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          data-testid="filter-all"
          onClick={() => setFilter('all')}
          style={{ fontWeight: filter === 'all' ? 'bold' : 'normal' }}
        >
          All
        </button>
        <button
          data-testid="filter-active"
          onClick={() => setFilter('active')}
          style={{ fontWeight: filter === 'active' ? 'bold' : 'normal' }}
        >
          Active
        </button>
        <button
          data-testid="filter-completed"
          onClick={() => setFilter('completed')}
          style={{ fontWeight: filter === 'completed' ? 'bold' : 'normal' }}
        >
          Completed
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#666' }}>
          {activeCount} items left
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredTodos.map((todo) => (
          <li
            key={todo.id}
            data-testid="todo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.text}
              </span>
            </label>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-todos',
        name: 'Renders Initial Todos',
        description: 'Verifies the default todo list items render.',
        expectedResult: 'At least 1 item',
        testFn: ({ queryByTestId, expect }) => {
          const item = queryByTestId('todo-item');
          expect(item).toBeTruthy();
        },
      },
      {
        id: 'add-new-todo',
        name: 'Adds New Todo Item',
        description: 'Types a new item and submits, confirming it appears in the list.',
        expectedResult: 'Walk the dog',
        testFn: async ({ getByTestId, getByText, type, fireEvent, expect }) => {
          const input = getByTestId('todo-input') as HTMLInputElement;
          await type(input, 'Walk the dog');
          const addBtn = getByText('Add');
          fireEvent.click(addBtn);

          const newTodo = getByText('Walk the dog');
          expect(newTodo).toBeTruthy();
        },
      },
      {
        id: 'filter-active',
        name: 'Filters Active Items',
        description: 'Clicking Active filter only shows uncompleted items.',
        expectedResult: 'Only active items visible',
        testFn: ({ getByTestId, queryByText, fireEvent, expect }) => {
          const filterActiveBtn = getByTestId('filter-active');
          fireEvent.click(filterActiveBtn);

          // 'Read React 19 docs' was completed in initial state, should not be visible
          const completedItem = queryByText('Read React 19 docs');
          expect(completedItem).toBeNull();
        },
      },
      {
        id: 'hidden-delete-item',
        name: 'Deletes Item from List',
        description: 'Clicking delete removes the item from the list.',
        hidden: true,
        weight: 2,
        expectedResult: 'Item removed',
        testFn: ({ getAllByRole, queryByText, fireEvent, expect }) => {
          const deleteButtons = getAllByRole('button').filter((b) => b.textContent?.includes('Delete'));
          if (deleteButtons.length > 0) {
            fireEvent.click(deleteButtons[0]);
          }
          expect(queryByText('Buy groceries')).toBeNull();
        },
      },
    ],
  },

  // 3. Tabbed Navigation Interface
  {
    id: 'accessible-tabs',
    title: 'Accessible Tabs Navigation',
    slug: 'accessible-tabs',
    difficulty: 'Easy',
    estimatedTime: '15 mins',
    category: 'UI Components',
    tags: ['Tabs', 'Accessibility', 'Active State'],
    description:
      'Implement an accessible tab navigation component where clicking tab headers activates the corresponding panel and switches visible content.',
    requirements: [
      'Render 3 tabs: "Profile", "Settings", "Notifications".',
      'Default to "Profile" tab being active on mount.',
      'Clicking a tab highlights it and displays its unique content panel.',
      'Only the active panel should be visible in the DOM or displayed.',
    ],
    functionalRequirements: [
      'Active tab index is maintained in state.',
      'Proper aria attributes: role="tablist", role="tab", role="tabpanel".',
    ],
    UIRequirements: [
      'Tab headers have data-testid="tab-[id]".',
      'Tab content panel has data-testid="tab-content".',
    ],
    edgeCases: ['Switching rapidly between tabs'],
    hints: ['Store activeTab string or index in state.', 'Conditionally render the active tab content.'],
    constraints: ['Vanilla CSS and React. No 3rd party tabs packages.'],
    interviewNotes: 'Frequently asked in frontend rounds to evaluate clean component state and WAI-ARIA familiarity.',
    evaluationRules: ['Initial active tab is displayed.', 'Clicking switches panels accurately.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  // Your implementation here
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Tab Navigation</h2>
      {/* Tabs */}
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', content: 'User Profile details and biography settings.' },
    { id: 'settings', label: 'Settings', content: 'Account preferences, privacy, and security options.' },
    { id: 'notifications', label: 'Notifications', content: 'Email notifications and push alert toggles.' },
  ];

  const current = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h2>Tab Navigation</h2>
      <div role="tablist" style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', gap: 12 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            data-testid={\`tab-\${tab.id}\`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        data-testid="tab-content"
        style={{ padding: '16px 0', fontSize: 14, color: '#374151' }}
      >
        {current.content}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-tab-content',
        name: 'Displays Initial Tab Content',
        description: 'Checks that Profile content is visible by default.',
        expectedResult: 'Profile details',
        testFn: ({ getByTestId, expect }) => {
          const content = getByTestId('tab-content');
          expect(content.textContent).toContain('Profile');
        },
      },
      {
        id: 'switch-tab-click',
        name: 'Switches Tab on Click',
        description: 'Clicking Settings activates the settings panel.',
        expectedResult: 'Settings content visible',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const settingsBtn = getByTestId('tab-settings');
          fireEvent.click(settingsBtn);
          const content = getByTestId('tab-content');
          expect(content.textContent).toContain('Account preferences');
        },
      },
      {
        id: 'hidden-third-tab',
        name: 'Switches to Notifications Tab',
        description: 'Verifies third tab activates properly.',
        hidden: true,
        weight: 1,
        expectedResult: 'Notifications content visible',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const notifBtn = getByTestId('tab-notifications');
          fireEvent.click(notifBtn);
          const content = getByTestId('tab-content');
          expect(content.textContent).toContain('push alert toggles');
        },
      },
    ],
  },

  // 4. Accordion Component
  {
    id: 'accordion-collapse',
    title: 'Accordion Component with Multi-Expand',
    slug: 'accordion-collapse',
    difficulty: 'Easy',
    estimatedTime: '20 mins',
    category: 'UI Components',
    tags: ['Accordion', 'Collapsible', 'Multiple Selection'],
    description:
      'Create an Accordion component displaying multiple collapsible items. Support toggling individual items, plus a checkbox to toggle between single-expand and multi-expand mode.',
    requirements: [
      'Display 3 FAQ accordion items with titles and expandable bodies.',
      'Clicking an item title toggles its expanded/collapsed body.',
      'Allow multi-expand by default or toggleable via a checkbox.',
    ],
    functionalRequirements: [
      'Maintain set of open item IDs in state.',
      'Expanded items show content; collapsed items hide content.',
    ],
    UIRequirements: [
      'Accordion title buttons with data-testid="accordion-header-[id]".',
      'Expanded content with data-testid="accordion-body-[id]".',
    ],
    edgeCases: ['Collapsing an already open item'],
    hints: ['Use Set or Array in state to hold opened IDs.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates state design for multi-item toggle collections.',
    evaluationRules: ['Expands on click.', 'Collapses on second click.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>FAQ Accordion</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const ITEMS = [
  { id: '1', title: 'What is React?', content: 'React is a library for building user interfaces with declarative components.' },
  { id: '2', title: 'What are React Hooks?', content: 'Hooks let you use state and lifecycle features without writing classes.' },
  { id: '3', title: 'What is Concurrent React?', content: 'Concurrent React allows rendering to be interruptible for smooth user experience.' },
];

export default function App() {
  const [openIds, setOpenIds] = useState<string[]>(['1']);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 480 }}>
      <h2>FAQ Accordion</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ITEMS.map((item) => {
          const isOpen = openIds.includes(item.id);
          return (
            <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <button
                data-testid={\`accordion-header-\${item.id}\`}
                onClick={() => toggle(item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 12,
                  background: '#f9fafb',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{item.title}</span>
                <span>{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div data-testid={\`accordion-body-\${item.id}\`} style={{ padding: 12, fontSize: 14, color: '#4b5563' }}>
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-open-item',
        name: 'Item 1 Open by Default',
        description: 'First item content is rendered initially.',
        expectedResult: 'Item 1 body visible',
        testFn: ({ queryByTestId, expect }) => {
          const body = queryByTestId('accordion-body-1');
          expect(body).toBeTruthy();
        },
      },
      {
        id: 'toggle-item-2',
        name: 'Opens Item 2 on Header Click',
        description: 'Clicking header 2 displays body 2.',
        expectedResult: 'Item 2 body visible',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          const header = getByTestId('accordion-header-2');
          fireEvent.click(header);
          const body = queryByTestId('accordion-body-2');
          expect(body).toBeTruthy();
        },
      },
      {
        id: 'hidden-collapse-open-item',
        name: 'Collapses Item on Re-Click',
        description: 'Clicking open item header closes it.',
        hidden: true,
        weight: 1,
        expectedResult: 'Item 1 body removed',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          const header = getByTestId('accordion-header-1');
          fireEvent.click(header);
          const body = queryByTestId('accordion-body-1');
          expect(body).toBeNull();
        },
      },
    ],
  },

  // 5. Modal Dialog with Overlay Click & Escape
  {
    id: 'accessible-modal',
    title: 'Modal Dialog with Overlay & Esc Handling',
    slug: 'accessible-modal',
    difficulty: 'Easy',
    estimatedTime: '20 mins',
    category: 'UI Components',
    tags: ['Modal', 'Portal', 'Keyboard Events', 'Overlay'],
    description:
      'Build an accessible Modal dialog that opens when clicking a button, closes on overlay click, close button click, and when the Escape key is pressed.',
    requirements: [
      'Button "Open Modal" triggers the dialog.',
      'Dialog appears on top of a darkened overlay.',
      'Clicking the "Close" button or the overlay outside the dialog closes it.',
      'Pressing the Escape keyboard key dismisses the modal.',
    ],
    functionalRequirements: [
      'Listen to keydown event on window when modal is open and clean up on close.',
      'Prevent click events inside the modal from bubbling to overlay.',
    ],
    UIRequirements: [
      'Open button: data-testid="open-modal-btn".',
      'Modal content box: data-testid="modal-content".',
      'Close button: data-testid="close-modal-btn".',
      'Overlay backdrop: data-testid="modal-overlay".',
    ],
    edgeCases: ['Clicking inside modal content box must NOT close the modal.'],
    hints: ['Use e.stopPropagation() on the modal dialog card.', 'Add and remove window keydown listener in useEffect.'],
    constraints: ['Pure React. No third party modal libraries.'],
    interviewNotes: 'Tests understanding of DOM event bubbling, event propagation, and useEffect window event cleanup.',
    evaluationRules: ['Opens on click.', 'Closes on overlay.', 'Closes on Escape.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Modal Dialog</h2>
      <button data-testid="open-modal-btn">Open Modal</button>
    </div>
  );
}`,
    solutionCode: `import React, { useState, useEffect } from 'react';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Modal Dialog</h2>
      <button
        data-testid="open-modal-btn"
        onClick={() => setIsOpen(true)}
        style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer', background: '#3b82f6', color: '#fff', border: 'none' }}
      >
        Open Modal
      </button>

      {isOpen && (
        <div
          data-testid="modal-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            data-testid="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              width: 380,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              color: '#111',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0' }}>Modal Title</h3>
            <p style={{ fontSize: 14, color: '#555', margin: '0 0 20px 0' }}>
              This is an accessible modal dialog. Press ESC or click outside to dismiss.
            </p>
            <button
              data-testid="close-modal-btn"
              onClick={() => setIsOpen(false)}
              style={{ padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initially-hidden',
        name: 'Modal Initially Closed',
        description: 'Verifies modal content is not in the DOM on load.',
        expectedResult: 'Modal content is null',
        testFn: ({ queryByTestId, expect }) => {
          expect(queryByTestId('modal-content')).toBeNull();
        },
      },
      {
        id: 'open-modal',
        name: 'Opens on Button Click',
        description: 'Clicking Open Modal renders the dialog.',
        expectedResult: 'Modal content visible',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          const btn = getByTestId('open-modal-btn');
          fireEvent.click(btn);
          expect(queryByTestId('modal-content')).toBeTruthy();
        },
      },
      {
        id: 'close-on-button',
        name: 'Closes via Close Button',
        description: 'Clicking the Close button closes the dialog.',
        expectedResult: 'Modal dismissed',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('open-modal-btn'));
          fireEvent.click(getByTestId('close-modal-btn'));
          expect(queryByTestId('modal-content')).toBeNull();
        },
      },
      {
        id: 'hidden-escape-dismiss',
        name: 'Dismisses on Escape Key',
        description: 'Pressing Escape dismisses the modal.',
        hidden: true,
        weight: 2,
        expectedResult: 'Modal dismissed by Escape',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('open-modal-btn'));
          fireEvent.keyDown(window as any, 'Escape');
          expect(queryByTestId('modal-content')).toBeNull();
        },
      },
    ],
  },

  // 6. Character Counter & Textarea Limit
  {
    id: 'character-counter',
    title: 'Textarea Character Counter & Word Tracker',
    slug: 'character-counter',
    difficulty: 'Easy',
    estimatedTime: '15 mins',
    category: 'Forms',
    tags: ['Forms', 'Textarea', 'Limits', 'Validation'],
    description:
      'Build a message box with live character and word count tracking. Enforce a max character limit of 140, warning when close to limit (>= 120), and disabling typing or indicating overflow beyond limit.',
    requirements: [
      'Textarea allowing user to type messages.',
      'Show live character count: "X / 140 characters".',
      'Show live word count: "Y words".',
      'Warning state when character count is >= 120.',
      'Disallow typing beyond 140 characters.',
    ],
    functionalRequirements: [
      'Trim and split words accurately on spaces.',
      'Enforce maxLength=140 on textarea or slice value in onChange.',
    ],
    UIRequirements: [
      'Textarea with data-testid="char-textarea".',
      'Character count display with data-testid="char-count".',
      'Word count display with data-testid="word-count".',
    ],
    edgeCases: ['Multiple spaces between words', 'Leading/trailing whitespace'],
    hints: ['Use e.target.value.slice(0, 140)', 'Split on /\\s+/ filter Boolean for words.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates string manipulation, controlled textarea handling, and reactive count displays.',
    evaluationRules: ['Accurate char count.', 'Accurate word count.', 'Limit capped at 140.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Character Counter</h2>
      <textarea data-testid="char-textarea" />
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [text, setText] = useState('');
  const MAX = 140;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value.slice(0, MAX));
  };

  const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
  const chars = text.length;
  const isNearLimit = chars >= 120;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>Character Counter</h2>
      <textarea
        data-testid="char-textarea"
        value={text}
        onChange={handleChange}
        rows={4}
        placeholder="Type your message..."
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 6,
          border: \`1px solid \${isNearLimit ? '#f59e0b' : '#ccc'}\`,
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: '#666' }}>
        <span data-testid="word-count">{words} words</span>
        <span data-testid="char-count" style={{ color: isNearLimit ? '#f59e0b' : 'inherit', fontWeight: isNearLimit ? 'bold' : 'normal' }}>
          {chars} / {MAX} characters
        </span>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-counts',
        name: 'Initial Zero Counts',
        description: 'Starts at 0 words and 0 / 140 characters.',
        expectedResult: '0 words, 0 / 140 characters',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('char-count').textContent).toContain('0 / 140');
          expect(getByTestId('word-count').textContent).toContain('0 words');
        },
      },
      {
        id: 'type-words-update',
        name: 'Updates Counts on Typing',
        description: 'Typing "Hello React World" shows 3 words and 17 chars.',
        expectedResult: '3 words',
        testFn: async ({ getByTestId, type, expect }) => {
          const textarea = getByTestId('char-textarea') as HTMLTextAreaElement;
          await type(textarea, 'Hello React World');
          expect(getByTestId('word-count').textContent).toContain('3 words');
          expect(getByTestId('char-count').textContent).toContain('17 / 140');
        },
      },
      {
        id: 'hidden-max-cap',
        name: 'Enforces 140 Character Limit',
        description: 'Typing more than 140 chars is truncated at 140.',
        hidden: true,
        weight: 1,
        expectedResult: '140 / 140 characters max',
        testFn: async ({ getByTestId, type, expect }) => {
          const textarea = getByTestId('char-textarea') as HTMLTextAreaElement;
          const longText = 'A'.repeat(160);
          await type(textarea, longText);
          expect(getByTestId('char-count').textContent).toContain('140 / 140');
        },
      },
    ],
  },

  // 7. Interactive Star Rating Component
  {
    id: 'star-rating',
    title: 'Interactive Star Rating Component',
    slug: 'star-rating',
    difficulty: 'Easy',
    estimatedTime: '15 mins',
    category: 'UI Components',
    tags: ['Rating', 'Hover State', 'Mouse Events'],
    description:
      'Build a 5-star rating component with hover preview, click to select, and a reset/clear option. Shows text description of the selected rating.',
    requirements: [
      'Render 5 stars in a row.',
      'Hovering over a star highlights all stars up to that rating.',
      'Clicking a star sets and locks the rating.',
      'Moving mouse away restores previous selected rating.',
      'Show selected score: "Rating: X / 5".',
    ],
    functionalRequirements: [
      'Maintain selectedRating and hoverRating in state.',
      'Use onMouseEnter and onMouseLeave on stars.',
    ],
    UIRequirements: [
      'Star buttons with data-testid="star-[1-5]".',
      'Rating label with data-testid="rating-display".',
    ],
    edgeCases: ['Clicking already selected star'],
    hints: ['activeRating = hoverRating || selectedRating'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Tests dual-state coordination between temporary hover feedback and permanent selection.',
    evaluationRules: ['Click sets rating.', 'Display updates accurately.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Star Rating</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const displayRating = hover || rating;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 350 }}>
      <h2>Star Rating</h2>
      <div style={{ display: 'flex', gap: 6, fontSize: 32, cursor: 'pointer' }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            data-testid={\`star-\${star}\`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            style={{ color: star <= displayRating ? '#f59e0b' : '#d1d5db', transition: 'color 100ms' }}
          >
            ★
          </span>
        ))}
      </div>
      <div data-testid="rating-display" style={{ marginTop: 12, fontSize: 14, color: '#4b5563' }}>
        Rating: {rating} / 5
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-rating-zero',
        name: 'Initializes with 0 Rating',
        description: 'Displays Rating: 0 / 5 initially.',
        expectedResult: 'Rating: 0 / 5',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('rating-display').textContent).toContain('Rating: 0 / 5');
        },
      },
      {
        id: 'click-star-4',
        name: 'Clicking 4th Star Sets Rating to 4',
        description: 'Clicking star 4 updates rating to 4 / 5.',
        expectedResult: 'Rating: 4 / 5',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const star4 = getByTestId('star-4');
          fireEvent.click(star4);
          expect(getByTestId('rating-display').textContent).toContain('Rating: 4 / 5');
        },
      },
      {
        id: 'hidden-star-5',
        name: 'Clicking 5th Star Sets Full Rating',
        description: 'Verifies star 5 click sets 5 / 5.',
        hidden: true,
        weight: 1,
        expectedResult: 'Rating: 5 / 5',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('star-5'));
          expect(getByTestId('rating-display').textContent).toContain('Rating: 5 / 5');
        },
      },
    ],
  },

  // 8. Accessible Toggle Switch
  {
    id: 'accessible-toggle',
    title: 'Accessible Toggle Switch with Keyboard Support',
    slug: 'accessible-toggle',
    difficulty: 'Easy',
    estimatedTime: '15 mins',
    category: 'UI Components',
    tags: ['Toggle', 'Switch', 'Accessibility', 'Keyboard'],
    description:
      'Build an accessible Toggle Switch component with role="switch", aria-checked status, smooth CSS slide transition, and keyboard Spacebar toggle support.',
    requirements: [
      'Render a toggle switch with On / Off label.',
      'Clicking the switch toggles its state.',
      'Pressing Space or Enter when focused toggles state.',
      'Supports disabled prop / state.',
    ],
    functionalRequirements: [
      'aria-checked attribute accurately reflects boolean state.',
      'tabIndex={0} allows keyboard focus.',
    ],
    UIRequirements: [
      'Switch button with data-testid="toggle-switch".',
      'Status label with data-testid="toggle-status".',
    ],
    edgeCases: ['Keypress on other keys should not toggle'],
    hints: ['Check if e.key === " " or "Enter".'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates component accessibility (a11y) and keyboard event handling.',
    evaluationRules: ['Click toggles state.', 'Space key toggles state.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Accessible Toggle Switch</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => setIsOn((prev) => !prev);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 350 }}>
      <h2>Accessible Toggle Switch</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          role="switch"
          aria-checked={isOn}
          tabIndex={0}
          data-testid="toggle-switch"
          onClick={toggle}
          onKeyDown={handleKeyDown}
          style={{
            width: 52,
            height: 28,
            borderRadius: 14,
            backgroundColor: isOn ? '#10b981' : '#d1d5db',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 200ms',
            outline: 'none',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#fff',
              transform: isOn ? 'translateX(24px)' : 'translateX(0)',
              transition: 'transform 200ms',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
        <span data-testid="toggle-status" style={{ fontSize: 14, fontWeight: 600 }}>
          {isOn ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-disabled-state',
        name: 'Starts in Disabled State',
        description: 'aria-checked is false and label is Disabled.',
        expectedResult: 'Disabled',
        testFn: ({ getByTestId, expect }) => {
          const sw = getByTestId('toggle-switch');
          expect(sw.getAttribute('aria-checked')).toBe('false');
          expect(getByTestId('toggle-status').textContent).toBe('Disabled');
        },
      },
      {
        id: 'click-toggle',
        name: 'Click Toggles to Enabled',
        description: 'Clicking switch enables it.',
        expectedResult: 'Enabled',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const sw = getByTestId('toggle-switch');
          fireEvent.click(sw);
          expect(sw.getAttribute('aria-checked')).toBe('true');
          expect(getByTestId('toggle-status').textContent).toBe('Enabled');
        },
      },
      {
        id: 'hidden-space-key',
        name: 'Space Key Toggles Switch',
        description: 'Pressing spacebar toggles the switch.',
        hidden: true,
        weight: 1,
        expectedResult: 'Toggled via Space',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const sw = getByTestId('toggle-switch');
          fireEvent.keyDown(sw, ' ');
          expect(sw.getAttribute('aria-checked')).toBe('true');
        },
      },
    ],
  },

  // 9. Pagination Controller
  {
    id: 'pagination-controller',
    title: 'Client-Side Pagination Controller',
    slug: 'pagination-controller',
    difficulty: 'Easy',
    estimatedTime: '20 mins',
    category: 'Lists',
    tags: ['Pagination', 'Lists', 'Slice', 'Calculations'],
    description:
      'Build a client-side pagination component that splits a list of 25 items into pages of 5 items, with Prev, Next, and numbered page buttons.',
    requirements: [
      'List of 25 items (Items 1 to 25).',
      'Display 5 items per page.',
      'Show current page items: "Item 1" through "Item 5" on page 1.',
      'Page buttons [1] [2] [3] [4] [5], plus [Prev] and [Next].',
      'Prev disabled on page 1; Next disabled on page 5.',
    ],
    functionalRequirements: [
      'Calculate startIndex = (page - 1) * pageSize and slice array.',
      'Clicking page button switches active page.',
    ],
    UIRequirements: [
      'List items with data-testid="page-item".',
      'Prev button with data-testid="pagination-prev".',
      'Next button with data-testid="pagination-next".',
      'Page button with data-testid="pagination-page-[n]".',
    ],
    edgeCases: ['Navigating past boundary limits'],
    hints: ['Math.ceil(total / pageSize) to find total pages.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Classic pagination math and slice array logic.',
    evaluationRules: ['Displays 5 items per page.', 'Next/Prev works and disables appropriately.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Pagination Controller</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const ITEMS = Array.from({ length: 25 }, (_, i) => \`Item \${i + 1}\`);
const PAGE_SIZE = 5;

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(ITEMS.length / PAGE_SIZE);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = ITEMS.slice(start, start + PAGE_SIZE);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>Pagination Controller</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        {pageItems.map((item) => (
          <li key={item} data-testid="page-item" style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
            {item}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          data-testid="pagination-prev"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ padding: '6px 12px', borderRadius: 6, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            data-testid={\`pagination-page-\${num}\`}
            onClick={() => setCurrentPage(num)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontWeight: currentPage === num ? 'bold' : 'normal',
              background: currentPage === num ? '#3b82f6' : '#f3f4f6',
              color: currentPage === num ? '#fff' : '#111',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {num}
          </button>
        ))}

        <button
          data-testid="pagination-next"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{ padding: '6px 12px', borderRadius: 6, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-page-one',
        name: 'Renders Page 1 with 5 Items',
        description: 'Displays Items 1 to 5 initially.',
        expectedResult: '5 items on page 1',
        testFn: ({ getAllByRole, getByTestId, expect }) => {
          const items = getAllByRole('listitem');
          expect(items.length).toBe(5);
          expect(items[0].textContent).toContain('Item 1');
          expect(getByTestId('pagination-prev').hasAttribute('disabled')).toBeTruthy();
        },
      },
      {
        id: 'click-next-page',
        name: 'Clicking Next Moves to Page 2',
        description: 'Page 2 renders Items 6 through 10.',
        expectedResult: 'Item 6 on page 2',
        testFn: ({ getByTestId, getAllByRole, fireEvent, expect }) => {
          const nextBtn = getByTestId('pagination-next');
          fireEvent.click(nextBtn);
          const items = getAllByRole('listitem');
          expect(items[0].textContent).toContain('Item 6');
        },
      },
      {
        id: 'hidden-last-page',
        name: 'Page 5 Disables Next Button',
        description: 'Navigating to page 5 disables Next.',
        hidden: true,
        weight: 1,
        expectedResult: 'Next disabled on page 5',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('pagination-page-5'));
          expect(getByTestId('pagination-next').hasAttribute('disabled')).toBeTruthy();
        },
      },
    ],
  },

  // 10. Stopwatch with Lap Times
  {
    id: 'stopwatch-laps',
    title: 'Stopwatch with Lap Tracking',
    slug: 'stopwatch-laps',
    difficulty: 'Easy',
    estimatedTime: '20 mins',
    category: 'Async & Hooks',
    tags: ['useRef', 'setInterval', 'Timer', 'Stopwatch'],
    description:
      'Build a precision stopwatch with Start, Stop, Lap, and Reset capabilities using setInterval and useRef for timer management.',
    requirements: [
      'Display time formatted as MM:SS.ms (e.g. 00:00.00).',
      'Start / Stop toggle button.',
      'Lap button that records current timestamp into a list.',
      'Reset button that resets time to 0 and clears laps.',
    ],
    functionalRequirements: [
      'Store timerId in useRef to avoid memory leaks and stale intervals.',
      'Clean up interval when stopping or unmounting.',
    ],
    UIRequirements: [
      'Timer display with data-testid="stopwatch-display".',
      'Start/Stop button with data-testid="start-stop-btn".',
      'Reset button with data-testid="reset-btn".',
      'Lap list with data-testid="lap-item".',
    ],
    edgeCases: ['Double clicking start should not create duplicate running intervals.'],
    hints: ['Use useRef(null) for interval ID.', 'Track elapsed milliseconds in state.'],
    constraints: ['Vanilla React with standard hooks.'],
    interviewNotes: 'Crucial interview test of setInterval lifecycle, clearInterval cleanup, and useRef.',
    evaluationRules: ['Timer runs when started.', 'Stops when stopped.', 'Laps recorded.'],
    starterCode: `import React, { useState, useRef } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Stopwatch</h2>
      <div data-testid="stopwatch-display">00:00.00</div>
    </div>
  );
}`,
    solutionCode: `import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [ms, setMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setMs((prev) => prev + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => setIsRunning((r) => !r);

  const handleReset = () => {
    setIsRunning(false);
    setMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps((prev) => [...prev, ms]);
    }
  };

  const format = (totalMs: number) => {
    const seconds = Math.floor(totalMs / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const milli = Math.floor((totalMs % 1000) / 10);
    return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}.\${String(milli).padStart(2, '0')}\`;
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Stopwatch</h2>
      <div
        data-testid="stopwatch-display"
        style={{ fontSize: 36, fontFamily: 'monospace', fontWeight: 700, margin: '16px 0' }}
      >
        {format(ms)}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          data-testid="start-stop-btn"
          onClick={handleStartStop}
          style={{ padding: '8px 16px', borderRadius: 6, background: isRunning ? '#ef4444' : '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          data-testid="lap-btn"
          onClick={handleLap}
          disabled={!isRunning}
          style={{ padding: '8px 16px', borderRadius: 6, cursor: isRunning ? 'pointer' : 'not-allowed' }}
        >
          Lap
        </button>
        <button
          data-testid="reset-btn"
          onClick={handleReset}
          style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>

      {laps.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, borderTop: '1px solid #eee' }}>
          {laps.map((lapMs, idx) => (
            <li key={idx} data-testid="lap-item" style={{ padding: '4px 0' }}>
              Lap {idx + 1}: {format(lapMs)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-stopwatch-zero',
        name: 'Initial Display at 00:00.00',
        description: 'Verifies default stopwatch display.',
        expectedResult: '00:00.00',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('stopwatch-display').textContent).toContain('00:00.00');
        },
      },
      {
        id: 'start-runs-timer',
        name: 'Starts and Advances Timer',
        description: 'Clicking Start causes the timer to advance.',
        expectedResult: 'Timer advances',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          const btn = getByTestId('start-stop-btn');
          fireEvent.click(btn);
          await sleep(60);
          fireEvent.click(btn); // stop

          const display = getByTestId('stopwatch-display');
          expect(display.textContent).not.toBe('00:00.00');
        },
      },
      {
        id: 'hidden-reset-clears-laps',
        name: 'Reset Clears Time and Laps',
        description: 'Clicking reset clears all state.',
        hidden: true,
        weight: 1,
        expectedResult: '00:00.00 after reset',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('reset-btn'));
          expect(getByTestId('stopwatch-display').textContent).toContain('00:00.00');
          expect(queryByTestId('lap-item')).toBeNull();
        },
      },
    ],
  },

  // 11. Color Palette Picker
  {
    id: 'color-picker',
    title: 'Color Palette & Hex Code Inspector',
    slug: 'color-picker',
    difficulty: 'Easy',
    estimatedTime: '15 mins',
    category: 'UI Components',
    tags: ['Color', 'Palette', 'Clipboard', 'Styles'],
    description:
      'Build a color palette inspector where users can click presets or type custom hex colors to preview backgrounds and copy hex codes.',
    requirements: [
      'Render 5 preset color swatch buttons.',
      'Display a live preview box with the currently selected color.',
      'Input field allowing custom hex input with validation.',
      'Show current hex code and "Copy" button.',
    ],
    functionalRequirements: [
      'Validates 3 or 6 digit hex pattern (#fff, #3b82f6).',
      'Preview box backgroundColor updates reactively.',
    ],
    UIRequirements: [
      'Hex input with data-testid="hex-input".',
      'Preview box with data-testid="color-preview".',
      'Preset swatch buttons with data-testid="swatch-[hex]".',
    ],
    edgeCases: ['Invalid hex inputs should not crash or apply broken color.'],
    hints: ['Use regex /^#([0-9A-Fa-f]{3}){1,2}$/ to validate.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Tests input validation, style binding, and palette selection patterns.',
    evaluationRules: ['Swatches change color.', 'Valid hex inputs update preview.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Color Palette Picker</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const PRESETS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function App() {
  const [color, setColor] = useState('#3b82f6');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Color Palette Picker</h2>
      <div
        data-testid="color-preview"
        style={{
          width: '100%',
          height: 120,
          borderRadius: 8,
          backgroundColor: color,
          marginBottom: 16,
          border: '1px solid #e5e7eb',
        }}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {PRESETS.map((hex) => (
          <button
            key={hex}
            data-testid={\`swatch-\${hex.replace('#', '')}\`}
            onClick={() => setColor(hex)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: hex,
              border: color === hex ? '3px solid #111' : '1px solid #ccc',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <div>
        <label style={{ fontSize: 13, marginRight: 8 }}>Hex:</label>
        <input
          data-testid="hex-input"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', width: 100 }}
        />
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-preview-color',
        name: 'Renders Initial Blue Swatch',
        description: 'Color preview defaults to #3b82f6.',
        expectedResult: 'Initial color preview rendered',
        testFn: ({ getByTestId, expect }) => {
          const preview = getByTestId('color-preview');
          expect(preview).toBeTruthy();
        },
      },
      {
        id: 'swatch-click-updates',
        name: 'Clicking Swatch Updates Color',
        description: 'Clicking red swatch #ef4444 sets hex input.',
        expectedResult: '#ef4444',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const red = getByTestId('swatch-ef4444');
          fireEvent.click(red);
          const input = getByTestId('hex-input') as HTMLInputElement;
          expect(input.value).toBe('#ef4444');
        },
      },
      {
        id: 'hidden-type-hex',
        name: 'Typing Hex Updates Color',
        description: 'Typing #10b981 in input updates value.',
        hidden: true,
        weight: 1,
        expectedResult: '#10b981',
        testFn: async ({ getByTestId, type, expect }) => {
          const input = getByTestId('hex-input') as HTMLInputElement;
          await type(input, '#10b981');
          expect(input.value).toBe('#10b981');
        },
      },
    ],
  },
];
