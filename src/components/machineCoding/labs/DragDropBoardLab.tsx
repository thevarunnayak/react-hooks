import React, { useState, useRef } from 'react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  Plus,
  GripVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';

export type ColumnId = 'todo' | 'in_progress' | 'done';

export type TagVariant = 'default' | 'cyan' | 'purple' | 'success';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  column: ColumnId;
  tag: string;
  tagVariant: TagVariant;
  createdAt: number;
}

const TAG_OPTIONS: { label: string; variant: TagVariant }[] = [
  { label: 'Feature', variant: 'default' },
  { label: 'Performance', variant: 'cyan' },
  { label: 'A11y', variant: 'purple' },
  { label: 'Architecture', variant: 'purple' },
  { label: 'Bug Fix', variant: 'default' },
  { label: 'Release', variant: 'success' },
];

const COLUMN_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Completed' },
];

const INITIAL_BOARD_CARDS: KanbanCard[] = [
  {
    id: 'c1',
    title: 'Audit Core Web Vitals (INP)',
    description: 'Investigate interaction-to-next-paint delays on heavy table rows.',
    column: 'todo',
    tag: 'Performance',
    tagVariant: 'cyan',
    createdAt: Date.now() - 40000,
  },
  {
    id: 'c2',
    title: 'Implement accessible Combobox ARIA',
    description: 'Ensure screen reader announcements and aria-expanded state sync.',
    column: 'todo',
    tag: 'A11y',
    tagVariant: 'purple',
    createdAt: Date.now() - 30000,
  },
  {
    id: 'c3',
    title: 'Simulate WebSocket stream order',
    description: 'Ensure out-of-order packets are buffered and dispatched sequentially.',
    column: 'in_progress',
    tag: 'Architecture',
    tagVariant: 'purple',
    createdAt: Date.now() - 20000,
  },
  {
    id: 'c4',
    title: 'Build Drag & Drop matrix tests',
    description: 'Verify cross-column and intra-column state transitions under stress.',
    column: 'in_progress',
    tag: 'Feature',
    tagVariant: 'default',
    createdAt: Date.now() - 10000,
  },
  {
    id: 'c5',
    title: 'Setup TypeScript strict null checks',
    description: 'Eliminate potential undefined property dereferences in tree nodes.',
    column: 'done',
    tag: 'Release',
    tagVariant: 'success',
    createdAt: Date.now() - 5000,
  },
];

