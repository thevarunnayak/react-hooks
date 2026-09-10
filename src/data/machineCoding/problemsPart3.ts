import { MachineCodingProblem } from '../../types/machineCoding';

export const PROBLEMS_PART3: MachineCodingProblem[] = [
  // 11. List Virtualization
  {
    id: 'list-virtualization',
    number: 11,
    title: 'List Virtualization (Windowing)',
    difficulty: 'Advanced',
    category: 'Advanced DOM & Performance',
    tags: ['Performance', 'Windowing', 'DOM Optimization', 'Scroll Events', 'Large Datasets'],
    summary: 'Efficiently render 10,000+ items with fixed row height, viewport slicing, and live DOM node comparison.',
    explanation:
      'Tests advanced frontend performance engineering: instead of mounting 10,000 heavy DOM nodes, list virtualization only renders the visible slice (~10-15 items) plus a small overscan buffer, positioning items accurately via spacer padding or CSS translate.',
    requirements: {
      functional: [
        'Smoothly render a dataset of 10,000+ items with instant 60fps scrolling.',
        'Calculate startIndex and endIndex based on scrollTop, container height, and itemHeight.',
        'Include an overscan buffer (e.g. 3 items above/below) to eliminate blank flickers during fast scrolling.',
        'Maintain a dynamic scrollbar representing the full 10,000 item height using a phantom spacer div.',
        'Provide live telemetry: Total items, Active DOM nodes rendered, and current scroll offset.',
      ],
      nonFunctional: [
        'Zero frame drops when scrolling vigorously.',
        'Pure mathematical index computation with no external third-party libraries (e.g. no react-window).',
      ],
    },
    conceptsUsed: [
      {
        name: 'Mathematical Viewport Windowing',
        description: 'Computes `startIndex = Math.floor(scrollTop / itemHeight)` and `endIndex = Math.min(total, startIndex + visibleCount + overscan)`.',
      },
      {
        name: 'Phantom Height Spacer & Translation',
        description: 'Creates total container height (`totalCount * itemHeight`) with top offset spacer (`startIndex * itemHeight`).',
      },
      {
        name: 'Scroll Event Throttling / RAF',
        description: 'Syncs scroll position without causing layout thrashing or synchronous reflows.',
      },
    ],
    edgeCases: [
      'Scrolling to the very bottom: endIndex must clamp strictly to totalItems - 1 without negative slice.',
      'Container resizing: visible item count must recompute if viewport dimensions change.',
      'Jumping to a specific index: must calculate and set `container.scrollTop = index * itemHeight`.',
    ],
    solutionCode: `import React, { useState, useRef } from 'react';

interface VirtualListProps {
  items: string[];
  itemHeight: number;
  containerHeight: number;
}

export function VirtualList({ items, itemHeight, containerHeight }: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const overscan = 3;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(items.length, startIndex + visibleCount + 2 * overscan);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative', border: '1px solid #ccc' }}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div style={{ transform: \`translateY(\${offsetY}px)\`, position: 'absolute', top: 0, left: 0, right: 0 }}>
          {visibleItems.map((item, idx) => (
            <div key={startIndex + idx} style={{ height: itemHeight, display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid #eee' }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  },

  // 12. Date Picker / Calendar
  {
    id: 'date-picker',
    number: 12,
    title: 'Date Picker & Range Calendar',
    difficulty: 'Advanced',
    category: 'Data & Navigation',
    tags: ['Date Arithmetic', 'Grid System', 'Range Selection', 'Accessibility'],
    summary: 'Month/year grid navigation, date selection, range selection (start to end date), disabled dates, and quick presets.',
    explanation:
      'Tests date arithmetic from scratch without moment.js or date-fns: calculating days in a month, leading padding days from previous month, day-of-week offsets, date range hover states, and disabled past dates.',
    requirements: {
      functional: [
        'Monthly calendar grid with previous/next month navigation and year selector.',
        'Single date selection and Date Range selection (start date → end date).',
        'Visual indicators for today, selected date, range start/end, and dates inside range.',
        'Quick preset buttons (Today, Yesterday, Last 7 Days, This Month).',
        'Disabled dates option (e.g. cannot select dates in the past or weekends).',
      ],
      nonFunctional: [
        'Proper 7-column CSS grid layout for Sun–Sat.',
        'ARIA calendar role attributes (`role="grid"`, `role="gridcell"`).',
      ],
    },
    conceptsUsed: [
      {
        name: 'Native JavaScript Date Arithmetic',
        description: 'Uses `new Date(year, month + 1, 0).getDate()` to determine accurate month lengths and leap years.',
      },
      {
        name: 'Calendar Matrix Generation',
        description: 'Constructs grid including prefix padding days from previous month and suffix padding days.',
      },
      {
        name: 'Range Selection State Machine',
        description: 'Tracks `startDate`, `endDate`, and `hoverDate` for smooth range highlighting.',
      },
    ],
    edgeCases: [
      'Selecting end date that is earlier than start date: should automatically swap start and end.',
      'Navigating from January to December (year rollover) or February in leap year (29 days).',
      'Selecting the same day as start and end: valid single-day range.',
    ],
    solutionCode: `import React, { useState } from 'react';

export function DatePicker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div style={{ width: 280, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth}>‹</button>
        <span>{currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
        <button onClick={nextMonth}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} style={{ fontWeight: 700, fontSize: 12 }}>{d}</div>
        ))}
        {padding.map((p) => <div key={'pad-' + p} />)}
        {days.map((day) => {
          const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
          return (
            <button
              key={day}
              onClick={() => setSelectedDate(new Date(year, month, day))}
              style={{ padding: 6, background: isSelected ? '#3b82f6' : 'none', color: isSelected ? '#fff' : '#000', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}`,
  },

  // 13. Drag & Drop Board
  {
    id: 'drag-drop-board',
    number: 13,
    title: 'Drag & Drop Board (Kanban)',
    difficulty: 'Advanced',
    category: 'Advanced DOM & Performance',
    tags: ['HTML5 Drag & Drop', 'Kanban', 'State Reordering', 'Columns'],
    summary: 'Reordering tasks, dragging cards across columns, adding cards, and live visual drop indicators.',
    explanation:
      'Tests native HTML5 drag-and-drop state synchronization without third-party packages (no react-beautiful-dnd or dnd-kit): card pickup, hover target calculation, intra-column reordering, and cross-column status transitions.',
    requirements: {
      functional: [
        '3-column board: "To Do", "In Progress", "Completed".',
        'Drag cards between columns to change their progress state.',
        'Reorder cards within the same column by dragging up or down.',
        'Add new cards to any column with title and description.',
        'Visual drop preview line indicating exactly where the dropped card will land.',
      ],
      nonFunctional: [
        'Zero external drag-and-drop dependencies.',
        'Smooth CSS transition states on active dragged card.',
      ],
    },
    conceptsUsed: [
      {
        name: 'HTML5 Drag & Drop Lifecycle',
        description: 'Uses `draggable={true}`, `onDragStart`, `onDragOver`, `onDragLeave`, and `onDrop`.',
      },
      {
        name: 'Array Reordering Operations',
        description: 'Slices and splices arrays to move items between different column groups cleanly.',
      },
      {
        name: 'DataTransfer Object & State Identification',
        description: 'Encodes dragged card ID and source column in dataTransfer or component state.',
      },
    ],
    edgeCases: [
      'Dropping into an empty column should append to that column smoothly.',
      'Dragging outside window and releasing should cancel drag without mutating board state.',
      'Rapid dragging should not duplicate cards or corrupt column lists.',
    ],
    solutionCode: `import React, { useState } from 'react';

interface Card { id: string; title: string; column: 'todo' | 'in_progress' | 'done'; }

export function KanbanBoard() {
  const [cards, setCards] = useState<Card[]>([
    { id: '1', title: 'Design System Tokens', column: 'todo' },
    { id: '2', title: 'Implement Auth Flow', column: 'in_progress' },
    { id: '3', title: 'Setup Unit Tests', column: 'done' },
  ]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = (targetCol: Card['column']) => {
    if (!draggedId) return;
    setCards((prev) => prev.map((c) => (c.id === draggedId ? { ...c, column: targetCol } : c)));
    setDraggedId(null);
  };

  const columns: { id: Card['column']; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Completed' },
  ];

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {columns.map((col) => (
        <div
          key={col.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
          style={{ flex: 1, background: '#f8fafc', padding: 12, borderRadius: 8, minHeight: 300 }}
        >
          <h4>{col.label}</h4>
          {cards.filter((c) => c.column === col.id).map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={() => setDraggedId(card.id)}
              style={{ padding: 12, margin: '8px 0', background: '#fff', borderRadius: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'grab' }}
            >
              {card.title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}`,
  },

  // 14. Real-Time Chat UI
  {
    id: 'realtime-chat',
    number: 14,
    title: 'Real-Time Chat UI with Auto-Scroll',
    difficulty: 'Advanced',
    category: 'Async & Network',
    tags: ['WebSockets', 'Auto-Scroll', 'Typing Indicator', 'Timestamps', 'Streaming'],
    summary: 'Simulated WebSocket message stream, typing indicators, auto-scroll to bottom, and "new messages below" pill.',
    explanation:
      'Tests chat application architecture: streaming message handling, sticky auto-scroll when user is at the bottom, detecting when user has scrolled up to read history (disabling auto-scroll), and typing indicator presence.',
    requirements: {
      functional: [
        'Send and receive chat messages with avatars, names, timestamps, and message bubbles.',
        'Auto-scroll to bottom when a new message arrives IF user is already scrolled to the bottom.',
        'If user has scrolled up, do NOT force scroll to bottom; instead show a "New messages ↓" pill.',
        'Simulate incoming messages and "Alex is typing..." indicator.',
        'Enter sends message; Shift+Enter creates a new line.',
      ],
      nonFunctional: [
        'Smooth scroll behaviors and timestamp formatting.',
        'Keyboard accessibility for message composer.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Scroll Position Calculus',
        description: 'Calculates `isAtBottom = scrollHeight - scrollTop - clientHeight < threshold` before updating DOM.',
      },
      {
        name: 'useLayoutEffect / useEffect for Auto-Scroll',
        description: 'Executes `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })` conditionally.',
      },
      {
        name: 'Streaming Message Append Cycle',
        description: 'Preserves message ordering with deterministic IDs and timestamp sorting.',
      },
    ],
    edgeCases: [
      'Sending a message oneself should always force scroll to bottom regardless of scroll position.',
      'Very long message texts should wrap cleanly without breaking chat container boundaries.',
      'Rapid burst of 5 incoming messages should only update scroll position once smoothly.',
    ],
    solutionCode: `import React, { useState, useEffect, useRef } from 'react';

interface Message { id: string; text: string; sender: 'me' | 'other'; timestamp: number; }

export function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey! Ready for the machine coding round?', sender: 'other', timestamp: Date.now() - 60000 },
  ]);
  const [input, setInput] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShowScrollBottom(!isBottom);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), text: input, sender: 'me', timestamp: Date.now() }]);
    setInput('');
    setTimeout(scrollToBottom, 50);
  };

  return (
    <div style={{ maxWidth: 450, margin: '0 auto', border: '1px solid #ccc', borderRadius: 8, height: 400, display: 'flex', flexDirection: 'column' }}>
      <div ref={chatContainerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ textAlign: m.sender === 'me' ? 'right' : 'left', margin: '6px 0' }}>
            <span style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 12, background: m.sender === 'me' ? '#3b82f6' : '#e2e8f0', color: m.sender === 'me' ? '#fff' : '#000' }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      {showScrollBottom && <button onClick={scrollToBottom} style={{ alignSelf: 'center' }}>↓ New messages</button>}
      <div style={{ display: 'flex', padding: 8, borderTop: '1px solid #ccc' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} style={{ flex: 1 }} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}`,
  },

  // 15. React Pagination Component
  {
    id: 'pagination-component',
    number: 15,
    title: 'Smart Pagination Component',
    difficulty: 'Beginner',
    category: 'Data & Navigation',
    tags: ['Pagination', 'Ellipsis Logic', 'Windowing', 'Keyboard Navigation'],
    summary: 'Sliding window page numbers with ellipsis (e.g. 1 ... 4 5 [6] 7 8 ... 50), page size selector, and jump-to-page.',
    explanation:
      'Tests the classic sliding-window algorithm for generating page numbers with ellipses (`1 ... 4 5 [6] 7 8 ... 50`). Avoids rendering 50 buttons by calculating sibling offsets, left/right ellipsis thresholds, and jump-to-page bounds.',
    requirements: {
      functional: [
        'Generate compact page items with smart ellipsis (`1 ... 4 5 [6] 7 8 ... 50`).',
        'Previous and Next page buttons, disabled at boundaries (page 1 and totalPages).',
        'Direct page jumping input: type a page number and press Enter.',
        'Page size selector (10, 20, 50 items per page) that automatically recalculates total pages.',
        'Shows total record count and active viewing range (e.g. "Showing 51–60 of 500 items").',
      ],
      nonFunctional: [
        'ARIA pagination attributes (`aria-label="Pagination Navigation"`, `aria-current="page"`).',
        'Pure arithmetic without external libraries.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Sliding Window Ellipsis Algorithm',
        description: 'Calculates leftSiblingIndex and rightSiblingIndex to determine if left or right ellipses should appear.',
      },
      {
        name: 'Boundary Clamping',
        description: 'Safely clamps page numbers within `Math.min(Math.max(1, newPage), totalPages)`.',
      },
      {
        name: 'Range Arithmetic',
        description: 'Calculates `fromItem = (page - 1) * pageSize + 1` and `toItem = Math.min(page * pageSize, totalItems)`.',
      },
    ],
    edgeCases: [
      'Total pages <= 7: should render all numbers without any ellipses.',
      'Current page near start (e.g. page 2 of 50): show `1 2 3 4 5 ... 50`.',
      'Current page near end (e.g. page 49 of 50): show `1 ... 46 47 48 49 50`.',
      'Changing page size when on page 10 such that total pages becomes 5 should automatically clamp page to 5.',
    ],
    solutionCode: `import React, { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const pages = useMemo(() => {
    const delta = 1;
    const range: number[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    const result: (number | string)[] = [];
    if (range[0] > 2) result.push(1, '...');
    else if (range[0] === 2) result.push(1);
    else result.push(1);

    result.push(...range);

    if (range[range.length - 1] < totalPages - 1) result.push('...', totalPages);
    else if (totalPages > 1) result.push(totalPages);

    return Array.from(new Set(result));
  }, [currentPage, totalPages]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Previous</button>
      {pages.map((p, idx) =>
        typeof p === 'number' ? (
          <button
            key={idx}
            onClick={() => onPageChange(p)}
            style={{ padding: '4px 8px', fontWeight: p === currentPage ? 700 : 400, background: p === currentPage ? '#3b82f6' : 'transparent', color: p === currentPage ? '#fff' : '#000' }}
          >
            {p}
          </button>
        ) : (
          <span key={idx} style={{ padding: '0 4px' }}>...</span>
        )
      )}
      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  );
}`,
  },
];
