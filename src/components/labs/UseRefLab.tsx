import React, { useState, useRef } from 'react';
import { Target, Layers, ArrowRight, RotateCcw, Crosshair } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { t } from '../../i18n/i18n';
import { useRenderCount } from '../../hooks/usePrevious';

export const UseRefLab: React.FC = () => {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);
  const renderCount = useRenderCount();

  // DOM Ref measurement
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxDimensions, setBoxDimensions] = useState<{ width: number; height: number } | null>(null);

  const incrementState = () => {
    setStateCount((c) => c + 1);
  };

  const incrementRef = () => {
    refCount.current += 1;
    // Note: Does not trigger re-render!
  };

  const forceRerender = () => {
    setStateCount((c) => c); // or any state trigger
  };

  const measureBox = () => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setBoxDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="cyan">useState vs useRef Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              Mutable Container Without Re-renders & DOM Access
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            <code>useRef</code> returns a mutable object whose <code>.current</code> property persists across renders
            without triggering re-renders when mutated. Notice how the total render counter behaves below!
          </p>
        </div>
      </Card>

      {/* Global Component Render Counter */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Total Component Renders:
        </span>
        <Badge variant="primary" size="md">
          {renderCount} Renders
        </Badge>
      </div>

      {/* Side-by-Side Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* useState Card */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--accent-primary-text)' }}>
              1. useState Value
            </span>
            <Badge variant="primary">Triggers Rerender</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>{stateCount}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>visible in UI</span>
          </div>

          <Button variant="primary" size="sm" onClick={incrementState}>
            Increment useState (+1)
          </Button>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Calling <code>setStateCount</code> schedules a re-render. Component executes again, DOM updates immediately.
          </p>
        </Card>

        {/* useRef Card */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--accent-cyan-text)' }}>
              2. useRef Value (.current)
            </span>
            <Badge variant="cyan">Zero Rerenders</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>{refCount.current}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              (UI only refreshes when a render occurs)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={incrementRef} style={{ flex: 1 }}>
              Mutate ref.current (+1)
            </Button>
            <Tooltip content="Force re-render to view updated ref in UI" placement="top">
              <Button variant="ghost" size="sm" onClick={forceRerender}>
                {t('common.syncUI')}
              </Button>
            </Tooltip>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Mutating <code>refCount.current</code> is synchronous and silent. Total renders will NOT increase!
          </p>
        </Card>
      </div>

      {/* DOM Measurement Ref Demo */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={16} style={{ color: 'var(--accent-purple)' }} />
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            DOM Node Access: Measuring Live Elements
          </span>
        </div>

        <div
          ref={boxRef}
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-subtle)',
            border: '2px dashed var(--border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Resize your window or inspect this element via <code>useRef&lt;HTMLDivElement&gt;</code>
          </span>
          <Button size="xs" variant="secondary" onClick={measureBox}>
            Measure Dimensions
          </Button>
        </div>

        {boxDimensions && (
          <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple-text)' }}>
            DOM Rect: width = {boxDimensions.width}px, height = {boxDimensions.height}px
          </div>
        )}
      </Card>
    </div>
  );
};
