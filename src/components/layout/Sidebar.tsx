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
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Terminal,
} from 'lucide-react';
import { HOOKS_CATALOG } from '../../data/hooks';
import { CUSTOM_HOOKS_CATALOG } from '../../data/custom-hooks/catalog';
import { MACHINE_CODING_PROBLEMS_BY_ID } from '../../data/machineCoding/problems';
import { TUTORIAL_PROJECTS } from '../playground/tutorials/tutorialConfigs';
import { Tooltip } from '../ui/Tooltip';

export interface SidebarProps {
  currentRoute: string;
  currentHookId?: string;
  onNavigate: (route: string, param?: string) => void;
  bookmarks?: string[];
  completedLessons?: string[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  currentHookId,
  onNavigate,
  bookmarks = [],
  completedLessons = [],
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const mainNav = [
    { id: 'home', label: 'Home & Learning Path', icon: <Home size={16} /> },
    { id: 'playground', label: 'Visual Component Builder', icon: <LayoutGrid size={16} style={{ color: 'var(--accent-primary)' }} /> },
    { id: 'examples', label: 'Real-Time Architectures', icon: <Boxes size={16} style={{ color: '#10b981' }} />, badge: String(Object.keys(TUTORIAL_PROJECTS).length) },
    { id: 'hook-map', label: 'Visual Hook Map', icon: <Map size={16} /> },
    { id: 'challenges', label: 'Interactive Challenges', icon: <CheckCircle2 size={16} /> },
    { id: 'machine-coding', label: 'Machine Coding Labs', icon: <Terminal size={16} style={{ color: 'var(--accent-primary)' }} />, badge: '25' },
    { id: 'interview', label: 'Interview Preparation', icon: <HelpCircle size={16} /> },
    { id: 'about', label: 'About & Story', icon: <Sparkles size={16} style={{ color: 'var(--accent-warning)' }} /> },
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
        width: isCollapsed ? '56px' : '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        height: '100%',
        maxHeight: 'calc(100vh - 56px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isCollapsed ? '10px 8px' : 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: isCollapsed ? '6px' : 'var(--space-4)',
        flexShrink: 0,
        boxSizing: 'border-box',
        transition: 'width 220ms cubic-bezier(0.16, 1, 0.3, 1), padding 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="app-sidebar"
    >
      {/* Header with Top-Right Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '2px 0 6px 0' : '2px 4px 6px 6px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {!isCollapsed && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}
          >
            Navigation
          </span>
        )}

        {onToggleCollapse && (
          <Tooltip
            content={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            placement="right"
            shortcut="⌘B"
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isCollapsed ? '34px' : '28px',
                height: isCollapsed ? '34px' : '28px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCollapsed ? 'var(--bg-surface-elevated)' : 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isCollapsed ? 'var(--bg-surface-elevated)' : 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={15} />}
            </button>
          </Tooltip>
        )}
      </div>
      {/* Primary Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '4px' : '2px', width: '100%' }}>
        {mainNav.map((item) => {
          const isActive =
            currentRoute === item.id ||
            (item.id === 'challenges' && (currentRoute === 'challenge-session' || currentRoute === 'challenge-mode')) ||
            (item.id === 'machine-coding' && (currentRoute === 'machine-coding' || MACHINE_CODING_PROBLEMS_BY_ID.has(currentRoute)));

          if (isCollapsed) {
            return (
              <Tooltip
                key={item.id}
                content={item.badge ? `${item.label} (${item.badge})` : item.label}
                placement="right"
              >
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                    margin: '0 auto',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                      }}
                    />
                  )}
                </button>
              </Tooltip>
            );
          }

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

      {/* When Collapsed: Compact Shortcut Rail */}
      {isCollapsed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: 'center' }}>
          {/* Subtle separator */}
          <div
            style={{
              width: '28px',
              height: '1px',
              backgroundColor: 'var(--border-subtle)',
              margin: '4px auto',
            }}
          />

          {/* Core Hooks Shortcut */}
          <Tooltip content="Core React Hooks (7 Hooks)" placement="right">
            <button
              type="button"
              onClick={() => onNavigate('hook', currentHookId && coreHooks.some((h) => h.id === currentHookId) ? currentHookId : 'useState')}
              aria-label="Core React Hooks"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor:
                  currentRoute === 'hook' && coreHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-subtle)'
                    : 'transparent',
                color:
                  currentRoute === 'hook' && coreHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-text)'
                    : 'var(--text-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  currentRoute === 'hook' && coreHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-subtle)'
                    : 'transparent';
                e.currentTarget.style.color =
                  currentRoute === 'hook' && coreHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-text)'
                    : 'var(--text-muted)';
              }}
            >
              <Layers size={17} />
            </button>
          </Tooltip>

          {/* Concurrent & Modern Hooks Shortcut */}
          <Tooltip content="Concurrent & React 19 Hooks" placement="right">
            <button
              type="button"
              onClick={() => onNavigate('hook', currentHookId && advancedHooks.some((h) => h.id === currentHookId) ? currentHookId : 'useTransition')}
              aria-label="Concurrent Hooks"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor:
                  currentRoute === 'hook' && advancedHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-subtle)'
                    : 'transparent',
                color:
                  currentRoute === 'hook' && advancedHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-text)'
                    : 'var(--text-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  currentRoute === 'hook' && advancedHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-subtle)'
                    : 'transparent';
                e.currentTarget.style.color =
                  currentRoute === 'hook' && advancedHooks.some((h) => h.id === currentHookId)
                    ? 'var(--accent-primary-text)'
                    : 'var(--text-muted)';
              }}
            >
              <Sparkles size={17} />
            </button>
          </Tooltip>

          {/* Custom Hooks Catalog Shortcut */}
          <Tooltip content="Browse 40+ Custom Hooks" placement="right">
            <button
              type="button"
              onClick={() => onNavigate('custom-hooks')}
              aria-label="Browse 40+ Custom Hooks"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor:
                  currentRoute === 'custom-hooks' || currentRoute === 'custom-hook-detail'
                    ? 'var(--accent-purple-subtle)'
                    : 'transparent',
                color:
                  currentRoute === 'custom-hooks' || currentRoute === 'custom-hook-detail'
                    ? 'var(--accent-purple-text)'
                    : 'var(--text-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  currentRoute === 'custom-hooks' || currentRoute === 'custom-hook-detail'
                    ? 'var(--accent-purple-subtle)'
                    : 'transparent';
                e.currentTarget.style.color =
                  currentRoute === 'custom-hooks' || currentRoute === 'custom-hook-detail'
                    ? 'var(--accent-purple-text)'
                    : 'var(--text-muted)';
              }}
            >
              <Boxes size={17} />
            </button>
          </Tooltip>

          {/* Hook Builder Wizard Shortcut */}
          <Tooltip content="Scaffold Hook Wizard" placement="right">
            <button
              type="button"
              onClick={() => onNavigate('hook-builder')}
              aria-label="Scaffold Hook Wizard"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: currentRoute === 'hook-builder' ? 'var(--accent-purple-subtle)' : 'transparent',
                color: currentRoute === 'hook-builder' ? 'var(--accent-purple-text)' : 'var(--text-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  currentRoute === 'hook-builder' ? 'var(--accent-purple-subtle)' : 'transparent';
                e.currentTarget.style.color =
                  currentRoute === 'hook-builder' ? 'var(--accent-purple-text)' : 'var(--text-muted)';
              }}
            >
              <Wand2 size={17} />
            </button>
          </Tooltip>

          {/* Current Hook Indicator in Collapsed Mode */}
          {currentRoute === 'hook' && currentHookId && (
            <Tooltip content={`Active Hook: ${currentHookId}()`} placement="right">
              <div
                style={{
                  marginTop: '4px',
                  width: '38px',
                  padding: '4px 2px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary-text)',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  border: '1px solid var(--accent-primary)',
                  cursor: 'default',
                }}
              >
                {currentHookId.replace(/^use/, 'u')}
              </div>
            </Tooltip>
          )}
        </div>
      ) : (
        /* When Expanded: Full Hook Sections */
        <>
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
        </>
      )}
    </aside>
  );
};
