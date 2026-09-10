import { MachineCodingProblem } from '../../types/machineCoding';

export const PROBLEMS_PART4: MachineCodingProblem[] = [
  // 16. Accordion / FAQ Component
  {
    id: 'accordion-faq',
    number: 16,
    title: 'Accordion / FAQ Component',
    difficulty: 'Beginner',
    category: 'UI Feedback & Overlays',
    tags: ['Accordion', 'WAI-ARIA', 'Collapsible', 'Transitions', 'State'],
    summary: 'Single vs multiple expand modes, smooth animated height transitions, accessible ARIA attributes, and keyboard navigation.',
    explanation:
      'The accordion component is a staple of technical documentation, FAQ sections, and mobile navigation. The key challenge lies in orchestrating smooth CSS height transitions on dynamic content without hardcoding pixel heights, managing single vs. multiple active panel state, and implementing full WAI-ARIA accordion accessibility semantics.',
    requirements: {
      functional: [
        'Render a list of collapsible panels with title headers and content sections.',
        'Support two modes: Single-panel expansion (accordion) and Multi-panel expansion (collapsible list).',
        'Animated expand/collapse with rotating chevron indicator.',
        'Batch actions: Expand All and Collapse All buttons in multi-mode.',
        'Live search filter to quickly find matching FAQ topics and auto-expand them.',
      ],
      nonFunctional: [
        'WAI-ARIA compliance: aria-expanded, aria-controls, aria-labelledby, and role="region".',
        'Smooth CSS transitions using max-height or grid-template-rows: 0fr -> 1fr.',
        'Keyboard accessibility: Enter / Space to toggle, Up/Down arrow key focus cycling.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Set vs Single State Management',
        description: 'Uses Set<string> for multi-expand mode and string | null for single-expand mode for clean O(1) state lookups.',
      },
      {
        name: 'CSS Grid 0fr to 1fr Height Transitions',
        description: 'Modern CSS technique for animating from 0 to auto height without JavaScript measurement loops.',
      },
      {
        name: 'WAI-ARIA Accordion Pattern',
        description: 'Ensures screen readers announce panel expansion state and properly associate headers with content panels.',
      },
    ],
    edgeCases: [
      'Rapidly clicking headers during transition should not cause height snapping.',
      'Expanding panel with very tall content should not cause parent overflow clipping.',
      'Searching for a keyword should preserve the state of unopened panels after search is cleared.',
    ],
    solutionCode: `import React, { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([items[0]?.id]));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);

        return (
          <div
            key={item.id}
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={\`content-\${item.id}\`}
              id={\`header-\${item.id}\`}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{item.title}</span>
              <span
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  fontSize: '12px',
                }}
              >
                ▼
              </span>
            </button>
            <div
              id={\`content-\${item.id}\`}
              role="region"
              aria-labelledby={\`header-\${item.id}\`}
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.25s ease-out',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0 18px 16px 18px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};`,
  },

  // 17. Tabs Component
  {
    id: 'tabs-component',
    number: 17,
    title: 'Tabs Component',
    difficulty: 'Beginner',
    category: 'UI Feedback & Overlays',
    tags: ['Tabs', 'WAI-ARIA', 'Navigation', 'Sliding Indicator', 'Keyboard Navigation'],
    summary: 'Dynamic tab panels, animated sliding indicator, vertical & horizontal orientations, disabled tab handling, and WAI-ARIA keyboard navigation.',
    explanation:
      'Tabs organize content into modular sections while preserving page vertical real estate. A production-grade tabs component requires animated sliding active indicators, horizontal & vertical orientations, disabled tab states, dynamic tab adding/removing, and arrow-key keyboard navigation matching WAI-ARIA tablist standards.',
    requirements: {
      functional: [
        'Support switching between tabs with instant panel display.',
        'Animated sliding active indicator underneath the selected tab.',
        'Support both Horizontal and Vertical orientations.',
        'Support disabled tab items that cannot be selected or focused.',
        'Support dynamic adding and closing of individual tabs.',
      ],
      nonFunctional: [
        'Keyboard navigation: ArrowLeft/ArrowRight (horizontal), ArrowUp/ArrowDown (vertical), Home/End.',
        'WAI-ARIA compliance: role="tablist", role="tab", role="tabpanel", aria-selected, aria-controls.',
        'Smooth layout transitions without DOM reflow jumps.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Animated Indicator via Ref Layout Measurement',
        description: 'Calculates offsetLeft and clientWidth of the active tab to smoothly translate the highlight pill or underline.',
      },
      {
        name: 'WAI-ARIA roving tabindex',
        description: 'Sets tabindex={isActive ? 0 : -1} so tabs can be navigated via arrow keys without leaving the tablist.',
      },
      {
        name: 'Compound Component Architecture',
        description: 'Exposes Tabs, TabList, Tab, and TabPanel for flexible declarative composition.',
      },
    ],
    edgeCases: [
      'Closing the currently active tab should smoothly shift focus to the nearest remaining tab.',
      'Tabs with varying text lengths should properly size the indicator without clipping.',
      'Disabled tabs must be skipped during keyboard arrow navigation.',
    ],
    solutionCode: `import React, { useState, useRef, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs: React.FC<TabsProps> = ({ items, orientation = 'horizontal' }) => {
  const [activeTab, setActiveTab] = useState(items[0]?.id);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, top: 0, height: 0 });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const el = tabRefs.current.get(activeTab);
    if (el) {
      if (orientation === 'horizontal') {
        setIndicatorStyle({ left: el.offsetLeft, width: el.clientWidth, top: el.offsetTop + el.clientHeight - 2, height: 2 });
      } else {
        setIndicatorStyle({ left: 0, width: 3, top: el.offsetTop, height: el.clientHeight });
      }
    }
  }, [activeTab, orientation, items]);

  const activeContent = items.find((t) => t.id === activeTab)?.content;

  return (
    <div style={{ display: 'flex', flexDirection: orientation === 'vertical' ? 'row' : 'column', gap: 16 }}>
      <div
        role="tablist"
        aria-orientation={orientation}
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          position: 'relative',
          borderBottom: orientation === 'horizontal' ? '1px solid var(--border-default)' : 'none',
          borderRight: orientation === 'vertical' ? '1px solid var(--border-default)' : 'none',
          gap: 8,
        }}
      >
        {items.map((tab) => (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) tabRefs.current.set(tab.id, node);
              else tabRefs.current.delete(tab.id);
            }}
            role="tab"
            aria-selected={activeTab === tab.id}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '13px',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              opacity: tab.disabled ? 0.4 : 1,
            }}
          >
            {tab.label}
          </button>
        ))}
        {/* Animated indicator */}
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'var(--accent-primary)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            ...indicatorStyle,
          }}
        />
      </div>

      <div role="tabpanel" style={{ padding: '12px 0' }}>
        {activeContent}
      </div>
    </div>
  );
};`,
  },

  // 18. Tree View / File Explorer
  {
    id: 'tree-view-file-explorer',
    number: 18,
    title: 'Tree View / File Explorer',
    difficulty: 'Intermediate',
    category: 'Data & Navigation',
    tags: ['Recursion', 'Tree', 'File Explorer', 'State', 'Folder Collapse'],
    summary: 'Recursive nested file tree, folder expand/collapse, add file/folder, inline renaming, delete node, and search filter with auto-expansion.',
    explanation:
      'File trees are the core UI of IDEs, cloud storage explorers, and content management systems. The challenge requires implementing recursive component rendering, managing hierarchical tree mutations (add, rename, delete) immutably, and filtering trees while preserving path ancestry.',
    requirements: {
      functional: [
        'Recursively render folders and nested files with indented hierarchy levels.',
        'Expand/collapse folders with intuitive chevron rotation.',
        'Add new files and folders within any existing folder.',
        'Inline renaming of files and folders with validation.',
        'Delete files or non-empty folders with confirmation.',
        'Live search input that auto-expands parent folders containing matching files.',
      ],
      nonFunctional: [
        'Immutable state updates: deep recursive tree cloning without direct mutation.',
        'Distinct file extension icons (TypeScript, React TSX, CSS, JSON, Markdown).',
        'Selection state with mock file preview drawer on click.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Recursive Component Pattern',
        description: 'A component that invokes itself to render arbitrary levels of nested children without flat array flattening.',
      },
      {
        name: 'Immutable Tree Traversal & Mutation',
        description: 'Performs functional deep updates via recursive map/filter functions for adding, renaming, and deleting nodes.',
      },
      {
        name: 'Ancestry Preservation in Tree Search',
        description: 'Filters nodes matching a query while retaining all ancestor folders so matching leaves remain reachable.',
      },
    ],
    edgeCases: [
      'Creating duplicate file names within the same directory should be flagged.',
      'Deleting the currently selected file should reset the file viewer preview.',
      'Deeply nested folders (5+ levels) must not break container width or horizontal scroll.',
    ],
    solutionCode: `import React, { useState } from 'react';

export interface FileNode {
  id: string;
  name: string;
  isFolder: boolean;
  children?: FileNode[];
  content?: string;
}

export const INITIAL_FILES: FileNode = {
  id: 'root',
  name: 'project-root',
  isFolder: true,
  children: [
    {
      id: 'src',
      name: 'src',
      isFolder: true,
      children: [
        { id: 'app', name: 'App.tsx', isFolder: false, content: 'export default function App() { return <div>Hello</div>; }' },
        { id: 'index', name: 'index.ts', isFolder: false, content: 'console.log("ready");' },
      ],
    },
    { id: 'pkg', name: 'package.json', isFolder: false, content: '{\\n  "name": "app",\\n  "version": "1.0.0"\\n}' },
    { id: 'readme', name: 'README.md', isFolder: false, content: '# Documentation\\nFrontend machine coding project.' },
  ],
};

export const FileTreeNode: React.FC<{
  node: FileNode;
  level: number;
  onSelect: (node: FileNode) => void;
}> = ({ node, level, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!node.isFolder) {
    return (
      <div
        onClick={() => onSelect(node)}
        style={{
          paddingLeft: level * 16 + 8,
          paddingTop: 4,
          paddingBottom: 4,
          fontSize: '13px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>📄</span>
        <span>{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          paddingLeft: level * 16 + 4,
          paddingTop: 4,
          paddingBottom: 4,
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{isOpen ? '📂' : '📁'}</span>
        <span>{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} level={level + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};`,
  },

  // 19. Dashboard with Draggable Widgets
  {
    id: 'draggable-dashboard',
    number: 19,
    title: 'Dashboard with Draggable Widgets',
    difficulty: 'Intermediate',
    category: 'State & CRUD',
    tags: ['Drag and Drop', 'Dashboard', 'Widgets', 'Reorder', 'Analytics'],
    summary: 'Customizable analytics dashboard with draggable reordering, widget toggle (add/remove cards), live simulated metrics tick, and layout persistence.',
    explanation:
      'Analytics dashboards empower users to customize their workspace by reordering metric cards, toggling widgets on/off, and viewing real-time data feeds. The challenge tests drag-and-drop state array reordering without external bulky libraries, live interval updates without re-render cascades, and clean component decoupling.',
    requirements: {
      functional: [
        'Display a grid of analytical metric cards (Active Users, CPU Load, Error Rate, Revenue, Conversion).',
        'Drag and drop reordering of widgets with immediate position feedback.',
        'Widget catalog drawer to toggle widgets on/off.',
        'Live data simulation toggle with randomized metrics updating every 1.5s.',
        'Reset dashboard layout to default state.',
      ],
      nonFunctional: [
        'Clean HTML5 Drag and Drop or pointer-based drag handlers.',
        'Responsive multi-column grid layout adapting from 1 to 3 columns.',
        'Zero layout shifts when dragging cards.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Array Reordering with Splice Immutability',
        description: 'Implements immutable reordering: const [moved] = list.splice(from, 1); list.splice(to, 0, moved).',
      },
      {
        name: 'Drag & Drop Event Pipeline (dragStart, dragOver, drop)',
        description: 'Tracks draggedIndex and targetIndex to provide smooth ghost preview and position swap on drop.',
      },
      {
        name: 'Throttled Interval Ticking',
        description: 'Simulates live incoming metric data using requestAnimationFrame or setInterval with clean unmount cleanup.',
      },
    ],
    edgeCases: [
      'Dropping a widget onto itself should be a no-op.',
      'Dragging outside the dashboard area should cancel the operation cleanly.',
      'Toggling widgets off should not corrupt the index positions of remaining widgets.',
    ],
    solutionCode: `import React, { useState } from 'react';

export interface Widget {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export const DraggableDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', title: 'Active Users', value: '14,290', change: '+12.4%', isPositive: true },
    { id: '2', title: 'API Error Rate', value: '0.04%', change: '-0.02%', isPositive: true },
    { id: '3', title: 'CPU Utilization', value: '42.8%', change: '+4.1%', isPositive: false },
    { id: '4', title: 'Daily Revenue', value: '$8,420', change: '+18.9%', isPositive: true },
  ]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDraggedIdx(idx);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    setWidgets((prev) => {
      const next = [...prev];
      const [item] = next.splice(draggedIdx, 1);
      next.splice(targetIdx, 0, item);
      return next;
    });
    setDraggedIdx(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {widgets.map((w, idx) => (
        <div
          key={w.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(idx)}
          style={{
            padding: 16,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            cursor: 'grab',
            opacity: draggedIdx === idx ? 0.4 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{w.title}</div>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0', color: 'var(--text-primary)' }}>{w.value}</div>
          <div style={{ fontSize: '11px', color: w.isPositive ? 'var(--accent-success)' : 'var(--accent-error)' }}>
            {w.change} from last hour
          </div>
        </div>
      ))}
    </div>
  );
};`,
  },

  // 20. Split Pane Resizer
  {
    id: 'split-pane-resizer',
    number: 20,
    title: 'Split Pane Resizer',
    difficulty: 'Intermediate',
    category: 'Advanced DOM & Performance',
    tags: ['Split Pane', 'Resizer', 'Pointer Events', 'DOM', 'Layout'],
    summary: 'Dual-pane resizer with draggable divider gutter, horizontal/vertical orientation, min/max dimension bounds, collapse snaps, and pointer capture.',
    explanation:
      'Split panes are fundamental to code playgrounds, markdown editors, and comparison tools. Building an enterprise split pane requires handling mouse/pointer events across the entire window, preventing text selection during drag, enforcing minimum and maximum pixel boundaries, and supporting instant snap collapse.',
    requirements: {
      functional: [
        'Draggable splitter gutter between two flexible panes.',
        'Support Horizontal (side-by-side) and Vertical (stacked) split modes.',
        'Enforce min/max pane constraints (e.g. minimum 15%, maximum 85%).',
        'Collapse toggle buttons (< and >) on the gutter to snap either pane closed.',
        'Display live ratio badge (e.g. 40% : 60%).',
      ],
      nonFunctional: [
        'Attach mousemove and mouseup listeners to window to avoid cursor slippage.',
        'Apply user-select: none on document body during dragging to prevent text highlighting.',
        'Smooth CSS transition when clicking snap collapse buttons.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Window-Level Pointer Tracking',
        description: 'Attaches mousemove and mouseup listeners to document.body on mousedown to track drag movement outside the splitter handle.',
      },
      {
        name: 'BoundingClientRect Percentage Calculation',
        description: 'Computes split ratio: (e.clientX - container.left) / container.width * 100 clamped between min and max percentages.',
      },
      {
        name: 'Pointer Events & Text Selection Lock',
        description: 'Sets userSelect: none and pointerEvents: none during dragging to prevent cursor stutter over child iframes or inputs.',
      },
    ],
    edgeCases: [
      'Dragging rapidly outside the browser window should retain tracking until mouseup.',
      'Resizing the browser window should preserve relative split percentage.',
      'Collapsing a pane and dragging the splitter should immediately restore fluid resizing.',
    ],
    solutionCode: `import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface SplitPaneProps {
  initialRatio?: number;
  orientation?: 'horizontal' | 'vertical';
}

export const SplitPane: React.FC<SplitPaneProps> = ({ initialRatio = 50, orientation = 'horizontal' }) => {
  const [ratio, setRatio] = useState(initialRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newRatio = 50;

      if (orientation === 'horizontal') {
        newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newRatio = ((e.clientY - rect.top) / rect.height) * 100;
      }

      // Clamp between 15% and 85%
      setRatio(Math.min(Math.max(newRatio, 15), 85));
    },
    [isDragging, orientation]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        width: '100%',
        height: 340,
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ [orientation === 'horizontal' ? 'width' : 'height']: \`\${ratio}%\`, overflow: 'auto', padding: 16 }}>
        <strong>Pane Left / Top</strong>
      </div>
      <div
        onMouseDown={handleMouseDown}
        style={{
          [orientation === 'horizontal' ? 'width' : 'height']: 6,
          backgroundColor: isDragging ? 'var(--accent-primary)' : 'var(--border-default)',
          cursor: orientation === 'horizontal' ? 'col-resize' : 'row-resize',
          transition: 'background-color 0.15s ease',
        }}
      />
      <div style={{ [orientation === 'horizontal' ? 'width' : 'height']: \`\${100 - ratio}%\`, overflow: 'auto', padding: 16 }}>
        <strong>Pane Right / Bottom</strong>
      </div>
    </div>
  );
};`,
  },
];
