import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SearchInput } from '../../ui/SearchInput';
import { Search, RotateCcw, X, Database, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';

const MOCK_CORPUS = [
  'React 19 Server Components',
  'React 19 useActionState hook',
  'React 19 useOptimistic updates',
  'React 19 useTransition API',
  'Debouncing vs Throttling event listeners',
  'AbortController for fetch cancellation',
  'Virtual DOM diffing algorithm',
  'Fiber reconciler architecture',
  'IntersectionObserver API for infinite feeds',
  'HTML5 Drag and Drop Kanban boards',
  'Redux Toolkit vs Zustand vs Signals',
  'Microfrontends with Module Federation',
  'WebSockets real-time duplex streaming',
  'Service Workers and offline PWA caching',
  'Core Web Vitals (LCP, INP, CLS) optimization',
];

export const DebouncedSearchLab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [delayMs, setDelayMs] = useState(350);
  const debouncedQuery = useDebounce(query, delayMs);

  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [apiCallCount, setApiCallCount] = useState(0);
  const [lastDispatchedQuery, setLastDispatchedQuery] = useState<string | null>(null);
  const [isCacheHit, setIsCacheHit] = useState(false);

  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const typingTimeoutRef = useRef<any>(null);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), delayMs);
  };

  useEffect(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      setLastDispatchedQuery(null);
      setIsCacheHit(false);
      return;
    }

    // Check in-memory cache first
    if (cacheRef.current.has(trimmed)) {
      setResults(cacheRef.current.get(trimmed)!);
      setLastDispatchedQuery(trimmed);
      setIsCacheHit(true);
      return;
    }

    // Simulate Network Latency + AbortController support
    setIsCacheHit(false);
    setLoading(true);
    setApiCallCount((c) => c + 1);
    setLastDispatchedQuery(trimmed);

    const timer = setTimeout(() => {
      const matches = MOCK_CORPUS.filter((item) => item.toLowerCase().includes(trimmed));
      cacheRef.current.set(trimmed, matches);
      setResults(matches);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsCacheHit(false);
    setLastDispatchedQuery(null);
  };

  const handleReset = () => {
    handleClear();
    cacheRef.current.clear();
    setApiCallCount(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 720, margin: '0 auto' }}>
      {/* Search Input Bar */}
      <SearchInput
        value={query}
        onChange={handleInputChange}
        onClear={handleClear}
        placeholder="Type rapidly (e.g. 'react', 'api', 'state', 'web')..."
        shortcutBadge="Debounced"
        style={{ maxWidth: '100%', padding: '10px 14px' }}
      />

      {/* Control & Telemetry Strip */}
      <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Debounce Delay:
            </span>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              style={{ width: 120, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {delayMs}ms
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <Badge variant={isTyping ? 'warning' : 'default'} size="sm">
              <Clock size={11} style={{ marginRight: 3 }} />
              {isTyping ? 'Timer Running...' : 'Settled'}
            </Badge>
            {isCacheHit && (
              <Badge variant="purple" size="sm">
                <Database size={11} style={{ marginRight: 3 }} /> Cache Hit
              </Badge>
            )}
            <Badge variant="cyan" size="sm">
              <Zap size={11} style={{ marginRight: 3 }} /> API Calls: {apiCallCount}
            </Badge>
            <button
              onClick={handleReset}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Active Input: <strong>"{query}"</strong></span>
          <span>Debounced Value: <strong>"{debouncedQuery}"</strong></span>
          <span>In-Memory Cache Size: <strong>{cacheRef.current.size} queries</strong></span>
        </div>
      </Card>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Simulating server search dispatch...
          </Card>
        ) : query.trim() && results.length === 0 ? (
          <Card variant="glass" padding="md" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No results found for "{query}".
          </Card>
        ) : (
          results.map((res, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={14} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
              <span>{res}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