export const DragDropBoardLab: React.FC = () => {
  const [cards, setCards] = useState<KanbanCard[]>(() => {
    try {
      const saved = localStorage.getItem('mc_lab_kanban');
      return saved ? JSON.parse(saved) : INITIAL_BOARD_CARDS;
    } catch {
      return INITIAL_BOARD_CARDS;
    }
  });

  // Drag & drop tracking state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Top Bar Add Card state
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [targetColumnForNew, setTargetColumnForNew] = useState<ColumnId>('todo');
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const [titleError, setTitleError] = useState(false);
  const [showDescInput, setShowDescInput] = useState(false);

  // In-Column Inline Add Card state
  const [activeInlineCol, setActiveInlineCol] = useState<ColumnId | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineDesc, setInlineDesc] = useState('');
  const [inlineTagIndex, setInlineTagIndex] = useState(0);
  const [inlineError, setInlineError] = useState(false);

  const topInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const saveCards = (next: KanbanCard[]) => {
    setCards(next);
    try {
      localStorage.setItem('mc_lab_kanban', JSON.stringify(next));
    } catch {}
  };

  // Helper to append a new card with visual flash
  const createAndAppendCard = (title: string, description: string, col: ColumnId, tagItem: { label: string; variant: TagVariant }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return false;

    const newId = 'card-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newCard: KanbanCard = {
      id: newId,
      title: trimmedTitle,
      description: description.trim() || undefined,
      column: col,
      tag: tagItem.label,
      tagVariant: tagItem.variant,
      createdAt: Date.now(),
    };

    saveCards([...cards, newCard]);
    setRecentlyAddedId(newId);
    setTimeout(() => setRecentlyAddedId(null), 1800);
    return true;
  };

  // Handle Top Form Submit
  const handleTopAddCard = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!newCardTitle.trim()) {
      setTitleError(true);
      topInputRef.current?.focus();
      return;
    }

    setTitleError(false);
    const tagItem = TAG_OPTIONS[selectedTagIndex] || TAG_OPTIONS[0];
    createAndAppendCard(newCardTitle, newCardDesc, targetColumnForNew, tagItem);

    setNewCardTitle('');
    setNewCardDesc('');
    setShowDescInput(false);
  };

  // Handle Column Inline Add Card
  const handleInlineAddCard = (col: ColumnId) => {
    if (!inlineTitle.trim()) {
      setInlineError(true);
      inlineInputRef.current?.focus();
      return;
    }

    setInlineError(false);
    const tagItem = TAG_OPTIONS[inlineTagIndex] || TAG_OPTIONS[0];
    createAndAppendCard(inlineTitle, inlineDesc, col, tagItem);

    setInlineTitle('');
    setInlineDesc('');
    setActiveInlineCol(null);
  };

  // Card Deletion
  const handleDeleteCard = (id: string) => {
    saveCards(cards.filter((c) => c.id !== id));
  };

  // Quick Move for Touch & Accessibility
  const handleMoveCard = (id: string, direction: 'left' | 'right') => {
    const order: ColumnId[] = ['todo', 'in_progress', 'done'];
    const card = cards.find((c) => c.id === id);
    if (!card) return;

    const currentIndex = order.indexOf(card.column);
    const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= order.length) return;

    const nextCol = order[nextIndex];
    saveCards(cards.map((c) => (c.id === id ? { ...c, column: nextCol } : c)));
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedCardId) return;

    const next = cards.map((c) => (c.id === draggedCardId ? { ...c, column: colId } : c));
    saveCards(next);
    setDraggedCardId(null);
  };

  const handleReset = () => {
    saveCards(INITIAL_BOARD_CARDS);
    setNewCardTitle('');
    setNewCardDesc('');
    setActiveInlineCol(null);
    setTitleError(false);
  };

  const COLUMNS: { id: ColumnId; label: string; icon: React.ReactNode; color: string; accentBg: string }[] = [
    {
      id: 'todo',
      label: 'To Do',
      icon: <Clock size={14} />,
      color: 'var(--accent-primary)',
      accentBg: 'rgba(37, 99, 235, 0.08)',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: <AlertCircle size={14} />,
      color: 'var(--accent-warning)',
      accentBg: 'rgba(234, 179, 8, 0.08)',
    },
    {
      id: 'done',
      label: 'Completed',
      icon: <CheckCircle2 size={14} />,
      color: 'var(--accent-success)',
      accentBg: 'rgba(34, 197, 94, 0.08)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 840, margin: '0 auto' }}>
      {/* Top Quick Add Bar */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <form onSubmit={handleTopAddCard} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Card Title Input */}
          <div style={{ flex: '1 1 240px', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input
              ref={topInputRef}
              type="text"
              value={newCardTitle}
              onChange={(e) => {
                setNewCardTitle(e.target.value);
                if (titleError && e.target.value.trim()) setTitleError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTopAddCard();
                }
              }}
              placeholder="New task card title..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${titleError ? 'var(--accent-danger)' : 'var(--border-default)'}`,
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                boxShadow: titleError ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            />
            {titleError && (
              <span style={{ fontSize: '11px', color: 'var(--accent-danger)', fontWeight: 500 }}>
                Please enter a card title
              </span>
            )}
          </div>

          {/* Column Selector */}
          <CustomSelect
            size="sm"
            value={targetColumnForNew}
            options={COLUMN_OPTIONS}
            onChange={(val) => setTargetColumnForNew(val as ColumnId)}
            ariaLabel="Select target column"
          />

          {/* Toggle Description Field */}
          <Button
            variant={showDescInput ? 'secondary' : 'ghost'}
            size="sm"
            type="button"
            icon={<FileText size={13} />}
            onClick={() => setShowDescInput(!showDescInput)}
            title="Add description"
          >
            {showDescInput ? 'Description' : '+ Note'}
          </Button>

          {/* Add Card Button */}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            type="submit"
            onClick={handleTopAddCard}
          >
            Add Card
          </Button>

          {/* Reset Board */}
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={13} />}
            onClick={handleReset}
            type="button"
            title="Reset board to default cards"
          >
            Reset
          </Button>
        </form>

        {/* Expandable Optional Description & Tag Selector in Top Bar */}
        {showDescInput && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)',
              animation: 'fadeIn 0.15s ease',
            }}
          >
            <input
              type="text"
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTopAddCard();
                }
              }}
              placeholder="Card description or acceptance criteria (optional)..."
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Tag:</span>
              {TAG_OPTIONS.map((tag, idx) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setSelectedTagIndex(idx)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${selectedTagIndex === idx ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    backgroundColor: selectedTagIndex === idx ? 'var(--accent-primary-subtle)' : 'transparent',
                    color: selectedTagIndex === idx ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Board Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 14 }}>
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col.id);
          const isOver = dragOverCol === col.id;
          const isInlineAdding = activeInlineCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                borderRadius: 'var(--radius-xl)',
                backgroundColor: isOver ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                border: `1.5px solid ${isOver ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 380,
                transition: 'all var(--transition-fast)',
                boxShadow: isOver ? '0 0 0 3px var(--accent-primary-subtle)' : 'none',
              }}
            >
              {/* Column Header with Quick Add Action */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 8,
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 700, color: col.color }}>
                  {col.icon}
                  <span>{col.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge variant="default" size="sm">
                    {colCards.length}
                  </Badge>

                  {/* Header Add Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInlineCol(isInlineAdding ? null : col.id);
                      setInlineTitle('');
                      setInlineDesc('');
                      setInlineError(false);
                      setTimeout(() => inlineInputRef.current?.focus(), 50);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: isInlineAdding ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                      color: isInlineAdding ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={`Add new card to ${col.label}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Cards List in column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {colCards.map((card) => {
                  const isBeingDragged = draggedCardId === card.id;
                  const isJustAdded = recentlyAddedId === card.id;

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragEnd={() => setDraggedCardId(null)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isBeingDragged
                          ? 'var(--bg-subtle)'
                          : isJustAdded
                          ? 'var(--accent-primary-subtle)'
                          : 'var(--bg-surface-elevated)',
                        border: `1px solid ${isJustAdded ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        boxShadow: isBeingDragged ? 'none' : '0 2px 6px rgba(0,0,0,0.06)',
                        cursor: 'grab',
                        opacity: isBeingDragged ? 0.35 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'transform 0.15s ease, border-color 0.3s ease, background-color 0.3s ease',
                      }}
                    >
                      {/* Card Title & Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {card.title}
                        </span>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 2,
                            borderRadius: 4,
                          }}
                          title="Delete card"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Card Description (if present) */}
                      {card.description && (
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {card.description}
                        </p>
                      )}

                      {/* Card Footer: Tag Badge, Column Move Controls, Drag Handle */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
                        <Badge variant={card.tagVariant} size="sm">
                          {card.tag}
                        </Badge>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {/* Quick Shift Left */}
                          {col.id !== 'todo' && (
                            <button
                              type="button"
                              onClick={() => handleMoveCard(card.id, 'left')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                border: '1px solid var(--border-default)',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                              }}
                              title="Move card left"
                            >
                              <ChevronLeft size={11} />
                            </button>
                          )}

                          {/* Quick Shift Right */}
                          {col.id !== 'done' && (
                            <button
                              type="button"
                              onClick={() => handleMoveCard(card.id, 'right')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                border: '1px solid var(--border-default)',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                              }}
                              title="Move card right"
                            >
                              <ChevronRight size={11} />
                            </button>
                          )}

                          <GripVertical size={13} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty Drop Zone Message */}
                {colCards.length === 0 && !isInlineAdding && (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      padding: 24,
                      textAlign: 'center',
                      gap: 4,
                    }}
                  >
                    <span>No cards in {col.label}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Drag cards here or click + Add Card</span>
                  </div>
                )}

                {/* Inline Card Composer inside this Column */}
                {isInlineAdding && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${inlineError ? 'var(--accent-danger)' : 'var(--accent-primary)'}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      animation: 'fadeIn 0.15s ease',
                    }}
                  >
                    <input
                      ref={inlineInputRef}
                      type="text"
                      value={inlineTitle}
                      onChange={(e) => {
                        setInlineTitle(e.target.value);
                        if (inlineError && e.target.value.trim()) setInlineError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInlineAddCard(col.id);
                        } else if (e.key === 'Escape') {
                          setActiveInlineCol(null);
                        }
                      }}
                      placeholder={`Card title for ${col.label}...`}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-xs)',
                        outline: 'none',
                      }}
                    />

                    <input
                      type="text"
                      value={inlineDesc}
                      onChange={(e) => setInlineDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInlineAddCard(col.id);
                        } else if (e.key === 'Escape') {
                          setActiveInlineCol(null);
                        }
                      }}
                      placeholder="Optional notes or details..."
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                        outline: 'none',
                      }}
                    />

                    {/* Tag Selector Chips */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {TAG_OPTIONS.map((tag, idx) => (
                        <button
                          key={tag.label}
                          type="button"
                          onClick={() => setInlineTagIndex(idx)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: `1px solid ${inlineTagIndex === idx ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                            backgroundColor: inlineTagIndex === idx ? 'var(--accent-primary-subtle)' : 'transparent',
                            color: inlineTagIndex === idx ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>

                    {/* Inline Actions */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', paddingTop: 2 }}>
                      <Button
                        variant="ghost"
                        size="xs"
                        type="button"
                        icon={<X size={12} />}
                        onClick={() => {
                          setActiveInlineCol(null);
                          setInlineError(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        type="button"
                        icon={<Plus size={12} />}
                        onClick={() => handleInlineAddCard(col.id)}
                      >
                        Add Card
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Column Footer: "+ Add a card" Button */}
              {!isInlineAdding && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveInlineCol(col.id);
                    setInlineTitle('');
                    setInlineDesc('');
                    setInlineError(false);
                    setTimeout(() => inlineInputRef.current?.focus(), 50);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-default)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Plus size={13} />
                  <span>Add a card</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Tip: Drag cards across columns or use the ← → buttons.</span>
        <span>State automatically saved to localStorage</span>
      </div>
    </div>
  );
};
