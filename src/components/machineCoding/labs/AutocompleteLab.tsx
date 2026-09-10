import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, X, Sparkles, Check } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

const SUGGESTIONS = [
  'JavaScript (ES2026)',
  'TypeScript Advanced Generics',
  'React 19 Server Actions',
  'React Server Components',
  'Redux Toolkit Query',
  'Zustand State Management',
  'Next.js App Router Architecture',
  'GraphQL Relay Specifications',
  'Tailwind CSS v4 Engine',
  'Vite 8 Rolldown Bundler',
  'WebAssembly Audio DSP',
  'Web Workers Multithreading',
  'CSS Container Queries',
  'Node.js Event Loop Internals',
  'IndexedDB Dexie Wrapper',
];

export const AutocompleteLab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const filtered = query.trim()
    ? SUGGESTIONS.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS.slice(0, 6);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelect = (item: string) => {
    setQuery(item);
    setSelectedItem(item);
    setIsOpen(false);
  };

  // Highlight matched substrings
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary-subtle)', borderRadius: 2, padding: '0 2px' }}>
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* Keyboard Shortcuts Guide */}
      <div style={{ display: 'flex', gap: 12, fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <kbd style={{ padding: '2px 5px', background: 'var(--bg-subtle)', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>↓</kbd> / <kbd style={{ padding: '2px 5px', background: 'var(--bg-subtle)', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>↑</kbd> Navigate
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <kbd style={{ padding: '2px 5px', background: 'var(--bg-subtle)', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>↵ Enter</kbd> Select
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <kbd style={{ padding: '2px 5px', background: 'var(--bg-subtle)', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>Esc</kbd> Dismiss
        </span>
      </div>

      {/* Autocomplete Input Container */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search frontend technologies (try typing 'react', 'web', 'script')..."
            style={{
              width: '100%',
              padding: '12px 40px 12px 42px',
              borderRadius: 'var(--radius-md)',
              border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              boxShadow: isOpen ? '0 0 0 3px var(--accent-primary-subtle)' : 'none',
              outline: 'none',
              transition: 'all var(--transition-fast)',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSelectedItem(null); inputRef.current?.focus(); }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions List */}
        {isOpen && (
          <ul
            ref={listRef}
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              maxHeight: 240,
              overflowY: 'auto',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 50,
              margin: 0,
              padding: '6px 0',
              listStyle: 'none',
            }}
          >
            {filtered.length === 0 ? (
              <li style={{ padding: '10px 16px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                No matching technologies found.
              </li>
            ) : (
              filtered.map((item, idx) => {
                const isHighlighted = idx === highlightedIndex;
                const isSelected = selectedItem === item;

                return (
                  <li
                    key={item}
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-sm)',
                      backgroundColor: isHighlighted ? 'var(--accent-primary-subtle)' : 'transparent',
                      color: isHighlighted ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{renderHighlightedText(item, query)}</span>
                    {isSelected && <Check size={14} style={{ color: 'var(--accent-success)' }} />}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {/* Selection Confirmation Card */}
      {selectedItem && (
        <Card variant="glass" padding="md" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Selected Option</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedItem}</div>
          </div>
        </Card>
      )}
    </div>
  );
};
