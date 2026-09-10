import React, { useState, useRef, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Layers, Activity, Cpu, ArrowDown, Sparkles } from 'lucide-react';

const TOTAL_ITEMS = 10000;
const ITEM_HEIGHT = 44;
const CONTAINER_HEIGHT = 360;
const OVERSCAN = 4;

const GENERATED_ITEMS = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
  id: i + 1,
  title: `Record #${(i + 1).toLocaleString()}`,
  hash: `0x${(i * 1234567).toString(16).padStart(8, '0')}`,
  status: i % 5 === 0 ? 'Verified' : i % 3 === 0 ? 'Pending' : 'Success',
  latencyMs: (i * 7) % 45 + 5,
}));

export const ListVirtualizationLab: React.FC = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = TOTAL_ITEMS * ITEM_HEIGHT;

  // Window calculation
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
  const endIndex = Math.min(TOTAL_ITEMS, startIndex + visibleCount + 2 * OVERSCAN);

  const visibleSlice = useMemo(() => {
    return GENERATED_ITEMS.slice(startIndex, endIndex);
  }, [startIndex, endIndex]);

  const offsetY = startIndex * ITEM_HEIGHT;

  const scrollToRandom = () => {
    const targetIdx = Math.floor(Math.random() * (TOTAL_ITEMS - 50));
    if (containerRef.current) {
      containerRef.current.scrollTop = targetIdx * ITEM_HEIGHT;
    }
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = totalHeight;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* Telemetry Bar */}
      <Card variant="glass" padding="sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge variant="cyan" size="sm">
            <Layers size={11} style={{ marginRight: 3 }} />
            Total: 10,000 Items
          </Badge>
          <Badge variant="success" size="sm">
            <Cpu size={11} style={{ marginRight: 3 }} />
            Active DOM Nodes: {visibleSlice.length}
          </Badge>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Button
            size="xs"
            variant="secondary"
            onClick={scrollToTop}
          >
            Top
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={scrollToRandom}
            style={{ color: 'var(--accent-primary)' }}
          >
            Random Jump
          </Button>
          <Button
            size="xs"
            variant="secondary"
            onClick={scrollToBottom}
          >
            Bottom
          </Button>
        </div>
      </Card>

      {/* Virtualization Viewport */}
      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{
          height: CONTAINER_HEIGHT,
          overflowY: 'auto',
          position: 'relative',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        {/* Phantom total height spacer */}
        <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
          {/* Translated visible slice */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${offsetY}px)`,
              willChange: 'transform',
            }}
          >
            {visibleSlice.map((item) => (
              <div
                key={item.id}
                style={{
                  height: ITEM_HEIGHT,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)', width: 90, flexShrink: 0 }}>
                    {item.title}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.hash}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.latencyMs}ms</span>
                  <Badge variant={item.status === 'Success' ? 'success' : item.status === 'Verified' ? 'purple' : 'warning'} size="sm">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanatory telemetry footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>ScrollTop: <strong>{Math.round(scrollTop)}px</strong></span>
        <span>Render window: <strong>items {startIndex + 1} to {endIndex}</strong></span>
        <span>Memory saved: <strong>~{Math.round(((TOTAL_ITEMS - visibleSlice.length) / TOTAL_ITEMS) * 100)}%</strong></span>
      </div>
    </div>
  );
};
