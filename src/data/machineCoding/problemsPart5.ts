import { MachineCodingProblem } from '../../types/machineCoding';

export const PROBLEMS_PART5: MachineCodingProblem[] = [
  // 21. Breadcrumb Navigation Generator
  {
    id: 'breadcrumb-navigation',
    number: 21,
    title: 'Breadcrumb Navigation Generator',
    difficulty: 'Beginner',
    category: 'Data & Navigation',
    tags: ['Breadcrumb', 'Navigation', 'Overflow Menu', 'Routing', 'WAI-ARIA'],
    summary: 'Dynamic path hierarchy, responsive overflow collapse into popover dropdown, custom separators, and interactive path builder.',
    explanation:
      'Breadcrumbs help users maintain orientation in deep application hierarchies and navigate back up the tree. The challenge requires building a declarative breadcrumb system that dynamically collapses middle items into an ellipsis (...) dropdown when space is constrained, supports custom separators, and adheres to WAI-ARIA breadcrumb guidelines.',
    requirements: {
      functional: [
        'Render hierarchical breadcrumb trails with clickable parent segments and static current page.',
        'Support maximum visible segments threshold (e.g. max 3 or 4 items).',
        'Automatically collapse overflowing intermediary segments into an ellipsis (...) dropdown.',
        'Custom separator selection (/ slash, > chevron, • bullet).',
        'Interactive path builder to push/pop segments and test responsive truncation.',
      ],
      nonFunctional: [
        'WAI-ARIA compliance: nav role="navigation" aria-label="Breadcrumb", ol/li semantics, aria-current="page".',
        'Truncate excessively long segment names with ellipsis and full tooltip on hover.',
        'Keyboard navigation across clickable path segments.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Segment Partitioning with Ellipsis Windowing',
        description: 'Splits items into [head, ...collapsed, ...tail] when items.length > maxVisible to preserve context.',
      },
      {
        name: 'WAI-ARIA Breadcrumb Pattern',
        description: 'Uses an ordered list (<ol>) inside <nav aria-label="Breadcrumb"> with aria-current="page" on the active leaf segment.',
      },
      {
        name: 'Outside Click Popover Management',
        description: 'Closes the collapsed middle segment dropdown menu when clicking anywhere outside.',
      },
    ],
    edgeCases: [
      'A breadcrumb trail of 1 or 2 items should never show the collapsed dropdown.',
      'Extremely long path names (50+ chars) should truncate gracefully without overflowing container.',
      'Clicking a collapsed item from the dropdown should navigate directly to that parent route.',
    ],
    solutionCode: `import React, { useState } from 'react';

export interface BreadcrumbSegment {
  id: string;
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbSegment[];
  maxVisible?: number;
  separator?: string;
  onNavigate?: (segment: BreadcrumbSegment) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  maxVisible = 4,
  separator = '/',
  onNavigate,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const shouldCollapse = items.length > maxVisible;
  const first = items[0];
  const last = items[items.length - 1];
  const middle = items.slice(1, items.length - 1);
  const visibleTail = items.slice(-2);

  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', padding: 0, margin: 0, gap: 8 }}>
        {/* First Item */}
        <li>
          <button
            onClick={() => onNavigate?.(first)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
          >
            {first.label}
          </button>
        </li>
        <li aria-hidden="true" style={{ color: 'var(--text-muted)' }}>{separator}</li>

        {/* Collapsed Ellipsis Dropdown */}
        {shouldCollapse && (
          <li style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}
            >
              ...
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 6,
                  padding: 4,
                  zIndex: 20,
                  minWidth: 140,
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {middle.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onNavigate?.(m);
                      setDropdownOpen(false);
                    }}
                    style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            )}
          </li>
        )}

        {/* Tail Items */}
        {(shouldCollapse ? visibleTail : items.slice(1)).map((seg, idx, arr) => {
          const isCurrent = idx === arr.length - 1;
          return (
            <React.Fragment key={seg.id}>
              <li aria-hidden="true" style={{ color: 'var(--text-muted)' }}>{separator}</li>
              <li>
                {isCurrent ? (
                  <span aria-current="page" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                    {seg.label}
                  </span>
                ) : (
                  <button
                    onClick={() => onNavigate?.(seg)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {seg.label}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};`,
  },

  // 22. Poll & Voting System
  {
    id: 'poll-voting-system',
    number: 22,
    title: 'Poll & Voting System',
    difficulty: 'Intermediate',
    category: 'Async & Network',
    tags: ['Poll', 'Voting', 'Real-Time', 'State', 'Progress Bar'],
    summary: 'Real-time voting with animated percentage bars, single-vote locking via storage, simulated live incoming vote stream, and leading option badges.',
    explanation:
      'Online polls and voting widgets require calculating live percentages with rounding consistency (always summing to 100%), preventing double-voting via persistent client-side tracking, animating progress bars smoothly, and supporting real-time inbound vote streams.',
    requirements: {
      functional: [
        'Display question with 4 multiple choice options and vote submission.',
        'Compute and display live percentages with smooth animated width expansion.',
        'Lock voting state after user casts a vote, showing voted indicator checkmark.',
        'Simulate inbound real-time vote stream with toggle (simulating active community votes).',
        'Highlight leading option with visual crown or "Leading" badge.',
        'Allow clearing vote or resetting poll stats.',
      ],
      nonFunctional: [
        'Prevent percentage roundoff drift (ensure all percentages sum to exactly 100%).',
        'Fluid CSS transitions (width 0.4s cubic-bezier).',
        'Persist voted option in localStorage so refresh preserves state.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Normalized Percentage Distribution',
        description: 'Calculates Math.round((optionVotes / totalVotes) * 100) and handles totalVotes === 0 gracefully.',
      },
      {
        name: 'Optimistic UI Update with Storage Lock',
        description: 'Instantly increments option vote count and writes user choice to localStorage before sync.',
      },
      {
        name: 'Simulated WebSocket/SSE Inflow',
        description: 'Periodically pushes randomized votes into the state array to demonstrate dynamic re-balancing.',
      },
    ],
    edgeCases: [
      'Initial state with 0 total votes should display 0% without division by zero NaN errors.',
      'Tied votes should mark all leading options consistently.',
      'Rapidly toggling simulated stream should not cause memory leaks or duplicate timers.',
    ],
    solutionCode: `import React, { useState, useEffect } from 'react';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export const PollVoting: React.FC = () => {
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: 'React 19 Server Components', votes: 48 },
    { id: '2', text: 'TanStack Start & Router', votes: 31 },
    { id: '3', text: 'Vite 6 & Roll-Down Bundling', votes: 65 },
    { id: '4', text: 'WebAssembly & SIMD', votes: 19 },
  ]);
  const [userVotedId, setUserVotedId] = useState<string | null>(null);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (id: string) => {
    if (userVotedId) return;
    setUserVotedId(id);
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o))
    );
  };

  const highestVotes = Math.max(...options.map((o) => o.votes));

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: '16px' }}>What frontend tech are you most excited for in 2026?</h3>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{totalVotes} total votes recorded</div>

      {options.map((opt) => {
        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        const isLeading = opt.votes === highestVotes && opt.votes > 0;
        const isSelected = userVotedId === opt.id;

        return (
          <div
            key={opt.id}
            onClick={() => handleVote(opt.id)}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              border: \`1px solid \${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}\`,
              overflow: 'hidden',
              cursor: userVotedId ? 'default' : 'pointer',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            {/* Background percentage fill */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: \`\${pct}%\`,
                backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
                transition: 'width 0.4s ease',
                zIndex: 0,
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500 }}>{opt.text}</span>
                {isSelected && <span style={{ fontSize: '11px', color: 'var(--accent-primary)' }}>✓ You voted</span>}
                {isLeading && <span style={{ fontSize: '10px', backgroundColor: 'var(--accent-warning)', color: '#000', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Leading</span>}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};`,
  },

  // 23. Product Image Gallery with Zoom
  {
    id: 'product-gallery-zoom',
    number: 23,
    title: 'Product Image Gallery with Zoom',
    difficulty: 'Advanced',
    category: 'Advanced DOM & Performance',
    tags: ['Gallery', 'Zoom', 'Magnifying Glass', 'Lightbox', 'E-commerce'],
    summary: 'E-commerce media gallery with thumbnail carousel selector, mouse-tracking magnifying glass zoom lens, 2.5x high-res zoom preview, and modal lightbox.',
    explanation:
      'Product galleries on Amazon, Shopify, and Apple require fluid interaction: thumbnail selection, smooth main image cross-fading, mouse-following magnifying zoom lens with bounds checking, and high-resolution flyout magnification. This problem assesses spatial cursor math and high-performance image transformations.',
    requirements: {
      functional: [
        'Display primary product image with thumbnail gallery strip.',
        'Hovering primary image displays a circular magnifying glass lens tracking cursor position.',
        'Side magnification flyout (or lens zoom) showing 2.5x high-resolution detail.',
        'Bound clamping: zoom lens stays strictly within the image container boundary.',
        'Thumbnail click updates the active view with smooth fade transition.',
        'Clicking main image opens a high-resolution lightbox modal with escape-to-close.',
      ],
      nonFunctional: [
        'Zero cursor lag: uses mousemove with transform percentage calculations.',
        'Mobile touch fallback (pinch to zoom or tap for lightbox).',
        'High-resolution image preloading for instantaneous magnification.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Normalized Cursor Coordinate Mapping',
        description: 'Calculates xPercent = (e.clientX - rect.left) / rect.width and maps to backgroundPosition: `${xPercent * 100}% ${yPercent * 100}%`.',
      },
      {
        name: 'Magnifying Lens Clamping Math',
        description: 'Clamps lens coordinates: Math.max(0, Math.min(x - lensRadius, rect.width - lensWidth)).',
      },
      {
        name: 'Image Preloading & Cache Priming',
        description: 'Preloads high-resolution assets in memory so hovering initiates immediate crisp rendering.',
      },
    ],
    edgeCases: [
      'Mouse rapidly entering and exiting image boundary must remove the lens immediately.',
      'Images with different aspect ratios should maintain object-fit: cover or contain without distortion.',
      'Window resize during zoom must re-measure image bounding rect.',
    ],
    solutionCode: `import React, { useState, useRef } from 'react';

export interface ProductMedia {
  id: string;
  thumb: string;
  highRes: string;
  alt: string;
}

export const ProductGallery: React.FC<{ items: ProductMedia[] }> = ({ items }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const activeMedia = items[activeIdx];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseLeave = () => setZoomCoords(null);

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Main image container */}
      <div
        ref={imgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: 380,
          height: 380,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#1e293b',
          cursor: 'crosshair',
        }}
      >
        <img src={activeMedia.thumb} alt={activeMedia.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {zoomCoords && (
          <div
            style={{
              position: 'absolute',
              top: \`\${zoomCoords.y}%\`,
              left: \`\${zoomCoords.x}%\`,
              transform: 'translate(-50%, -50%)',
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Zoom Flyout Panel */}
      {zoomCoords && (
        <div
          style={{
            width: 320,
            height: 380,
            borderRadius: 8,
            border: '1px solid var(--border-default)',
            backgroundImage: \`url(\${activeMedia.highRes})\`,
            backgroundPosition: \`\${zoomCoords.x}% \${zoomCoords.y}%\`,
            backgroundSize: '300%',
            backgroundRepeat: 'no-repeat',
            boxShadow: 'var(--shadow-lg)',
          }}
        />
      )}
    </div>
  );
};`,
  },

  // 24. Rich Text Editor
  {
    id: 'rich-text-editor',
    number: 24,
    title: 'Rich Text Editor',
    difficulty: 'Advanced',
    category: 'Advanced DOM & Performance',
    tags: ['Rich Text', 'WYSIWYG', 'ContentEditable', 'Selection API', 'Formatting'],
    summary: 'ContentEditable WYSIWYG editor with formatting toolbar (bold, italic, headings, lists, quotes, code), word/char count, and live HTML export.',
    explanation:
      'Rich text editors power modern blogging, documentation, and comment platforms. Building one from scratch involves managing contentEditable element states, executing formatting commands safely with document.execCommand or modern Selection API ranges, maintaining toolbar active state indicators, and exporting sanitised HTML.',
    requirements: {
      functional: [
        'WYSIWYG editing canvas supporting inline styling (bold, italic, underline, strikethrough).',
        'Block formatting: Heading 1, Heading 2, Blockquote, Code Block, Bullet List, Ordered List.',
        'Active format tracking: toolbar buttons highlight when cursor is inside formatted text.',
        'Word counter, character counter, and estimated reading time.',
        'Live HTML and Markdown source preview tab.',
        'Clean formatting button to strip formatting from selected text.',
      ],
      nonFunctional: [
        'Preserve cursor focus inside contentEditable during toolbar button clicks (e.preventDefault on mousedown).',
        'Accessible toolbar: role="toolbar", aria-pressed for active toggle states.',
        'Prevent paste of un-sanitised or dangerous HTML script injection.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Selection & Range API or execCommand',
        description: 'Applies styling commands and reads document.queryCommandState() to highlight active toolbar buttons.',
      },
      {
        name: 'Focus Preservation via mousedown preventDefault',
        description: 'Prevents contentEditable canvas from losing focus when clicking toolbar action buttons.',
      },
      {
        name: 'Text Metrics Extraction',
        description: 'Calculates real-time word count (text.trim().split(/\\s+/).length) and reading time.',
      },
    ],
    edgeCases: [
      'Pasting rich styled text from Word or Google Docs should clean unneeded styles.',
      'Pressing Enter inside a blockquote or list should appropriately create new list item or escape.',
      'Empty editor should display placeholder text cleanly.',
    ],
    solutionCode: `import React, { useState, useRef } from 'react';

export const RichTextEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const format = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateContent();
    }
  };

  const updateContent = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText.trim();
    setHtmlContent(html);
    setWordCount(text ? text.split(/\\s+/).length : 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: 8,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          flexWrap: 'wrap',
        }}
      >
        <button onMouseDown={(e) => { e.preventDefault(); format('bold'); }} style={{ fontWeight: 800, padding: '4px 8px' }}>B</button>
        <button onMouseDown={(e) => { e.preventDefault(); format('italic'); }} style={{ fontStyle: 'italic', padding: '4px 8px' }}>I</button>
        <button onMouseDown={(e) => { e.preventDefault(); format('underline'); }} style={{ textDecoration: 'underline', padding: '4px 8px' }}>U</button>
        <button onMouseDown={(e) => { e.preventDefault(); format('formatBlock', 'h2'); }} style={{ padding: '4px 8px' }}>H2</button>
        <button onMouseDown={(e) => { e.preventDefault(); format('insertUnorderedList'); }} style={{ padding: '4px 8px' }}>• List</button>
        <button onMouseDown={(e) => { e.preventDefault(); format('removeFormat'); }} style={{ padding: '4px 8px' }}>Clear</button>
      </div>

      {/* Editor Surface */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        style={{
          minHeight: 180,
          padding: 16,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          outline: 'none',
          lineHeight: 1.6,
          fontSize: '14px',
        }}
      />

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{wordCount} words</span>
        <span>HTML Export Available</span>
      </div>
    </div>
  );
};`,
  },

  // 25. Code Editor with Syntax Highlighting
  {
    id: 'code-editor-syntax',
    number: 25,
    title: 'Code Editor with Syntax Highlighting',
    difficulty: 'Advanced',
    category: 'Advanced DOM & Performance',
    tags: ['Code Editor', 'Syntax Highlighting', 'Tokenizer', 'Tabs', 'Line Numbers'],
    summary: 'Lightweight code editor with synchronized line numbers, simulated syntax tokenizer, tab indentation handling, theme switcher, and sandbox runner.',
    explanation:
      'Code editors like VS Code, CodeSandbox, and LeetCode require overlaying a transparent textarea with a syntax-highlighted pre/code layer. Challenges include keeping scroll positions synchronized to the exact pixel, handling Tab/Shift-Tab key indentation without losing focus, calculating accurate line numbers, and styling syntax tokens (keywords, strings, functions, numbers, comments).',
    requirements: {
      functional: [
        'Synchronized code editor with live line number gutter.',
        'Syntax highlighting simulation tokenizing keywords, strings, functions, and comments.',
        'Tab key handling: pressing Tab inserts 2 spaces at the cursor without blurring.',
        'Theme selector: Dark Modern, Night Owl, Monokai.',
        'Language selector: TypeScript, JavaScript, CSS, JSON.',
        '"Run Code" simulated execution sandbox showing console output.',
      ],
      nonFunctional: [
        'Perfect pixel synchronization between textarea and background highlight code block.',
        'Monospace typography with identical line-height and font-size across both layers.',
        'Copy code snippet to clipboard with confirmation toast.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Dual-Layer Synchronized Textarea & Code Overlay',
        description: 'A transparent caret-active textarea positioned exactly over a highlighted <pre><code> block with matching line-height and font metrics.',
      },
      {
        name: 'Cursor-Aware Tab Key Insertion',
        description: 'Uses textarea.selectionStart and selectionEnd to insert 2 spaces and advance the cursor position programmatically.',
      },
      {
        name: 'Micro-Tokenizer Regex Lexer',
        description: 'Splits raw code strings into categorized token spans (keyword, string, number, comment, function) using declarative regex patterns.',
      },
    ],
    edgeCases: [
      'Scrolling horizontally or vertically must scroll both textarea and pre layers simultaneously.',
      'Selecting code across multiple lines should maintain visible selection highlights.',
      'Consecutive spaces and newlines must be preserved using white-space: pre.',
    ],
    solutionCode: `import React, { useState, useRef } from 'react';

export const CodeEditor: React.FC = () => {
  const [code, setCode] = useState(
    '// Welcome to the Live React Code Editor\\nfunction calculateFibonacci(n: number): number {\\n  if (n <= 1) return n;\\n  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);\\n}\\n\\nconsole.log(calculateFibonacci(10));'
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const lines = code.split('\\n');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
      {/* Line Numbers Gutter */}
      <div style={{ padding: '12px 8px', backgroundColor: '#020617', color: '#64748b', fontFamily: 'monospace', fontSize: 13, userSelect: 'none', textAlign: 'right' }}>
        {lines.map((_, i) => (
          <div key={i} style={{ lineHeight: '20px' }}>{i + 1}</div>
        ))}
      </div>

      {/* Editor Area */}
      <div style={{ position: 'relative', flex: 1, height: 260 }}>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            padding: 12,
            background: 'transparent',
            color: '#f8fafc',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: '20px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            whiteSpace: 'pre',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};`,
  },
];
