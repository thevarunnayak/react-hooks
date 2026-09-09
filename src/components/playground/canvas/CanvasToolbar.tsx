import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Eye,
  Code2,
  LayoutGrid,
  BookOpen,
  ChevronDown,
  Sparkles,
  Check,
  Search,
  ExternalLink,
  ArrowUpDown,
  Layers,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Plus,
  Sliders,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';
import { Tooltip } from '../../ui/Tooltip';
import { PlaygroundView } from '../../../constants/enums';
import { t } from '../../../i18n/i18n';
import { TUTORIAL_PROJECTS } from '../tutorials/tutorialConfigs';
import { PlaygroundNode } from '../../../types/playground';
import { UIOrderModal } from '../panels/UIOrderModal';

export interface CanvasToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onReset: () => void;
  onSave: () => void;
  onLoadTutorial: (tutorialKey: string) => void;
  activeView: 'builder' | 'canvas' | 'code' | 'preview' | 'layout';
  onViewChange: (view: 'builder' | 'canvas' | 'code' | 'preview' | 'layout') => void;
  activeDevice?: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  onDeviceChange?: (device: 'desktop' | 'laptop' | 'tablet' | 'mobile') => void;
  isLeftCollapsed?: boolean;
  onToggleLeftPanel?: () => void;
  isRightCollapsed?: boolean;
  onToggleRightPanel?: () => void;
  nodes?: PlaygroundNode[];
  onReorderUINodes?: (orderedIds: string[]) => void;
  isMobile?: boolean;
  onOpenMobilePalette?: () => void;
  onOpenMobileInspector?: () => void;
  selectedNodeId?: string | null;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onReset,
  onSave,
  onLoadTutorial,
  activeView,
  onViewChange,
  activeDevice = 'desktop',
  onDeviceChange,
  isLeftCollapsed,
  onToggleLeftPanel,
  isRightCollapsed,
  onToggleRightPanel,
  nodes,
  onReorderUINodes,
  isMobile = false,
  onOpenMobilePalette,
  onOpenMobileInspector,
  selectedNodeId,
}) => {
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [presetSearch, setPresetSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const allPresets = Object.values(TUTORIAL_PROJECTS);

  const filteredPresets = allPresets.filter((p) => {
    if (!presetSearch) return true;
    const q = presetSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.hooks && p.hooks.some((h) => h.toLowerCase().includes(q)))
    );
  });

  // Group by category
  const groupedPresets = filteredPresets.reduce((acc, p) => {
    const cat = p.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, typeof allPresets>);

  const handleSelectPreset = (presetId: string) => {
    onLoadTutorial(presetId);
    setIsDropdownOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '12px',
        flexWrap: 'wrap',
        zIndex: 25,
        position: 'relative',
      }}
      className="canvas-toolbar"
    >
      {/* Left: View Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Tabs
          items={[
            { id: PlaygroundView.BUILDER, label: isMobile ? 'Builder' : t('playground.toolbar.visualBuilderTab'), icon: <LayoutGrid size={14} /> },
            {
              id: PlaygroundView.PREVIEW,
              label: isMobile ? 'Preview' : t('playground.toolbar.livePreviewTab'),
              icon: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-success)',
                      boxShadow: '0 0 6px var(--accent-success)',
                    }}
                  />
                  <Eye size={14} />
                </div>
              ),
            },
            {
              id: PlaygroundView.LAYOUT,
              label: isMobile ? 'Layout' : 'Layout & Flex Studio',
              icon: <Layers size={14} style={{ color: 'var(--accent-primary)' }} />,
            },
            { id: PlaygroundView.CODE, label: isMobile ? 'Code' : t('playground.toolbar.generatedCodeTab'), icon: <Code2 size={14} /> },
          ]}
          activeId={activeView === PlaygroundView.CANVAS ? PlaygroundView.BUILDER : activeView}
          onChange={(id) => onViewChange(id as any)}
          variant="pills"
          size="sm"
        />

        {/* Mobile quick action buttons for Builder mode */}
        {isMobile && (activeView === 'builder' || activeView === 'canvas') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Button
              size="xs"
              variant="secondary"
              icon={<Plus size={12} />}
              onClick={onOpenMobilePalette}
              title="Add Component from Palette"
            >
              Add
            </Button>
            <Button
              size="xs"
              variant={selectedNodeId ? 'primary' : 'ghost'}
              icon={<Sliders size={12} />}
              onClick={onOpenMobileInspector}
              title="Open Inspector"
            >
              Inspect
            </Button>
          </div>
        )}

        {/* Responsive Device Viewport Switcher when in Preview or Layout */}
        {(activeView === 'preview' || activeView === 'layout') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
              gap: '2px',
              marginLeft: '4px',
            }}
          >
            {[
              { id: 'desktop', label: 'Desktop (1440px)', icon: <Monitor size={12} /> },
              { id: 'laptop', label: 'Laptop (1024px)', icon: <Laptop size={12} /> },
              { id: 'tablet', label: 'Tablet (768px)', icon: <Tablet size={12} /> },
              { id: 'mobile', label: 'Mobile (375px)', icon: <Smartphone size={12} /> },
            ].map((d) => {
              const isSelected = activeDevice === d.id;
              return (
                <Tooltip key={d.id} content={d.label} placement="bottom">
                  <button
                    type="button"
                    onClick={() => onDeviceChange && onDeviceChange(d.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 7px',
                      fontSize: '11px',
                      fontWeight: isSelected ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {d.icon}
                    <span className="hide-mobile">{d.id.charAt(0).toUpperCase() + d.id.slice(1)}</span>
                  </button>
                </Tooltip>
              );
            })}
          </div>
        )}

        <div
          className="hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: '10px',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-success)',
              boxShadow: '0 0 6px var(--accent-success)',
            }}
          />
          <span>{t('playground.toolbar.liveUpdateBadge')}</span>
        </div>
      </div>

      {/* Center: History & Zoom Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Tooltip content={t('playground.toolbar.undoTooltip')} shortcut="⌘Z" placement="bottom">
          <Button
            size="xs"
            variant="ghost"
            disabled={!canUndo}
            icon={<Undo2 size={13} />}
            onClick={onUndo}
          />
        </Tooltip>
        <Tooltip content={t('playground.toolbar.redoTooltip')} shortcut="⌘⇧Z" placement="bottom">
          <Button
            size="xs"
            variant="ghost"
            disabled={!canRedo}
            icon={<Redo2 size={13} />}
            onClick={onRedo}
          />
        </Tooltip>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        <Tooltip content={t('playground.toolbar.zoomOutTooltip')} placement="bottom">
          <Button size="xs" variant="ghost" icon={<ZoomOut size={13} />} onClick={onZoomOut} />
        </Tooltip>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            minWidth: '42px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          onClick={onZoomReset}
          title="Click to reset zoom"
        >
          {Math.round(zoom * 100)}%
        </span>
        <Tooltip content={t('playground.toolbar.zoomInTooltip')} placement="bottom">
          <Button size="xs" variant="ghost" icon={<ZoomIn size={13} />} onClick={onZoomIn} />
        </Tooltip>
      </div>

      {/* Right: Custom UI Dropdown & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* UI Layout & Flex Studio Shortcut Button */}
        <Tooltip content="Open Layout & Flex Studio to structure rows, columns, and flexbox containers" placement="bottom">
          <button
            type="button"
            className="hide-mobile"
            onClick={() => onViewChange('layout')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeView === 'layout' ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
              border: `1px solid ${activeView === 'layout' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Layers size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>Layout Studio</span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '999px',
                backgroundColor: 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary-text)',
                fontWeight: 700,
              }}
            >
              {nodes?.filter((n) => n.type === 'ui').length ?? 0}
            </span>
          </button>
        </Tooltip>

        {/* Custom Presets Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isDropdownOpen ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
              border: `1px solid ${isDropdownOpen ? 'var(--accent-primary)' : 'var(--border-default)'}`,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <BookOpen size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>Load Preset</span>
            <ChevronDown size={13} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
          </button>

          {/* Floating Dropdown Menu Card */}
          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: 'min(360px, calc(100vw - 24px))',
                maxWidth: 'calc(100vw - 24px)',
                maxHeight: '480px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
                padding: '8px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Header & Gallery Link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px 8px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    REAL-TIME ARCHITECTURES ({allPresets.length})
                  </span>
                </div>
                <a
                  href="#examples"
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Gallery Page</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              {/* Inline Search Input */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={13}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  placeholder={`Search ${allPresets.length} architectures or hooks...`}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '6px 8px 6px 26px',
                    fontSize: '11px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Scrollable Grouped Items */}
              <div
                style={{
                  overflowY: 'auto',
                  maxHeight: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingRight: '2px',
                }}
              >
                {Object.keys(groupedPresets).length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    No architectures matching &quot;{presetSearch}&quot;
                  </div>
                ) : (
                  Object.entries(groupedPresets).map(([category, items]) => (
                    <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'var(--text-muted)',
                          padding: '4px 6px 2px',
                        }}
                      >
                        {category} ({items.length})
                      </span>
                      {items.map((preset) => (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.id)}
                          style={{
                            padding: '7px 9px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            backgroundColor: 'transparent',
                            transition: 'background-color var(--transition-fast)',
                            border: '1px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-elevated)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {preset.name}
                            </span>
                            {preset.difficulty && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '1px 5px',
                                  borderRadius: 'var(--radius-xs)',
                                  backgroundColor: 'var(--bg-surface-elevated)',
                                  color: 'var(--text-muted)',
                                  fontWeight: 600,
                                }}
                              >
                                {preset.difficulty}
                              </span>
                            )}
                          </div>
                          {preset.hooks && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {preset.hooks.map((h) => (
                                <span
                                  key={h}
                                  style={{
                                    fontSize: '8.5px',
                                    fontFamily: 'var(--font-mono)',
                                    padding: '1px 4px',
                                    borderRadius: 'var(--radius-xs)',
                                    backgroundColor: 'var(--accent-primary-subtle)',
                                    color: 'var(--accent-primary-text)',
                                    fontWeight: 600,
                                  }}
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          )}
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {preset.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Tooltip content={t('playground.toolbar.saveTooltip')} placement="bottom">
          <Button size="xs" variant="secondary" icon={<Save size={13} />} onClick={onSave}>
            <span className="hide-mobile">{t('common.save')}</span>
          </Button>
        </Tooltip>
        <Tooltip content={t('playground.toolbar.resetTooltip')} placement="bottom">
          <Button size="xs" variant="ghost" icon={<RotateCcw size={13} />} onClick={onReset}>
            <span className="hide-mobile">{t('common.reset')}</span>
          </Button>
        </Tooltip>
      </div>

      {/* UI Component Ordering Modal */}
      {isOrderModalOpen && (
        <UIOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          nodes={nodes || []}
          onReorderUINodes={onReorderUINodes || (() => {})}
        />
      )}
    </div>
  );
};
