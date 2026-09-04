import React, { useState, useRef } from 'react';
import {
  Edit3,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  BookOpen,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { NoteEntry } from '../../types/storage';

// Format relative timestamp helper
function formatTimestamp(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 45) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format full date & time for tooltip helper
function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface PersonalNotesSectionProps {
  targetId: string;
  targetName: string;
  title?: string;
}

export const PersonalNotesSection: React.FC<PersonalNotesSectionProps> = ({
  targetId,
  targetName,
  title = 'My Personal Notes',
}) => {
  const { notes, addNote, updateNote, deleteNote } = usePersonalNotes(targetId);

  // New Note Input State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Copied Note Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle adding a new note
  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    const added = addNote(newNoteContent);
    if (added) {
      setNewNoteContent('');
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Keyboard shortcut: Cmd+Enter / Ctrl+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    }
  };

  // Start editing a note
  const handleStartEdit = (note: NoteEntry) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  // Save edited note
  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) return;
    updateNote(id, editContent);
    setEditingId(null);
    setEditContent('');
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Copy note content to clipboard
  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <Card
      variant="glass"
      padding="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* 1. Header with metadata badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary-subtle)',
              color: 'var(--accent-primary)',
            }}
          >
            <BookOpen size={15} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </span>
            <Badge variant="default" size="sm">
              {targetName}
            </Badge>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={notes.length > 0 ? 'primary' : 'default'} size="sm">
            {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
          </Badge>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Notes Table (Local)
          </span>
        </div>
      </div>

      {/* 2. New Note Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Add a new note, key observation, or edge-case gotcha for ${targetName}... (⌘+Enter to save)`}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CornerDownLeft size={11} />
            <span>
              Tip: Press <kbd style={{ padding: '2px 4px', borderRadius: '3px', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>⌘/Ctrl+Enter</kbd> to save entry
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {newNoteContent.length > 0 && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setNewNoteContent('')}
              >
                Clear
              </Button>
            )}
            <Button
              size="xs"
              variant="primary"
              icon={justAdded ? <Check size={12} /> : <Plus size={12} />}
              disabled={!newNoteContent.trim()}
              onClick={handleAddNote}
            >
              {justAdded ? 'Added!' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Notes Table / List Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
        {notes.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-5)',
              textAlign: 'center',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px dashed var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Edit3 size={18} style={{ color: 'var(--text-muted)' }} />
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              No notes recorded yet for {targetName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '380px' }}>
              Add multiple entries above to track mental models, gotchas, or interview takeaways. Each note is saved in your local notes table with an ID and timestamp.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Saved Entries ({notes.length})</span>
              <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>
                Sorted newest first
              </span>
            </div>

            {notes.map((note) => {
              const isEditing = editingId === note.id;
              const isCopied = copiedId === note.id;

              return (
                <div
                  key={note.id}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                  }}
                >
                  {/* Note Card Header: ID, Date, Action buttons */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '6px',
                      fontSize: '11px',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--accent-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                        }}
                      >
                        #{note.id.length > 18 ? `${note.id.slice(0, 10)}...${note.id.slice(-4)}` : note.id}
                      </span>
                      <span
                        style={{
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title={formatFullDate(note.createdAt)}
                      >
                        <Clock size={11} />
                        {formatTimestamp(note.createdAt)}
                      </span>
                      {note.updatedAt && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--accent-purple)',
                            fontStyle: 'italic',
                          }}
                          title={`Updated ${formatFullDate(note.updatedAt)}`}
                        >
                          (edited)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={isCopied ? <Check size={11} style={{ color: 'var(--accent-success)' }} /> : <Copy size={11} />}
                        onClick={() => handleCopyNote(note.id, note.content)}
                        title="Copy note text"
                        style={{ height: '22px', padding: '2px 6px', fontSize: '10px' }}
                      >
                        {isCopied ? 'Copied' : 'Copy'}
                      </Button>

                      {!isEditing && (
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={<Edit3 size={11} />}
                          onClick={() => handleStartEdit(note)}
                          title="Edit note"
                          style={{ height: '22px', padding: '2px 6px', fontSize: '10px' }}
                        >
                          Edit
                        </Button>
                      )}

                      <Button
                        size="xs"
                        variant="ghost"
                        icon={<Trash2 size={11} style={{ color: 'var(--accent-danger)' }} />}
                        onClick={() => deleteNote(note.id)}
                        title="Delete note"
                        style={{ height: '22px', padding: '2px 6px', fontSize: '10px' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Note Content / Inline Edit Form */}
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--accent-primary)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          lineHeight: 1.4,
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={<X size={11} />}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="xs"
                          variant="primary"
                          icon={<Check size={11} />}
                          disabled={!editContent.trim()}
                          onClick={() => handleSaveEdit(note.id)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                        lineHeight: 1.55,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        paddingTop: '2px',
                      }}
                    >
                      {note.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
