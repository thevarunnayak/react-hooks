import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

export interface ResizableSplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  pane1: React.ReactNode;
  pane2: React.ReactNode;
  defaultSize?: number; // Size of pane1 (px if isPixelSize, or percentage 0-100)
  size?: number; // Controlled size
  onResize?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
  minSize?: number; // Default 150px
  maxSize?: number; // Default 85% or max px
  isPixelSize?: boolean; // If true, size is in pixels (e.g. 380px), otherwise percentage (e.g. 50%)
  pane1Collapsed?: boolean;
  pane2Collapsed?: boolean;
  onTogglePane1?: () => void;
  onTogglePane2?: () => void;
  pane1Label?: string;
  pane2Label?: string;
  showCollapseButtons?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
  direction = 'horizontal',
  pane1,
  pane2,
  defaultSize,
  size: controlledSize,
  onResize,
  onResizeEnd,
  minSize = 180,
  maxSize,
  isPixelSize = false,
  pane1Collapsed = false,
  pane2Collapsed = false,
  onTogglePane1,
  onTogglePane2,
  pane1Label,
  pane2Label,
  showCollapseButtons = true,
  className = '',
  style = {},
}) => {
  const isHorizontal = direction === 'horizontal';
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial size calculation
  const initialSize = defaultSize !== undefined ? defaultSize : isPixelSize ? 380 : 50;
  const [internalSize, setInternalSize] = useState<number>(initialSize);
  const currentSize = controlledSize !== undefined ? controlledSize : internalSize;

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  // Sync internal state if controlledSize changes
  useEffect(() => {
    if (controlledSize !== undefined) {
      setInternalSize(controlledSize);
    }
  }, [controlledSize]);

  const updateSize = useCallback(
    (newSize: number) => {
      setInternalSize(newSize);
      onResize?.(newSize);
    },
    [onResize]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary button
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;

    const startPos = isHorizontal ? e.clientX : e.clientY;
    const initialSplitSize = currentSize;
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerDimension = isHorizontal ? containerRect.width : containerRect.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      moveEvent.preventDefault();

      const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - startPos;

      let nextSize: number;
      if (isPixelSize) {
        nextSize = initialSplitSize + delta;
        const maxLimit = maxSize !== undefined ? maxSize : containerDimension - minSize;
        nextSize = Math.max(minSize, Math.min(nextSize, maxLimit));
      } else {
        const deltaPercent = (delta / containerDimension) * 100;
        nextSize = initialSplitSize + deltaPercent;
        const minPercent = (minSize / containerDimension) * 100;
        const maxPercent = maxSize !== undefined ? (maxSize / containerDimension) * 100 : 85;
        nextSize = Math.max(minPercent, Math.min(nextSize, maxPercent));
      }

      updateSize(Math.round(nextSize));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      onResizeEnd?.(currentSize);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = isPixelSize ? 20 : 3;
    if (isHorizontal) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSize(Math.max(minSize, currentSize - step));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSize(currentSize + step);
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSize(Math.max(minSize, currentSize - step));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateSize(currentSize + step);
      }
    }
  };

  // Compute CSS sizing for pane1
  let pane1StyleSize: string;
  if (pane1Collapsed) {
    pane1StyleSize = '0px';
  } else if (pane2Collapsed) {
    pane1StyleSize = '100%';
  } else if (isPixelSize) {
    pane1StyleSize = `${currentSize}px`;
  } else {
    pane1StyleSize = `${currentSize}%`;
  }

  return (
    <div
      ref={containerRef}
      className={`resizable-split-container ${isDragging ? 'is-dragging-split' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        userSelect: isDragging ? 'none' : 'auto',
        ...style,
      }}
    >
      {/* Invisible Global Overlay while dragging to prevent iframes/Monaco from capturing events */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            cursor: isHorizontal ? 'col-resize' : 'row-resize',
            userSelect: 'none',
          }}
        />
      )}

      {/* Pane 1 (Left / Top) */}
      <div
        style={{
          [isHorizontal ? 'width' : 'height']: pane1StyleSize,
          display: pane1Collapsed ? 'none' : 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {pane1}
      </div>

      {/* Resizer Divider Bar */}
      {!pane1Collapsed && !pane2Collapsed && (
        <div
          role="separator"
          tabIndex={0}
          aria-orientation={direction}
          aria-valuenow={currentSize}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onDoubleClick={() => updateSize(initialSize)}
          title="Drag to resize • Double click to reset"
          style={{
            position: 'relative',
            [isHorizontal ? 'width' : 'height']: '7px',
            [isHorizontal ? 'cursor' : 'cursor']: isHorizontal ? 'col-resize' : 'row-resize',
            backgroundColor: isDragging ? 'var(--accent-primary-subtle)' : 'var(--border-subtle)',
            transition: isDragging ? 'none' : 'background-color 150ms ease',
            zIndex: 30,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
          }}
          className="resizable-split-handle"
        >
          {/* Subtle Visual Line Indicator inside Divider */}
          <div
            style={{
              [isHorizontal ? 'width' : 'height']: isDragging ? '2px' : '1px',
              [isHorizontal ? 'height' : 'width']: '100%',
              backgroundColor: isDragging ? 'var(--accent-primary)' : 'var(--border-default)',
              transition: 'all 150ms ease',
            }}
          />

          {/* Embedded Collapse/Expand Button */}
          {showCollapseButtons && onTogglePane1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePane1();
              }}
              aria-label={pane1Label ? `Collapse ${pane1Label}` : 'Collapse pane'}
              title={pane1Label ? `Collapse ${pane1Label}` : 'Collapse pane'}
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                boxShadow: 'var(--shadow-sm)',
                zIndex: 40,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              {isHorizontal ? <ChevronLeft size={10} /> : <ChevronUp size={10} />}
            </button>
          )}
        </div>
      )}

      {/* Pane 2 (Right / Bottom) */}
      <div
        style={{
          flex: 1,
          display: pane2Collapsed ? 'none' : 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {pane2}
      </div>
    </div>
  );
};
