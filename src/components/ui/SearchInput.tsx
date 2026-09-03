import React from 'react';
import { Search, X } from 'lucide-react';
import { formatKeybinding } from '../../utils/platform';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  shortcutBadge?: string;
  style?: React.CSSProperties;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search hooks, custom hooks, tutorials...',
  onClear,
  shortcutBadge = '⌘K',
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        maxWidth: '480px',
        transition: 'border-color var(--transition-fast)',
        ...style,
      }}
    >
      <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
          width: '100%',
          outline: 'none',
        }}
      />
      {value ? (
        <button
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          style={{ color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : shortcutBadge ? (
        <kbd
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            padding: '2px 5px',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            userSelect: 'none',
          }}
        >
          {formatKeybinding(shortcutBadge)}
        </kbd>
      ) : null}
    </div>
  );
};
