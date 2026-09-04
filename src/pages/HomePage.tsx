import React, { useState, useRef } from 'react';
import {
  LayoutGrid,
  Map,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Activity,
  AlertTriangle,
  Zap,
  Terminal,
  RefreshCw,
  Clock,
  Layers,
  Cpu,
  Boxes,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HOOKS_CATALOG } from '../data/hooks';

export interface HomePageProps {
  onNavigate: (route: string, param?: string) => void;
  completedLessons?: string[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, completedLessons = [] }) => {
  // Interactive Hero Telemetry Sandbox
  const [heroCount, setHeroCount] = useState(0);
  const [heroRenders, setHeroRenders] = useState(1);
  const [lastAction, setLastAction] = useState<string>('Initial Mount');
  const [isStableRef, setIsStableRef] = useState(true);
  const memoryAddressRef = useRef('0x4A1E');

  const triggerDirect = () => {
    // Demonstrating render batching
    setHeroCount(heroCount + 1);
    setHeroRenders((r) => r + 1);
    setLastAction(`setHeroCount(${heroCount} + 1) — Snapshot read`);
    setIsStableRef(false);
    memoryAddressRef.current = '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase();
  };

  const triggerFunctional = () => {
    setHeroCount((c) => c + 1);
    setHeroRenders((r) => r + 1);
    setLastAction('setHeroCount(c => c + 1) — Functional queue');
    setIsStableRef(true);
  };

  const productionPitfalls = [
    {
      id: 'stale-closures',
      tag: 'CLOSURE TRAP',
      title: 'Stale Closures in setInterval & Callbacks',
      scenario: 'A timer created inside useEffect reads initial state (count = 0) forever because the callback closed over the mount snapshot.',
      solution: 'Pass a functional updater setCount(c => c + 1) or store mutable identity in a useRef.',
      route: 'hook',
      param: 'useEffect',
      color: 'var(--accent-danger)',
    },
    {
      id: 'referential-equality',
      tag: 'INFINITE LOOP',
      title: 'Object References in Dependency Arrays',
      scenario: 'Passing new options object literal ({ query }) into useEffect dependencies creates a new memory address on every render, triggering an infinite fetch loop.',
      solution: 'Stabilize reference identity with useMemo or hoist static configuration outside component scope.',
      route: 'hook',
      param: 'useMemo',
      color: 'var(--accent-warning)',
    },
    {
      id: 'double-invocation',
      tag: 'REACT 18 / 19',
      title: 'Strict Mode Double Invocations',
      scenario: 'Effects run Mount → Cleanup → Mount in local development to help you identify missing teardowns (WebSockets, subscriptions, AbortControllers).',
      solution: 'Ensure all side effects return symmetric cleanup functions that restore original state.',
      route: 'hook',
      param: 'useLayoutEffect',
      color: 'var(--accent-purple)',
    },
    {
      id: 'blocking-typing',
      tag: 'PERFORMANCE',
      title: 'Main Thread UI Freezes on Heavy Renders',
      scenario: 'Filtering 5,000 table rows synchronously blocks browser paint events, causing keyboard typing lag and stutter.',
      solution: 'Wrap non-urgent list updates in useTransition to keep 60fps typing completely responsive.',
      route: 'hook',
      param: 'useTransition',
      color: 'var(--accent-primary)',
    },
  ];

  const curriculumPhases = [
    { phase: '01', title: 'Mental Model & Render Pipeline', desc: 'Render vs Commit, Fiber nodes, pure functions', route: 'hook-map' },
    { phase: '02', title: 'Reactive State Snapshots', desc: 'useState, state batching, queued updates', route: 'hook', param: 'useState' },
    { phase: '03', title: 'External Synchronization', desc: 'useEffect, cleanups, Race conditions with AbortController', route: 'hook', param: 'useEffect' },
    { phase: '04', title: 'Escape Hatches & DOM Identity', desc: 'useRef, mutable container, focus & scroll APIs', route: 'hook', param: 'useRef' },
    { phase: '05', title: 'Subtree Context Propagation', desc: 'useContext, context splitting, re-render boundaries', route: 'hook', param: 'useContext' },
    { phase: '06', title: 'Deterministic State Machines', desc: 'useReducer, action dispatchers, predictable transitions', route: 'hook', param: 'useReducer' },
    { phase: '07', title: 'Referential Equality & Memoization', desc: 'useMemo, useCallback, React.memo optimization', route: 'hook', param: 'useMemo' },
    { phase: '08', title: 'Non-Blocking Concurrent UI', desc: 'useTransition, useDeferredValue, time-slicing', route: 'hook', param: 'useTransition' },
    { phase: '09', title: 'React 19 Actions & Forms', desc: 'useActionState, useOptimistic, useId', route: 'hook', param: 'useActionState' },
    { phase: '10', title: 'Custom Hook Architecture', desc: '40+ composable hooks, sensors, browser APIs', route: 'custom-hooks' },
  ];

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '1120px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
      }}
      className="home-page"
    >
      {/* Developer Hero Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
          alignItems: 'center',
          paddingTop: 'var(--space-4)',
        }}
      >
        {/* Hero Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Badge variant="primary" size="sm">
              REACT 19 READY
            </Badge>
            <Badge variant="purple" size="sm">
              FIBER RECONCILER INTERNALS
            </Badge>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              100% Client-Side Privacy
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              color: 'var(--text-primary)',
            }}
          >
            Stop guessing what React hooks are doing under the hood.
          </h1>

          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
            }}
          >
            A visual, hands-on diagnostic laboratory for React engineers. Inspect state snapshots,
            debug memory leaks and stale closures, compare referential identity, and build components with an interactive visual builder.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <Button
              size="md"
              variant="primary"
              icon={<LayoutGrid size={16} />}
              iconRight={<ArrowRight size={14} />}
              onClick={() => onNavigate('playground')}
            >
              Open Visual Builder
            </Button>
            <Button
              size="md"
              variant="secondary"
              icon={<BookOpen size={16} />}
              onClick={() => onNavigate('hook', 'useState')}
            >
              Start Core Lessons
            </Button>
            <Button
              size="md"
              variant="outline"
              icon={<Sparkles size={16} />}
              onClick={() => onNavigate('custom-hooks')}
            >
              Custom Hooks (40+)
            </Button>
          </div>
        </div>

        {/* Live Hero Telemetry Card */}
        <Card
          variant="glass"
          padding="md"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={15} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                Interactive Fiber Telemetry
              </span>
            </div>
            <Badge variant="cyan" size="sm">
              Live State
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>State Value</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary-text)' }}>
                {heroCount}
              </div>
            </div>

            <div style={{ padding: '10px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Component Renders</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple-text)' }}>
                #{heroRenders}
              </div>
            </div>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Object Heap Pointer:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: isStableRef ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 600 }}>
              {memoryAddressRef.current} ({isStableRef ? 'Stable Reference' : 'Reallocated'})
            </span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} />
            <span>Last Mutation: <strong style={{ color: 'var(--text-primary)' }}>{lastAction}</strong></span>
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <Button
              size="xs"
              variant="outline"
              icon={<RefreshCw size={12} />}
              onClick={triggerDirect}
              style={{ flex: 1 }}
            >
              Direct Update
            </Button>
            <Button
              size="xs"
              variant="primary"
              icon={<Zap size={12} />}
              onClick={triggerFunctional}
              style={{ flex: 1 }}
            >
              Functional Update
            </Button>
          </div>
        </Card>
      </section>

      {/* Concrete Production Pitfalls Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-danger)' }} />
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Real-World Production Scenarios
            </h2>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            The 4 most common architectural traps encountered in senior React codebases, with interactive diagnostic reproductions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
          {productionPitfalls.map((pitfall) => (
            <Card
              key={pitfall.id}
              variant="glass"
              padding="md"
              interactive
              onClick={() => onNavigate(pitfall.route, pitfall.param)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em', color: pitfall.color }}>
                    {pitfall.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {pitfall.title}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                  {pitfall.scenario}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  <strong>Fix: </strong> {pitfall.solution}
                </p>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--accent-primary-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '6px',
                  }}
                >
                  Test in Diagnostic Lab <ArrowRight size={11} />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Visual Canvas Highlight Banner */}
      <Card
        variant="elevated"
        padding="lg"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Badge variant="purple" size="sm">
            THE VISUAL PLAYGROUND
          </Badge>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Build Real React Apps Visually
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Place actual UI components (Buttons, Inputs, Cards) and React logic hooks (<code>useState</code>, <code>useEffect</code>, <code>useRef</code>).
            Connect ports with bezier curves, click interactive elements in the live preview, and watch execution traces pulse across components in real time.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <Button
              size="sm"
              variant="primary"
              icon={<LayoutGrid size={14} />}
              onClick={() => onNavigate('playground')}
            >
              Launch Visual Builder
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Boxes size={14} />}
              onClick={() => onNavigate('examples')}
            >
              Real-Time Architectures (25)
            </Button>
          </div>
        </div>

        {/* Diagrammatic preview */}
        <div
          style={{
            padding: '14px',
            backgroundColor: 'var(--bg-code)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
          }}
        >
          <div style={{ color: 'var(--text-muted)' }}>// Visual Wire Architecture</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary-text)' }}>
            <span>Button [Increment (+1)]</span>
            <span style={{ color: 'var(--text-muted)' }}>──(onClick)──►</span>
            <span>useState [count: 0]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple-text)' }}>
            <span>useState [count]</span>
            <span style={{ color: 'var(--text-muted)' }}>──────(data)──────►</span>
            <span>Text [Count: &#123;&#123;count&#125;&#125;]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-warning-text)' }}>
            <span>Button [Toggle Timer]</span>
            <span style={{ color: 'var(--text-muted)' }}>──(onClick)──►</span>
            <span>useRef [intervalId]</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', color: 'var(--accent-success)', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} />
            <span>Generates clean, type-checked React 19 TypeScript code instantly.</span>
          </div>
        </div>
      </Card>

      {/* Structured Curriculum Phases */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Structured Learning Progression
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              From foundational Fiber rendering to concurrent time-slicing and custom hooks.
            </p>
          </div>
          <Badge variant="primary">
            {completedLessons.length} / {HOOKS_CATALOG.length} Lessons Completed
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
          {curriculumPhases.map((step) => {
            const isCompleted = step.param && completedLessons.includes(step.param);
            return (
              <div
                key={step.phase}
                onClick={() => onNavigate(step.route, step.param)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)',
                }}
                className="learning-path-step"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, paddingTop: '2px' }}>
                    {step.phase}
                  </span>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.desc}</div>
                  </div>
                </div>

                {isCompleted ? (
                  <CheckCircle2 size={14} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
                ) : (
                  <ArrowRight size={12} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
