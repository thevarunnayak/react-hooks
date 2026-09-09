import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  Boxes,
  ChevronDown,
  Rows,
  Columns,
  CreditCard,
  FolderInput,
  Plus,
  Layers,
  Sparkles,
  Check,
  Hash,
} from 'lucide-react';

export interface ExistingContainerOption {
  groupId: string;
  name: string;
  itemCount: number;
  containerType: 'div' | 'card';
}

export interface MergeElementCandidate {
  id: string;
  title: string;
  subtype: string;
}

export interface WrapDropdownProps {
  nodeId: string;
  nodeTitle: string;
  existingContainers: ExistingContainerOption[];
  otherNodes: MergeElementCandidate[];
  selectedNodeIds: Set<string>;
  onWrapInNew: (
    nodeId: string,
    direction: 'row' | 'column',
    containerType: 'div' | 'card',
    customName?: string
  ) => void;
  onMoveToContainer: (nodeId: string, targetContainerId: string) => void;
  onMergeWithNodes: (
    sourceNodeId: string,
    targetNodeIds: string[],
    customName?: string,
    direction?: 'row' | 'column',
    containerType?: 'div' | 'card'
  ) => void;
  compact?: boolean;
}

export const sanitizeHtmlId = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const WrapDropdown: React.FC<WrapDropdownProps> = ({
  nodeId,
  nodeTitle,
  existingContainers,
  otherNodes,
  selectedNodeIds,
  onWrapInNew,
  onMoveToContainer,
  onMergeWithNodes,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [divName, setDivName] = useState('');
  const [selectedMergeIds, setSelectedMergeIds] = useState<Set<string>>(new Set());

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  // Selected nodes excluding current node
  const checkedOtherIds = Array.from(selectedNodeIds).filter((id) => id !== nodeId);

  // Suggested default name based on node title
  const defaultSuggestedName = `${sanitizeHtmlId(nodeTitle) || 'section'}-wrap`;
  const effectiveName = divName.trim() || defaultSuggestedName;
  const sanitizedId = sanitizeHtmlId(effectiveName);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 236;
    const menuHeight = 310;

    let left = rect.right - menuWidth;
    let top = rect.bottom + 4;

    if (left < 12) {
      left = Math.max(12, rect.left);
    }
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }
    if (top + menuHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - menuHeight - 4);
    }

    setMenuCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
      setDivName('');
      // Pre-select any nodes already checked in the studio
      setSelectedMergeIds(new Set(checkedOtherIds));
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus after short tick to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle outside click, escape, and window resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updateCoords();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleToggleMergeCandidate = (candidateId: string) => {
    setSelectedMergeIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  };

  const handlePerformMerge = (direction: 'row' | 'column' = 'row') => {
    const mergeTargets = Array.from(selectedMergeIds);
    if (mergeTargets.length === 0) {
      // If none explicitly checked, wrap just this item in a new div
      onWrapInNew(nodeId, direction, 'div', effectiveName);
    } else {
      onMergeWithNodes(nodeId, mergeTargets, effectiveName, direction, 'div');
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-no-drag="true"
        onClick={handleToggle}
        title="Wrap in new div, send to existing div, or merge with elements"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          padding: compact ? '2px 5px' : '2px 6px',
          fontSize: compact ? '10px' : '10.5px',
          fontWeight: 600,
          borderRadius: 'var(--radius-xs)',
          backgroundColor: isOpen ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
          color: isOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          outline: 'none',
          userSelect: 'none',
          transition: 'all var(--transition-fast)',
          lineHeight: 1.2,
        }}
      >
        <Boxes size={compact ? 10 : 11} />
        <span>Wrap</span>
        <ChevronDown size={9} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            data-no-drag="true"
            style={{
              position: 'fixed',
              top: `${menuCoords.top}px`,
              left: `${menuCoords.left}px`,
              width: '236px',
              maxHeight: '340px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'dropdownFadeIn 120ms ease-out',
            }}
          >
            {/* Header: Title and Div Name / ID Input */}
            <div
              style={{
                padding: '6px 8px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Boxes size={11} style={{ color: 'var(--accent-primary)' }} />
                  Wrap Element
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    padding: '1px 4px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-primary-subtle)',
                    color: 'var(--accent-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                  }}
                  title="HTML id attribute generated in code"
                >
                  #{sanitizedId}
                </span>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '3px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                >
                  <Hash size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    id={`div-name-input-${id}`}
                    ref={inputRef}
                    type="text"
                    value={divName}
                    onChange={(e) => setDivName(e.target.value)}
                    placeholder={defaultSuggestedName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePerformMerge('row');
                      }
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Options Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              {/* SECTION 1: Wrap in New Container */}
              <div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0 2px',
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  Wrap in New Container
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onWrapInNew(nodeId, 'row', 'div', effectiveName);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Rows size={11} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>Pure Div (Row)</span>
                    </div>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>row</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onWrapInNew(nodeId, 'column', 'div', effectiveName);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Columns size={11} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>Pure Div (Col)</span>
                    </div>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>column</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onWrapInNew(nodeId, 'row', 'card', effectiveName);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CreditCard size={11} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>Card Container</span>
                    </div>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>card</span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: Send Inside Existing Div */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0 2px',
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  Send Inside Existing Div
                </span>

                {existingContainers.length === 0 ? (
                  <div
                    style={{
                      padding: '3px 4px',
                      fontSize: '9.5px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    No existing divs yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {existingContainers.map((container) => {
                      const containerIdClean = sanitizeHtmlId(container.name);
                      return (
                        <button
                          key={container.groupId}
                          type="button"
                          onClick={() => {
                            onMoveToContainer(nodeId, container.groupId);
                            setIsOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '4px',
                            padding: '3px 6px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '10.5px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 100ms ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--accent-primary-subtle)';
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                            <FolderInput size={11} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '105px' }}>
                              {container.name}
                            </span>
                            <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              #{containerIdClean}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '8.5px',
                              padding: '1px 3px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-muted)',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {container.itemCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 3: Merge with Other Elements */}
              {otherNodes.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px', marginBottom: '2px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Merge with Elements
                    </span>
                    {selectedMergeIds.size > 0 && (
                      <span style={{ fontSize: '8.5px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {selectedMergeIds.size} selected
                      </span>
                    )}
                  </div>

                  {/* List of other nodes with quick checkbox */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', maxHeight: '70px', overflowY: 'auto' }}>
                    {otherNodes.map((other) => {
                      const isChecked = selectedMergeIds.has(other.id);
                      return (
                        <div
                          key={other.id}
                          onClick={() => handleToggleMergeCandidate(other.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 4px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: isChecked ? 'var(--accent-primary-subtle)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 100ms ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isChecked) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', flexShrink: 0, width: '11px', height: '11px' }}
                          />
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: isChecked ? 600 : 500,
                              color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {other.title}
                          </span>
                          <span
                            style={{
                              fontSize: '8px',
                              padding: '1px 3px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-muted)',
                              flexShrink: 0,
                            }}
                          >
                            {other.subtype}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Merge action button */}
                  <button
                    type="button"
                    onClick={() => handlePerformMerge('row')}
                    style={{
                      marginTop: '4px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--accent-primary)',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'opacity 100ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    <Sparkles size={11} />
                    <span>
                      {selectedMergeIds.size > 0
                        ? `Merge ${selectedMergeIds.size + 1} Items`
                        : `Wrap into Div #${sanitizedId}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
