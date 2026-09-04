import React, { useState, useMemo } from 'react';
import { TUTORIAL_PROJECTS } from '../components/playground/tutorials/tutorialConfigs';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tooltip } from '../components/ui/Tooltip';
import { MultiSelectDropdown } from '../components/ui/MultiSelectDropdown';
import {
  Search,
  ArrowRight,
  Eye,
  Boxes,
  Compass,
  Layers,
  RotateCcw,
  X,
} from 'lucide-react';

const ALL_HOOK_NAMES = [
  'useState',
  'useReducer',
  'useEffect',
  'useLayoutEffect',
  'useRef',
  'useMemo',
  'useCallback',
  'useContext',
  'useId',
  'useTransition',
  'useDeferredValue',
  'useOptimistic',
  'useActionState',
  'useFormStatus',
  'useSyncExternalStore',
  'Timer',
];

export interface ExamplesPageProps {
  onLoadInPlayground: (tutorialKey: string, view?: 'builder' | 'preview') => void;
}

export const ExamplesPage: React.FC<ExamplesPageProps> = ({ onLoadInPlayground }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedHooks, setSelectedHooks] = useState<string[]>([]);

  const allProjects = useMemo(() => Object.values(TUTORIAL_PROJECTS), []);

  // Extract unique categories as structured options
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort().map((cat) => ({
      value: cat,
      label: cat,
      count: allProjects.filter((p) => p.category === cat).length,
    }));
  }, [allProjects]);

  const getHookColor = (hook: string) => {
    switch (hook) {
      case 'useState':
        return 'var(--accent-primary)';
      case 'useEffect':
        return 'var(--accent-purple)';
      case 'useRef':
        return 'var(--accent-cyan)';
      case 'useReducer':
        return 'var(--accent-warning)';
      case 'useMemo':
        return '#10b981';
      case 'useCallback':
        return '#3b82f6';
      case 'useContext':
        return '#8b5cf6';
      case 'useId':
        return '#14b8a6';
      case 'useTransition':
        return '#f59e0b';
      case 'useLayoutEffect':
        return '#ec4899';
      case 'useDeferredValue':
        return '#06b6d4';
      case 'useOptimistic':
        return '#10b981';
      case 'useActionState':
        return '#f97316';
      case 'useFormStatus':
        return '#eab308';
      case 'useSyncExternalStore':
        return '#6366f1';
      case 'Timer':
        return 'var(--accent-danger)';
      default:
        return 'var(--text-muted)';
    }
  };

  const hookOptions = useMemo(() => {
    return ALL_HOOK_NAMES.map((hook) => ({
      value: hook,
      label: hook,
      count: allProjects.filter((p) => p.hooks && p.hooks.includes(hook)).length,
      color: getHookColor(hook),
      fontFamily: 'var(--font-mono)',
    }));
  }, [allProjects]);

  // Filter projects with multi-select Category & Hook support
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.hooks && project.hooks.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategories.length === 0 ||
        (project.category !== undefined && selectedCategories.includes(project.category));

      const matchesHook =
        selectedHooks.length === 0 ||
        (project.hooks !== undefined && project.hooks.some((h) => selectedHooks.includes(h)));

      return matchesSearch && matchesCategory && matchesHook;
    });
  }, [allProjects, searchQuery, selectedCategories, selectedHooks]);

  const getDifficultyVariant = (difficulty?: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' => {
    switch (difficulty) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'primary';
      case 'Advanced':
        return 'purple';
      case 'Expert':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      {/* Hero Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Boxes size={24} style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Real-Time Hook Architectures Gallery
          </h1>
          <Badge variant="primary" size="sm">
            {allProjects.length} Architectures
          </Badge>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '850px', lineHeight: 1.6 }}>
          Browse {allProjects.length} interactive, real-world systems illustrating cross-hook composition, concurrency, lifecycle management, and high-performance state patterns. Click any system to launch its live interactive blueprint directly onto the canvas.
        </p>

        {/* Highlight Stats Pill Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'var(--space-2)' }}>
          <Badge variant="default" size="sm">All React Hooks &amp; Patterns Covered</Badge>
          <Badge variant="default" size="sm">Zero Stale Closures</Badge>
          <Badge variant="default" size="sm">Live Reactive Visualizer</Badge>
          <Badge variant="default" size="sm">Production TSX Generator</Badge>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          backgroundColor: 'var(--bg-surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search architectures by name, keyword, or hook (e.g. 'Stopwatch', 'Cart', 'useTransition')..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
        </div>

        {/* Multi-Select Dropdowns & Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <MultiSelectDropdown
              label="Filter by Category"
              icon={<Layers size={14} />}
              options={categoryOptions}
              selectedValues={selectedCategories}
              onChange={setSelectedCategories}
              placeholder="All Categories"
              searchPlaceholder="Search categories..."
            />

            <MultiSelectDropdown
              label="Filter by Hook"
              icon={<Boxes size={14} />}
              options={hookOptions}
              selectedValues={selectedHooks}
              onChange={setSelectedHooks}
              placeholder="All Hooks"
              searchPlaceholder="Search hooks..."
            />

            {(selectedCategories.length > 0 || selectedHooks.length > 0 || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedHooks([]);
                  setSearchQuery('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-danger)';
                  e.currentTarget.style.borderColor = 'var(--accent-danger)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredProjects.length}</strong> of {allProjects.length} architectures
          </span>
        </div>

        {/* Active Filter Tags Ribbon (if any active) */}
        {(selectedCategories.length > 0 || selectedHooks.length > 0) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              paddingTop: '6px',
              borderTop: '1px dashed var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
              Active Filters:
            </span>
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary-text)',
                  border: '1px solid var(--accent-primary)',
                  fontWeight: 600,
                }}
              >
                <span>Category: {cat}</span>
                <span
                  onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Remove filter"
                >
                  <X size={11} />
                </span>
              </span>
            ))}
            {selectedHooks.map((h) => (
              <span
                key={h}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  fontWeight: 600,
                }}
              >
                <span>{h}</span>
                <span
                  onClick={() => setSelectedHooks((prev) => prev.filter((item) => item !== h))}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Remove filter"
                >
                  <X size={11} />
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Architecture Cards */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-default)',
          }}
        >
          <Compass size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Matching Architectures Found
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 16px' }}>
            Try resetting your search query or filter tags to discover all 25 production-ready architectures.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategories([]);
              setSelectedHooks([]);
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {filteredProjects.map((project) => {
            const nodeCount = project.nodes.length;
            const connCount = project.connections.length;

            return (
              <Card
                key={project.id}
                variant="default"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderColor: 'var(--border-default)',
                }}
              >
                <div>
                  {/* Card Top Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {project.category || 'Architecture'}
                    </span>
                    {project.difficulty && (
                      <Badge variant={getDifficultyVariant(project.difficulty)} size="sm">
                        {project.difficulty}
                      </Badge>
                    )}
                  </div>

                  {/* Architecture Title */}
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: '6px',
                    }}
                  >
                    {project.name}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Hook Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                    {project.hooks?.map((hook) => (
                      <span
                        key={hook}
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: getHookColor(hook),
                        }}
                      >
                        {hook}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    marginTop: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{nodeCount} Modules</span>
                    <span>•</span>
                    <span>{connCount} Wires</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tooltip content="Directly open the interactive Live Preview" placement="top">
                      <Button
                        size="xs"
                        variant="secondary"
                        icon={<Eye size={12} />}
                        onClick={() => onLoadInPlayground(project.id, 'preview')}
                      >
                        Live Preview
                      </Button>
                    </Tooltip>

                    <Tooltip content="Load this interactive system into the visual canvas" placement="top">
                      <Button
                        size="xs"
                        variant="primary"
                        icon={<ArrowRight size={12} />}
                        onClick={() => onLoadInPlayground(project.id, 'builder')}
                      >
                        Launch in Canvas
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
