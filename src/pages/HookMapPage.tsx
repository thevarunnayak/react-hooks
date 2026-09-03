import React from 'react';
import { HOOKS_CATALOG } from '../data/hooks';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ArrowRight, Map, Network, Sparkles } from 'lucide-react';

export interface HookMapPageProps {
  onNavigateHook: (hookId: string) => void;
}

export const HookMapPage: React.FC<HookMapPageProps> = ({ onNavigateHook }) => {
  const categories = [
    { name: 'State Management', category: 'State', desc: 'Hold and transition component state between renders' },
    { name: 'Effects & Lifecycle', category: 'Effects', desc: 'Synchronize with external systems after browser paints' },
    { name: 'References & DOM', category: 'References', desc: 'Hold mutable identity and directly interact with DOM nodes' },
    { name: 'Performance Optimization', category: 'Performance', desc: 'Cache expensive computations and stabilize callback identities' },
    { name: 'Context & Dependency Injection', category: 'Context', desc: 'Broadcast data across component subtrees without prop drilling' },
    { name: 'Concurrent React', category: 'Concurrent', desc: 'Interruptible background transitions and time-slicing' },
    { name: 'Modern & React 19', category: 'Modern', desc: 'Form actions, optimistic UI, and universal SSR IDs' },
  ];

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      className="hook-map-page"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Map size={20} style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Interactive React Hooks Taxonomy Map
          </h1>
        </div>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
          Explore the official React Hooks landscape grouped by architectural responsibility. Click any hook node to jump into its full 20-part lesson and interactive lab.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {categories.map((cat) => {
          const hooksInCat = HOOKS_CATALOG.filter(
            (h) => h.category === cat.category || (cat.category === 'References' && h.category === 'DOM / Ref')
          );

          if (hooksInCat.length === 0) return null;

          return (
            <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  — {cat.desc}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                {hooksInCat.map((hook) => (
                  <Card
                    key={hook.id}
                    variant="glass"
                    padding="md"
                    interactive
                    onClick={() => onNavigateHook(hook.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: 'var(--text-sm)',
                            color: 'var(--accent-primary-text)',
                          }}
                        >
                          {hook.name}()
                        </span>
                        <Badge variant="purple" size="sm">
                          {hook.difficulty}
                        </Badge>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {hook.tagline}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>React {hook.reactVersion}</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-primary-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        Lesson & Lab <ArrowRight size={11} />
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
