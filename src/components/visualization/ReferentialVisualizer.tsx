import React, { useState } from 'react';
import { Layers, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface ReferentialVisualizerProps {
  title?: string;
}

export const ReferentialVisualizer: React.FC<ReferentialVisualizerProps> = ({
  title = 'Referential Equality & Memory Identity Visualizer',
}) => {
  const [renderCount, setRenderCount] = useState(1);
  const [useMemoEnabled, setUseMemoEnabled] = useState(false);

  // Generate simulated heap memory pointers
  const unstableRef = `0x${((renderCount * 1337) % 65535).toString(16).toUpperCase().padStart(4, '0')}`;
  const stableRef = `0xCAFE`;

  const currentRef = useMemoEnabled ? stableRef : unstableRef;
  const prevRef = useMemoEnabled ? stableRef : `0x${(((renderCount - 1) * 1337) % 65535).toString(16).toUpperCase().padStart(4, '0')}`;
  const isReferenceSame = renderCount === 1 || prevRef === currentRef;

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
          <Layers size={18} style={{ color: 'var(--accent-purple)' }} />
          <h4 style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
            {title}
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="xs"
            variant={useMemoEnabled ? 'primary' : 'outline'}
            onClick={() => setUseMemoEnabled(!useMemoEnabled)}
          >
            {useMemoEnabled ? 'useMemo: ON (Stable)' : 'useMemo: OFF (Inline Object)'}
          </Button>
          <Button
            size="xs"
            variant="secondary"
            icon={<RefreshCw size={12} />}
            onClick={() => setRenderCount((c) => c + 1)}
          >
            Trigger Rerender #{renderCount + 1}
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Previous Render Box */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              PREVIOUS RENDER #{Math.max(1, renderCount - 1)}
            </span>
            <Badge variant="default" size="sm">
              Address: {renderCount === 1 ? currentRef : prevRef}
            </Badge>
          </div>
          <pre
            style={{
              padding: '8px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            {`const options = {\n  filter: 'active',\n  limit: 10\n};`}
          </pre>
        </div>

        {/* Current Render Box */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            border: isReferenceSame ? '1px solid var(--accent-success)' : '1px solid var(--accent-warning)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              CURRENT RENDER #{renderCount}
            </span>
            <Badge variant={isReferenceSame ? 'success' : 'warning'} size="sm">
              Address: {currentRef}
            </Badge>
          </div>
          <pre
            style={{
              padding: '8px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            {useMemoEnabled
              ? `const options = useMemo(() => ({\n  filter: 'active',\n  limit: 10\n}), []);`
              : `const options = {\n  filter: 'active',\n  limit: 10\n};`}
          </pre>
        </div>
      </div>

      {/* Equality Result */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isReferenceSame ? 'var(--accent-success-subtle)' : 'var(--accent-warning-subtle)',
          border: isReferenceSame
            ? '1px solid rgba(16, 185, 129, 0.3)'
            : '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {isReferenceSame ? (
          <CheckCircle2 size={20} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
        ) : (
          <AlertCircle size={20} style={{ color: 'var(--accent-warning)', flexShrink: 0 }} />
        )}
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          <strong>Object.is(prev, next): {isReferenceSame ? 'TRUE (Identical Pointer)' : 'FALSE (New Heap Allocation)'}</strong>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {isReferenceSame
              ? 'Stable memory reference maintained. React.memo children will NOT re-render; useEffect dependencies will NOT re-trigger.'
              : 'Even though keys and values are identical, JavaScript creates a brand-new object in memory every render. React sees a changed dependency!'}
          </p>
        </div>
      </div>
    </div>
  );
};
