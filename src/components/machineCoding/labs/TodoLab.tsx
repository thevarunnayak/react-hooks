import React, { useState, useReducer, useEffect, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { Plus, Trash2, CheckCircle2, Circle, Edit2, Check, X, RotateCcw, Filter } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Newest First' },
  { value: 'priority', label: 'Priority' },
];

export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

type TaskAction =
  | { type: 'ADD'; payload: { title: string; priority: Priority } }
  | { type: 'TOGGLE'; payload: { id: string } }
  | { type: 'EDIT'; payload: { id: string; title: string } }
  | { type: 'DELETE'; payload: { id: string } }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'MARK_ALL_COMPLETED' }
  | { type: 'RESET_INITIAL' };

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Design component state machine architecture', completed: true, priority: 'high', createdAt: Date.now() - 3600000 },
  { id: '2', title: 'Implement keyboard accessibility (Tab, Enter, Esc)', completed: false, priority: 'medium', createdAt: Date.now() - 1800000 },
  { id: '3', title: 'Verify responsive layout on mobile viewports', completed: false, priority: 'high', createdAt: Date.now() - 900000 },
  { id: '4', title: 'Add local storage persistence fallback', completed: true, priority: 'low', createdAt: Date.now() - 300000 },
];

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD':
      return [
        {
          id: String(Date.now()),
          title: action.payload.title.trim(),
          completed: false,
          priority: action.payload.priority,
          createdAt: Date.now(),
        },
        ...state,
      ];
    case 'TOGGLE':
      return state.map((t) => (t.id === action.payload.id ? { ...t, completed: !t.completed } : t));
    case 'EDIT':
      return state.map((t) => (t.id === action.payload.id ? { ...t, title: action.payload.title.trim() } : t));
    case 'DELETE':
      return state.filter((t) => t.id !== action.payload.id);
    case 'CLEAR_COMPLETED':
      return state.filter((t) => !t.completed);
    case 'MARK_ALL_COMPLETED':
      return state.map((t) => ({ ...t, completed: true }));
    case 'RESET_INITIAL':
      return INITIAL_TASKS;
    default:
      return state;
  }
}

export const TodoLab: React.FC = () => {
  const [tasks, dispatch] = useReducer(taskReducer, [], () => {
    try {
      const saved = localStorage.getItem('mc_lab_todos');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [inputTitle, setInputTitle] = useState('');
  const [inputPriority, setInputPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('mc_lab_todos', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let list = tasks.filter((t) => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    });

    if (sortBy === 'priority') {
      const weight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
      list = [...list].sort((a, b) => weight[b.priority] - weight[a.priority]);
    } else {
      list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    }

    return list;
  }, [tasks, filter, sortBy]);

  const activeCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  const completedCount = tasks.length - activeCount;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    dispatch({ type: 'ADD', payload: { title: inputTitle, priority: inputPriority } });
    setInputTitle('');
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      dispatch({ type: 'EDIT', payload: { id, title: editingTitle } });
    }
    setEditingId(null);
  };

  const getPriorityBadgeVariant = (p: Priority) => {
    if (p === 'high') return 'danger';
    if (p === 'medium') return 'warning';
    return 'default';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 720, margin: '0 auto' }}>
      {/* Input Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          placeholder="What needs to be done? (e.g. Implement debounced search)"
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
          }}
        />
        <CustomSelect
          size="md"
          value={inputPriority}
          options={PRIORITY_OPTIONS}
          onChange={(val) => setInputPriority(val as Priority)}
        />
        <Button variant="primary" icon={<Plus size={15} />} type="submit">
          Add Task
        </Button>
      </form>

      {/* Filter and Control Bar */}
      <Card variant="glass" padding="sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'active', 'completed'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: filter === f ? 'var(--accent-primary)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: filter === f ? 700 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f} ({f === 'all' ? tasks.length : f === 'active' ? activeCount : completedCount})
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <Filter size={12} />
            <span>Sort:</span>
            <CustomSelect
              size="sm"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={(val) => setSortBy(val as 'date' | 'priority')}
            />
          </div>

          {completedCount > 0 && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
              style={{ color: 'var(--accent-danger)' }}
            >
              Clear Completed
            </Button>
          )}

          <Button
            size="xs"
            variant="ghost"
            icon={<RotateCcw size={11} />}
            onClick={() => dispatch({ type: 'RESET_INITIAL' })}
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filteredTasks.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No tasks found in this view.
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const isEditing = editingId === task.id;

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  gap: 12,
                }}
              >
                {/* Left checkbox & text */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE', payload: { id: task.id } })}
                    style={{ background: 'none', border: 'none', color: task.completed ? 'var(--accent-success)' : 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>

                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(task.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--accent-primary)',
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--text-sm)',
                        }}
                      />
                      <button onClick={() => handleSaveEdit(task.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-success)', cursor: 'pointer' }}>
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span
                      onDoubleClick={() => handleStartEdit(task)}
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                        cursor: 'pointer',
                      }}
                      title="Double-click to edit"
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                {/* Right badges & actions */}
                {!isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                      {task.priority}
                    </Badge>
                    <button
                      onClick={() => handleStartEdit(task)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      title="Edit title"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE', payload: { id: task.id } })}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: 4 }}
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        💡 Tip: Double-click any task title to edit. Tasks persist in your browser localStorage.
      </div>
    </div>
  );
};
