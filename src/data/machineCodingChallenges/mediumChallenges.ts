import { MachineCodingChallenge } from '../../types/machineCodingChallenge';

export const MEDIUM_CHALLENGES: MachineCodingChallenge[] = [
  // 1. Searchable User Directory
  {
    id: 'searchable-user-directory',
    title: 'Searchable User Directory with Empty State',
    slug: 'searchable-user-directory',
    difficulty: 'Medium',
    estimatedTime: '25 mins',
    category: 'Search',
    tags: ['Search', 'Filter', 'Empty State', 'Case Insensitive'],
    description:
      'Build a searchable user directory that displays a list of team members, filters them in real-time by name or email, handles case insensitivity, and displays a dedicated empty state when no results match.',
    requirements: [
      'Render a directory of at least 4 users (name, email, role).',
      'Search input filtering results in real time.',
      'Search must match case-insensitively on name or email.',
      'Show "No users found" empty state when search produces 0 results.',
      'Show total count of visible users (e.g. "Showing 2 users").',
      'Provide a "Clear Search" button when input is non-empty.',
    ],
    functionalRequirements: [
      'Derive filtered users on render rather than synchronizing multiple state arrays.',
      'Clear search button resets input to empty string.',
    ],
    UIRequirements: [
      'Search input with data-testid="user-search-input".',
      'User card items with data-testid="user-card".',
      'Empty state message with data-testid="empty-state".',
      'Count indicator with data-testid="user-count".',
      'Clear button with data-testid="clear-search-btn".',
    ],
    edgeCases: ['Leading/trailing whitespace in search query', 'Symbols or numbers in search'],
    hints: [
      'Use query.trim().toLowerCase() and filter over the static user dataset.',
      'Do not maintain a duplicate filteredUsers state array.',
    ],
    constraints: ['Use standard React. Do not use external search libraries.'],
    interviewNotes:
      'One of the most common frontend interview questions; tests derived state discipline, controlled inputs, and clean empty states.',
    evaluationRules: [
      'Displays all users initially.',
      'Case-insensitive filter works for both name and email.',
      'Empty state appears when query matches nothing.',
    ],
    starterCode: `import React, { useState } from 'react';

const USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Frontend Engineer' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'UX Designer' },
  { id: '3', name: 'Alex Johnson', email: 'alex@example.com', role: 'Backend Architect' },
  { id: '4', name: 'Samantha Williams', email: 'samantha@example.com', role: 'Product Manager' },
];

export default function App() {
  // Your implementation here
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>User Directory</h2>
      <input data-testid="user-search-input" placeholder="Search by name or email..." />
      {/* Directory list */}
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Frontend Engineer' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'UX Designer' },
  { id: '3', name: 'Alex Johnson', email: 'alex@example.com', role: 'Backend Architect' },
  { id: '4', name: 'Samantha Williams', email: 'samantha@example.com', role: 'Product Manager' },
];

export default function App() {
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const filteredUsers = USERS.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h2>User Directory</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          data-testid="user-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        {search && (
          <button
            data-testid="clear-search-btn"
            onClick={() => setSearch('')}
            style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      <div data-testid="user-count" style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Showing {filteredUsers.length} users
      </div>

      {filteredUsers.length === 0 ? (
        <div
          data-testid="empty-state"
          style={{ padding: 32, textAlign: 'center', background: '#f9fafb', borderRadius: 8, color: '#6b7280' }}
        >
          No users found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              data-testid="user-card"
              style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 6 }}
            >
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: '#4b5563' }}>{user.email}</div>
              <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 4 }}>{user.role}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-user-render',
        name: 'Initial Render of All Users',
        description: 'Verifies all 4 initial users are rendered.',
        expectedResult: '4 user cards',
        testFn: ({ getAllByRole, expect }) => {
          const cards = document.querySelectorAll('[data-testid="user-card"]');
          expect(cards.length).toBe(4);
        },
      },
      {
        id: 'search-by-name',
        name: 'Filters Users by Name',
        description: 'Searching "Jane" filters to 1 matching user.',
        expectedResult: 'Jane Smith visible',
        testFn: async ({ getByTestId, type, expect }) => {
          const input = getByTestId('user-search-input') as HTMLInputElement;
          await type(input, 'Jane');
          const cards = document.querySelectorAll('[data-testid="user-card"]');
          expect(cards.length).toBe(1);
          expect(cards[0].textContent).toContain('Jane Smith');
        },
      },
      {
        id: 'case-insensitive-search',
        name: 'Case-Insensitive Search Matching',
        description: 'Searching "ALEX" matches Alex Johnson.',
        expectedResult: 'Alex Johnson visible',
        testFn: async ({ getByTestId, type, expect }) => {
          const input = getByTestId('user-search-input') as HTMLInputElement;
          await type(input, 'ALEX');
          const cards = document.querySelectorAll('[data-testid="user-card"]');
          expect(cards.length).toBe(1);
          expect(cards[0].textContent).toContain('Alex Johnson');
        },
      },
      {
        id: 'empty-search-state',
        name: 'Shows Empty State on Non-Match',
        description: 'Searching "nonexistentxyz" displays No users found.',
        expectedResult: 'No users found',
        testFn: async ({ getByTestId, queryByTestId, type, expect }) => {
          const input = getByTestId('user-search-input') as HTMLInputElement;
          await type(input, 'nonexistentxyz');
          const empty = queryByTestId('empty-state');
          expect(empty).toBeTruthy();
          expect(empty?.textContent).toContain('No users found');
        },
      },
      {
        id: 'hidden-clear-search',
        name: 'Clear Button Resets Filter',
        description: 'Clicking Clear restores all 4 users.',
        hidden: true,
        weight: 2,
        expectedResult: '4 users restored',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          const input = getByTestId('user-search-input') as HTMLInputElement;
          await type(input, 'Jane');
          const clearBtn = getByTestId('clear-search-btn');
          fireEvent.click(clearBtn);
          const cards = document.querySelectorAll('[data-testid="user-card"]');
          expect(cards.length).toBe(4);
        },
      },
    ],
  },

  // 2. Debounced Search Input
  {
    id: 'debounced-search',
    title: 'Debounced Search with Query Delay',
    slug: 'debounced-search',
    difficulty: 'Medium',
    estimatedTime: '25 mins',
    category: 'Async & Hooks',
    tags: ['useDebounce', 'setTimeout', 'Performance', 'Async'],
    description:
      'Build a debounced search input component that postpones heavy search operations or simulated API calls until the user stops typing for 300 milliseconds.',
    requirements: [
      'Input field that updates immediately for responsive typing.',
      'Show "Active Search Query" that updates only after 300ms of inactivity.',
      'Show "Typing / Debouncing..." status indicator while waiting.',
      'Count total number of executed searches.',
    ],
    functionalRequirements: [
      'Use useEffect with setTimeout and cleanup clearTimeout.',
      'Cancel previous timer if input changes before 300ms.',
    ],
    UIRequirements: [
      'Search input with data-testid="debounced-input".',
      'Debounced value display with data-testid="debounced-value".',
      'Search count with data-testid="search-count".',
      'Debouncing status indicator with data-testid="debouncing-status".',
    ],
    edgeCases: ['Rapid bursts of typing', 'Clearing input quickly'],
    hints: ['Return () => clearTimeout(timer) inside the useEffect hook.'],
    constraints: ['Do not use Lodash debounce. Implement using standard React hooks.'],
    interviewNotes: 'Core React optimization pattern for preventing network flooding on search inputs.',
    evaluationRules: [
      'Immediate input responsiveness.',
      'Delayed debounced value update.',
      'Proper timer cleanup.',
    ],
    starterCode: `import React, { useState, useEffect } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Debounced Search</h2>
      <input data-testid="debounced-input" placeholder="Type to search..." />
    </div>
  );
}`,
    solutionCode: `import React, { useState, useEffect } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  useEffect(() => {
    if (input === debouncedValue) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(input);
      setIsDebouncing(false);
      setSearchCount((c) => c + 1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [input, debouncedValue]);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 450 }}>
      <h2>Debounced Search</h2>
      <input
        data-testid="debounced-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type to search..."
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
      />

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div data-testid="debounced-value" style={{ fontSize: 16, fontWeight: 600 }}>
          Query: {debouncedValue || '(none)'}
        </div>
        <div data-testid="debouncing-status" style={{ fontSize: 13, color: isDebouncing ? '#f59e0b' : '#10b981' }}>
          {isDebouncing ? 'Debouncing in progress...' : 'Ready'}
        </div>
        <div data-testid="search-count" style={{ fontSize: 13, color: '#666' }}>
          Total Searches Executed: {searchCount}
        </div>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-debounced-state',
        name: 'Initial State is Ready',
        description: 'Starts with empty query and Ready status.',
        expectedResult: 'Query: (none)',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('debounced-value').textContent).toContain('(none)');
        },
      },
      {
        id: 'updates-after-delay',
        name: 'Updates After 300ms Delay',
        description: 'Typing "React" sets value after 350ms wait.',
        expectedResult: 'Query: React',
        testFn: async ({ getByTestId, type, sleep, expect }) => {
          const input = getByTestId('debounced-input') as HTMLInputElement;
          await type(input, 'React');
          await sleep(350);
          expect(getByTestId('debounced-value').textContent).toContain('Query: React');
        },
      },
      {
        id: 'hidden-cancels-previous-timer',
        name: 'Rapid Typing Only Triggers Once',
        description: 'Typing rapidly only increments searchCount once.',
        hidden: true,
        weight: 2,
        expectedResult: 'Single search executed',
        testFn: async ({ getByTestId, type, sleep, expect }) => {
          const input = getByTestId('debounced-input') as HTMLInputElement;
          await type(input, 'R');
          await sleep(100);
          await type(input, 'Re');
          await sleep(100);
          await type(input, 'Rea');
          await sleep(350);
          expect(getByTestId('search-count').textContent).toContain('1');
        },
      },
    ],
  },

  // 3. Autocomplete with Keyboard Navigation
  {
    id: 'autocomplete-suggestions',
    title: 'Autocomplete Input with Keyboard Navigation',
    slug: 'autocomplete-suggestions',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'Search',
    tags: ['Autocomplete', 'Keyboard Navigation', 'Arrow Keys', 'Dropdown'],
    description:
      'Build an Autocomplete component that displays matching suggestions as the user types, supports navigating suggestions with ArrowUp / ArrowDown keys, selecting with Enter, and clicking outside to dismiss.',
    requirements: [
      'Input box connected to a list of suggestions (programming languages / frameworks).',
      'Dropdown opens when query has matching items.',
      'ArrowDown and ArrowUp move the active highlighted suggestion.',
      'Pressing Enter selects the highlighted suggestion and fills the input.',
      'Clicking a suggestion selects it.',
    ],
    functionalRequirements: [
      'Active index is tracked in state and resets when query changes.',
      'Highlighted item has distinct active styling or aria-selected="true".',
    ],
    UIRequirements: [
      'Input with data-testid="autocomplete-input".',
      'Suggestions dropdown with data-testid="suggestions-list".',
      'Suggestion items with data-testid="suggestion-item".',
    ],
    edgeCases: ['Navigating past the bottom or top of the list', 'No matching suggestions'],
    hints: ['Use (prevIndex + 1) % suggestions.length for cycling.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Tests keyboard event interception (preventDefault) and combobox UX.',
    evaluationRules: ['Arrow keys highlight items.', 'Enter selects highlighted item.'],
    starterCode: `import React, { useState } from 'react';

const SUGGESTIONS = [
  'React', 'TypeScript', 'JavaScript', 'Next.js', 'TailwindCSS', 'Redux', 'Vue.js', 'Angular'
];

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Autocomplete</h2>
      <input data-testid="autocomplete-input" placeholder="Search framework..." />
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const SUGGESTIONS = [
  'React', 'TypeScript', 'JavaScript', 'Next.js', 'TailwindCSS', 'Redux', 'Vue.js', 'Angular'
];

export default function App() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = query.trim()
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!filtered.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filtered.length) {
      e.preventDefault();
      setQuery(filtered[activeIndex]);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const selectItem = (item: string) => {
    setQuery(item);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Autocomplete</h2>
      <div style={{ position: 'relative' }}>
        <input
          data-testid="autocomplete-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search framework..."
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
        />

        {isOpen && filtered.length > 0 && (
          <ul
            data-testid="suggestions-list"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              margin: '4px 0 0 0',
              padding: 0,
              listStyle: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 10,
              color: '#111',
            }}
          >
            {filtered.map((item, idx) => (
              <li
                key={item}
                data-testid="suggestion-item"
                onClick={() => selectItem(item)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: idx === activeIndex ? '#3b82f6' : 'transparent',
                  color: idx === activeIndex ? '#fff' : 'inherit',
                  cursor: 'pointer',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'shows-suggestions-on-type',
        name: 'Shows Matching Suggestions',
        description: 'Typing "Scrip" shows TypeScript and JavaScript.',
        expectedResult: 'TypeScript and JavaScript visible',
        testFn: async ({ getByTestId, type, expect }) => {
          const input = getByTestId('autocomplete-input') as HTMLInputElement;
          await type(input, 'Scrip');
          const items = document.querySelectorAll('[data-testid="suggestion-item"]');
          expect(items.length).toBe(2);
        },
      },
      {
        id: 'keyboard-arrow-and-enter',
        name: 'ArrowDown and Enter Selects Item',
        description: 'Arrow down highlights first suggestion, Enter selects it.',
        expectedResult: 'TypeScript selected into input',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          const input = getByTestId('autocomplete-input') as HTMLInputElement;
          await type(input, 'Type');
          fireEvent.keyDown(input, 'ArrowDown');
          fireEvent.keyDown(input, 'Enter');
          expect(input.value).toBe('TypeScript');
        },
      },
      {
        id: 'hidden-click-selection',
        name: 'Clicking Suggestion Selects Item',
        description: 'Clicking an item sets the query value.',
        hidden: true,
        weight: 1,
        expectedResult: 'React selected',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          const input = getByTestId('autocomplete-input') as HTMLInputElement;
          await type(input, 'Rea');
          const item = document.querySelector('[data-testid="suggestion-item"]') as HTMLElement;
          fireEvent.click(item);
          expect(input.value).toBe('React');
        },
      },
    ],
  },

  // 4. Shopping Cart with Quantities & Promo Code
  {
    id: 'shopping-cart',
    title: 'Interactive Shopping Cart & Discount Engine',
    slug: 'shopping-cart',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'State Management',
    tags: ['Cart', 'Calculations', 'Discounts', 'State Management'],
    description:
      'Build an interactive Shopping Cart component with item quantity adjustments, item removal, subtotal calculation, tax (10%), and a promo code ("SAVE20" for 20% off).',
    requirements: [
      'Display product catalog: Laptop ($999), Headphones ($199), Mouse ($49).',
      'Add to Cart button increments cart item quantity.',
      '+ and - buttons in cart to change quantities (removing at quantity 0).',
      'Calculate Subtotal, Discount, Tax, and Final Total.',
      'Promo code field: Applying "SAVE20" subtracts 20% from subtotal.',
    ],
    functionalRequirements: [
      'Avoid floating point rounding glitches (use toFixed(2)).',
      'Invalid promo codes show an error message.',
    ],
    UIRequirements: [
      'Catalog add buttons with data-testid="add-to-cart-[id]".',
      'Cart item quantity with data-testid="cart-qty-[id]".',
      'Promo input with data-testid="promo-input".',
      'Apply promo button with data-testid="apply-promo-btn".',
      'Grand total display with data-testid="grand-total".',
    ],
    edgeCases: ['Applying promo code multiple times', 'Decrementing to 0 removes item'],
    hints: ['Compute totals using cart.reduce() on every render.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Common e-commerce machine coding challenge evaluating arithmetic precision and cart state manipulation.',
    evaluationRules: ['Cart increments accurately.', 'Totals and discounts compute correctly.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Shopping Cart</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const PRODUCTS = [
  { id: '1', name: 'Laptop', price: 999 },
  { id: '2', name: 'Headphones', price: 199 },
  { id: '3', name: 'Mouse', price: 49 },
];

export default function App() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [promo, setPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'SAVE20') {
      setDiscountPercent(0.2);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const prod = PRODUCTS.find((p) => p.id === id);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const discount = subtotal * discountPercent;
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + tax;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 480 }}>
      <h2>Shopping Cart</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {PRODUCTS.map((p) => (
          <div key={p.id} style={{ border: '1px solid #e5e7eb', padding: 8, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
            <div style={{ color: '#666', fontSize: 12, margin: '4px 0' }}>\${p.price}</div>
            <button
              data-testid={\`add-to-cart-\${p.id}\`}
              onClick={() => addToCart(p.id)}
              style={{ padding: '4px 8px', fontSize: 12, borderRadius: 4, cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      <h3>Your Cart</h3>
      {Object.keys(cart).length === 0 ? (
        <p style={{ color: '#888' }}>Cart is empty</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {Object.entries(cart).map(([id, qty]) => {
            const prod = PRODUCTS.find((p) => p.id === id)!;
            return (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span>{prod.name} (\${prod.price})</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => updateQty(id, -1)} style={{ width: 24 }}>-</button>
                  <span data-testid={\`cart-qty-\${id}\`}>{qty}</span>
                  <button onClick={() => updateQty(id, 1)} style={{ width: 24 }}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input
          data-testid="promo-input"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="Promo code (SAVE20)"
          style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button data-testid="apply-promo-btn" onClick={applyPromo} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          Apply
        </button>
      </div>
      {promoError && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 8px 0' }}>{promoError}</p>}

      <div style={{ borderTop: '1px solid #eee', paddingTop: 8, fontSize: 14 }}>
        <div>Subtotal: \${subtotal.toFixed(2)}</div>
        {discount > 0 && <div style={{ color: '#10b981' }}>Discount: -\${discount.toFixed(2)}</div>}
        <div>Tax (10%): \${tax.toFixed(2)}</div>
        <div data-testid="grand-total" style={{ fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>
          Total: \${total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-empty-cart',
        name: 'Initial Cart Total is $0.00',
        description: 'Total shows $0.00 before items are added.',
        expectedResult: 'Total: $0.00',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('grand-total').textContent).toContain('$0.00');
        },
      },
      {
        id: 'add-product-updates-total',
        name: 'Adding Product Updates Grand Total',
        description: 'Adding Mouse ($49) + 10% tax = $53.90.',
        expectedResult: 'Total: $53.90',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('add-to-cart-3'));
          expect(getByTestId('grand-total').textContent).toContain('$53.90');
        },
      },
      {
        id: 'hidden-promo-code',
        name: 'Applies 20% Discount with Promo Code',
        description: 'Applying SAVE20 deducts 20% from subtotal.',
        hidden: true,
        weight: 2,
        expectedResult: 'Total with discount applied',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          fireEvent.click(getByTestId('add-to-cart-2')); // $199
          const promoInput = getByTestId('promo-input') as HTMLInputElement;
          await type(promoInput, 'SAVE20');
          fireEvent.click(getByTestId('apply-promo-btn'));
          // Subtotal $199 - $39.80 = $159.20 + 10% ($15.92) = $175.12
          expect(getByTestId('grand-total').textContent).toContain('$175.12');
        },
      },
    ],
  },

  // 5. Multi-Step Wizard Form
  {
    id: 'multi-step-form',
    title: 'Multi-Step Wizard Form with Step Validation',
    slug: 'multi-step-form',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'Forms',
    tags: ['Multi-Step', 'Wizard', 'Validation', 'Forms'],
    description:
      'Build a 3-step registration wizard: Step 1 (Personal Info), Step 2 (Account Setup), Step 3 (Review & Confirm). Users cannot proceed to the next step unless current fields are valid.',
    requirements: [
      'Step 1: Name and Email inputs (valid email required).',
      'Step 2: Password and Confirm Password (passwords must match, min 6 chars).',
      'Step 3: Review summary showing entered Name and Email, and a "Submit" button.',
      'Next and Back buttons.',
      'Prevent progressing if validation errors exist.',
    ],
    functionalRequirements: [
      'Maintain all form state across step transitions.',
      'Display field-level error messages.',
    ],
    UIRequirements: [
      'Step indicator with data-testid="step-indicator".',
      'Name input with data-testid="input-name".',
      'Email input with data-testid="input-email".',
      'Next button with data-testid="next-step-btn".',
      'Back button with data-testid="back-step-btn".',
      'Submit button with data-testid="submit-form-btn".',
    ],
    edgeCases: ['Invalid email format', 'Password mismatch'],
    hints: ['Check if step === 1, validate, then setStep((s) => s + 1).'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates multi-screen state consolidation and step-gate validation.',
    evaluationRules: ['Validates step 1 before step 2.', 'Retains data on Back button.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Registration Wizard</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.includes('@')) return 'Valid email is required';
    return '';
  };

  const validateStep2 = () => {
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Registration Wizard</h2>
      <div data-testid="step-indicator" style={{ fontWeight: 600, color: '#3b82f6', marginBottom: 16 }}>
        Step {step} of 3
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            data-testid="input-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full Name"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            data-testid="input-email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email Address"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            data-testid="input-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Password (min 6 chars)"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            data-testid="input-confirm"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm Password"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          {isDone ? (
            <div data-testid="success-message" style={{ color: '#10b981', fontWeight: 'bold' }}>
              Registration Successful!
            </div>
          ) : (
            <button
              data-testid="submit-form-btn"
              onClick={() => setIsDone(true)}
              style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              Submit Registration
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        {step > 1 && !isDone && (
          <button data-testid="back-step-btn" onClick={() => setStep((s) => s - 1)} style={{ padding: '6px 14px' }}>
            Back
          </button>
        )}
        {step < 3 && (
          <button
            data-testid="next-step-btn"
            onClick={handleNext}
            style={{ marginLeft: 'auto', padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6 }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'step-1-validation-block',
        name: 'Prevents Next on Empty Step 1',
        description: 'Clicking Next with empty inputs blocks progress and stays on Step 1.',
        expectedResult: 'Stays on Step 1',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('next-step-btn'));
          expect(getByTestId('step-indicator').textContent).toContain('Step 1 of 3');
        },
      },
      {
        id: 'valid-step-1-advances',
        name: 'Advances to Step 2 with Valid Data',
        description: 'Entering name and valid email advances to Step 2.',
        expectedResult: 'Step 2 of 3',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          await type(getByTestId('input-name') as HTMLInputElement, 'Alice Cooper');
          await type(getByTestId('input-email') as HTMLInputElement, 'alice@test.com');
          fireEvent.click(getByTestId('next-step-btn'));
          expect(getByTestId('step-indicator').textContent).toContain('Step 2 of 3');
        },
      },
      {
        id: 'hidden-back-button-retains-data',
        name: 'Back Button Retains Entered Values',
        description: 'Clicking Back from Step 2 preserves Step 1 values.',
        hidden: true,
        weight: 1,
        expectedResult: 'Values preserved on Back',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          await type(getByTestId('input-name') as HTMLInputElement, 'Bob');
          await type(getByTestId('input-email') as HTMLInputElement, 'bob@test.com');
          fireEvent.click(getByTestId('next-step-btn'));
          fireEvent.click(getByTestId('back-step-btn'));
          expect((getByTestId('input-name') as HTMLInputElement).value).toBe('Bob');
        },
      },
    ],
  },

  // 6. Kanban Task Board
  {
    id: 'kanban-board',
    title: 'Multi-Column Kanban Task Board',
    slug: 'kanban-board',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'Lists',
    tags: ['Kanban', 'Columns', 'Board', 'State Management'],
    description:
      'Build a Kanban task management board with three columns: "To Do", "In Progress", and "Done". Support adding tasks and moving tasks forward or backward between columns.',
    requirements: [
      'Three columns: To Do, In Progress, Done.',
      'Input field to add tasks directly to "To Do".',
      'Buttons on task cards to move Right (forward) or Left (backward).',
      'Tasks in "Done" cannot move further right; tasks in "To Do" cannot move left.',
    ],
    functionalRequirements: [
      'Maintain tasks array with status: "todo" | "in-progress" | "done".',
      'Moving task updates its status property immutably.',
    ],
    UIRequirements: [
      'Columns with data-testid="column-[status]".',
      'Task cards with data-testid="kanban-task".',
      'Move Right button with data-testid="move-right-[id]".',
      'Add task input with data-testid="new-task-input".',
    ],
    edgeCases: ['Adding blank task text'],
    hints: ['Columns can be defined as ["todo", "in-progress", "done"].'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates multi-container state transitions and card workflow orchestration.',
    evaluationRules: ['Adds task to To Do.', 'Moves task between columns accurately.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Kanban Board</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
}

const COLUMNS: Array<{ key: Task['status']; label: string }> = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Write unit tests', status: 'todo' },
    { id: '2', title: 'Refactor navbar', status: 'in-progress' },
  ]);
  const [title, setTitle] = useState('');

  const addTask = () => {
    if (!title.trim()) return;
    setTasks((prev) => [...prev, { id: String(Date.now()), title: title.trim(), status: 'todo' }]);
    setTitle('');
  };

  const moveTask = (id: string, dir: -1 | 1) => {
    const order: Task['status'][] = ['todo', 'in-progress', 'done'];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const currentIdx = order.indexOf(t.status);
        const nextIdx = currentIdx + dir;
        if (nextIdx >= 0 && nextIdx < order.length) {
          return { ...t, status: order[nextIdx] };
        }
        return t;
      })
    );
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 650 }}>
      <h2>Kanban Board</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          data-testid="new-task-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button onClick={addTask} style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
          Add Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              data-testid={\`column-\${col.key}\`}
              style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            >
              <h4 style={{ margin: '0 0 10px 0' }}>{col.label} ({colTasks.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    data-testid="kanban-task"
                    style={{ backgroundColor: '#fff', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                  >
                    <div style={{ fontSize: 13, marginBottom: 6 }}>{t.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      {t.status !== 'todo' && (
                        <button onClick={() => moveTask(t.id, -1)} style={{ fontSize: 11 }}>◀</button>
                      )}
                      {t.status !== 'done' && (
                        <button
                          data-testid={\`move-right-\${t.id}\`}
                          onClick={() => moveTask(t.id, 1)}
                          style={{ fontSize: 11 }}
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-kanban-render',
        name: 'Renders Three Columns and Initial Tasks',
        description: 'Verifies all 3 columns are present in the DOM.',
        expectedResult: 'To Do, In Progress, Done rendered',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('column-todo')).toBeTruthy();
          expect(getByTestId('column-in-progress')).toBeTruthy();
          expect(getByTestId('column-done')).toBeTruthy();
        },
      },
      {
        id: 'move-task-forward',
        name: 'Moves Task from To Do to In Progress',
        description: 'Clicking move right moves task 1 into In Progress column.',
        expectedResult: 'Task 1 in in-progress column',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const moveBtn = getByTestId('move-right-1');
          fireEvent.click(moveBtn);
          const inProgressCol = getByTestId('column-in-progress');
          expect(inProgressCol.textContent).toContain('Write unit tests');
        },
      },
      {
        id: 'hidden-add-and-move-done',
        name: 'Adds Task and Moves All the Way to Done',
        description: 'Adds new task and moves it twice to Done.',
        hidden: true,
        weight: 2,
        expectedResult: 'Task in Done column',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          const input = getByTestId('new-task-input') as HTMLInputElement;
          await type(input, 'Ship feature');
          fireEvent.click(document.querySelector('button') as HTMLElement);

          const doneCol = getByTestId('column-done');
          expect(doneCol).toBeTruthy();
        },
      },
    ],
  },

  // 7. Infinite Scroll Feed
  {
    id: 'infinite-scroll-feed',
    title: 'Simulated Infinite Scroll Feed',
    slug: 'infinite-scroll-feed',
    difficulty: 'Medium',
    estimatedTime: '25 mins',
    category: 'Lists',
    tags: ['Infinite Scroll', 'IntersectionObserver', 'Feed', 'Async'],
    description:
      'Build an infinite scroll feed that loads 10 additional items whenever the user scrolls to the bottom sentinel element or clicks "Load More".',
    requirements: [
      'Initial render of 10 items.',
      'A sentinel target element or "Load More" button at the bottom.',
      'Show "Loading more..." state while fetching next batch.',
      'Stop and show "All items loaded" when reaching 30 items.',
    ],
    functionalRequirements: [
      'Simulate 150ms network delay before appending new items.',
      'Prevent duplicate calls while loading is in progress.',
    ],
    UIRequirements: [
      'Feed items with data-testid="feed-item".',
      'Load more trigger with data-testid="load-more-btn".',
      'Loading indicator with data-testid="feed-loading".',
    ],
    edgeCases: ['Clicking load more repeatedly while already loading'],
    hints: ['Use isFetching boolean state flag guard.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Evaluates asynchronous pagination patterns and loading state coordination.',
    evaluationRules: ['Initial 10 items render.', 'Loads next batch of 10.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Infinite Feed</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [items, setItems] = useState<string[]>(() =>
    Array.from({ length: 10 }, (_, i) => \`Post #\${i + 1}\`)
  );
  const [loading, setLoading] = useState(false);
  const MAX = 30;

  const loadMore = () => {
    if (loading || items.length >= MAX) return;
    setLoading(true);
    setTimeout(() => {
      setItems((prev) => [
        ...prev,
        ...Array.from({ length: 10 }, (_, i) => \`Post #\${prev.length + i + 1}\`),
      ]);
      setLoading(false);
    }, 150);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Infinite Feed</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
        {items.map((item) => (
          <li
            key={item}
            data-testid="feed-item"
            style={{ padding: 12, borderBottom: '1px solid #eee' }}
          >
            {item}
          </li>
        ))}
      </ul>

      {loading && <div data-testid="feed-loading" style={{ color: '#3b82f6', marginBottom: 8 }}>Loading more...</div>}

      {items.length < MAX ? (
        <button
          data-testid="load-more-btn"
          onClick={loadMore}
          disabled={loading}
          style={{ width: '100%', padding: 10, borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Load More
        </button>
      ) : (
        <div data-testid="feed-end" style={{ color: '#888', textAlign: 'center' }}>All items loaded</div>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-feed-count',
        name: 'Initial 10 Feed Items',
        description: 'Checks feed has 10 items mounted.',
        expectedResult: '10 items',
        testFn: ({ expect }) => {
          const items = document.querySelectorAll('[data-testid="feed-item"]');
          expect(items.length).toBe(10);
        },
      },
      {
        id: 'load-more-appends-items',
        name: 'Loads 10 More Items',
        description: 'Clicking load more appends 10 additional posts.',
        expectedResult: '20 items',
        testFn: async ({ getByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('load-more-btn'));
          await sleep(220);
          const items = document.querySelectorAll('[data-testid="feed-item"]');
          expect(items.length).toBe(20);
        },
      },
      {
        id: 'hidden-max-cap-loaded',
        name: 'Caps at 30 Maximum Items',
        description: 'Loads until 30 items reached, showing end indicator.',
        hidden: true,
        weight: 1,
        expectedResult: 'All items loaded message',
        testFn: async ({ getByTestId, queryByTestId, fireEvent, sleep, expect }) => {
          fireEvent.click(getByTestId('load-more-btn'));
          await sleep(220);
          fireEvent.click(getByTestId('load-more-btn'));
          await sleep(220);
          expect(queryByTestId('feed-end')).toBeTruthy();
        },
      },
    ],
  },

  // 8. Nested Comments Tree
  {
    id: 'nested-comments',
    title: 'Recursive Nested Comments Thread',
    slug: 'nested-comments',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'Trees & Hierarchy',
    tags: ['Recursion', 'Tree', 'Comments', 'Replies'],
    description:
      'Build a Reddit/HackerNews style nested comment thread component that recursively renders replies and allows adding a reply to any comment at arbitrary depth.',
    requirements: [
      'Render nested tree of comments with author and text.',
      'Indent replies hierarchically.',
      '"Reply" button on each comment that toggles an inline reply input.',
      'Submitting reply appends it to that comment\'s replies array.',
    ],
    functionalRequirements: [
      'Recursive component rendering.',
      'Immutable tree update (DFS recursion to find target comment ID and append reply).',
    ],
    UIRequirements: [
      'Comment nodes with data-testid="comment-node".',
      'Reply buttons with data-testid="reply-btn-[id]".',
      'Reply input with data-testid="reply-input".',
      'Submit reply button with data-testid="submit-reply-btn".',
    ],
    edgeCases: ['Replying to deeply nested comments', 'Empty reply text'],
    hints: ['Recursively traverse comments tree: if (c.id === targetId) return { ...c, replies: [...c.replies, newReply] }'],
    constraints: ['Vanilla React. Must support arbitrary nesting depth.'],
    interviewNotes: 'Classic tree structure manipulation testing recursive component patterns and immutable object graph updates.',
    evaluationRules: ['Renders initial replies tree.', 'Successfully appends reply to correct parent node.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Nested Comments</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

interface Comment {
  id: string;
  author: string;
  text: string;
  replies: Comment[];
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: '1',
    author: 'Sarah',
    text: 'Is React 19 production ready?',
    replies: [
      {
        id: '2',
        author: 'Dan',
        text: 'Yes, React 19 is officially stable.',
        replies: [
          { id: '3', author: 'Sarah', text: 'Awesome, upgrading now!', replies: [] },
        ],
      },
    ],
  },
];

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (parentId: string, text: string) => void }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const submit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText.trim());
    setReplyText('');
    setReplying(false);
  };

  return (
    <div data-testid="comment-node" style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: 12, margin: '8px 0' }}>
      <div style={{ fontSize: 13, fontWeight: 'bold' }}>{comment.author}</div>
      <div style={{ fontSize: 14, color: '#374151', margin: '2px 0 6px 0' }}>{comment.text}</div>
      <button
        data-testid={\`reply-btn-\${comment.id}\`}
        onClick={() => setReplying((r) => !r)}
        style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        Reply
      </button>

      {replying && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input
            data-testid="reply-input"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write reply..."
            style={{ padding: 4, fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button data-testid="submit-reply-btn" onClick={submit} style={{ fontSize: 12, padding: '4px 8px' }}>
            Post
          </button>
        </div>
      )}

      {comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} onReply={onReply} />
      ))}
    </div>
  );
}

export default function App() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);

  const addReply = (parentId: string, text: string) => {
    const updateTree = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...c.replies, { id: String(Date.now()), author: 'You', text, replies: [] }],
          };
        }
        return { ...c, replies: updateTree(c.replies) };
      });

    setComments(updateTree(comments));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 500 }}>
      <h2>Nested Comments</h2>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onReply={addReply} />
      ))}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-tree-render',
        name: 'Renders 3 Nested Comments',
        description: 'Initial tree contains 3 comments across 3 levels of nesting.',
        expectedResult: '3 comment nodes',
        testFn: ({ expect }) => {
          const nodes = document.querySelectorAll('[data-testid="comment-node"]');
          expect(nodes.length).toBe(3);
        },
      },
      {
        id: 'reply-adds-child-node',
        name: 'Adds Reply to Root Comment',
        description: 'Replying to comment 1 adds a 4th comment node.',
        expectedResult: '4 comment nodes',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          fireEvent.click(getByTestId('reply-btn-1'));
          const input = getByTestId('reply-input') as HTMLInputElement;
          await type(input, 'Thanks for confirming!');
          fireEvent.click(getByTestId('submit-reply-btn'));

          const nodes = document.querySelectorAll('[data-testid="comment-node"]');
          expect(nodes.length).toBe(4);
        },
      },
      {
        id: 'hidden-deep-reply',
        name: 'Appends to Deep Child Node',
        description: 'Replying to deepest child appends to level 4.',
        hidden: true,
        weight: 2,
        expectedResult: 'Reply nested under deep child',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          fireEvent.click(getByTestId('reply-btn-3'));
          const input = getByTestId('reply-input') as HTMLInputElement;
          await type(input, 'Enjoy the new features!');
          fireEvent.click(getByTestId('submit-reply-btn'));
          const nodes = document.querySelectorAll('[data-testid="comment-node"]');
          expect(nodes.length).toBe(4);
        },
      },
    ],
  },

  // 9. Collapsible File Explorer
  {
    id: 'file-explorer',
    title: 'Collapsible File & Folder Tree Explorer',
    slug: 'file-explorer',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'Trees & Hierarchy',
    tags: ['File Explorer', 'Tree', 'Collapsible', 'Recursion'],
    description:
      'Build a VS Code-style hierarchical File Explorer that displays folders and files, allows expanding/collapsing folders, and highlights the currently selected file.',
    requirements: [
      'Render nested tree of folders and files.',
      'Folders have toggleable expanded/collapsed chevron icons.',
      'Clicking a folder expands or collapses its contents.',
      'Clicking a file selects it and shows "Active file: [name]" preview bar.',
    ],
    functionalRequirements: [
      'Recursive tree rendering.',
      'Expanded folders state tracked by ID or path.',
    ],
    UIRequirements: [
      'Folder nodes with data-testid="folder-[id]".',
      'File nodes with data-testid="file-[id]".',
      'Active file bar with data-testid="active-file-indicator".',
    ],
    edgeCases: ['Empty folders', 'Multiple nested folders'],
    hints: ['Store expandedFolderIds: Set<string> or Array in state.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Frequently asked in frontend coding rounds at top tech companies.',
    evaluationRules: ['Expands/collapses folders.', 'Selects files accurately.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>File Explorer</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

interface Node {
  id: string;
  name: string;
  isFolder: boolean;
  children?: Node[];
}

const FILE_TREE: Node = {
  id: 'root',
  name: 'src',
  isFolder: true,
  children: [
    {
      id: 'components',
      name: 'components',
      isFolder: true,
      children: [
        { id: 'btn', name: 'Button.tsx', isFolder: false },
        { id: 'modal', name: 'Modal.tsx', isFolder: false },
      ],
    },
    { id: 'app', name: 'App.tsx', isFolder: false },
    { id: 'main', name: 'main.tsx', isFolder: false },
  ],
};

function TreeNode({
  node,
  expandedIds,
  toggleFolder,
  selectedId,
  selectFile,
}: {
  node: Node;
  expandedIds: string[];
  toggleFolder: (id: string) => void;
  selectedId: string;
  selectFile: (id: string, name: string) => void;
}) {
  const isExpanded = expandedIds.includes(node.id);

  if (node.isFolder) {
    return (
      <div style={{ paddingLeft: 12 }}>
        <div
          data-testid={\`folder-\${node.id}\`}
          onClick={() => toggleFolder(node.id)}
          style={{ cursor: 'pointer', fontWeight: 600, padding: '4px 0', userSelect: 'none' }}
        >
          {isExpanded ? '📂' : '📁'} {node.name}
        </div>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                expandedIds={expandedIds}
                toggleFolder={toggleFolder}
                selectedId={selectedId}
                selectFile={selectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid={\`file-\${node.id}\`}
      onClick={() => selectFile(node.id, node.name)}
      style={{
        paddingLeft: 24,
        paddingTop: 2,
        paddingBottom: 2,
        cursor: 'pointer',
        color: selectedId === node.id ? '#3b82f6' : '#374151',
        fontWeight: selectedId === node.id ? 'bold' : 'normal',
      }}
    >
      📄 {node.name}
    </div>
  );
}

export default function App() {
  const [expandedIds, setExpandedIds] = useState<string[]>(['root', 'components']);
  const [activeFileName, setActiveFileName] = useState('App.tsx');
  const [selectedId, setSelectedId] = useState('app');

  const toggleFolder = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectFile = (id: string, name: string) => {
    setSelectedId(id);
    setActiveFileName(name);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>File Explorer</h2>
      <div data-testid="active-file-indicator" style={{ marginBottom: 12, fontSize: 13, color: '#3b82f6' }}>
        Active: {activeFileName}
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, backgroundColor: '#f9fafb' }}>
        <TreeNode
          node={FILE_TREE}
          expandedIds={expandedIds}
          toggleFolder={toggleFolder}
          selectedId={selectedId}
          selectFile={selectFile}
        />
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-tree-files',
        name: 'Renders Expanded File Tree',
        description: 'Checks Button.tsx and App.tsx are visible initially.',
        expectedResult: 'Files visible',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('file-btn')).toBeTruthy();
          expect(getByTestId('file-app')).toBeTruthy();
        },
      },
      {
        id: 'select-file-updates-indicator',
        name: 'Selecting File Updates Active Bar',
        description: 'Clicking Modal.tsx sets active file to Modal.tsx.',
        expectedResult: 'Active: Modal.tsx',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('file-modal'));
          expect(getByTestId('active-file-indicator').textContent).toContain('Modal.tsx');
        },
      },
      {
        id: 'hidden-collapse-folder',
        name: 'Collapsing Folder Hides Child Files',
        description: 'Clicking components folder hides Button.tsx.',
        hidden: true,
        weight: 2,
        expectedResult: 'Button.tsx removed on collapse',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('folder-components'));
          expect(queryByTestId('file-btn')).toBeNull();
        },
      },
    ],
  },

  // 10. Sortable & Filterable Data Table
  {
    id: 'sortable-data-table',
    title: 'Sortable & Filterable Data Table',
    slug: 'sortable-data-table',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'Lists',
    tags: ['Table', 'Sorting', 'Filtering', 'Grid'],
    description:
      'Build a data table displaying employees with sorting by Name, Age, and Salary (ascending/descending) plus a global search filter.',
    requirements: [
      'Render a table with columns: Name, Department, Age, Salary.',
      'Clicking a column header toggles sort direction (asc -> desc -> default).',
      'Search input filtering across name and department.',
      'Visual indicator (▲ / ▼) on active sorted column.',
    ],
    functionalRequirements: [
      'Accurate numerical sorting for Age and Salary; alphabetical for Name.',
      'Filter matches case-insensitively.',
    ],
    UIRequirements: [
      'Header cells with data-testid="sort-[col]".',
      'Data rows with data-testid="table-row".',
      'Search input with data-testid="table-search".',
    ],
    edgeCases: ['Equal values during sort', 'Negative or zero values'],
    hints: ['Sort a shallow copy of the filtered array: [...filtered].sort(...)'],
    constraints: ['Vanilla React. No TanStack table.'],
    interviewNotes: 'Tests table rendering, multi-type comparator sorting, and sort direction toggle logic.',
    evaluationRules: ['Sorts numerically and alphabetically.', 'Filters accurately.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Data Table</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const EMPLOYEES = [
  { id: '1', name: 'Alice', department: 'Engineering', age: 29, salary: 120000 },
  { id: '2', name: 'Bob', department: 'Marketing', age: 34, salary: 95000 },
  { id: '3', name: 'Charlie', department: 'Engineering', age: 24, salary: 85000 },
  { id: '4', name: 'Diana', department: 'Design', age: 31, salary: 110000 },
];

type SortKey = 'name' | 'age' | 'salary';

export default function App() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filtered = EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      })
    : filtered;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h2>Data Table</h2>
      <input
        data-testid="table-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter by name or department..."
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16, boxSizing: 'border-box' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th data-testid="sort-name" onClick={() => handleSort('name')} style={{ cursor: 'pointer', padding: 8 }}>
              Name {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: 8 }}>Department</th>
            <th data-testid="sort-age" onClick={() => handleSort('age')} style={{ cursor: 'pointer', padding: 8 }}>
              Age {sortKey === 'age' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th data-testid="sort-salary" onClick={() => handleSort('salary')} style={{ cursor: 'pointer', padding: 8 }}>
              Salary {sortKey === 'salary' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id} data-testid="table-row" style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{row.name}</td>
              <td style={{ padding: 8 }}>{row.department}</td>
              <td style={{ padding: 8 }}>{row.age}</td>
              <td style={{ padding: 8 }}>\${row.salary.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-table-rows',
        name: 'Renders All 4 Table Rows',
        description: 'Checks initial row count.',
        expectedResult: '4 rows',
        testFn: ({ expect }) => {
          const rows = document.querySelectorAll('[data-testid="table-row"]');
          expect(rows.length).toBe(4);
        },
      },
      {
        id: 'sort-age-ascending',
        name: 'Sorts by Age Ascending',
        description: 'Clicking Age header puts Charlie (age 24) first.',
        expectedResult: 'Charlie first',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('sort-age'));
          const rows = document.querySelectorAll('[data-testid="table-row"]');
          expect(rows[0].textContent).toContain('Charlie');
        },
      },
      {
        id: 'hidden-filter-and-sort',
        name: 'Combines Search and Sorting',
        description: 'Filtering "Engineering" and sorting by salary descending.',
        hidden: true,
        weight: 2,
        expectedResult: 'Alice first in Engineering',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          await type(getByTestId('table-search') as HTMLInputElement, 'Engineering');
          fireEvent.click(getByTestId('sort-salary'));
          fireEvent.click(getByTestId('sort-salary')); // desc: Alice ($120k) > Charlie ($85k)
          const rows = document.querySelectorAll('[data-testid="table-row"]');
          expect(rows.length).toBe(2);
          expect(rows[0].textContent).toContain('Alice');
        },
      },
    ],
  },

  // 11. OTP / PIN Verification Input
  {
    id: 'otp-pin-input',
    title: 'Multi-Box OTP Verification Input',
    slug: 'otp-pin-input',
    difficulty: 'Medium',
    estimatedTime: '25 mins',
    category: 'Forms',
    tags: ['OTP', 'Refs', 'Focus Management', 'Keyboard'],
    description:
      'Build a 4-digit OTP / PIN input box where typing a digit automatically advances focus to the next input, Backspace deletes and focuses backward, and pasting a 4-digit code fills all boxes.',
    requirements: [
      '4 individual numeric input boxes.',
      'Typing a digit shifts focus to the next box automatically.',
      'Pressing Backspace on an empty box shifts focus to the previous box.',
      'Pasting "1234" populates all 4 boxes.',
      'Show complete verification code when all 4 digits are entered.',
    ],
    functionalRequirements: [
      'Manage focus using useRef array.',
      'Reject non-numeric characters.',
    ],
    UIRequirements: [
      'Inputs with data-testid="otp-input-[index]".',
      'Complete code display with data-testid="otp-complete-code".',
    ],
    edgeCases: ['Pasting more or less than 4 digits', 'Non-numeric input keys'],
    hints: ['Use inputRefs = useRef<HTMLInputElement[]>([]) and .focus().'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Classic UX and focus orchestration challenge frequently used by fintech and auth teams.',
    evaluationRules: ['Advances focus on type.', 'Backspaces focus backward.'],
    starterCode: `import React, { useState, useRef } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>OTP Verification</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState, useRef } from 'react';

export default function App() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    if (digit && !/^[0-9]$/.test(digit)) return;

    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 350 }}>
      <h2>OTP Verification</h2>
      <div style={{ display: 'flex', gap: 10, margin: '16px 0' }}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputsRef.current[idx] = el; }}
            data-testid={\`otp-input-\${idx}\`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            style={{
              width: 44,
              height: 48,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 8,
              border: '2px solid #e5e7eb',
              outline: 'none',
            }}
          />
        ))}
      </div>

      {isComplete && (
        <div data-testid="otp-complete-code" style={{ color: '#10b981', fontWeight: 600 }}>
          Verified PIN: {otp.join('')}
        </div>
      )}
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-otp-boxes',
        name: 'Renders 4 Empty OTP Boxes',
        description: 'Checks all 4 inputs render empty.',
        expectedResult: '4 empty boxes',
        testFn: ({ getByTestId, expect }) => {
          for (let i = 0; i < 4; i++) {
            expect((getByTestId(`otp-input-${i}`) as HTMLInputElement).value).toBe('');
          }
        },
      },
      {
        id: 'enter-all-four-digits',
        name: 'Fills All Digits and Completes',
        description: 'Enters 7, 2, 9, 4 and verifies completed PIN.',
        expectedResult: 'Verified PIN: 7294',
        testFn: async ({ getByTestId, type, expect }) => {
          await type(getByTestId('otp-input-0') as HTMLInputElement, '7');
          await type(getByTestId('otp-input-1') as HTMLInputElement, '2');
          await type(getByTestId('otp-input-2') as HTMLInputElement, '9');
          await type(getByTestId('otp-input-3') as HTMLInputElement, '4');
          expect(getByTestId('otp-complete-code').textContent).toContain('7294');
        },
      },
      {
        id: 'hidden-ignores-letters',
        name: 'Rejects Non-Numeric Characters',
        description: 'Typing letters into box is ignored.',
        hidden: true,
        weight: 1,
        expectedResult: 'Non-numeric ignored',
        testFn: async ({ getByTestId, type, expect }) => {
          const inp = getByTestId('otp-input-0') as HTMLInputElement;
          await type(inp, 'A');
          expect(inp.value).toBe('');
        },
      },
    ],
  },

  // 12. Undo/Redo State History
  {
    id: 'undo-redo-state',
    title: 'Undo/Redo State History Hook',
    slug: 'undo-redo-state',
    difficulty: 'Medium',
    estimatedTime: '25 mins',
    category: 'State Management',
    tags: ['useReducer', 'Undo/Redo', 'History Stack', 'Custom Hooks'],
    description:
      'Implement an undo/redo stack manager for a text canvas with Undo (Ctrl+Z) and Redo (Ctrl+Y) controls.',
    requirements: [
      'Input box updating canvas text.',
      'Undo and Redo buttons.',
      'Maintain past and future history stacks.',
      'Undo button disabled when no past history; Redo disabled when no future history.',
    ],
    functionalRequirements: [
      'New edits push current state to past and clear future stack.',
      'Undo moves present to future and pops previous from past.',
    ],
    UIRequirements: [
      'Editor input with data-testid="undo-input".',
      'Undo button with data-testid="undo-btn".',
      'Redo button with data-testid="redo-btn".',
      'Current value with data-testid="undo-current-value".',
    ],
    edgeCases: ['Consecutive undos until past is empty'],
    hints: ['State structure: { past: T[], present: T, future: T[] }.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Classic data structure question evaluating stacks and immutable state transitions.',
    evaluationRules: ['Undo reverts state.', 'Redo restores state.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Undo / Redo Editor</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

export default function App() {
  const [history, setHistory] = useState<{ past: string[]; present: string; future: string[] }>({
    past: [],
    present: 'Hello',
    future: [],
  });

  const updateText = (newVal: string) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newVal,
      future: [],
    }));
  };

  const handleUndo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    setHistory((prev) => ({
      past: newPast,
      present: previous,
      future: [prev.present, ...prev.future],
    }));
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: next,
      future: newFuture,
    }));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Undo / Redo Editor</h2>
      <input
        data-testid="undo-input"
        value={history.present}
        onChange={(e) => updateText(e.target.value)}
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          data-testid="undo-btn"
          onClick={handleUndo}
          disabled={history.past.length === 0}
          style={{ padding: '6px 14px', cursor: history.past.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          Undo
        </button>
        <button
          data-testid="redo-btn"
          onClick={handleRedo}
          disabled={history.future.length === 0}
          style={{ padding: '6px 14px', cursor: history.future.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          Redo
        </button>
      </div>
      <div data-testid="undo-current-value" style={{ marginTop: 12, fontSize: 14 }}>
        Value: {history.present}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-undo-disabled',
        name: 'Undo Disabled on Initial Mount',
        description: 'Undo button is disabled when past stack is empty.',
        expectedResult: 'Undo disabled',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('undo-btn').hasAttribute('disabled')).toBeTruthy();
        },
      },
      {
        id: 'edit-and-undo',
        name: 'Types New Text and Undoes',
        description: 'Types text, clicks Undo, reverts to original.',
        expectedResult: 'Reverts to original',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          const input = getByTestId('undo-input') as HTMLInputElement;
          await type(input, 'Hello World');
          fireEvent.click(getByTestId('undo-btn'));
          expect(getByTestId('undo-current-value').textContent).toContain('Hello');
        },
      },
      {
        id: 'hidden-redo-restores',
        name: 'Redo Restores Value',
        description: 'Clicking Redo after Undo restores edited value.',
        hidden: true,
        weight: 1,
        expectedResult: 'Restored via Redo',
        testFn: async ({ getByTestId, type, fireEvent, expect }) => {
          const input = getByTestId('undo-input') as HTMLInputElement;
          await type(input, 'Hello World');
          fireEvent.click(getByTestId('undo-btn'));
          fireEvent.click(getByTestId('redo-btn'));
          expect(getByTestId('undo-current-value').textContent).toContain('Hello World');
        },
      },
    ],
  },

  // 13. Theme Switcher with CSS Tokens
  {
    id: 'theme-switcher',
    title: 'Theme Switcher with Dynamic CSS Variables',
    slug: 'theme-switcher',
    difficulty: 'Medium',
    estimatedTime: '20 mins',
    category: 'UI Components',
    tags: ['Theme', 'CSS Variables', 'Dark Mode', 'Tokens'],
    description:
      'Build a theme switcher supporting Light, Dark, and High Contrast themes by applying CSS variables or data-theme attributes.',
    requirements: [
      'Dropdown or radio buttons to choose: "light", "dark", "contrast".',
      'Preview card adapting background and text colors to the active theme.',
      'Display active theme token name.',
    ],
    functionalRequirements: [
      'Apply theme styling via data-theme attribute or inline style tokens.',
    ],
    UIRequirements: [
      'Theme selector with data-testid="theme-select".',
      'Preview container with data-testid="theme-preview-box".',
    ],
    edgeCases: ['Switching theme repeatedly'],
    hints: ['Define a THEMES object with background and text color tokens.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Design systems interview question on design token propagation.',
    evaluationRules: ['Select updates theme.', 'Theme colors update accurately.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Theme Switcher</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

const THEMES: Record<string, { bg: string; text: string; border: string }> = {
  light: { bg: '#ffffff', text: '#111827', border: '#e5e7eb' },
  dark: { bg: '#111827', text: '#f9fafb', border: '#374151' },
  contrast: { bg: '#000000', text: '#ffff00', border: '#ffff00' },
};

export default function App() {
  const [themeKey, setThemeKey] = useState('light');
  const theme = THEMES[themeKey] || THEMES.light;

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Theme Switcher</h2>
      <select
        data-testid="theme-select"
        value={themeKey}
        onChange={(e) => setThemeKey(e.target.value)}
        style={{ padding: 8, borderRadius: 6, marginBottom: 16 }}
      >
        <option value="light">Light Theme</option>
        <option value="dark">Dark Theme</option>
        <option value="contrast">High Contrast</option>
      </select>

      <div
        data-testid="theme-preview-box"
        style={{
          padding: 20,
          borderRadius: 8,
          backgroundColor: theme.bg,
          color: theme.text,
          border: \`2px solid \${theme.border}\`,
          transition: 'all 200ms',
        }}
      >
        <h3>Active Theme: {themeKey.toUpperCase()}</h3>
        <p style={{ margin: 0, fontSize: 13 }}>
          This surface dynamically adapts its color tokens based on the chosen mode.
        </p>
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-light-theme',
        name: 'Defaults to Light Theme',
        description: 'Verifies preview shows Light theme initially.',
        expectedResult: 'Active Theme: LIGHT',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('theme-preview-box').textContent).toContain('LIGHT');
        },
      },
      {
        id: 'select-dark-theme',
        name: 'Switches to Dark Theme',
        description: 'Changing select to dark updates preview.',
        expectedResult: 'Active Theme: DARK',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const select = getByTestId('theme-select');
          fireEvent.change(select, 'dark');
          expect(getByTestId('theme-preview-box').textContent).toContain('DARK');
        },
      },
      {
        id: 'hidden-high-contrast',
        name: 'Switches to High Contrast',
        description: 'Verifies high contrast theme works.',
        hidden: true,
        weight: 1,
        expectedResult: 'Active Theme: CONTRAST',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const select = getByTestId('theme-select');
          fireEvent.change(select, 'contrast');
          expect(getByTestId('theme-preview-box').textContent).toContain('CONTRAST');
        },
      },
    ],
  },

  // 14. Custom Hook: useLocalStorage
  {
    id: 'custom-use-local-storage',
    title: 'Custom Hook: useLocalStorage with State Sync',
    slug: 'custom-use-local-storage',
    difficulty: 'Medium',
    estimatedTime: '25 mins',
    category: 'Async & Hooks',
    tags: ['Custom Hooks', 'localStorage', 'JSON Serialization'],
    description:
      'Build and consume a custom useLocalStorage hook that synchronizes React state with browser localStorage, handling serialization, deserialization, and safe error fallbacks.',
    requirements: [
      'Create and use a custom hook useLocalStorage(key, initialValue).',
      'Input field updating the stored value in real time.',
      'Display the current stored string.',
      'Clear storage button restoring default value.',
    ],
    functionalRequirements: [
      'Catch JSON parse errors safely.',
      'Persist updates via localStorage.setItem().',
    ],
    UIRequirements: [
      'Input field with data-testid="storage-input".',
      'Stored display with data-testid="storage-display".',
      'Clear button with data-testid="storage-clear-btn".',
    ],
    edgeCases: ['Corrupted non-JSON strings in localStorage'],
    hints: ['Wrap JSON.parse in try/catch.'],
    constraints: ['Vanilla React with standard hooks.'],
    interviewNotes: 'One of the most frequently requested custom hooks in React interviews.',
    evaluationRules: ['Persists state.', 'Restores initial value when cleared.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>useLocalStorage Demo</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [username, setUsername] = useLocalStorage<string>('challenge_user_key', 'Guest');

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>useLocalStorage Demo</h2>
      <input
        data-testid="storage-input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
      />
      <div data-testid="storage-display" style={{ marginTop: 12, fontSize: 14 }}>
        Stored Username: {username}
      </div>
      <button
        data-testid="storage-clear-btn"
        onClick={() => setUsername('Guest')}
        style={{ marginTop: 8, padding: '6px 12px', cursor: 'pointer' }}
      >
        Reset
      </button>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-storage-value',
        name: 'Displays Initial Default Value',
        description: 'Checks username displays Guest initially.',
        expectedResult: 'Stored Username: Guest',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('storage-display').textContent).toContain('Guest');
        },
      },
      {
        id: 'updates-storage-input',
        name: 'Updates and Synchronizes Value',
        description: 'Typing "Alexander" updates displayed username.',
        expectedResult: 'Stored Username: Alexander',
        testFn: async ({ getByTestId, type, expect }) => {
          const input = getByTestId('storage-input') as HTMLInputElement;
          await type(input, 'Alexander');
          expect(getByTestId('storage-display').textContent).toContain('Alexander');
        },
      },
      {
        id: 'hidden-reset-storage',
        name: 'Reset Restores Default',
        description: 'Clicking Reset restores Guest.',
        hidden: true,
        weight: 1,
        expectedResult: 'Reset to Guest',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('storage-clear-btn'));
          expect(getByTestId('storage-display').textContent).toContain('Guest');
        },
      },
    ],
  },

  // 15. Async Search with Race Condition Guard
  {
    id: 'async-search-race-condition',
    title: 'Async Search with Race Condition Guard',
    slug: 'async-search-race-condition',
    difficulty: 'Medium',
    estimatedTime: '30 mins',
    category: 'Async & Hooks',
    tags: ['Race Condition', 'Async', 'AbortController', 'useEffect'],
    description:
      'Simulate an async API search where responses return with variable latency. Implement a race condition guard (via cleanup flag or AbortController) so that slower, earlier responses never overwrite faster, later responses.',
    requirements: [
      'Search input triggering mock async fetch.',
      'Simulated random delay (100ms - 400ms) for each query.',
      'Ensure the rendered result ALWAYS matches the latest entered query.',
      'Show "Searching..." loading indicator during active queries.',
    ],
    functionalRequirements: [
      'Use a boolean let active = true in useEffect cleanup or AbortController.',
      'Ignore response if the effect has been cleaned up before fetch resolves.',
    ],
    UIRequirements: [
      'Search input with data-testid="async-search-input".',
      'Result display with data-testid="async-search-result".',
      'Loading status with data-testid="async-loading".',
    ],
    edgeCases: ['Query A takes 400ms, Query B takes 100ms. B must win.'],
    hints: ['In useEffect: let active = true; ... if (active) setResult(...); return () => { active = false; };'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'One of the most critical real-world React bug patterns asked by senior interviewers.',
    evaluationRules: ['Latest response wins.', 'No stale state overwrites.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Async Search (Race Safe)</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState, useEffect } from 'react';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResult('');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    // Simulate network delay
    const delay = query === 'fast' ? 50 : 250;
    const timer = setTimeout(() => {
      if (active) {
        setResult(\`Result for: \${query}\`);
        setLoading(false);
      }
    }, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Async Search (Race Safe)</h2>
      <input
        data-testid="async-search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type query..."
        style={{ padding: 8, width: '100%', borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
      />
      {loading && <div data-testid="async-loading" style={{ marginTop: 8, color: '#f59e0b' }}>Searching...</div>}
      <div data-testid="async-search-result" style={{ marginTop: 12, fontWeight: 600 }}>
        {result || 'No search yet'}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'initial-async-state',
        name: 'Initial State Shows No Search',
        description: 'Displays "No search yet" initially.',
        expectedResult: 'No search yet',
        testFn: ({ getByTestId, expect }) => {
          expect(getByTestId('async-search-result').textContent).toContain('No search yet');
        },
      },
      {
        id: 'fast-query-resolves',
        name: 'Resolves Query Result',
        description: 'Typing "fast" displays "Result for: fast".',
        expectedResult: 'Result for: fast',
        testFn: async ({ getByTestId, type, sleep, expect }) => {
          await type(getByTestId('async-search-input') as HTMLInputElement, 'fast');
          await sleep(100);
          expect(getByTestId('async-search-result').textContent).toContain('Result for: fast');
        },
      },
      {
        id: 'hidden-race-condition-guard',
        name: 'Cancels Outdated In-Flight Queries',
        description: 'Typing query and clearing or changing it does not overwrite.',
        hidden: true,
        weight: 2,
        expectedResult: 'Latest query preserved',
        testFn: async ({ getByTestId, type, sleep, expect }) => {
          const input = getByTestId('async-search-input') as HTMLInputElement;
          await type(input, 'slow');
          await sleep(20);
          await type(input, 'fast');
          await sleep(120);
          expect(getByTestId('async-search-result').textContent).toContain('Result for: fast');
        },
      },
    ],
  },

  // 16. Toast Notification System
  {
    id: 'toast-notification-system',
    title: 'Toast Notification Queue with Auto-Dismiss',
    slug: 'toast-notification-system',
    difficulty: 'Medium',
    estimatedTime: '25 mins',
    category: 'UI Components',
    tags: ['Toast', 'Notification', 'Queue', 'Timers'],
    description:
      'Build a toast notification queue system that allows triggering Success, Error, and Info toasts, auto-dismisses toasts after 2.5 seconds, and supports manually dismissing a toast.',
    requirements: [
      'Trigger buttons: "Add Success Toast", "Add Error Toast".',
      'Toasts appear in a fixed stack in top-right or bottom-right.',
      'Each toast auto-dismisses after 2500ms.',
      'Manual close (x) button on each toast.',
    ],
    functionalRequirements: [
      'Maintain array of toasts: { id, message, type }.',
      'Trigger individual dismiss timers per toast.',
    ],
    UIRequirements: [
      'Success button with data-testid="trigger-success-btn".',
      'Toast items with data-testid="toast-item".',
      'Dismiss button with data-testid="toast-dismiss-btn".',
    ],
    edgeCases: ['Multiple toasts triggered in rapid succession'],
    hints: ['Store { id, message, type } and setTimeout for removal.'],
    constraints: ['Vanilla React.'],
    interviewNotes: 'Tests dynamic array queue manipulation and per-element timer lifecycles.',
    evaluationRules: ['Adds toast on button click.', 'Auto dismisses after delay.'],
    starterCode: `import React, { useState } from 'react';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Toast Notification System</h2>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h2>Toast Notification System</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          data-testid="trigger-success-btn"
          onClick={() => addToast('Operation successful!', 'success')}
          style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Success Toast
        </button>
        <button
          onClick={() => addToast('Something went wrong.', 'error')}
          style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Error Toast
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-testid="toast-item"
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              backgroundColor: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: \`1px solid \${toast.type === 'success' ? '#10b981' : '#ef4444'}\`,
              color: toast.type === 'success' ? '#065f46' : '#991b1b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{toast.message}</span>
            <button
              data-testid="toast-dismiss-btn"
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    testCases: [
      {
        id: 'adds-toast-on-click',
        name: 'Adds Toast on Button Click',
        description: 'Clicking Success Toast renders toast item.',
        expectedResult: 'Toast item rendered',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('trigger-success-btn'));
          const item = document.querySelector('[data-testid="toast-item"]');
          expect(item).toBeTruthy();
          expect(item?.textContent).toContain('Operation successful!');
        },
      },
      {
        id: 'manual-dismiss-toast',
        name: 'Manually Dismisses Toast',
        description: 'Clicking ✕ removes toast immediately.',
        expectedResult: 'Toast removed',
        testFn: ({ getByTestId, queryByTestId, fireEvent, expect }) => {
          fireEvent.click(getByTestId('trigger-success-btn'));
          const dismissBtn = getByTestId('toast-dismiss-btn');
          fireEvent.click(dismissBtn);
          expect(queryByTestId('toast-item')).toBeNull();
        },
      },
      {
        id: 'hidden-multiple-toasts',
        name: 'Can Stack Multiple Toasts',
        description: 'Clicking twice stacks 2 toasts.',
        hidden: true,
        weight: 1,
        expectedResult: '2 toasts rendered',
        testFn: ({ getByTestId, fireEvent, expect }) => {
          const btn = getByTestId('trigger-success-btn');
          fireEvent.click(btn);
          fireEvent.click(btn);
          const items = document.querySelectorAll('[data-testid="toast-item"]');
          expect(items.length).toBe(2);
        },
      },
    ],
  },
];
