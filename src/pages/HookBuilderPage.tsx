import React, { useState } from 'react';
import { Wand2, Code2, Copy, Check, Sparkles, Terminal } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const HookBuilderPage: React.FC = () => {
  const [hookName, setHookName] = useState('useCustomFeature');
  const [selectedHooks, setSelectedHooks] = useState<string[]>(['useState', 'useEffect']);
  const [selectedApis, setSelectedApis] = useState<string[]>(['eventListener']);
  const [copied, setCopied] = useState(false);

  const availableHooks = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer'];
  const availableApis = ['eventListener', 'localStorage', 'matchMedia', 'intersectionObserver', 'resizeObserver'];

  const toggleHook = (h: string) => {
    setSelectedHooks((prev) => (prev.includes(h) ? prev.filter((i) => i !== h) : [...prev, h]));
  };

  const toggleApi = (a: string) => {
    setSelectedApis((prev) => (prev.includes(a) ? prev.filter((i) => i !== a) : [...prev, a]));
  };

  // Generate boilerplate code
  const generatedStarter = `import { ${selectedHooks.join(', ')} } from 'react';

/**
 * ${hookName}
 * Custom hook integrating: ${selectedHooks.join(', ')}${selectedApis.length > 0 ? ` with ${selectedApis.join(', ')}` : ''}
 */
export function ${hookName}<T>(initialValue?: T) {
${selectedHooks.includes('useState') ? '  const [state, setState] = useState<T | undefined>(initialValue);\n' : ''}${
    selectedHooks.includes('useRef') ? '  const ref = useRef<any>(null);\n' : ''
  }${
    selectedHooks.includes('useEffect')
      ? `  useEffect(() => {\n    // Setup logic${
          selectedApis.includes('eventListener') ? "\n    const handler = () => {};\n    window.addEventListener('resize', handler);\n    return () => window.removeEventListener('resize', handler);" : ''
        }\n  }, []);\n`
      : ''
  }${
    selectedHooks.includes('useCallback')
      ? '  const execute = useCallback(() => {\n    // Callback logic\n  }, []);\n'
      : ''
  }  return {
${selectedHooks.includes('useState') ? '    state,\n    setState,\n' : ''}${
    selectedHooks.includes('useCallback') ? '    execute,\n' : ''
  }  };
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedStarter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '920px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      className="hook-builder-page"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wand2 size={20} style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Custom Hook Scaffold Wizard
          </h1>
        </div>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
          Compose primitive React hooks and browser APIs to generate clean, typed starter code, testing hints, and encapsulation boundaries.
        </p>
      </div>

      {/* Configuration Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Hook Name */}
        <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Hook Name
          </label>
          <input
            type="text"
            value={hookName}
            onChange={(e) => setHookName(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Custom hooks must always start with the word <code>use</code>.
          </span>
        </Card>

        {/* Primitive Hooks Selection */}
        <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Select Underlying React Hooks
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {availableHooks.map((h) => {
              const isSelected = selectedHooks.includes(h);
              return (
                <Button
                  key={h}
                  size="xs"
                  variant={isSelected ? 'primary' : 'outline'}
                  onClick={() => toggleHook(h)}
                >
                  {h}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Browser APIs Selection */}
        <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Select Browser Subsystems
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {availableApis.map((api) => {
              const isSelected = selectedApis.includes(api);
              return (
                <Button
                  key={api}
                  size="xs"
                  variant={isSelected ? 'primary' : 'outline'}
                  onClick={() => toggleApi(api)}
                >
                  {api}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Generated Scaffold Code */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={16} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase' }}>
              Generated TypeScript Starter Boilerplate
            </span>
          </div>

          <Button size="xs" variant="primary" icon={copied ? <Check size={12} /> : <Copy size={12} />} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy Boilerplate'}
          </Button>
        </div>

        <pre
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-code)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.6,
            overflowX: 'auto',
            color: 'var(--text-primary)',
          }}
        >
          <code>{generatedStarter}</code>
        </pre>
      </Card>
    </div>
  );
};
