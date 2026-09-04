import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Wand2,
  X,
  Heading as HeadingIcon,
  MousePointerClick,
  TextCursorInput,
  ToggleLeft,
  ListFilter,
  Sliders,
  CheckSquare,
  FileText,
  Square,
  Tag,
  Database,
  Columns3,
  Type,
  LayoutList,
  GripVertical,
  Move,
} from 'lucide-react';
import { PlaygroundNode } from '../../../types/playground';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';

export interface UIOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: PlaygroundNode[];
  onReorderUINodes: (orderedIds: string[]) => void;
}

export const UIOrderModal: React.FC<UIOrderModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onReorderUINodes,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // List Item Drag-and-Drop Reordering State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Draggable Modal Window State
  const [modalOffset, setModalOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const modalDragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  useClickOutside(modalRef, () => {
    if (!isOpen || isDraggingModal) return;
    onClose();
  });

  useKeyboardShortcut('Escape', () => {
    if (isOpen) onClose();
  });

  useEffect(() => {
    if (!isDraggingModal) return;
    const handleMouseMove = (e: MouseEvent) => {
      setModalOffset({
        x: modalDragStartRef.current.startX + (e.clientX - modalDragStartRef.current.mouseX),
        y: modalDragStartRef.current.startY + (e.clientY - modalDragStartRef.current.mouseY),
      });
    };
    const handleMouseUp = () => {
      setIsDraggingModal(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingModal]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setModalOffset({ x: 0, y: 0 });
      setDraggedIndex(null);
      setDragOverIndex(null);
      setIsDraggingModal(false);
    }
  }, [isOpen]);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract all UI nodes in their current order (respecting uiOrder)
  const uiNodes = (nodes || [])
    .filter((n): n is PlaygroundNode => Boolean(n && n.type === 'ui'))
    .sort((a, b) => {
      const orderA = typeof a.props?.uiOrder === 'number' ? a.props.uiOrder : (nodes || []).indexOf(a);
      const orderB = typeof b.props?.uiOrder === 'number' ? b.props.uiOrder : (nodes || []).indexOf(b);
      return orderA - orderB;
    });

  const getSubtypeIcon = (subtype?: string) => {
    switch (subtype) {
      case 'Heading':
        return <HeadingIcon size={14} style={{ color: 'var(--text-primary)' }} />;
      case 'Button':
        return <MousePointerClick size={14} style={{ color: 'var(--accent-primary)' }} />;
      case 'Input':
        return <TextCursorInput size={14} style={{ color: 'var(--accent-cyan)' }} />;
      case 'Switch':
        return <ToggleLeft size={14} style={{ color: '#10b981' }} />;
      case 'Dropdown':
        return <ListFilter size={14} style={{ color: 'var(--accent-warning)' }} />;
      case 'Slider':
        return <Sliders size={14} style={{ color: 'var(--accent-purple)' }} />;
      case 'Checkbox':
        return <CheckSquare size={14} style={{ color: 'var(--accent-primary)' }} />;
      case 'Card':
      case 'Container':
        return <Square size={14} style={{ color: '#6366f1' }} />;
      case 'Form':
        return <FileText size={14} style={{ color: '#ec4899' }} />;
      case 'Badge':
        return <Tag size={14} style={{ color: 'var(--accent-success)' }} />;
      case 'DummyData':
        return <Database size={14} style={{ color: '#6366f1' }} />;
      case 'Kanban':
        return <Columns3 size={14} style={{ color: '#8b5cf6' }} />;
      default:
        return <Type size={14} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const getNodeTitle = (node: PlaygroundNode): string => {
    if (!node) return 'Component';
    const p = node.props || {};
    return (
      p.content ||
      (p as any).title ||
      (p as any).label ||
      p.placeholder ||
      node.label ||
      node.subtype ||
      'Component'
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const newOrder = [...uiNodes];
    const targetItem = newOrder[index];
    newOrder.splice(index, 1);

    if (direction === 'up') {
      newOrder.splice(Math.max(0, index - 1), 0, targetItem);
    } else if (direction === 'down') {
      newOrder.splice(Math.min(uiNodes.length - 1, index + 1), 0, targetItem);
    } else if (direction === 'top') {
      newOrder.unshift(targetItem);
    } else if (direction === 'bottom') {
      newOrder.push(targetItem);
    }

    onReorderUINodes(newOrder.map((n) => n.id));
  };

  // Smart Auto-sort: Sorts UI nodes based on visual canvas layout (top-to-bottom, left-to-right)
  const handleAutoSortCanvas = () => {
    const sorted = [...uiNodes].sort((a, b) => {
      const posY_a = a.position?.y ?? 0;
      const posY_b = b.position?.y ?? 0;
      const posX_a = a.position?.x ?? 0;
      const posX_b = b.position?.x ?? 0;
      const yDiff = posY_a - posY_b;
      if (Math.abs(yDiff) > 40) {
        return yDiff;
      }
      return posX_a - posX_b;
    });

    onReorderUINodes(sorted.map((n) => n.id));
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    setIsDraggingModal(true);
    modalDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: modalOffset.x,
      startY: modalOffset.y,
    };
  };

  // List Drag Handlers
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleItemDragLeave = (_e: React.DragEvent, index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...uiNodes];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    onReorderUINodes(newOrder.map((n) => n.id));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'fadeIn 150ms ease-out',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="UI Component Ordering"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          transform: `translate(${modalOffset.x}px, ${modalOffset.y}px)`,
          transition: isDraggingModal ? 'none' : 'transform 100ms ease-out',
        }}
      >
        {/* Header - Draggable Window Header */}
        <div
          onMouseDown={handleHeaderMouseDown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            cursor: isDraggingModal ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              <ArrowUpDown size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  UI Component Sequence & Order
                </h3>
                <span
                  style={{
                    fontSize: '9.5px',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  title="Click and drag anywhere on this header to reposition the modal"
                >
                  <Move size={10} /> Drag Window
                </span>
                {(modalOffset.x !== 0 || modalOffset.y !== 0) && (
                  <button
                    type="button"
                    onClick={() => setModalOffset({ x: 0, y: 0 })}
                    style={{
                      fontSize: '9.5px',
                      color: 'var(--accent-primary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '1px 4px',
                      textDecoration: 'underline',
                    }}
                  >
                    Reset Pos
                  </button>
                )}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Drag rows using ⠿ or use arrow buttons to sequence elements in Live Preview
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar Quick Action Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LayoutList size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {uiNodes.length} UI {uiNodes.length === 1 ? 'Component' : 'Components'}
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              · Drag ⠿ handle or click arrows
            </span>
          </div>

          <button
            type="button"
            onClick={handleAutoSortCanvas}
            title="Sort elements according to their visual vertical positions on canvas"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary-subtle)',
              border: '1px solid var(--accent-primary)',
              color: 'var(--accent-primary-text)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              marginLeft: 'auto',
            }}
          >
            <Wand2 size={13} />
            <span>Auto-Sort by Canvas</span>
          </button>
        </div>

        {/* List of UI Components */}
        <div
          style={{
            padding: '12px 18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1,
            maxHeight: '480px',
          }}
        >
          {uiNodes.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              No UI components on the canvas yet. Add a Button, Dropdown, Card, or Input from the left palette!
            </div>
          ) : (
            uiNodes.map((node, index) => {
              const isFirst = index === 0;
              const isLast = index === uiNodes.length - 1;
              const title = getNodeTitle(node);
              const isDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={node.id}
                  draggable={true}
                  onDragStart={(e) => handleItemDragStart(e, index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragLeave={(e) => handleItemDragLeave(e, index)}
                  onDrop={(e) => handleItemDrop(e, index)}
                  onDragEnd={handleItemDragEnd}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isDragOver
                      ? 'var(--accent-primary-subtle)'
                      : 'var(--bg-surface-elevated)',
                    border: isDragOver
                      ? '1px solid var(--accent-primary)'
                      : isDragged
                      ? '1px dashed var(--accent-primary)'
                      : '1px solid var(--border-default)',
                    boxShadow: isDragOver ? '0 4px 16px rgba(99, 102, 241, 0.25)' : 'none',
                    transform: isDragOver ? 'scale(1.015)' : 'none',
                    opacity: isDragged ? 0.35 : 1,
                    cursor: isDragged ? 'grabbing' : 'grab',
                    gap: '10px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {/* Left: Drag Handle, Position Rank badge & Component Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {/* Drag Handle */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDragOver ? 'var(--accent-primary)' : 'var(--text-muted)',
                        cursor: 'grab',
                        padding: '2px',
                        flexShrink: 0,
                        transition: 'color var(--transition-fast)',
                      }}
                      title="Drag row to reorder"
                    >
                      <GripVertical size={15} />
                    </div>

                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}
                    >
                      #{index + 1}
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        flexShrink: 0,
                      }}
                    >
                      {getSubtypeIcon(node.subtype)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {title}
                        </span>
                        <span
                          style={{
                            fontSize: '9.5px',
                            padding: '1px 5px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {node.subtype}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        canvas: x={Math.round(node.position?.x ?? 0)}, y={Math.round(node.position?.y ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Move Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMove(index, 'top')}
                      title="Move to Very Top"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: isFirst ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: isFirst ? 'not-allowed' : 'pointer',
                        opacity: isFirst ? 0.35 : 1,
                      }}
                    >
                      <ChevronsUp size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMove(index, 'up')}
                      title="Move Up"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: isFirst ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: isFirst ? 'not-allowed' : 'pointer',
                        opacity: isFirst ? 0.35 : 1,
                      }}
                    >
                      <ArrowUp size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMove(index, 'down')}
                      title="Move Down"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: isLast ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: isLast ? 'not-allowed' : 'pointer',
                        opacity: isLast ? 0.35 : 1,
                      }}
                    >
                      <ArrowDown size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMove(index, 'bottom')}
                      title="Move to Very Bottom"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: isLast ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: isLast ? 'not-allowed' : 'pointer',
                        opacity: isLast ? 0.35 : 1,
                      }}
                    >
                      <ChevronsDown size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            💡 Changes apply immediately to Live Preview and exported JSX code.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
