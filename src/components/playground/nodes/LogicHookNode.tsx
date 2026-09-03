import React, { useRef, useEffect } from 'react';
import { PlaygroundNode, NodePort } from '../../../types/playground';
import { PortHandle } from './PortHandle';
import { Cpu } from 'lucide-react';

export interface LogicHookNodeProps {
  node: PlaygroundNode;
  isSelected: boolean;
  isExecuting?: boolean;
  onNodeMouseDown: (id: string, e: React.MouseEvent) => void;
  onPortClick: (nodeId: string, port: NodePort, e: React.MouseEvent) => void;
  resolvedValue?: any;
  onResize?: (id: string, width: number, height: number) => void;
}

export const LogicHookNode: React.FC<LogicHookNodeProps> = ({
  node,
  isSelected,
  isExecuting,
  onNodeMouseDown,
  onPortClick,
  resolvedValue,
  onResize,
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
  const getSubtypeColor = () => {
    switch (node.subtype) {
      case 'useState':
        return 'var(--accent-primary)';
      case 'useEffect':
        return 'var(--accent-purple)';
      case 'useRef':
        return 'var(--accent-cyan)';
      case 'useReducer':
        return 'var(--accent-warning)';
      case 'useMemo':
        return '#10b981';
      case 'useCallback':
        return '#3b82f6';
      case 'useContext':
        return '#8b5cf6';
      case 'useId':
        return '#14b8a6';
      case 'useTransition':
        return '#f59e0b';
      case 'useLayoutEffect':
        return '#ec4899';
      case 'Timer':
        return 'var(--accent-danger)';
      default:
        return 'var(--accent-primary)';
    }
  };

  const renderHookDetails = () => {
    switch (node.subtype) {
      case 'useState': {
        const stateName = node.props.stateName || 'count';
        const displayVal = resolvedValue !== undefined ? resolvedValue : node.props.initialValue ?? 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '11px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Variable:</span>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {stateName}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '11px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Value:</span>
              <strong style={{ color: 'var(--accent-primary-text)', fontFamily: 'var(--font-mono)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {JSON.stringify(displayVal)}
              </strong>
            </div>
          </div>
        );
      }

      case 'useEffect':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Deps:</span>
              <code style={{ fontSize: '10px', color: 'var(--accent-purple)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.depsType === 'none' ? 'None (All)' : `[${node.props.deps?.join(', ') || ''}]`}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Task:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.effectTask || 'Title'}
              </span>
            </div>
            {node.props.hasCleanup !== false && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', color: 'var(--accent-warning)', minWidth: 0 }}>
                <span style={{ flexShrink: 0 }}>Cleanup:</span>
                <span style={{ maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>return () =&gt; ...</span>
              </div>
            )}
          </div>
        );

      case 'useRef':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Type:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                {node.props.refType === 'dom' ? 'DOM Element' : 'Mutable Val'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>.current:</span>
              <code style={{ fontSize: '10px', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {JSON.stringify(node.props.initialValue ?? 'null')}
              </code>
            </div>
          </div>
        );

      case 'useReducer':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Actions:</span>
              <span style={{ color: 'var(--accent-warning)', fontWeight: 600, maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                {(node.props.reducerActions || ['INC', 'DEC', 'RESET']).length} types
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Initial:</span>
              <code style={{ fontSize: '10px', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {JSON.stringify(node.props.reducerInitialState ?? 0)}
              </code>
            </div>
          </div>
        );

      case 'useMemo':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Expr:</span>
              <code style={{ fontSize: '10px', color: 'var(--accent-primary)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.memoExpression || 'count * 2'}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Deps:</span>
              <code style={{ fontSize: '10px', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                [{node.props.deps?.join(', ') || 'count'}]
              </code>
            </div>
          </div>
        );

      case 'useCallback':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Fn:</span>
              <strong style={{ color: 'var(--accent-primary)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.callbackFnName || 'handleClick'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Deps:</span>
              <code style={{ fontSize: '10px', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                [{node.props.deps?.join(', ') || 'count'}]
              </code>
            </div>
          </div>
        );

      case 'useContext':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Context:</span>
              <strong style={{ color: 'var(--text-primary)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.contextName || 'ThemeContext'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Value:</span>
              <code style={{ fontSize: '10px', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {JSON.stringify(node.props.initialValue ?? 'dark')}
              </code>
            </div>
          </div>
        );

      case 'useId':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Element:</span>
              <strong style={{ color: 'var(--text-primary)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.elementName || 'inputId'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Generated:</span>
              <code style={{ fontSize: '10px', color: '#14b8a6', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.prefix || ':r1:'}
              </code>
            </div>
          </div>
        );

      case 'useTransition':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Task:</span>
              <span style={{ color: '#f59e0b', fontWeight: 600, maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.transitionTask || 'filterResults'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>isPending:</span>
              <code style={{ fontSize: '10px', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {String(node.props.isPending || false)}
              </code>
            </div>
          </div>
        );

      case 'useLayoutEffect':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Timing:</span>
              <span style={{ color: '#ec4899', fontWeight: 600, maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                Pre-Paint Sync
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Task:</span>
              <span style={{ color: 'var(--text-primary)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 0 }}>
                {node.props.layoutTask || 'measureDOM'}
              </span>
            </div>
          </div>
        );

      case 'Timer':
        return (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', pointerEvents: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Interval: </span>
            <code style={{ maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.props.delay || 1000}ms</code>
          </div>
        );

      default:
        return null;
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
        backgroundColor: 'var(--bg-surface-elevated)',
        border: isSelected
          ? `2px solid ${getSubtypeColor()}`
          : isExecuting
          ? '2px solid var(--accent-warning)'
          : '1px solid var(--border-default)',
        boxShadow: isSelected
          ? `0 0 0 3px ${getSubtypeColor()}30, 0 8px 24px rgba(0, 0, 0, 0.25)`
          : isExecuting
          ? '0 0 0 3px rgba(245, 158, 11, 0.25), 0 8px 24px rgba(0, 0, 0, 0.25)'
          : '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        userSelect: 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        zIndex: isSelected ? 10 : 2,
        width: 'fit-content',
        minWidth: '220px',
        maxWidth: '380px',
        boxSizing: 'border-box',
      }}
      className={`canvas-node canvas-logic-node ${isExecuting ? 'animate-pulse' : ''}`}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '4px',
          gap: '6px',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Cpu size={14} style={{ color: getSubtypeColor(), flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.subtype}
          </span>
        </div>
        {isSelected ? (
          <span style={{ color: getSubtypeColor(), fontWeight: 700, fontSize: '9px', flexShrink: 0 }}>ACTIVE</span>
        ) : (
          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', flexShrink: 0 }}>REACT LOGIC</span>
        )}
      </div>

      {/* Details */}
      <div style={{ padding: '2px 0', minWidth: 0 }}>{renderHookDetails()}</div>

      {/* Ports Area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '6px',
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
    </div>
  );
};
