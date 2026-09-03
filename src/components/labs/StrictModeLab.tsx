import React, { useState } from 'react';
import { Bug, CheckCircle2, AlertTriangle, ShieldCheck, Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const StrictModeLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dev' | 'prod'>('dev');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="purple">React Internals Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              React Strict Mode: Why Does My Effect Run Twice?
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            In development, React intentionally mounts, unmounts, and remounts your component once to verify that
            your effect cleanups properly reset state and prevent memory leaks.
          </p>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          size="sm"
          variant={activeTab === 'dev' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('dev')}
        >
          Development (Strict Mode Active)
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'prod' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('prod')}
        >
          Production (Single Mount)
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Sequence Flow */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            Mount Sequence in {activeTab === 'dev' ? 'Development' : 'Production'}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeTab === 'dev' ? (
              <>
                <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>
                  1. Component Function Renders (Render #1)
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>
                  2. Component Function Renders Again (Dev check for pure render)
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--accent-primary-subtle)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                  3. Effect Runs (Mount)
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--accent-danger-subtle)', border: '1px solid var(--accent-danger)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                  4. Effect Cleanup Runs (Simulated Unmount)
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--accent-success-subtle)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                  5. Effect Runs Again (Remount)
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' }}>
                  1. Component Function Renders (Single invocation)
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--accent-primary-subtle)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                  2. Effect Runs (Mount)
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Lesson takeaway */}
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-success)' }} />
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>The Golden Rule</span>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Never disable Strict Mode to silence double-invocations. If your component breaks when mounted twice,
            it has a bug that will cause memory leaks when:
          </p>
          <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc', paddingLeft: '16px' }}>
            <li>User navigates away before a fetch completes.</li>
            <li>React unmounts and remounts with Fast Refresh during code editing.</li>
            <li>React 19 off-screen / Suspense renders preserve tab state.</li>
          </ul>

          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--accent-primary-text)',
            }}
          >
            {`// Always implement symmetric cleanup:\nuseEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id); // symmetric!\n}, []);`}
          </div>
        </Card>
      </div>
    </div>
  );
};
