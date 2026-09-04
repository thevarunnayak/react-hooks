import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PlaygroundNode, PlaygroundConnection, NodePort } from '../../../types/playground';
import { UIComponentNode } from '../nodes/UIComponentNode';
import { LogicHookNode } from '../nodes/LogicHookNode';
import { CanvasConnection } from './CanvasConnection';
import { Eye, ArrowRight, Link } from 'lucide-react';

export interface VisualCanvasProps {
  nodes: PlaygroundNode[];
  connections: PlaygroundConnection[];
  selectedNodeId: string | null;
  selectedConnectionId?: string | null;
  highlightedNodeId?: string | null;
  highlightedConnectionId?: string | null;
  onSelectNode: (id: string | null) => void;
  onSelectConnection?: (id: string | null) => void;
  onMoveNode: (id: string, newPos: { x: number; y: number }) => void;
  onConnect: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => void;
  onSwitchToPreview?: () => void;
  onZoomChange?: (newZoom: number) => void;
  onDeleteNode?: (id: string) => void;
  onDeleteConnection?: (id: string) => void;
  onUpdateProps?: (nodeId: string, updatedProps: Record<string, any>) => void;
  resolvedValues?: Record<string, any>;
  zoom?: number;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  highlightedNodeId,
  highlightedConnectionId,
  onSelectNode,
  onSelectConnection,
  onMoveNode,
  onConnect,
  onSwitchToPreview,
  onZoomChange,
  onDeleteNode,
  onDeleteConnection,
  onUpdateProps,
  resolvedValues = {},
  zoom = 0.8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const [nodeDimensions, setNodeDimensions] = useState<Record<string, { width: number; height: number }>>({});

  const handleNodeResize = useCallback((id: string, width: number, height: number) => {
    setNodeDimensions((prev) => {
      if (prev[id] && prev[id].width === width && prev[id].height === height) {
        return prev;
      }
      return { ...prev, [id]: { width, height } };
    });
  }, []);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Non-passive wheel & touch listeners for Trackpad Pinch-to-Zoom & 2-Finger Pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom gesture on trackpad (deltaY > 0 = zoom out, deltaY < 0 = zoom in)
        const zoomDelta = -e.deltaY * 0.008;
        const currentZoom = zoomRef.current;
        const nextZoom = Math.min(2.5, Math.max(0.3, currentZoom * (1 + zoomDelta)));

