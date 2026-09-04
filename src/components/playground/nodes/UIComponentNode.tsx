import React, { useRef, useEffect } from 'react';
import { PlaygroundNode, NodePort } from '../../../types/playground';
import { UISubtype } from '../../../constants/enums';
import { t } from '../../../i18n/i18n';
import { PortHandle } from './PortHandle';
import { Check, ChevronDown, Database, ShoppingBag, Plus, Layers, MessageSquare, Ruler, Palette, Moon, Sun } from 'lucide-react';

export interface UIComponentNodeProps {
  node: PlaygroundNode;
  isSelected: boolean;
  isExecuting?: boolean;
  onNodeMouseDown: (id: string, e: React.MouseEvent) => void;
  onPortClick: (nodeId: string, port: NodePort, e: React.MouseEvent) => void;
  resolvedProps?: Record<string, any>;
  parentLabel?: string;
  childNodes?: PlaygroundNode[];
  onResize?: (id: string, width: number, height: number) => void;
  onUpdateProps?: (id: string, newProps: Record<string, any>) => void;
}

export const UIComponentNode: React.FC<UIComponentNodeProps> = ({
  node,
  isSelected,
  isExecuting,
  onNodeMouseDown,
  onPortClick,
  resolvedProps = {},
  parentLabel,
  childNodes = [],
  onResize,
  onUpdateProps,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nodeRef.current || !onResize) return;
    const el = nodeRef.current;
    onResize(node.id, el.offsetWidth, el.offsetHeight);

    const ro = new ResizeObserver(() => {
      if (el) {
        onResize(node.id, el.offsetWidth, el.offsetHeight);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [node.id, onResize]);

  const content = resolvedProps.content !== undefined ? resolvedProps.content : node.props.content || '';

  const renderVisualUI = () => {
    switch (node.subtype) {
      case 'Button':
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 14px',
              backgroundColor:
                node.props.variant === 'primary'
                  ? 'var(--accent-primary)'
                  : node.props.variant === 'danger'
                  ? 'var(--accent-danger)'
                  : 'var(--bg-surface-elevated)',
              color:
                node.props.variant === 'primary' || node.props.variant === 'danger'
                  ? '#ffffff'
                  : 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {content || 'Button'}
          </div>
        );

      case 'Text':
        return (
          <div
            style={{
              fontSize: `${node.props.fontSize || 14}px`,
              color: 'var(--text-primary)',
              fontWeight: 500,
              lineHeight: 1.4,
              padding: '4px',
              width: '100%',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              pointerEvents: 'none',
            }}
          >
            {content || 'Count: 0'}
          </div>
        );

      case 'Heading':
        return (
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              padding: '4px',
              width: '100%',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              lineHeight: 1.3,
              pointerEvents: 'none',
            }}
          >
            {content || 'Heading Title'}
          </div>
        );

      case 'Input':
        return (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {content || node.props.placeholder || 'Enter text...'}
          </div>
        );

      case 'Card':
      case 'Container':
        if (node.props.variant === 'cart') {
          return (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {node.props.title || 'Cart Items'}
                  </span>
                </div>
                <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  Active Cart
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{content || 'Cart Summary'}</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>-10% VIP</span>
              </div>
            </div>
          );
        }
        if (node.props.variant === 'tooltip') {
          return (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={13} style={{ color: '#ec4899' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {node.props.title || 'Floating Tooltip'}
                  </span>
                </div>
                <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontWeight: 700 }}>
                  Pre-Paint Sync
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {content || 'Zero-flicker pre-paint tooltip'}
              </div>
            </div>
          );
        }
        if (node.props.variant === 'metrics') {
          return (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ruler size={13} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {node.props.title || 'DOM Bounding Box'}
                  </span>
                </div>
                <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', fontWeight: 700 }}>
                  Live Rect
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {content || 'BoundingBox metrics'}
              </div>
            </div>
          );
        }
        if (node.props.variant === 'themeConsumer') {
          return (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={13} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {node.props.title || 'Theme Consumer'}
                  </span>
                </div>
                <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontWeight: 700 }}>
                  useContext
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {content || 'Direct Context Consumer (0 Props Drilled)'}
              </div>
            </div>
          );
        }
        if (node.props.variant === 'responsiveLayout') {
          return (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {node.props.content || 'Responsive Layout Grid'}
                </span>
                <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                  useLayoutEffect
                </span>
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                Adaptive 1/2/3/4 Column Grid (0ms flicker)
              </div>
            </div>
          );
        }
        return (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              boxSizing: 'border-box',
              minHeight: '70px',
              wordBreak: 'break-word',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              &lt;{node.subtype} /&gt;
            </div>
            <div style={{ fontSize: '12px' }}>{content || 'Container Content'}</div>
          </div>
        );

      case 'Kanban':
        return (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {node.props.title || 'Kanban Task Board'}
              </span>
              <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontWeight: 700 }}>
                Drag & Drop
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {[
                { title: 'Todo', color: '#6366f1' },
                { title: 'Progress', color: '#f59e0b' },
                { title: 'Done', color: '#10b981' },
              ].map((c) => (
                <div
                  key={c.title}
                  style={{
                    padding: '4px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: c.color }}>{c.title}</span>
                  <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: 'var(--bg-surface-elevated)' }} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'Switch':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', boxSizing: 'border-box', pointerEvents: 'none' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              {content || node.props.label || 'Toggle'}
            </span>
            <div
              style={{
                width: '36px',
                height: '20px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: node.props.checked ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: '2px',
                  left: node.props.checked ? '18px' : '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </div>
        );

      case 'Dropdown':
        return (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              pointerEvents: 'none',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
              {content || (node.props.options ? node.props.options[0] : 'Select option...')}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
        );

      case 'Slider':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {content || node.props.label || 'Range'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)', flexShrink: 0 }}>
                {node.props.initialValue ?? 50}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '50%',
                  height: '100%',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            </div>
          </div>
        );

      case 'Checkbox':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', pointerEvents: 'none' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: node.props.checked ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {node.props.checked && <Check size={11} strokeWidth={3} />}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
              {content || node.props.label || 'Checkbox option'}
            </span>
          </div>
        );

      case 'Form': {
        const isMulti = Boolean(node.props.isMultiStep || (Array.isArray(node.props.steps) && node.props.steps.length > 1));
        const steps: string[] = Array.isArray(node.props.steps) && node.props.steps.length > 0
          ? node.props.steps
          : isMulti
          ? ['Step 1: Account', 'Step 2: Profile']
          : ['Step 1'];

        const activeStep = node.props.activeStep || 1;

        const handleAddStep = (e: React.MouseEvent) => {
          e.stopPropagation();
          const nextStepNum = steps.length + 1;
          const nextStepName = `Step ${nextStepNum}`;
          const newSteps = [...steps, nextStepName];
          onUpdateProps?.(node.id, {
            isMultiStep: true,
            steps: newSteps,
            activeStep: nextStepNum,
          });
        };

        return (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--accent-primary)',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={11} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {isMulti ? `Wizard Form (${steps.length} Steps)` : '<form onSubmit />'}
                </span>
              </div>
              <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--accent-primary-subtle)', color: 'var(--accent-primary-text)', fontWeight: 600, flexShrink: 0 }}>
                {childNodes.length === 1
                  ? t('playground.canvas.fieldsCount', { count: childNodes.length })
                  : t('playground.canvas.fieldsCountPlural', { count: childNodes.length })}
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {content || t('playground.canvas.formCardBadge')}
            </div>

            {/* Steps Pills & "+ Add Step" Interactive Canvas Action */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '4px',
                marginTop: '2px',
                pointerEvents: 'auto',
              }}
            >
              {steps.map((stepName, idx) => {
                const stepNum = idx + 1;
                const isActive = stepNum === activeStep;
                return (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateProps?.(node.id, { activeStep: stepNum });
                    }}
                    title={`Step ${stepNum}: ${stepName} (Click to set active)`}
                    style={{
                      fontSize: '9.5px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <span style={{ opacity: 0.8 }}>#{stepNum}</span>
                    <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stepName}
                    </span>
                  </span>
                );
              })}

              <button
                type="button"
                onClick={handleAddStep}
                title="Add a new step to this form"
                style={{
                  padding: '2px 7px',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  border: '1px dashed var(--accent-primary)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'all 150ms ease',
                }}
              >
                <Plus size={10} strokeWidth={3} />
                <span>Add Step</span>
              </button>
            </div>

            {/* Form Fields Tag List */}
            {childNodes.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px', pointerEvents: 'none' }}>
                {childNodes.map((child) => (
                  <span
                    key={child.id}
                    style={{
                      fontSize: '9.5px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {child.props.step && (
                      <span style={{ fontSize: '8.5px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                        S{child.props.step}
                      </span>
                    )}
                    <span>{child.subtype}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', pointerEvents: 'none' }}>
                Empty form. Add fields in Inspector.
              </div>
            )}
          </div>
        );
      }

      case 'Badge':
        return (
          <div
            style={{
              display: 'inline-flex',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-subtle)',
              color: 'var(--accent-primary-text)',
              fontSize: '11px',
              fontWeight: 600,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {content || 'Badge'}
          </div>
        );

      case 'DummyData': {
        const items: string[] = node.props.items || ['React', 'Next.js', 'TypeScript', 'Tailwind'];
        const presetKey = node.props.datasetPreset;
        const displayStyle = node.props.displayStyle;
        return (
          <div
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                <Database size={12} style={{ color: '#6366f1', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {node.props.title || 'MOCK DATA'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {presetKey && (
                  <span style={{ fontSize: '8px', padding: '1px 4px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                    {presetKey}
                  </span>
                )}
                {displayStyle && (
                  <span style={{ fontSize: '8px', padding: '1px 4px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>
                    {displayStyle}
                  </span>
                )}
                <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                  {node.props.totalCount ? `${node.props.totalCount.toLocaleString()} items` : `${items.length} items`}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {items.slice(0, 4).map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: '8.5px',
                    padding: '1px 4px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item}
                </span>
              ))}
              {items.length > 4 && (
                <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', flexShrink: 0 }}>+{items.length - 4}</span>
              )}
            </div>
          </div>
        );
      }

      default:
        return <div style={{ pointerEvents: 'none', width: '100%', wordBreak: 'break-word' }}>{content}</div>;
    }
  };

  return (
    <div
      ref={nodeRef}
      onMouseDown={(e) => onNodeMouseDown(node.id, e)}
      style={{
        position: 'absolute',
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        cursor: 'grab',
        padding: '10px 12px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        border: isSelected
          ? '2px solid var(--accent-primary)'
          : isExecuting
          ? '2px solid var(--accent-warning)'
          : '1px solid var(--border-default)',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(59, 130, 246, 0.25), 0 8px 24px rgba(0, 0, 0, 0.25)'
          : isExecuting
          ? '0 0 0 3px rgba(245, 158, 11, 0.25), 0 8px 24px rgba(0, 0, 0, 0.25)'
          : '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        userSelect: 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        zIndex: isSelected ? 10 : 2,
        width: 'fit-content',
        minWidth: '220px',
        maxWidth: '380px',
        boxSizing: 'border-box',
      }}
      className={`canvas-node canvas-ui-node ${isExecuting ? 'animate-pulse' : ''}`}
    >
      {/* Node Top Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '4px',
          marginBottom: '2px',
          gap: '6px',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.subtype}
          </span>
          {parentLabel && (
            <span
              style={{
                fontSize: '8.5px',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                border: '1px solid rgba(59, 130, 246, 0.3)',
                flexShrink: 0,
              }}
            >
              {t('playground.canvas.inParentBadge', { parent: parentLabel })}
            </span>
          )}
        </div>
        {isSelected && (
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '9px', flexShrink: 0 }}>ACTIVE</span>
        )}
      </div>

      {/* Visual Component Render */}
      <div style={{ padding: '2px', minWidth: 0 }}>{renderVisualUI()}</div>

      {/* Ports Area */}
      {(node.inPorts.length > 0 || node.outPorts.length > 0) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '6px',
            marginTop: '4px',
            gap: '12px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            {node.inPorts.map((port) => (
              <PortHandle key={port.id} port={port} onPortClick={(p, e) => onPortClick(node.id, p, e)} />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0, marginLeft: 'auto' }}>
            {node.outPorts.map((port) => (
              <PortHandle key={port.id} port={port} onPortClick={(p, e) => onPortClick(node.id, p, e)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
