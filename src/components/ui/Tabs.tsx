import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'pills',
  size = 'md',
}) => {
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: variant === 'pills' ? '4px' : '16px',
        padding: variant === 'pills' ? '4px' : '0',
        backgroundColor: variant === 'pills' ? 'var(--bg-surface-elevated)' : 'transparent',
        borderRadius: variant === 'pills' ? 'var(--radius-md)' : '0',
        borderBottom: variant === 'underline' ? '1px solid var(--border-default)' : 'none',
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: size === 'sm' ? '4px 10px' : '6px 14px',
              fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor:
                variant === 'pills' && isActive ? 'var(--bg-surface)' : 'transparent',
              borderRadius: variant === 'pills' ? 'var(--radius-sm)' : '0',
              borderBottom:
                variant === 'underline' && isActive
                  ? '2px solid var(--accent-primary)'
                  : '2px solid transparent',
              boxShadow:
                variant === 'pills' && isActive ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive
                    ? 'var(--accent-primary-subtle)'
                    : 'var(--bg-subtle)',
                  color: isActive ? 'var(--accent-primary-text)' : 'var(--text-muted)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
