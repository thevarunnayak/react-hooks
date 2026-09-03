import React, { useState, useRef, useEffect } from 'react';
import { Timer, AlertTriangle, ShieldCheck, Play, Plus, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

export const ClosureVisualizer: React.FC = () => {
  const [count, setCount] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [capturedCount, setCapturedCount] = useState<number | null>(null);
  const [fixMode, setFixMode] = useState<'stale' | 'ref' | 'functional'>('stale');
  const [resultLog, setResultLog] = useState<string | null>(null);

  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const startTimer = () => {
    setTimerActive(true);
    setCapturedCount(count);
    setResultLog(null);

    const snapshot = count; // Closed over value

    setTimeout(() => {
      setTimerActive(false);
      if (fixMode === 'stale') {
        setResultLog(`Timer fired! Callback saw captured value: ${snapshot} (UI was ${countRef.current})`);
      } else if (fixMode === 'ref') {
        setResultLog(`Timer fired! useRef saw current value: ${countRef.current}`);
      } else {
        setResultLog(`Timer fired with functional accessor: ${countRef.current}`);
      }
    }, 3000);
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-default)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={18} style={{ color: 'var(--accent-warning)' }} />
          <h4 style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
            JavaScript Closure & Stale State Lab
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            size="xs"
            variant={fixMode === 'stale' ? 'danger' : 'outline'}
            onClick={() => setFixMode('stale')}
          >
            Bug: Stale Closure
          </Button>
          <Button
            size="xs"
            variant={fixMode === 'ref' ? 'primary' : 'outline'}
            onClick={() => setFixMode('ref')}
          >
            Fix: useRef Mutable Box
          </Button>
        </div>
      </div>

      {/* Interactive Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          backgroundColor: 'var(--bg-surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>CURRENT STATE IN UI</span>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {count}
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => setCount((c) => c + 1)}
          >
            Increment Count (+1)
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>3-SECOND ASYNC TIMER</span>
          <Button
            size="sm"
            variant={timerActive ? 'outline' : 'primary'}
            icon={<Play size={14} />}
            disabled={timerActive}
            onClick={startTimer}
          >
            {timerActive ? 'Timer Running (3s)...' : 'Start 3s Timer'}
          </Button>
          {timerActive && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} />
              <span>Now click "+1" multiple times before time expires!</span>
            </div>
          )}
        </div>
      </div>

      {/* Scope Snapshot Diagram */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-code)',
          border: '1px solid var(--border-subtle)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ color: 'var(--text-muted)' }}>// Closure Anatomy</div>
        <div>
          <span style={{ color: 'var(--accent-purple-text)' }}>Render Scope: </span>
          <span style={{ color: 'var(--text-primary)' }}>count = {count}</span>
        </div>
        <div>
          <span style={{ color: 'var(--accent-warning-text)' }}>Captured in Callback: </span>
          <span style={{ color: 'var(--text-primary)' }}>
            {capturedCount !== null ? `count = ${capturedCount}` : 'None (click Start Timer)'}
          </span>
        </div>
      </div>

      {/* Execution Result Log */}
      {resultLog && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: fixMode === 'stale' ? 'var(--accent-danger-subtle)' : 'var(--accent-success-subtle)',
            border: fixMode === 'stale'
              ? '1px solid rgba(244, 63, 94, 0.3)'
              : '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-sm)',
            animation: 'fadeIn 200ms ease-out',
          }}
        >
          {fixMode === 'stale' ? (
            <AlertTriangle size={18} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
          ) : (
            <ShieldCheck size={18} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
          )}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{resultLog}</span>
        </div>
      )}
    </div>
  );
};
