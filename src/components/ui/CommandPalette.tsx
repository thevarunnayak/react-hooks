import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Layers, Sparkles, CheckCircle2, HelpCircle, Boxes, Award } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { HOOKS_CATALOG } from '../../data/hooks';
import { CUSTOM_HOOKS_CATALOG } from '../../data/custom-hooks/catalog';
import { CHALLENGES_LIST } from '../../data/challenges';
import { INTERVIEW_QUESTIONS_LIST } from '../../data/interviews';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, param?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  useClickOutside(paletteRef, onClose);
  useKeyboardShortcut('Escape', onClose);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build searchable index
  interface PaletteItem {
    type: string;
    title: string;
    route: string;
    param?: string;
    icon: React.ReactNode;
  }

  const items: PaletteItem[] = [
    // Pages
    { type: 'page', title: 'Interactive Visual Component Builder', route: 'playground', icon: <Layers size={14} /> },
    { type: 'page', title: 'Visual React Hooks Map', route: 'hook-map', icon: <BookOpen size={14} /> },
    { type: 'page', title: 'Custom Hooks Library', route: 'custom-hooks', icon: <Sparkles size={14} /> },
    { type: 'page', title: 'Real-Time Architectures', route: 'examples', icon: <Boxes size={14} /> },
    { type: 'page', title: 'Interactive Challenges', route: 'challenges', icon: <CheckCircle2 size={14} /> },
    { type: 'page', title: 'Interview Preparation', route: 'interview', icon: <HelpCircle size={14} /> },

    // React Hooks
    ...HOOKS_CATALOG.map((h) => ({
      type: 'hook',
      title: `${h.name} — ${h.tagline}`,
      route: 'hook',
      param: h.id,
      icon: <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />,
    })),

    // Custom Hooks
    ...CUSTOM_HOOKS_CATALOG.map((c) => ({
      type: 'custom_hook',
      title: `${c.name} — ${c.description}`,
      route: 'custom-hook-detail',
      param: c.id,
      icon: <Sparkles size={14} style={{ color: 'var(--accent-purple)' }} />,
    })),

    // Challenges
    ...CHALLENGES_LIST.map((ch) => ({
      type: 'challenge',
      title: `Challenge: ${ch.title} (${ch.category})`,
      route: 'challenges',
      param: ch.id,
      icon: <CheckCircle2 size={14} style={{ color: 'var(--accent-success)' }} />,
    })),

    // Senior Interview Questions
    ...INTERVIEW_QUESTIONS_LIST.map((q) => ({
      type: 'interview',
      title: `Interview: ${q.question}`,
      route: 'interview',
      param: q.id,
      icon: <Award size={14} style={{ color: 'var(--accent-purple)' }} />,
    })),
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const handleSelect = (item: typeof items[0]) => {
    onNavigate(item.route, item.param);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        ref={paletteRef}
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn var(--transition-fast) ease-out',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search all React hooks, custom hooks, labs, challenges..."
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              width: '100%',
              outline: 'none',
            }}
          />
          <kbd
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '2px 5px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No results found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {item.type.replace('_', ' ')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
