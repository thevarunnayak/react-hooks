import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Play, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EffectLifecycle } from '../visualization/EffectLifecycle';

export const UseEffectLab: React.FC = () => {
  const [depType, setDepType] = useState<'empty' | 'count' | 'none' | 'unstable'>('count');
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [effectRunCount, setEffectRunCount] = useState(0);
  const [cleanupCount, setCleanupCount] = useState(0);
  const [loopDetected, setLoopDetected] = useState(false);

  const loopGuardRef = useRef(0);

  // Controlled Effect Execution
  useEffect(() => {
    loopGuardRef.current += 1;
    if (loopGuardRef.current > 20) {
      setLoopDetected(true);
      return;
    }

    setEffectRunCount((c) => c + 1);

    return () => {
      setCleanupCount((c) => c + 1);
    };
  }, [depType === 'none' ? Math.random() : depType === 'count' ? count : depType === 'unstable' ? {} : undefined]);

  const reset = () => {
    loopGuardRef.current = 0;
    setCount(0);
    setText('');
    setEffectRunCount(0);
    setCleanupCount(0);
    setLoopDetected(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="purple">Interactive useEffect Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              Dependency Array & Cleanup Inspector
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Choose a dependency configuration below, trigger state updates, and observe when effects run,
            when cleanups execute, and how accidental reference recreations cause infinite loops.
          </p>
        </div>
      </Card>

      {/* Dependency Selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          size="sm"
          variant={depType === 'empty' ? 'primary' : 'outline'}
          onClick={() => {
            reset();
            setDepType('empty');
          }}
        >
          useEffect(fn, []) — Mount Only
        </Button>
        <Button
          size="sm"
          variant={depType === 'count' ? 'primary' : 'outline'}
          onClick={() => {
            reset();
            setDepType('count');
          }}
        >
          useEffect(fn, [count]) — Primitives
        </Button>
        <Button
          size="sm"
          variant={depType === 'none' ? 'primary' : 'outline'}
          onClick={() => {
            reset();
            setDepType('none');
          }}
        >
          useEffect(fn) — Every Render
        </Button>
        <Button
          size="sm"
          variant={depType === 'unstable' ? 'danger' : 'outline'}
          onClick={() => {
            reset();
            setDepType('unstable');
          }}
        >
          useEffect(fn, [{}]) — Unstable Object Loop!
        </Button>
      </div>

      {/* Infinite Loop Alert */}
      {loopDetected && (
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-danger-subtle)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <AlertTriangle size={24} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--accent-danger-text)' }}>Infinite Re-render Loop Intercepted!</strong>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Because <code>[&#123;&#125;]</code> creates a new object in memory every render, <code>Object.is(prev, next)</code>{' '}
              is ALWAYS false. If the effect updates state, it renders again, creating a loop. Circuit-breaker halted the loop safely!
            </p>
            <Button size="xs" variant="secondary" onClick={reset} style={{ marginTop: '8px' }}>
              Reset Circuit Breaker
            </Button>
          </div>
        </div>
      )}

      {/* Live Counter & Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <Card variant="elevated" padding="md">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>EFFECT EXECUTIONS</span>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-primary-text)' }}>
            {effectRunCount}
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>CLEANUP EXECUTIONS</span>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-purple-text)' }}>
            {cleanupCount}
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>STATE: COUNT</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>{count}</span>
            <Button size="xs" variant="secondary" onClick={() => setCount((c) => c + 1)}>
              +1 Count
            </Button>
          </div>
        </Card>
      </div>

      {/* Lifecycle Visualizer */}
      <EffectLifecycle />
    </div>
  );
};
