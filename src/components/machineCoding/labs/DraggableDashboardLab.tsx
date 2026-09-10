import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  GripVertical,
  TrendingUp,
  Users,
  Activity,
  Server,
  GitCommit,
  DollarSign,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export interface DashboardWidget {
  id: string;
  title: string;
  category: 'metric' | 'chart' | 'activity' | 'system';
  icon: React.ReactNode;
  visible: boolean;
  value: string;
  change: string;
  isPositive: boolean;
  details?: string;
  history?: number[];
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'rev',
    title: 'Monthly Recurring Revenue',
    category: 'metric',
    icon: <DollarSign size={16} style={{ color: '#10b981' }} />,
    visible: true,
    value: '$84,920',
    change: '+14.2%',
    isPositive: true,
    details: 'Target: $90,000 / mo',
    history: [45, 52, 58, 65, 72, 80, 85],
  },
  {
    id: 'users',
    title: 'Real-Time Active Users',
    category: 'metric',
    icon: <Users size={16} style={{ color: '#3b82f6' }} />,
    visible: true,
    value: '3,842',
    change: '+8.6%',
    isPositive: true,
    details: 'Pulsing across 48 regions',
    history: [28, 32, 35, 30, 36, 37, 38],
  },
  {
    id: 'health',
    title: 'Kubernetes Cluster Health',
    category: 'system',
    icon: <Server size={16} style={{ color: '#8b5cf6' }} />,
    visible: true,
    value: '99.99%',
    change: 'Normal',
    isPositive: true,
    details: '32 Nodes • 128 Pods Active',
    history: [99, 99, 100, 99, 100, 100, 100],
  },
  {
    id: 'latency',
    title: 'Edge API P99 Latency',
    category: 'system',
    icon: <Activity size={16} style={{ color: '#f59e0b' }} />,
    visible: true,
    value: '14.2 ms',
    change: '-2.4ms',
    isPositive: true,
    details: 'Global CDN edge cache hit 96.8%',
    history: [18, 17, 16, 15, 14, 15, 14],
  },
  {
    id: 'growth',
    title: 'Conversion Funnel Rate',
    category: 'metric',
    icon: <TrendingUp size={16} style={{ color: '#ec4899' }} />,
    visible: true,
    value: '4.86%',
    change: '+0.4%',
    isPositive: true,
    details: 'Checkout stage up 12% WoW',
    history: [3.8, 4.0, 4.2, 4.3, 4.5, 4.7, 4.8],
  },
  {
    id: 'deploy',
    title: 'Recent Production Deployments',
    category: 'activity',
    icon: <GitCommit size={16} style={{ color: '#06b6d4' }} />,
    visible: true,
    value: 'v2.14.0',
    change: 'Success',
    isPositive: true,
    details: 'Passed 482 CI regression checks',
    history: [1, 2, 2, 3, 3, 4, 5],
  },
];

