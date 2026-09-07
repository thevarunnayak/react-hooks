import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  openIds?: string[];
  onToggle?: (id: string) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  allowMultiple = false,
  openIds: controlledOpenIds,
  onToggle,
}) => {
  const [internalOpenIds, setInternalOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );

  const isControlled = controlledOpenIds !== undefined;
  const activeOpenIds = isControlled ? controlledOpenIds : internalOpenIds;

  const toggle = (id: string) => {
    if (onToggle) {
      onToggle(id);
    }
    if (!isControlled) {
      if (allowMultiple) {
        setInternalOpenIds((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
      } else {
        setInternalOpenIds((prev) => (prev.includes(id) ? [] : [id]));
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {items.map((item) => {
        const isOpen = activeOpenIds.includes(item.id);
        return (
          <div
            key={item.id}
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: isOpen ? 'var(--bg-surface)' : 'var(--bg-subtle)',
              transition: 'all var(--transition-fast)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => toggle(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  {item.title}
                </span>
                {item.badge}
              </div>
              <ChevronDown
                size={16}
                style={{
                  color: 'var(--text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--transition-fast)',
                }}
              />
            </button>
            {isOpen && (
              <div
                style={{
                  padding: 'var(--space-2) var(--space-4) var(--space-4) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--border-subtle)',
                  animation: 'fadeIn var(--transition-fast) ease-out',
                }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
