import React, { useState, createContext, useContext } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

// Sample Theme Context
interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeColor: '#3b82f6',
  setThemeColor: () => {},
});

// Child A: Direct Consumer
const ConsumerChildA: React.FC<{ renderCount: number }> = ({ renderCount }) => {
  const { themeColor } = useContext(ThemeContext);

  return (
    <div
      style={{
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>&lt;ChildA (Consumer) /&gt;</span>
        <Badge variant="primary" size="sm">
          Renders: {renderCount}
        </Badge>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
        Directly reads <code>useContext(ThemeContext)</code>. Color:{' '}
        <span style={{ color: themeColor, fontWeight: 700 }}>{themeColor}</span>
      </div>
    </div>
  );
};

// Child B: Non-Consumer
const NonConsumerChildB: React.FC<{ renderCount: number; isMemo: boolean }> = ({
  renderCount,
  isMemo,
}) => {
  return (
    <div
      style={{
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-surface)',
        border: isMemo ? '1px solid var(--accent-success)' : '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>&lt;ChildB (Non-Consumer) /&gt;</span>
        <Badge variant={isMemo ? 'success' : 'warning'} size="sm">
          Renders: {renderCount}
        </Badge>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
        Does NOT consume context! {isMemo ? 'Protected by React.memo.' : 'Re-renders because Parent re-rendered!'}
      </div>
    </div>
  );
};

export const UseContextLab: React.FC = () => {
  const [themeColor, setThemeColor] = useState('#3b82f6');
  const [memoizeChildB, setMemoizeChildB] = useState(true);
  const [parentRenderCount, setParentRenderCount] = useState(1);
  const [childARenderCount, setChildARenderCount] = useState(1);
  const [childBRenderCount, setChildBRenderCount] = useState(1);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

  const changeColor = (color: string) => {
    setThemeColor(color);
    setParentRenderCount((c) => c + 1);
    setChildARenderCount((c) => c + 1);
    if (!memoizeChildB) {
      setChildBRenderCount((c) => c + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="primary">Component Tree Lab</Badge>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>
              useContext Propagation & Re-render Waves
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            When a context provider value changes, all consumers re-render. But non-consumers in the subtree also
            re-render by default unless isolated with <code>React.memo</code> or composition!
          </p>
        </div>
      </Card>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Change Provider Value:</span>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => changeColor(c)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: c,
                border: themeColor === c ? '2px solid #ffffff' : 'none',
                boxShadow: themeColor === c ? '0 0 8px rgba(0,0,0,0.5)' : 'none',
                cursor: 'pointer',
              }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>

        <Button
          size="xs"
          variant={memoizeChildB ? 'primary' : 'outline'}
          onClick={() => setMemoizeChildB(!memoizeChildB)}
        >
          {memoizeChildB ? 'ChildB React.memo: ON' : 'ChildB React.memo: OFF'}
        </Button>
      </div>

      {/* Visual Component Tree */}
      <Card variant="elevated" padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                &lt;ThemeProvider value=&#123;{themeColor}&#125; /&gt;
              </span>
              <Badge variant="cyan">Provider Root</Badge>
            </div>
          </div>

          <div style={{ paddingLeft: '24px', borderLeft: '2px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>&lt;ParentComponent /&gt;</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Renders: {parentRenderCount}
                </span>
              </div>
            </div>

            <div style={{ paddingLeft: '24px', borderLeft: '2px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
                <ConsumerChildA renderCount={childARenderCount} />
                <NonConsumerChildB renderCount={childBRenderCount} isMemo={memoizeChildB} />
              </ThemeContext.Provider>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
