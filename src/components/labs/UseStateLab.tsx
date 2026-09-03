import React, { useState } from 'react';
import { Plus, RotateCcw, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RenderVisualizer, RenderLogEntry } from '../visualization/RenderVisualizer';

export const UseStateLab: React.FC = () => {
  const [directCount, setDirectCount] = useState(0);
  const [functionalCount, setFunctionalCount] = useState(0);
  const [renderLogs, setRenderLogs] = useState<RenderLogEntry[]>([]);
  const [renderNum, setRenderNum] = useState(1);

  const addLog = (reason: string) => {
    const nextNum = renderNum + 1;
    setRenderNum(nextNum);
    setRenderLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        renderNumber: nextNum,
        timestamp: Date.now(),
        componentName: 'UseStateLab',
        reason,
      },
    ]);
  };

  // 1. Direct State Updates (Batched with same snapshot)
  const handleTripleDirect = () => {
    setDirectCount(directCount + 1);
    setDirectCount(directCount + 1);
    setDirectCount(directCount + 1);
    addLog(`setDirectCount(count + 1) x3 (all read snapshot: ${directCount})`);
  };

  // 2. Functional Updates (Queued pure functions)
  const handleTripleFunctional = () => {
    setFunctionalCount((c) => c + 1);
    setFunctionalCount((c) => c + 1);
    setFunctionalCount((c) => c + 1);
    addLog('setFunctionalCount(c => c + 1) x3 (queued sequentially)');
  };

  const handleReset = () => {
    setDirectCount(0);
    setFunctionalCount(0);
    setRenderLogs([]);
    setRenderNum(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Description Banner */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="primary">State Update & Batching Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              Direct Updates vs Functional Updates
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Why does calling <code>setCount(count + 1)</code> three times only increment by 1, whereas{' '}
            <code>setCount(c =&gt; c + 1)</code> increments by 3? Test both live below to see how React queues updates.
          </p>
        </div>
      </Card>

      {/* Side-by-Side Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Direct Updates Box */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--accent-warning)' }}>
              A. Direct Value Update
            </span>
            <Badge variant="warning">Snapshot Value</Badge>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            {`setCount(count + 1);\nsetCount(count + 1);\nsetCount(count + 1);`}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>{directCount}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>current count</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleTripleDirect}>
            Run 3x Direct Updates
          </Button>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
            }}
          >
            <AlertCircle size={14} style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              All 3 calls read <code>count</code> from the same render snapshot ({directCount}). Result: {directCount + 1}.
            </span>
          </div>
        </Card>

        {/* Functional Updates Box */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--accent-success)' }}>
              B. Functional Update
            </span>
            <Badge variant="success">Queued Pure Function</Badge>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            {`setCount(c => c + 1);\nsetCount(c => c + 1);\nsetCount(c => c + 1);`}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>{functionalCount}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>current count</span>
          </div>

          <Button variant="primary" size="sm" onClick={handleTripleFunctional}>
            Run 3x Functional Updates
          </Button>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
            }}
          >
            <CheckCircle2 size={14} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              Each function receives the pending state from the previous queued update. Result: {functionalCount + 3}.
            </span>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="xs" variant="ghost" icon={<RotateCcw size={12} />} onClick={handleReset}>
          Reset Lab State
        </Button>
      </div>

      {/* Render Causality Stream */}
      <RenderVisualizer logs={renderLogs} onClear={() => setRenderLogs([])} />
    </div>
  );
};
