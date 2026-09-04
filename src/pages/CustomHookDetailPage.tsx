import React, { useState, useEffect } from 'react';
import { CustomHookItem } from '../types/customHook';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  Code2,
  Layers,
  Lightbulb,
  TestTube,
  Bookmark,
} from 'lucide-react';
import { CustomHookInteractiveLab } from '../components/labs/custom-hooks/CustomHookInteractiveLab';
import { PersonalNotesSection } from '../components/notes/PersonalNotesSection';

export interface CustomHookDetailPageProps {
  hook: CustomHookItem;
  onBack: () => void;
  onOpenInPlayground?: (hookId: string) => void;
}

export const CustomHookDetailPage: React.FC<CustomHookDetailPageProps> = ({
  hook,
  onBack,
  onOpenInPlayground,
}) => {
  const [copied, setCopied] = useState(false);
  const [testCopied, setTestCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('react_hooks_custom_bookmarks') || '[]');
      return bookmarks.includes(hook.id);
    } catch {
      return false;
    }
  });

  // Sync bookmarks from localStorage
  useEffect(() => {
    const syncBookmark = () => {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('react_hooks_custom_bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(hook.id));
      } catch {
        setIsBookmarked(false);
      }
    };
    syncBookmark();
    window.addEventListener('local-storage', syncBookmark);
    return () => window.removeEventListener('local-storage', syncBookmark);
  }, [hook.id]);

  const toggleBookmark = () => {
    try {
      const bookmarks: string[] = JSON.parse(localStorage.getItem('react_hooks_custom_bookmarks') || '[]');
      let updated: string[];
      if (bookmarks.includes(hook.id)) {
        updated = bookmarks.filter((id) => id !== hook.id);
        setIsBookmarked(false);
      } else {
        updated = [...bookmarks, hook.id];
        setIsBookmarked(true);
      }
      localStorage.setItem('react_hooks_custom_bookmarks', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(hook.implementation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate an idiomatic Vitest / RTL unit test example
  const unitTestSnippet = hook.unitTestExample || `import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ${hook.name} } from './${hook.name}';

describe('${hook.name}', () => {
  it('should initialize and execute state changes predictably', () => {
    const { result } = renderHook(() => ${hook.name}(${hook.parameters[0]?.name ? '/* initial args */' : ''}));
    
    // Initial verification
    expect(result.current).toBeDefined();

    // Verify interaction
    act(() => {
      // Execute hook return function
    });
  });
});`;

  // Detect which primitive hooks are composed inside this custom hook
  const primitiveHooks = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer', 'useLayoutEffect'].filter(
    (h) => hook.implementation.includes(h)
  );

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
      className="custom-hook-detail-page"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Custom Hooks Catalog</span>
      </button>

      {/* Header & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Badge variant="purple">{hook.category}</Badge>
            <Badge variant="default">TypeScript First</Badge>
            <Badge variant="cyan">{primitiveHooks.length} Primitives Combined</Badge>
          </div>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {hook.name}()
          </h1>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
            {hook.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant={isBookmarked ? 'primary' : 'outline'}
            icon={<Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />}
            onClick={toggleBookmark}
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>

          {onOpenInPlayground && (
            <Button
              size="sm"
              variant="outline"
              icon={<Layers size={14} />}
              onClick={() => onOpenInPlayground(hook.id)}
            >
              Open in Builder
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            icon={copied ? <Check size={14} /> : <Copy size={14} />}
            onClick={handleCopy}
          >
            {copied ? 'Copied Implementation' : 'Copy Hook Code'}
          </Button>
        </div>
      </div>

      {/* 1. Problem & Solution Context */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <Card variant="glass" padding="md">
          <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-danger-text)', marginBottom: '6px' }}>
            The Concrete Problem
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {hook.problem}
          </p>
        </Card>

        <Card variant="glass" padding="md">
          <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-success-text)', marginBottom: '6px' }}>
            The Encapsulated Solution
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {hook.solution}
          </p>
        </Card>
      </div>

      {/* 2. Interactive Demonstration Lab (CENTERPIECE OF THE LESSON) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Interactive Sandbox Experiment
          </h2>
        </div>
        <CustomHookInteractiveLab hookId={hook.id} />
      </section>

      {/* 3. Primitive Hooks Composition Pipeline */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} style={{ color: 'var(--accent-purple)' }} />
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            Composition Architecture: How It Works Internally
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {primitiveHooks.map((h) => (
            <Badge key={h} variant="primary">
              {h}()
            </Badge>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This custom hook achieves encapsulation by composing standard React primitives. State changes inside the hook trigger re-renders only in the consumer component, keeping side-effects and cleanup lifecycles isolated.
          </div>
        </div>
      </Card>

      {/* 4. API Specification */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            API Specification (Parameters & Returns)
          </h3>
        </div>

        {hook.parameters.length > 0 && (
          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>PARAMETERS:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {hook.parameters.map((p, idx) => (
                <div key={idx} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <code style={{ color: 'var(--accent-primary-text)', fontWeight: 700 }}>{p.name}</code>: <code>{p.type}</code> — {p.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {hook.returns.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>RETURN TUPLE / OBJECT:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {hook.returns.map((r, idx) => (
                <div key={idx} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <code style={{ color: 'var(--accent-purple-text)', fontWeight: 700 }}>{r.name}</code>: <code>{r.type}</code> — {r.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 5. Full TypeScript Implementation */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Production TypeScript Implementation
          </span>
          <Button size="xs" variant="ghost" icon={copied ? <Check size={12} /> : <Copy size={12} />} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <pre
          style={{
            padding: '14px',
            backgroundColor: 'var(--bg-code)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.6,
            overflowX: 'auto',
            color: 'var(--text-primary)',
          }}
        >
          <code>{hook.implementation}</code>
        </pre>
      </Card>

      {/* 6. Real-World Consumer Usage Example */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Consumer Component Usage Example
        </span>
        <pre
          style={{
            padding: '14px',
            backgroundColor: 'var(--bg-code)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.6,
            overflowX: 'auto',
            color: 'var(--text-primary)',
          }}
        >
          <code>{hook.demoCode}</code>
        </pre>
      </Card>

      {/* 7. Common Pitfalls & Anti-Patterns */}
      {hook.pitfalls.length > 0 && (
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--accent-warning)' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Common Implementation Pitfalls & Gotchas
            </span>
          </div>
          <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc' }}>
            {hook.pitfalls.map((p, idx) => (
              <li key={idx} style={{ lineHeight: 1.5 }}>{p}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* 8. Unit Testing Suite (Vitest / React Testing Library) */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TestTube size={16} style={{ color: 'var(--accent-success)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              Unit Test Suite (renderHook + Vitest)
            </span>
          </div>
          <Button
            size="xs"
            variant="ghost"
            icon={testCopied ? <Check size={12} /> : <Copy size={12} />}
            onClick={() => {
              navigator.clipboard.writeText(unitTestSnippet);
              setTestCopied(true);
              setTimeout(() => setTestCopied(false), 2000);
            }}
          >
            {testCopied ? 'Copied Test' : 'Copy Test'}
          </Button>
        </div>

        <pre
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-code)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.5,
            overflowX: 'auto',
            color: 'var(--text-primary)',
          }}
        >
          <code>{unitTestSnippet}</code>
        </pre>
      </Card>

      {/* 9. Personal Notes (Stored in unified Notes Table with ID) */}
      <PersonalNotesSection targetId={hook.id} targetName={`${hook.name}()`} />

      {/* 10. Key Takeaway */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--accent-primary-subtle)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Lightbulb size={22} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          <strong>Key Takeaway: </strong> Custom hooks are not a React feature—they are a natural design pattern born from the Rules of Hooks. By isolating stateful logic into functions that start with <code>use</code>, you achieve 100% logic reusability with zero component tree pollution.
        </div>
      </div>
    </div>
  );
};
