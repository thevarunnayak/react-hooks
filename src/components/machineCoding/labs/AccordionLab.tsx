import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/SearchInput';
import { CustomSelect } from '../../ui/CustomSelect';
import { ChevronDown, ChevronsUpDown, CheckCircle, HelpCircle, Layers, Sparkles } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'React 19' | 'Performance' | 'Architecture' | 'State';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'React 19',
    question: 'How does React 19 Action State differ from standard useState?',
    answer:
      'useActionState automatically handles pending transitions, optimistic mutations, and form submission errors without manual isSubmitting or error state juggling. It integrates directly with server actions and HTML forms.',
  },
  {
    id: 'faq-2',
    category: 'Performance',
    question: 'Why is CSS Grid 0fr to 1fr preferred over max-height for accordion animation?',
    answer:
      'Using max-height requires estimating an arbitrary maximum (e.g. 500px), causing duration discrepancies and abrupt timing curves. CSS grid-template-rows: 0fr -> 1fr calculates the exact natural scrollHeight natively on the compositor thread without JavaScript layout thrashing.',
  },
  {
    id: 'faq-3',
    category: 'Architecture',
    question: 'What accessibility attributes are strictly mandatory for WAI-ARIA accordions?',
    answer:
      'The toggle button requires aria-expanded="true|false" and aria-controls="panel-id". The content section requires id="panel-id", role="region", and aria-labelledby="button-id" so screen reader users understand relationships.',
  },
  {
    id: 'faq-4',
    category: 'State',
    question: 'How should we store state for Single-expand vs Multi-expand accordions?',
    answer:
      'Single-expand stores a primitive string | null representing the solitary open panel ID. Multi-expand stores a Set<string> allowing constant-time O(1) addition, deletion, and membership lookups without array filtering overhead.',
  },
  {
    id: 'faq-5',
    category: 'React 19',
    question: 'What is the purpose of the new useOptimistic hook in interactive lists?',
    answer:
      'useOptimistic allows components to instantly display speculative state (such as an added task or upvoted poll) while an async network mutation is in-flight, automatically rolling back if the server rejects the action.',
  },
  {
    id: 'faq-6',
    category: 'Architecture',
    question: 'How do compound components improve accordion reusability?',
    answer:
      'By breaking the UI into Accordion, AccordionItem, AccordionTrigger, and AccordionContent sharing a React Context, consumers can inject arbitrary icons, badges, or layouts between triggers and content panels declaratively.',
  },
];

export const AccordionLab: React.FC = () => {
  const [expandMode, setExpandMode] = useState<'single' | 'multi'>('multi');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['faq-1']));
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredItems = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (expandMode === 'single') {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setOpenIds(new Set(filteredItems.map((f) => f.id)));
  };

  const handleCollapseAll = () => {
    setOpenIds(new Set());
  };

  const handleModeChange = (val: string) => {
    const newMode = val as 'single' | 'multi';
    setExpandMode(newMode);
    if (newMode === 'single' && openIds.size > 1) {
      // Keep only the first open item
      const first = Array.from(openIds)[0];
      setOpenIds(first ? new Set([first]) : new Set());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 720, margin: '0 auto' }}>
      {/* Controls Bar */}
      <Card
        variant="glass"
        padding="sm"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Expand Mode:
          </span>
          <CustomSelect
            value={expandMode}
            onChange={handleModeChange}
            options={[
              { value: 'multi', label: 'Multi-Expand (Independent)' },
              { value: 'single', label: 'Single-Expand (Auto-Collapse)' },
            ]}
            style={{ width: 'clamp(180px, 50vw, 240px)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {expandMode === 'multi' && (
            <>
              <Button size="xs" variant="secondary" onClick={handleExpandAll}>
                Expand All
              </Button>
              <Button size="xs" variant="ghost" onClick={handleCollapseAll}>
                Collapse All
              </Button>
            </>
          )}
          <Badge variant="cyan" size="sm">
            {openIds.size} Open
          </Badge>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search FAQs by question or answer..."
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', 'React 19', 'Performance', 'Architecture', 'State'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 11px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${selectedCategory === cat ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                backgroundColor: selectedCategory === cat ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Panels List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredItems.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No FAQ questions match your search filter.
          </Card>
        ) : (
          filteredItems.map((item) => {
            const isOpen = openIds.has(item.id);

            return (
              <div
                key={item.id}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  backgroundColor: 'var(--bg-surface)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isOpen ? '0 4px 16px rgba(0, 0, 0, 0.2)' : 'none',
                }}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${item.id}`}
                  id={`faq-header-${item.id}`}
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 3vw, 16px) clamp(12px, 3vw, 20px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 0 }}>
                    <Badge variant={isOpen ? 'primary' : 'default'} size="sm">
                      {item.category}
                    </Badge>
                    <span style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.4 }}>
                      {item.question}
                    </span>
                  </div>

                  <div
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Animated Height Container (CSS Grid 0fr -> 1fr) */}
                <div
                  id={`faq-content-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-header-${item.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        padding: '0 20px 18px 20px',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid var(--border-subtle)',
                        marginTop: 4,
                        paddingTop: 14,
                      }}
                    >
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <HelpCircle size={13} />
        <span>Try searching or toggle between Single and Multi expand modes above.</span>
      </div>
    </div>
  );
};