export const DraggableDashboardLab: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [columns, setColumns] = useState<'2' | '3'>('3');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live simulation tick
  useEffect(() => {
    if (!isLiveStreaming) {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      return;
    }

    liveIntervalRef.current = setInterval(() => {
      setWidgets((prev) =>
        prev.map((w) => {
          if (w.id === 'users') {
            const delta = Math.floor(Math.random() * 31) - 15;
            const currentNum = parseInt(w.value.replace(/,/g, ''), 10);
            const nextVal = Math.max(1000, currentNum + delta);
            return {
              ...w,
              value: nextVal.toLocaleString(),
              change: delta >= 0 ? `+${(Math.random() * 2 + 7).toFixed(1)}%` : `-${(Math.random() * 1.5).toFixed(1)}%`,
              isPositive: delta >= 0,
            };
          }
          if (w.id === 'latency') {
            const nextLat = (13.5 + Math.random() * 2).toFixed(1);
            return {
              ...w,
              value: `${nextLat} ms`,
            };
          }
          return w;
        })
      );
    }, 2500);

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [isLiveStreaming]);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default browser shadow
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (targetId !== dragOverId && targetId !== draggedId) {
      setDragOverId(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    setWidgets((prev) => {
      const fromIndex = prev.findIndex((w) => w.id === draggedId);
      const toIndex = prev.findIndex((w) => w.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Keyboard / Click reorder actions
  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    setWidgets((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, item);
      return copy;
    });
  };

  // Visibility toggle
  const toggleVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  // Reset to default
  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    setColumns('3');
  };

  const visibleWidgets = widgets.filter((w) => w.visible);
  const hiddenWidgets = widgets.filter((w) => !w.visible);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Controls Card */}
      <Card variant="glass" padding="md">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                Interactive Widget Grid & Dashboard
              </h3>
              {isLiveStreaming && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '11px',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                  LIVE FEED
                </span>
              )}
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Grab the left drag handle to reorder cards via HTML5 Drag & Drop. Supports keyboard positioning and live metrics.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ width: 140 }}>
              <CustomSelect
                value={columns}
                onChange={(val) => setColumns(val as '2' | '3')}
                options={[
                  { value: '2', label: '2 Columns' },
                  { value: '3', label: '3 Columns' },
                ]}
              />
            </div>

            <Button
              size="sm"
              variant={isLiveStreaming ? 'secondary' : 'primary'}
              icon={isLiveStreaming ? <Pause size={14} /> : <Play size={14} />}
              onClick={() => setIsLiveStreaming((p) => !p)}
            >
              {isLiveStreaming ? 'Pause Live' : 'Resume Live'}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={resetLayout}
            >
              Reset Layout
            </Button>
          </div>
        </div>

        {/* Hidden Widgets Tray if any are toggled off */}
        {hiddenWidgets.length > 0 && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Hidden widgets (click to restore):
            </span>
            {hiddenWidgets.map((hw) => (
              <Button
                key={hw.id}
                size="sm"
                variant="ghost"
                icon={<Plus size={12} />}
                onClick={() => toggleVisibility(hw.id)}
              >
                {hw.title}
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Grid of Draggable Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            columns === '2'
              ? 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))'
              : 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 16,
        }}
      >
        {visibleWidgets.map((widget, index) => {
          const isDraggingThis = draggedId === widget.id;
          const isTargetedOver = dragOverId === widget.id;

          return (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, widget.id)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: isDraggingThis ? 0.35 : 1,
                transform: isTargetedOver ? 'scale(1.02)' : 'none',
                transition: 'transform 0.15s ease, opacity 0.15s ease',
                cursor: 'grab',
                position: 'relative',
              }}
            >
              <Card
                variant="glass"
                padding="md"
                style={{
                  height: '100%',
                  border: isTargetedOver
                    ? '2px dashed var(--primary-color, #3b82f6)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isTargetedOver
                    ? '0 0 20px rgba(59, 130, 246, 0.25)'
                    : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                {/* Header with Drag Handle & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      title="Drag to reorder"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-muted)',
                        cursor: 'grab',
                        padding: '2px',
                      }}
                    >
                      <GripVertical size={16} />
                    </div>
                    {widget.icon}
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-color)',
                      }}
                    >
                      {widget.title}
                    </span>
                  </div>

                  {/* Reorder Buttons & Hide */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <button
                      title="Move backward"
                      disabled={index === 0}
                      onClick={() => moveWidget(index, 'up')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: index === 0 ? 'rgba(255,255,255,0.2)' : 'var(--text-muted)',
                        cursor: index === 0 ? 'default' : 'pointer',
                        padding: 3,
                        display: 'flex',
                      }}
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      title="Move forward"
                      disabled={index === visibleWidgets.length - 1}
                      onClick={() => moveWidget(index, 'down')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color:
                          index === visibleWidgets.length - 1
                            ? 'rgba(255,255,255,0.2)'
                            : 'var(--text-muted)',
                        cursor:
                          index === visibleWidgets.length - 1 ? 'default' : 'pointer',
                        padding: 3,
                        display: 'flex',
                      }}
                    >
                      <MoveDown size={13} />
                    </button>
                    <button
                      title="Hide widget"
                      onClick={() => toggleVisibility(widget.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 3,
                        display: 'flex',
                        marginLeft: 4,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Primary Metric Number & Change */}
                <div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: 'var(--text-color)',
                    }}
                  >
                    {widget.value}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <Badge
                      variant={
                        widget.change === 'Normal' || widget.change === 'Success'
                          ? 'success'
                          : widget.isPositive
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {widget.change}
                    </Badge>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {widget.details}
                    </span>
                  </div>
                </div>

                {/* Mini Visual Bar / Sparkline */}
                {widget.history && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 4,
                      height: 32,
                      paddingTop: 8,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {widget.history.map((val, hIdx) => {
                      const max = Math.max(...(widget.history || [1]));
                      const heightPct = Math.round((val / max) * 100);
                      return (
                        <div
                          key={hIdx}
                          style={{
                            flex: 1,
                            height: `${heightPct}%`,
                            backgroundColor:
                              hIdx === widget.history!.length - 1
                                ? 'var(--primary-color, #3b82f6)'
                                : 'rgba(59, 130, 246, 0.25)',
                            borderRadius: '2px 2px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--primary-color, #3b82f6)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>HTML5 Drag & Drop Pipeline</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Utilizes native browser drag events (dragstart, dragover, drop) with dataTransfer payload passing for smooth compositor-level rendering.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--primary-color, #3b82f6)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Zero-Jank Target Swapping</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Item reordering employs array splice operations coupled with drop-target highlights so cards do not thrash layouts while in motion.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--primary-color, #3b82f6)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Live Reactive Streams</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Demonstrates uninterrupted real-time streaming data updates while widgets are dynamically reordered, hidden, or resized.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
