import React, { useState } from 'react';
import { CUSTOM_HOOKS_CATALOG } from '../data/custom-hooks/catalog';
import { CustomHookCategory } from '../types/customHook';
import { SearchInput } from '../components/ui/SearchInput';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, Wand2, Copy, Check } from 'lucide-react';

export interface CustomHooksPageProps {
  onSelectHook: (id: string) => void;
  onOpenBuilder: () => void;
}

export const CustomHooksPage: React.FC<CustomHooksPageProps> = ({
  onSelectHook,
  onOpenBuilder,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: string[] = [
    'All',
    'State',
    'Effects',
    'Storage',
    'DOM & Sensors',
    'Performance',
    'Browser APIs',
  ];

  const filteredHooks = CUSTOM_HOOKS_CATALOG.filter((hook) => {
    const matchesCategory = selectedCategory === 'All' || hook.category === selectedCategory;
    const matchesSearch =
      hook.name.toLowerCase().includes(search.toLowerCase()) ||
      hook.description.toLowerCase().includes(search.toLowerCase()) ||
      hook.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
      className="custom-hooks-page"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Curated Custom Hooks Library
            </h1>
            <Badge variant="primary">40+ Curated Hooks</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
            Battle-tested, TypeScript-first custom hooks ready for production. Click any hook to inspect its implementation, parameters, and live demo.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Wand2 size={14} />}
          onClick={onOpenBuilder}
        >
          Build Your Own Hook Wizard
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search custom hooks (e.g. 'debounce', 'storage', 'modal')..."
        />

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="xs"
              variant={selectedCategory === cat ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid of Hooks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {filteredHooks.map((hook) => (
          <Card
            key={hook.id}
            variant="glass"
            padding="md"
            interactive
            onClick={() => onSelectHook(hook.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--accent-primary-text)',
                  }}
                >
                  {hook.name}()
                </span>
                <Badge variant="purple" size="sm">
                  {hook.category}
                </Badge>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {hook.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {hook.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '8px',
              }}
            >
              <Button
                size="xs"
                variant="ghost"
                icon={copiedId === hook.id ? <Check size={12} style={{ color: 'var(--accent-success)' }} /> : <Copy size={12} />}
                onClick={(e) => handleCopy(hook.id, hook.implementation, e)}
              >
                {copiedId === hook.id ? 'Copied' : 'Copy'}
              </Button>

              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--accent-primary-text)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Details & Demo <ArrowRight size={12} />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