        if (Math.abs(nextZoom - currentZoom) > 0.001) {
          const rect = container.getBoundingClientRect();
          const cursorX = e.clientX - rect.left;
          const cursorY = e.clientY - rect.top;

          // Adjust pan so point under cursor remains stable during zoom
          setPan((prevPan) => {
            const scaleRatio = nextZoom / currentZoom;
            const newPanX = cursorX - (cursorX - prevPan.x) * scaleRatio;
            const newPanY = cursorY - (cursorY - prevPan.y) * scaleRatio;
            return { x: newPanX, y: newPanY };
          });

          onZoomChange?.(Math.round(nextZoom * 100) / 100);
        }
      } else {
        // Normal 2-finger scroll on trackpad smoothly pans the workspace
        setPan((prevPan) => ({
          x: prevPan.x - e.deltaX,
          y: prevPan.y - e.deltaY,
        }));
      }
    };

    let touchStartDist = 0;
    let touchStartZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchStartZoom = zoomRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (touchStartDist > 0) {
          const ratio = currentDist / touchStartDist;
          const nextZoom = Math.min(2.5, Math.max(0.3, touchStartZoom * ratio));
          onZoomChange?.(Math.round(nextZoom * 100) / 100);
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartDist = 0;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onZoomChange]);

  // Dedicated Drag Controller using ref to prevent runaway dragging
  const activeDragRef = useRef<{
    nodeId: string;
    startClientX: number;
    startClientY: number;
    initialNodeX: number;
    initialNodeY: number;
    hasMoved: boolean;
  } | null>(null);

  // Pending connection wire state
  const [pendingConnection, setPendingConnection] = useState<{
    nodeId: string;
    port: NodePort;
  } | null>(null);

  // Mouse coordinates in workspace scale (for drawing pending wire)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Keyboard shortcut listener: Escape key to deselect, Delete/Backspace to delete selected node or wire
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInput) return;

      if (e.key === 'Escape') {
        onSelectNode(null);
        onSelectConnection?.(null);
        setPendingConnection(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          onDeleteNode?.(selectedNodeId);
        } else if (selectedConnectionId) {
          e.preventDefault();
          onDeleteConnection?.(selectedConnectionId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectNode, onSelectConnection, onDeleteNode, onDeleteConnection, selectedNodeId, selectedConnectionId]);

  // Window-level mouse listeners for Dragging & Panning
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left - pan.x) / zoom;
      const relativeY = (e.clientY - rect.top - pan.y) / zoom;
      setMousePos({ x: relativeX, y: relativeY });

      if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
      } else if (activeDragRef.current) {
        const dx = (e.clientX - activeDragRef.current.startClientX) / zoom;
        const dy = (e.clientY - activeDragRef.current.startClientY) / zoom;

        // 2px deadband prevents accidental slight moves on pure click
        if (Math.hypot(dx, dy) > 2 || activeDragRef.current.hasMoved) {
          activeDragRef.current.hasMoved = true;
          const newX = Math.round(activeDragRef.current.initialNodeX + dx);
          const newY = Math.round(activeDragRef.current.initialNodeY + dy);
          onMoveNode(activeDragRef.current.nodeId, {
            x: Math.max(10, newX),
            y: Math.max(10, newY),
          });
        }
      }
    };

    const handleWindowMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
      }

      if (activeDragRef.current) {
        if (!activeDragRef.current.hasMoved) {
          onSelectNode(activeDragRef.current.nodeId);
        }
        activeDragRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPanning, pan.x, pan.y, zoom, onMoveNode, onSelectNode]);

  // Mouse down on background starts panning or clears active selection
  const handleMouseDownBackground = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    const isBackground =
      target === containerRef.current ||
      target.tagName === 'svg' ||
      target.tagName === 'rect' ||
      target.classList.contains('workbench-bg');

    if (isBackground) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      onSelectNode(null);
      onSelectConnection?.(null);
      setPendingConnection(null);
    }
  };

  // Node mousedown: Starts tracking drag OR connects if wire is pending
  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelectConnection?.(null);

    // If pending wire is active and user clicked a DIFFERENT module, link them!
    if (pendingConnection && pendingConnection.nodeId !== id) {
      const targetNode = nodes.find((n) => n.id === id);
      if (targetNode) {
        const isOut = pendingConnection.port.type === 'out';
        const targetPort = isOut
          ? targetNode.inPorts[0] || { id: 'in-auto', name: 'in', type: 'in', category: 'data' }
          : targetNode.outPorts[0] || { id: 'out-auto', name: 'out', type: 'out', category: 'data' };

        onConnect(
          pendingConnection.nodeId,
          pendingConnection.port.id,
          id,
          targetPort.id
        );
        setPendingConnection(null);
        return;
      }
    }

    const targetNode = nodes.find((n) => n.id === id);
    if (targetNode) {
      activeDragRef.current = {
        nodeId: id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        initialNodeX: targetNode.position.x,
        initialNodeY: targetNode.position.y,
        hasMoved: false,
      };
      onSelectNode(id);
    }
  };

  // Connection handling: Click source port -> Click target port or module
  const handlePortClick = (nodeId: string, port: NodePort, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pendingConnection) {
      setPendingConnection({ nodeId, port });
    } else {
      if (pendingConnection.nodeId !== nodeId) {
        onConnect(pendingConnection.nodeId, pendingConnection.port.id, nodeId, port.id);
      }
      setPendingConnection(null);
    }
  };

  // Coordinates of pending source node for live wire preview
  const pendingSourceNode = pendingConnection ? nodes.find((n) => n.id === pendingConnection.nodeId) : null;
  const pendingSourceDim = pendingConnection ? nodeDimensions[pendingConnection.nodeId] || { width: 240, height: 100 } : { width: 240, height: 100 };
  const pendingStartX = pendingSourceNode ? pendingSourceNode.position.x + pendingSourceDim.width : 0;
  const pendingStartY = pendingSourceNode ? pendingSourceNode.position.y + pendingSourceDim.height / 2 : 0;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownBackground}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '450px',
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'default',
        backgroundColor: 'var(--workbench-bg)',
        userSelect: 'none',
      }}
      className="visual-builder-viewport workbench-bg"
    >
      {/* Workbench Background SVG Grid with Light Opaque Square Markings */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          {/* Minor 24px Grid Squares */}
          <pattern
            id="workbench-minor-grid"
            width={24 * zoom}
            height={24 * zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % (120 * zoom)}, ${pan.y % (120 * zoom)})`}
          >
            <path
              d={`M ${24 * zoom} 0 L 0 0 0 ${24 * zoom}`}
              fill="none"
              stroke="var(--workbench-grid-minor)"
              strokeWidth="1"
            />
          </pattern>

          {/* Major 120px Workbench Squares with Corner Precision Crosshairs */}
          <pattern
            id="workbench-major-grid"
            width={120 * zoom}
            height={120 * zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % (120 * zoom)}, ${pan.y % (120 * zoom)})`}
          >
            <rect width={120 * zoom} height={120 * zoom} fill="url(#workbench-minor-grid)" />
            <path
              d={`M ${120 * zoom} 0 L 0 0 0 ${120 * zoom}`}
              fill="none"
              stroke="var(--workbench-grid-major)"
              strokeWidth="1.2"
            />
            <path
              d={`M 0 ${6 * zoom} L 0 ${-6 * zoom} M ${-6 * zoom} 0 L ${6 * zoom} 0`}
              fill="none"
              stroke="var(--workbench-grid-crosshair)"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#workbench-major-grid)" />
      </svg>

      {/* Pending Connection Wire Banner */}
      {pendingConnection && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            padding: '6px 14px',
            backgroundColor: 'var(--accent-warning)',
            color: '#000000',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link size={13} />
          <span>Click target port or module to connect wire</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPendingConnection(null);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Transform Container (Pan & Zoom) */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* SVG Connections Layer */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6000px',
            height: '6000px',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {connections.map((conn) => (
            <CanvasConnection
              key={conn.id}
              connection={conn}
              nodes={nodes}
              nodeDimensions={nodeDimensions}
              isHighlighted={conn.id === highlightedConnectionId}
              isSelected={conn.id === selectedConnectionId}
              onSelect={(id) => {
                onSelectNode(null);
                onSelectConnection?.(id);
              }}
              onDelete={onDeleteConnection}
            />
          ))}

          {/* Interactive Live Connection Wire following mouse */}
          {pendingConnection && (
            <path
              d={`M ${pendingStartX} ${pendingStartY} L ${mousePos.x} ${mousePos.y}`}
              fill="none"
              stroke="var(--accent-warning)"
              strokeWidth={3}
              strokeDasharray="6 4"
              style={{ animation: 'flowLine 0.5s linear infinite' }}
            />
          )}
        </svg>

        {/* Nodes Layer */}
        <div style={{ pointerEvents: 'auto' }}>
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isExecuting = node.id === highlightedNodeId;

            if (node.type === 'ui') {
              const parentNode = node.parentId ? nodes.find((n) => n.id === node.parentId) : undefined;
              const childNodes = nodes.filter((n) => n.parentId === node.id);
              return (
                <UIComponentNode
                  key={node.id}
                  node={node}
                  isSelected={isSelected}
                  isExecuting={isExecuting}
                  parentLabel={parentNode ? parentNode.props.content || parentNode.label || parentNode.subtype : undefined}
                  childNodes={childNodes}
                  onNodeMouseDown={handleNodeMouseDown}
                  onPortClick={handlePortClick}
                  resolvedProps={{
                    content: resolvedValues[node.id] ?? node.props.content,
                  }}
                  onResize={handleNodeResize}
                  onUpdateProps={onUpdateProps}
                />
              );
            } else {
              return (
                <LogicHookNode
                  key={node.id}
                  node={node}
                  isSelected={isSelected}
                  isExecuting={isExecuting}
                  onNodeMouseDown={handleNodeMouseDown}
                  onPortClick={handlePortClick}
                  resolvedValue={resolvedValues[node.id]}
                  onResize={handleNodeResize}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
