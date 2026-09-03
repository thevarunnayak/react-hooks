import React, { useState, useMemo } from 'react';
import { TUTORIAL_PROJECTS } from '../components/playground/tutorials/tutorialConfigs';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tooltip } from '../components/ui/Tooltip';
import {
  Search,
  ArrowRight,
  Boxes,
  Compass,
} from 'lucide-react';

export interface ExamplesPageProps {
  onLoadInPlayground: (tutorialKey: string) => void;
}

export const ExamplesPage: React.FC<ExamplesPageProps> = ({ onLoadInPlayground }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedHook, setSelectedHook] = useState<string>('All');

  const allProjects = useMemo(() => Object.values(TUTORIAL_PROJECTS), []);

  // Extract unique categories and hooks
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [allProjects]);

  const allHookNames = [
    'All',
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
    'Timer',
  ];

  // Filter projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.hooks && project.hooks.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;

      const matchesHook = selectedHook === 'All' || (project.hooks && project.hooks.includes(selectedHook));

      return matchesSearch && matchesCategory && matchesHook;
    });
  }, [allProjects, searchQuery, selectedCategory, selectedHook]);

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
      case 'Timer':
        return 'var(--accent-danger)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getDifficultyVariant = (difficulty?: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' => {
    switch (difficulty) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'primary';
      case 'Advanced':
        return 'purple';
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
          Browse 25 interactive, real-world systems illustrating cross-hook composition, concurrency, lifecycle management, and high-performance state patterns. Click any system to launch its live interactive blueprint directly onto the canvas.
        </p>

        {/* Highlight Stats Pill Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'var(--space-2)' }}>
          <Badge variant="default" size="sm">All 11 Hooks Covered</Badge>
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

        {/* Category Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Filter by Category:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {categories.map((cat) => {
              const count = cat === 'All' ? allProjects.length : allProjects.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{cat}</span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      opacity: 0.85,
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-surface)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hook Filter Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Filter by Hook:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {allHookNames.map((hook) => {
              const isSelected = selectedHook === hook;
              const hookColor = hook === 'All' ? 'var(--accent-primary)' : getHookColor(hook);
              return (
                <button
                  key={hook}
                  onClick={() => setSelectedHook(hook)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
                    color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    fontFamily: hook !== 'All' ? 'var(--font-mono)' : 'inherit',
                  }}
                >
                  {hook}
                </button>
              );
            })}
          </div>
        </div>
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
              setSelectedCategory('All');
              setSelectedHook('All');
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

                  <Tooltip content="Load this interactive system into the visual canvas" placement="top">
                    <Button
                      size="xs"
                      variant="primary"
                      icon={<ArrowRight size={12} />}
                      onClick={() => onLoadInPlayground(project.id)}
                    >
                      Launch in Canvas
                    </Button>
                  </Tooltip>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
