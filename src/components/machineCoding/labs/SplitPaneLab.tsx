import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  Columns,
  Rows,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  CheckCircle,
  FileCode,
  Layers,
  Maximize2,
  Plus,
  Minus,
  Terminal,
  Grid,
  Code2,
} from 'lucide-react';

const SAMPLE_MARKDOWN = `# React 19 Action Handlers

\`useActionState\` manages pending mutations, optimistic transitions, and automatic form resets without boilerplate.

### Highlights
- Zero layout thrashing
- Server and Client Action parity
- Instant fallback reconciliation

\`\`\`typescript
const [state, formAction, isPending] = useActionState(updateName, { name: 'Ada' });
\`\`\`
`;

export type LayoutMode = '2-pane' | '3-columns' | 'nested-right' | '4-grid';

export const SplitPaneLab: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('2-pane');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [nestedSplitPercent, setNestedSplitPercent] = useState<number>(50);
  const [isDraggingMain, setIsDraggingMain] = useState<boolean>(false);
  const [isDraggingNested, setIsDraggingNested] = useState<boolean>(false);
  const [markdownInput, setMarkdownInput] = useState<string>(SAMPLE_MARKDOWN);

  const containerRef = useRef<HTMLDivElement>(null);
  const nestedContainerRef = useRef<HTMLDivElement>(null);

  // Min and max clamp bounds
  const MIN_PERCENT = 15;
  const MAX_PERCENT = 85;

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  // Mouse move handler for primary dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingMain && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let newPercent = 50;
        if (orientation === 'horizontal') {
          const offsetX = e.clientX - rect.left;
          newPercent = (offsetX / rect.width) * 100;
        } else {
          const offsetY = e.clientY - rect.top;
          newPercent = (offsetY / rect.height) * 100;
        }
        setSplitPercent(clamp(Math.round(newPercent), MIN_PERCENT, MAX_PERCENT));
      }

      if (isDraggingNested && nestedContainerRef.current) {
        const rect = nestedContainerRef.current.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const newPercent = (offsetY / rect.height) * 100;
        setNestedSplitPercent(clamp(Math.round(newPercent), MIN_PERCENT, MAX_PERCENT));
      }
    },
    [isDraggingMain, isDraggingNested, orientation]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingMain(false);
    setIsDraggingNested(false);
  }, []);

  // Touch move handler for mobile/tablet dragging
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      if (isDraggingMain && containerRef.current) {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        let newPercent = 50;
        if (orientation === 'horizontal') {
          const offsetX = touch.clientX - rect.left;
          newPercent = (offsetX / rect.width) * 100;
        } else {
          const offsetY = touch.clientY - rect.top;
          newPercent = (offsetY / rect.height) * 100;
        }
        setSplitPercent(clamp(Math.round(newPercent), MIN_PERCENT, MAX_PERCENT));
      }

      if (isDraggingNested && nestedContainerRef.current) {
        e.preventDefault();
        const rect = nestedContainerRef.current.getBoundingClientRect();
        const offsetY = touch.clientY - rect.top;
        const newPercent = (offsetY / rect.height) * 100;
        setNestedSplitPercent(clamp(Math.round(newPercent), MIN_PERCENT, MAX_PERCENT));
      }
    },
    [isDraggingMain, isDraggingNested, orientation]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDraggingMain(false);
    setIsDraggingNested(false);
  }, []);

  useEffect(() => {
    const isDragging = isDraggingMain || isDraggingNested;
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isDraggingNested
        ? 'row-resize'
        : orientation === 'horizontal'
        ? 'col-resize'
        : 'row-resize';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDraggingMain, isDraggingNested, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, orientation]);

  // Handle Add / Remove Pane
  const handleAddPane = () => {
    if (layoutMode === '2-pane') setLayoutMode('nested-right');
    else if (layoutMode === 'nested-right') setLayoutMode('3-columns');
    else if (layoutMode === '3-columns') setLayoutMode('4-grid');
  };

  const handleRemovePane = () => {
    if (layoutMode === '4-grid') setLayoutMode('3-columns');
    else if (layoutMode === '3-columns') setLayoutMode('nested-right');
    else if (layoutMode === 'nested-right') setLayoutMode('2-pane');
  };

  const LAYOUT_OPTIONS = [
    { value: '2-pane', label: '2 Panes (Split)' },
    { value: 'nested-right', label: '3 Panes (Nested Right)' },
    { value: '3-columns', label: '3 Panes (Columns)' },
    { value: '4-grid', label: '4 Panes (2×2 Grid)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Controls Card */}
      <Card
        variant="glass"
        padding="md"
        style={{ position: 'relative', zIndex: 40 }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                Split Pane Resizer Component
              </h3>
              <Badge variant="cyan">
                {layoutMode === '2-pane'
                  ? `${splitPercent}% / ${100 - splitPercent}%`
                  : layoutMode === '3-columns'
                  ? `3 Columns`
                  : layoutMode === 'nested-right'
                  ? `Nested (${splitPercent}% | ${nestedSplitPercent}%)`
                  : `4-Way Grid`}
              </Badge>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Multi-pane resizer supporting horizontal/vertical splits, nested sub-panes, and dynamic pane adding.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Layout Mode Selector Dropdown */}
            <div style={{ minWidth: 200 }}>
              <CustomSelect
                size="sm"
                variant="elevated"
                value={layoutMode}
                onChange={(val) => setLayoutMode(val as LayoutMode)}
                options={LAYOUT_OPTIONS}
                ariaLabel="Select split layout"
              />
            </div>

            {/* Split Orientation Selector */}
            <div style={{ width: 135 }}>
              <CustomSelect
                size="sm"
                variant="elevated"
                value={orientation}
                onChange={(val) => setOrientation(val as 'horizontal' | 'vertical')}
                options={[
                  { value: 'horizontal', label: 'Columns (H)' },
                  { value: 'vertical', label: 'Rows (V)' },
                ]}
                ariaLabel="Select split orientation"
              />
            </div>

            {/* Add / Remove Pane Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus size={14} />}
                onClick={handleAddPane}
                disabled={layoutMode === '4-grid'}
                title="Add more panes"
              >
                Add Pane
              </Button>
              {layoutMode !== '2-pane' && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Minus size={14} />}
                  onClick={handleRemovePane}
                  title="Remove pane"
                >
                  Remove
                </Button>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={() => {
                setSplitPercent(50);
                setNestedSplitPercent(50);
                setLayoutMode('2-pane');
                setMarkdownInput(SAMPLE_MARKDOWN);
              }}
              title="Reset layout"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Split Pane Container */}
      <Card
        variant="glass"
        padding="none"
        style={{
          height: 'clamp(380px, 60vh, 560px)',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Pane 1: Editor / Source */}
          <div
            style={{
              [orientation === 'horizontal' ? 'width' : 'height']:
                layoutMode === '3-columns' ? '33.3%' : `${splitPercent}%`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-surface-elevated, #f8fafc)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-hover, #f1f5f9)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCode size={15} style={{ color: 'var(--accent-primary, #2563eb)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Source Markdown Editor
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {markdownInput.length} chars
              </span>
            </div>

            {/* Content Textarea */}
            <textarea
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              placeholder="Type markdown or code here..."
              style={{
                flex: 1,
                width: '100%',
                padding: '14px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary, #0f172a)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '13px',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Primary Gutter / Divider */}
          <div
            onMouseDown={() => setIsDraggingMain(true)}
            onTouchStart={() => setIsDraggingMain(true)}
            style={{
              [orientation === 'horizontal' ? 'width' : 'height']: '10px',
              backgroundColor: isDraggingMain
                ? 'var(--accent-primary, #2563eb)'
                : 'var(--border-default, #e2e8f0)',
              cursor: orientation === 'horizontal' ? 'col-resize' : 'row-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              transition: isDraggingMain ? 'none' : 'background-color 0.15s ease',
              position: 'relative',
              zIndex: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: orientation === 'horizontal' ? 3 : 16,
                height: orientation === 'horizontal' ? 16 : 3,
                backgroundColor: isDraggingMain ? '#ffffff' : 'var(--text-muted)',
                borderRadius: 2,
              }}
            />
          </div>

          {/* Secondary Area based on Layout Mode */}
          {layoutMode === '2-pane' && (
            /* Standard Pane 2: Live Preview */
            <div
              style={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${100 - splitPercent}%`,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg-surface, #ffffff)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-hover, #f1f5f9)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={15} style={{ color: 'var(--accent-success, #10b981)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Live Rendered Output
                  </span>
                </div>
                <Badge variant="success">COMPILED</Badge>
              </div>

              <div style={{ padding: '18px 22px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary, #2563eb)' }}>
                  Rendered Preview
                </h2>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--accent-primary-subtle, rgba(37, 99, 235, 0.08))',
                    borderRadius: '6px',
                    borderLeft: '3px solid var(--accent-primary, #2563eb)',
                    marginBottom: 16,
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Instant split-pane synchronisation without layout redraw locks.
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle, #f8fafc)',
                    padding: 14,
                    borderRadius: 6,
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '12px',
                    overflowX: 'auto',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {markdownInput}
                </div>
              </div>
            </div>
          )}

          {layoutMode === 'nested-right' && (
            /* Nested Right: Top/Bottom Split inside Right Pane */
            <div
              ref={nestedContainerRef}
              style={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${100 - splitPercent}%`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              {/* Nested Top: Live Rendered Output */}
              <div
                style={{
                  height: `${nestedSplitPercent}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'auto',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-hover)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={15} style={{ color: 'var(--accent-success, #10b981)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Live Rendered Output
                    </span>
                  </div>
                  <Badge variant="success">NESTED TOP</Badge>
                </div>
                <div style={{ padding: 16, fontSize: '13px', color: 'var(--text-primary)' }}>
                  <h4 style={{ margin: '0 0 8px', color: 'var(--accent-primary)' }}>Rendered Preview</h4>
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '12px',
                    }}
                  >
                    {markdownInput}
                  </div>
                </div>
              </div>

              {/* Nested Divider */}
              <div
                onMouseDown={() => setIsDraggingNested(true)}
                onTouchStart={() => setIsDraggingNested(true)}
                style={{
                  height: '10px',
                  backgroundColor: isDraggingNested
                    ? 'var(--accent-primary, #2563eb)'
                    : 'var(--border-default)',
                  cursor: 'row-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  flexShrink: 0,
                  transition: isDraggingNested ? 'none' : 'background-color 0.15s ease',
                }}
              >
                <div style={{ width: 18, height: 3, backgroundColor: isDraggingNested ? '#fff' : 'var(--text-muted)', borderRadius: 2 }} />
              </div>

              {/* Nested Bottom: Diagnostic Console / Metrics */}
              <div
                style={{
                  height: `${100 - nestedSplitPercent}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'auto',
                  backgroundColor: 'var(--bg-surface-elevated)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-hover)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Terminal size={15} style={{ color: 'var(--accent-cyan, #0891b2)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Diagnostics & Metrics
                    </span>
                  </div>
                  <Badge variant="cyan">NESTED BOTTOM</Badge>
                </div>
                <div style={{ padding: 14, fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-secondary)' }}>
                  <div>[STATS] Characters: {markdownInput.length} | Lines: {markdownInput.split('\n').length}</div>
                  <div>[SPLIT] Primary: {splitPercent}% | Nested: {nestedSplitPercent}%</div>
                  <div>[STATE] Optimistic reconciler: ACTIVE</div>
                </div>
              </div>
            </div>
          )}

          {layoutMode === '3-columns' && (
            /* 3 Columns: Middle (Live Output) & Right (AST / JSON) */
            <>
              {/* Middle Column */}
              <div
                style={{
                  width: '33.3%',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bg-surface)',
                  borderRight: '1px solid var(--border-default)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-hover)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={15} style={{ color: 'var(--accent-success, #10b981)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Live Preview (Col 2)
                    </span>
                  </div>
                  <Badge variant="success">COLUMN 2</Badge>
                </div>
                <div style={{ padding: 16, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {markdownInput}
                </div>
              </div>

              {/* Right Column: AST / Metadata */}
              <div
                style={{
                  width: '33.3%',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bg-surface-elevated)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-hover)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code2 size={15} style={{ color: 'var(--accent-purple, #7c3aed)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Document AST (Col 3)
                    </span>
                  </div>
                  <Badge variant="purple">JSON</Badge>
                </div>
                <div style={{ padding: 14, fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <pre style={{ margin: 0, overflowX: 'auto', color: 'var(--text-primary)' }}>
{JSON.stringify(
  {
    type: 'Document',
    length: markdownInput.length,
    paragraphs: markdownInput.split('\n\n').length,
    headings: (markdownInput.match(/^#/gm) || []).length,
    codeBlocks: (markdownInput.match(/```/g) || []).length / 2,
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>
            </>
          )}

          {layoutMode === '4-grid' && (
            /* 4-Way Grid */
            <div
              style={{
                width: `${100 - splitPercent}%`,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              {/* Quadrant 2: Live Render */}
              <div style={{ borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: 12, overflow: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 6 }}>
                  Quadrant 2: Output
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {markdownInput.slice(0, 160)}...
                </div>
              </div>
              {/* Quadrant 3: AST */}
              <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: 12, overflow: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: 6 }}>
                  Quadrant 3: AST
                </div>
                <pre style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {JSON.stringify({ lines: markdownInput.split('\n').length }, null, 2)}
                </pre>
              </div>
              {/* Quadrant 4: Terminal Logs */}
              <div style={{ borderRight: '1px solid var(--border-subtle)', padding: 12, overflow: 'auto', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 6 }}>
                  Quadrant 4: Logs
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                  [OK] Layout 2x2 mounted
                </div>
              </div>
              {/* Quadrant 5: Memory / Metrics */}
              <div style={{ padding: 12, overflow: 'auto', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-success)', marginBottom: 6 }}>
                  Quadrant 5: Metrics
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                  Alloc: 4 Sub-doms active
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary, #3b82f6)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Multi-Pane & Nested Tree Layouts</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Supports dynamic pane insertion, recursive sub-pane split orientations, and arbitrary n-way grid distributions.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary, #3b82f6)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Min / Max Clamping Math</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Strict boundaries prevent panes from disappearing into 0% width, maintaining clean responsive layout proportions across all resolutions.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary, #3b82f6)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Global Pointer Capture</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Window mouse event bindings ensure smooth drag interactions even when cursor speed exceeds the viewport frame rate.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

