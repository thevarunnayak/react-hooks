import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { BookOpen, AlertTriangle, CheckCircle2, ArrowRight, LayoutGrid, Eye } from 'lucide-react';

export interface TutorialsPageProps {
  onLoadInPlayground: (tutorialKey: string) => void;
}

export const TutorialsPage: React.FC<TutorialsPageProps> = ({ onLoadInPlayground }) => {
  const [breakItActive, setBreakItActive] = useState<Record<string, boolean>>({});
  const [revealedSolution, setRevealedSolution] = useState<Record<string, boolean>>({});

  const tutorials = [
    {
      id: 'counter',
      title: 'Counter with Batching & Functional Updates',
      difficulty: 'Beginner',
      hooks: ['useState'],
      goal: 'Understand how state updates batch and how functional updates queue sequential changes.',
      steps: [
        'Place a Button and Text component in the builder.',
        'Add a useState block with initial value 0.',
        'Connect Button.onClick -> setCount, and count -> Text.',
        'Observe how clicking the button updates the live preview and triggers execution trace.',
      ],
      breakItBug: {
        title: 'Triple Update Snapshot Trap',
        description: 'Calling setCount(count + 1) three times in a row inside an event handler only increases by 1.',
        hint: 'What value does count hold during that single render snapshot?',
        solution: 'Replace setCount(count + 1) with the functional updater setCount(c => c + 1). Each queued function receives the pending state from the prior update.',
      },
    },
    {
      id: 'stopwatch',
      title: 'Stopwatch with Interval & Cleanup',
      difficulty: 'Intermediate',
      hooks: ['useState', 'useEffect', 'useRef'],
      goal: 'Master setInterval in React, manage timer IDs with useRef, and guarantee symmetric cleanups.',
      steps: [
        'Place Start, Stop, and Reset buttons with an Elapsed Seconds display.',
        'Wire useState(seconds) for display, useEffect for setInterval, and useRef for interval ID.',
        'Verify that stopping the stopwatch clears the interval via clearInterval.',
      ],
      breakItBug: {
        title: 'Missing Interval Cleanup & Stale Closure',
        description: 'Creating an interval without storing the ID in a ref and returning a cleanup causes duplicate timers and stale count reads.',
        hint: 'Check what happens if the component unmounts while the interval is ticking.',
        solution: 'Always store the interval ID in a useRef and return () => clearInterval(id.current) in the useEffect cleanup.',
      },
    },
    {
      id: 'search',
      title: 'Debounced Search Query',
      difficulty: 'Intermediate',
      hooks: ['useState', 'useDebounce', 'useEffect'],
      goal: 'Prevent API spam and typing lag by delaying network queries until the user pauses typing.',
      steps: [
        'Place an Input and a Results List.',
        'Bind input value to query state.',
        'Debounce query by 300ms before triggering the search effect.',
      ],
      breakItBug: {
        title: 'Missing AbortController Race Condition',
        description: 'Typing "cat" then "dog" can result in the slower "cat" response returning after "dog", displaying wrong results.',
        hint: 'Network latency varies. Responses may arrive out of order.',
        solution: 'Use AbortController inside useEffect to cancel in-flight requests when the query changes.',
      },
    },
  ];

  const toggleBreakIt = (id: string) => {
    setBreakItActive((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReveal = (id: string) => {
    setRevealedSolution((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '960px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      className="tutorials-page"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Tutorial Projects & "Break It" Mode
          </h1>
        </div>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
          Guided step-by-step projects teaching real-world hook composition. Load any project directly into the visual builder, or toggle "Break It" to debug intentional mistakes.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {tutorials.map((tut) => {
          const isBroken = breakItActive[tut.id];
          const isRevealed = revealedSolution[tut.id];

          return (
            <Card key={tut.id} variant="elevated" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge variant="primary">{tut.difficulty}</Badge>
                    {tut.hooks.map((h) => (
                      <Badge key={h} variant="purple">
                        {h}
                      </Badge>
                    ))}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {tut.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Goal: {tut.goal}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    size="xs"
                    variant={isBroken ? 'danger' : 'outline'}
                    icon={<AlertTriangle size={12} />}
                    onClick={() => toggleBreakIt(tut.id)}
                  >
                    {isBroken ? 'Break It: ACTIVE' : 'Break This Example'}
                  </Button>
                  <Button
                    size="xs"
                    variant="primary"
                    icon={<LayoutGrid size={12} />}
                    onClick={() => onLoadInPlayground(tut.id)}
                  >
                    Load in Visual Builder
                  </Button>
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Guided Steps:
                </span>
                {tut.steps.map((step, idx) => (
                  <div key={idx} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)', minWidth: '16px' }}>{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Break It Investigation Box */}
              {isBroken && (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-danger-subtle)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    animation: 'fadeIn 200ms ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--accent-danger)' }} />
                    <strong style={{ color: 'var(--accent-danger-text)', fontSize: 'var(--text-sm)' }}>
                      Diagnose Bug: {tut.breakItBug.title}
                    </strong>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {tut.breakItBug.description}
                  </p>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <strong>Hint: </strong> {tut.breakItBug.hint}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <Button size="xs" variant="secondary" onClick={() => toggleReveal(tut.id)}>
                      {isRevealed ? 'Hide Solution' : 'Reveal Solution'}
                    </Button>
                  </div>

                  {isRevealed && (
                    <div
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-primary)',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>Solution Explanation: </strong> {tut.breakItBug.solution}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
