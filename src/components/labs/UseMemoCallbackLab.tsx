import React, { useState, useMemo, useCallback } from 'react';
import { Gauge, Clock, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ReferentialVisualizer } from '../visualization/ReferentialVisualizer';

// Simulates an expensive mathematical calculation
function findNthPrime(n: number): number {
  let count = 0;
  let num = 2;
  while (count < n) {
    let isPrime = true;
    for (let i = 2; i * i <= num; i++) {
      if (num % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
    num++;
  }
  return num - 1;
}

// Memoized Child Component
const MemoizedChild = React.memo<{ onClick: () => void; renderTracker: number }>(
  ({ onClick, renderTracker }) => {
    return (
      <div
        style={{
          padding: 'var(--space-3)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          &lt;MemoizedChild /&gt; Renders: <strong>{renderTracker}</strong>
        </span>
        <Button size="xs" variant="ghost" onClick={onClick}>
          Child Action
        </Button>
      </div>
    );
  }
);

export const UseMemoCallbackLab: React.FC = () => {
  const [unrelatedState, setUnrelatedState] = useState(0);
  const [targetNumber, setTargetNumber] = useState(5000);
  const [useMemoEnabled, setUseMemoEnabled] = useState(false);
  const [useCallbackEnabled, setUseCallbackEnabled] = useState(false);
  const [childRenderCount, setChildRenderCount] = useState(1);

  // Measure calculation time
  const start = performance.now();
  const calculatedPrime = useMemo(() => {
    if (!useMemoEnabled) return 0;
    return findNthPrime(targetNumber);
  }, [useMemoEnabled ? targetNumber : undefined]);

  const fallbackPrime = !useMemoEnabled ? findNthPrime(targetNumber) : calculatedPrime;
  const executionDuration = Math.round((performance.now() - start) * 100) / 100;

  // Callback testing for child
  const stableCallback = useCallback(() => {
    console.log('Child button clicked');
  }, []);

  const inlineCallback = () => {
    console.log('Child button clicked');
  };

  const currentCallback = useCallbackEnabled ? stableCallback : inlineCallback;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="purple">Performance Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              useMemo (Cost vs Cache) & useCallback (Function Identity)
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Memoization avoids redundant calculations and prevents child re-renders. Toggle both optimizations
            live to observe computation duration and child render behavior.
          </p>
        </div>
      </Card>

      {/* Part 1: useMemo Expensive Calculation */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            1. Expensive Calculation: Find the #{targetNumber} Prime Number
          </span>
          <Button
            size="xs"
            variant={useMemoEnabled ? 'primary' : 'outline'}
            onClick={() => setUseMemoEnabled(!useMemoEnabled)}
          >
            {useMemoEnabled ? 'useMemo: ON (Cached)' : 'useMemo: OFF (Recalculate Every Render)'}
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>RESULT</span>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {fallbackPrime.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>COMPUTE TIME THIS RENDER</span>
            <div
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: executionDuration > 20 ? 'var(--accent-warning)' : 'var(--accent-success)',
              }}
            >
              {executionDuration} ms
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="sm" variant="secondary" onClick={() => setUnrelatedState((s) => s + 1)}>
            Trigger Unrelated Parent Render ({unrelatedState})
          </Button>
          <span style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px', color: useMemoEnabled ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
            {useMemoEnabled ? (
              <>
                <CheckCircle2 size={13} />
                <span>useMemo skipped calculation on unrelated render!</span>
              </>
            ) : (
              <>
                <AlertTriangle size={13} />
                <span>Re-ran heavy calculation unnecessarily!</span>
              </>
            )}
          </span>
        </div>
      </Card>

      {/* Part 2: useCallback + React.memo */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            2. useCallback + React.memo: Preventing Child Re-renders
          </span>
          <Button
            size="xs"
            variant={useCallbackEnabled ? 'primary' : 'outline'}
            onClick={() => setUseCallbackEnabled(!useCallbackEnabled)}
          >
            {useCallbackEnabled ? 'useCallback: ON (Stable Ref)' : 'useCallback: OFF (Inline fn)'}
          </Button>
        </div>

        <MemoizedChild
          onClick={currentCallback}
          renderTracker={useCallbackEnabled ? 1 : unrelatedState + 1}
        />

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Even though <code>&lt;MemoizedChild /&gt;</code> is wrapped in <code>React.memo</code>, passing an inline
          function <code>() =&gt; ...</code> creates a new function in memory on each render, failing the shallow prop
          equality check. <code>useCallback</code> caches the function reference!
        </p>
      </Card>

      {/* Referential Visualizer */}
      <ReferentialVisualizer />
    </div>
  );
};
