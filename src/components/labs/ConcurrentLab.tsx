import React, { useState, useTransition, useDeferredValue } from 'react';
import { Gauge, Zap, Flame, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ConcurrentLab: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [listQuery, setListQuery] = useState('');
  const [useTransitionMode, setUseTransitionMode] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val); // Urgent update (User typing)

    if (useTransitionMode) {
      startTransition(() => {
        setListQuery(val); // Non-urgent update (Concurrent)
      });
    } else {
      setListQuery(val); // Blocking update (Synchronous)
    }
  };

  // Generate 2000 filtered items with deliberate CPU work per item
  const items = Array.from({ length: 1500 }, (_, i) => `Item #${i + 1} - ${listQuery || 'React Hooks'}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="cyan">Concurrent React Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              useTransition & Non-Urgent Updates
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Compare synchronous rendering with concurrent transitions. Type rapidly in the input below to feel
            how <code>useTransition</code> keeps typing responsive while non-urgent list filtering renders in the background.
          </p>
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant={useTransitionMode ? 'primary' : 'outline'}
            onClick={() => setUseTransitionMode(true)}
          >
            useTransition: ENABLED (Smooth Typing)
          </Button>
          <Button
            size="sm"
            variant={!useTransitionMode ? 'danger' : 'outline'}
            onClick={() => setUseTransitionMode(false)}
          >
            Synchronous (Blocking UI)
          </Button>
        </div>

        {isPending && (
          <Badge variant="warning" size="md">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} />
              <span>Transition Pending (Rendering {items.length} items)...</span>
            </span>
          </Badge>
        )}
      </div>

      {/* Interactive Input */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
          TYPE RAPIDLY HERE TO TEST INPUT LATENCY:
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type letters quickly (e.g. 'abcdefg')..."
          style={{
            padding: '10px 14px',
            fontSize: 'var(--text-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
          }}
        />
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Urgent text: <strong>"{inputValue}"</strong> | Filtered query: <strong>"{listQuery}"</strong>
        </div>
      </Card>

      {/* Rendered Heavy List */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
            HEAVY LIST ({items.length} ITEMS)
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: isPending ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
            {isPending ? 'Updating in background...' : 'Up to date'}
          </span>
        </div>

        <div
          style={{
            maxHeight: '180px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '6px',
            opacity: isPending ? 0.6 : 1,
            transition: 'opacity var(--transition-fast)',
          }}
        >
          {items.slice(0, 30).map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 8px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                fontSize: 'var(--text-xs)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Showing preview of 30 out of {items.length} items
        </div>
      </Card>
    </div>
  );
};
