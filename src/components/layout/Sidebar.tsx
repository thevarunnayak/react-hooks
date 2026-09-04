import React from 'react';
import {
  Home,
  LayoutGrid,
  Map,
  Sparkles,
  Wand2,
  CheckCircle2,
  HelpCircle,
  Bookmark,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { HOOKS_CATALOG } from '../../data/hooks';
import { CUSTOM_HOOKS_CATALOG } from '../../data/custom-hooks/catalog';
import { TUTORIAL_PROJECTS } from '../playground/tutorials/tutorialConfigs';

export interface SidebarProps {
  currentRoute: string;
  currentHookId?: string;
  onNavigate: (route: string, param?: string) => void;
  bookmarks?: string[];
  completedLessons?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  currentHookId,
  onNavigate,
  bookmarks = [],
  completedLessons = [],
}) => {
  const mainNav = [
    { id: 'home', label: 'Home & Learning Path', icon: <Home size={16} /> },
    { id: 'playground', label: 'Visual Component Builder', icon: <LayoutGrid size={16} style={{ color: 'var(--accent-primary)' }} /> },
    { id: 'examples', label: 'Real-Time Architectures', icon: <Boxes size={16} style={{ color: '#10b981' }} />, badge: String(Object.keys(TUTORIAL_PROJECTS).length) },
    { id: 'hook-map', label: 'Visual Hook Map', icon: <Map size={16} /> },
    { id: 'challenges', label: 'Interactive Challenges', icon: <CheckCircle2 size={16} /> },
    { id: 'interview', label: 'Interview Preparation', icon: <HelpCircle size={16} /> },
  ];

  const coreHooks = HOOKS_CATALOG.filter((h) =>
    ['useState', 'useEffect', 'useContext', 'useRef', 'useReducer', 'useCallback', 'useMemo'].includes(h.id)
  );

  const advancedHooks = HOOKS_CATALOG.filter(
    (h) => !['useState', 'useEffect', 'useContext', 'useRef', 'useReducer', 'useCallback', 'useMemo'].includes(h.id)
  );

  // Top featured custom hooks for the sidebar
  const featuredCustomHooks = [
    'useLocalStorage',
    'useDebounce',
    'useInterval',
    'useMediaQuery',
    'useClickOutside',
    'usePrevious',
    'useClipboard',
    'useToggle',
  ];

  const customHookItems = CUSTOM_HOOKS_CATALOG.filter((c) =>
    featuredCustomHooks.includes(c.id)
  );

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        height: '100%',
        maxHeight: 'calc(100vh - 56px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: 'var(--space-4) var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        flexShrink: 0,
      }}
      className="app-sidebar"
    >
      {/* Primary Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {mainNav.map((item) => {
          const isActive =
            currentRoute === item.id ||
            (item.id === 'challenges' && (currentRoute === 'challenge-session' || currentRoute === 'challenge-mode'));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: 'var(--text-xs)',
                textAlign: 'left',
                border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-primary-subtle)',
                    color: 'var(--accent-primary-text)',
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Core Hooks */}
      <div>
        <div style={{ padding: '0 8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
          Core React Hooks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {coreHooks.map((h) => {
            const isActive = currentRoute === 'hook' && currentHookId === h.id;
            const isCompleted = completedLessons.includes(h.id);
            const isBookmarked = bookmarks.includes(h.id);

            return (
              <button
                key={h.id}
                onClick={() => onNavigate('hook', h.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--accent-primary-subtle)' : 'transparent',
                  color: isActive ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{h.name}()</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isBookmarked && <Bookmark size={11} style={{ color: 'var(--accent-warning)', fill: 'currentColor' }} />}
                  {isCompleted && <CheckCircle2 size={11} style={{ color: 'var(--accent-success)' }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced & React 19 Hooks */}
      <div>
        <div style={{ padding: '0 8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
          Concurrent & Modern
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {advancedHooks.map((h) => {
            const isActive = currentRoute === 'hook' && currentHookId === h.id;
            const isCompleted = completedLessons.includes(h.id);
            const isBookmarked = bookmarks.includes(h.id);

            return (
              <button
                key={h.id}
                onClick={() => onNavigate('hook', h.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--accent-primary-subtle)' : 'transparent',
                  color: isActive ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{h.name}()</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isBookmarked && <Bookmark size={11} style={{ color: 'var(--accent-warning)', fill: 'currentColor' }} />}
                  {isCompleted && <CheckCircle2 size={11} style={{ color: 'var(--accent-success)' }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dedicated Custom Hooks Section */}
      <div>
        <div
          style={{
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            Custom Hooks
          </span>
          <span
            style={{
              fontSize: '9px',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-purple-subtle)',
              color: 'var(--accent-purple-text)',
              fontWeight: 700,
            }}
          >
            40+ Catalog
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {customHookItems.map((c) => {
            const isActive = currentRoute === 'custom-hook-detail' && currentHookId === c.id;

            return (
              <button
                key={c.id}
                onClick={() => onNavigate('custom-hook-detail', c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--accent-purple-subtle)' : 'transparent',
                  color: isActive ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{c.name}()</span>
                <span
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {c.category.split(' ')[0]}
                </span>
              </button>
            );
          })}

          {/* View All Custom Hooks button */}
          <button
            onClick={() => onNavigate('custom-hooks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              marginTop: '4px',
              backgroundColor: currentRoute === 'custom-hooks' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: 'var(--accent-primary-text)',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              border: '1px dashed var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={12} />
              <span>Browse All 40+ Hooks</span>
            </div>
            <ArrowRight size={12} />
          </button>

          {/* Hook Builder Wizard link */}
          <button
            onClick={() => onNavigate('hook-builder')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              color: currentRoute === 'hook-builder' ? 'var(--accent-purple-text)' : 'var(--text-muted)',
              backgroundColor: currentRoute === 'hook-builder' ? 'var(--accent-purple-subtle)' : 'transparent',
              fontWeight: 500,
              fontSize: '11px',
              cursor: 'pointer',
              border: 'none',
              marginTop: '2px',
            }}
          >
            <Wand2 size={12} />
            <span>Scaffold Hook Wizard</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
