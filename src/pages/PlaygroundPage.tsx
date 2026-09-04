import React, { useState, useEffect, useCallback } from 'react';
import {
  PlaygroundNode,
  PlaygroundConnection,
  PlaygroundProject,
  NodeType,
  UISubtype,
  LogicSubtype,
  TraceStep,
  NodePort,
} from '../types/playground';
import { VisualCanvas } from '../components/playground/canvas/VisualCanvas';
import { CanvasToolbar } from '../components/playground/canvas/CanvasToolbar';
import { ComponentPalette } from '../components/playground/panels/ComponentPalette';
import { Inspector } from '../components/playground/panels/Inspector';
import { LivePreviewPanel } from '../components/playground/panels/LivePreviewPanel';
import { CodePanel } from '../components/playground/panels/CodePanel';
import { generateReactCode } from '../components/playground/engine/codeGenerator';
import { TUTORIAL_PROJECTS } from '../components/playground/tutorials/tutorialConfigs';
import { DUMMY_DATA_PRESETS } from '../constants/dummyDataPresets';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { usePopupAlert } from '../hooks/usePopupAlert';
import { CustomPopupAlert } from '../components/ui/CustomPopupAlert';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { AlertVariant } from '../constants/enums';
import { t } from '../i18n/i18n';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export interface PlaygroundPageProps {
  initialTutorialId?: string;
  initialView?: 'builder' | 'canvas' | 'code' | 'preview';
}

// Add Node from Palette - static port generator
const getDefaultPorts = (sub: UISubtype | LogicSubtype): { inPorts: NodePort[]; outPorts: NodePort[] } => {
  switch (sub) {
    case 'Button':
      return {
        inPorts: [{ id: 'in-btn-label', name: 'label', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-btn-click', name: 'onClick', type: 'out', category: 'event' }],
      };
    case 'Input':
      return {
        inPorts: [{ id: 'in-input-val', name: 'value', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-input-change', name: 'onChange', type: 'out', category: 'event' }],
      };
    case 'Switch':
      return {
        inPorts: [{ id: 'in-switch-state', name: 'checked', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-switch-change', name: 'onChange', type: 'out', category: 'event' }],
      };
    case 'Dropdown':
      return {
        inPorts: [{ id: 'in-select-val', name: 'value', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-select-change', name: 'onChange', type: 'out', category: 'event' }],
      };
    case 'Slider':
      return {
        inPorts: [{ id: 'in-slider-val', name: 'value', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-slider-change', name: 'onChange', type: 'out', category: 'event' }],
      };
    case 'Checkbox':
      return {
        inPorts: [{ id: 'in-check-state', name: 'checked', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-check-change', name: 'onChange', type: 'out', category: 'event' }],
      };
    case 'Form':
      return {
        inPorts: [{ id: 'in-form-data', name: 'data', type: 'in', category: 'data' }],
        outPorts: [
          { id: 'out-form-submit', name: 'onSubmit', type: 'out', category: 'event' },
          { id: 'out-form-fields', name: 'fields', type: 'out', category: 'data' },
        ],
      };
    case 'Text':
      return {
        inPorts: [{ id: 'in-text-data', name: 'data', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-text-val', name: 'value', type: 'out', category: 'data' }],
      };
    case 'Heading':
      return {
        inPorts: [{ id: 'in-heading-data', name: 'title', type: 'in', category: 'data' }],
        outPorts: [],
      };
    case 'Card':
    case 'Container':
      return {
        inPorts: [{ id: 'in-card-data', name: 'content', type: 'in', category: 'data' }],
        outPorts: [],
      };
    case 'Badge':
      return {
        inPorts: [{ id: 'in-badge-data', name: 'label', type: 'in', category: 'data' }],
        outPorts: [],
      };
    case 'DummyData':
      return {
        inPorts: [{ id: 'in-dummy-query', name: 'query', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-dummy-items', name: 'items', type: 'out', category: 'data' }],
      };
    case 'Kanban':
      return {
        inPorts: [
          { id: 'in-kanban-tasks', name: 'tasks', type: 'in', category: 'data' },
          { id: 'in-kanban-filter', name: 'filter', type: 'in', category: 'data' },
        ],
        outPorts: [
          { id: 'out-kanban-move', name: 'onTaskMove', type: 'out', category: 'event' },
        ],
      };
    case 'useState':
      return {
        inPorts: [{ id: 'in-state-set', name: 'setCount', type: 'in', category: 'action' }],
        outPorts: [{ id: 'out-state-count', name: 'count', type: 'out', category: 'data' }],
      };
    case 'useEffect':
      return {
        inPorts: [{ id: 'in-effect-deps', name: 'deps', type: 'in', category: 'dependency' }],
        outPorts: [{ id: 'out-effect-run', name: 'effect', type: 'out', category: 'effect' }],
      };
    case 'useRef':
      return {
        inPorts: [{ id: 'in-ref-val', name: 'current', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-ref-val', name: 'ref', type: 'out', category: 'data' }],
      };
    case 'useReducer':
      return {
        inPorts: [{ id: 'in-reducer-dispatch', name: 'dispatch', type: 'in', category: 'action' }],
        outPorts: [{ id: 'out-reducer-state', name: 'state', type: 'out', category: 'data' }],
      };
    case 'useMemo':
      return {
        inPorts: [{ id: 'in-memo-deps', name: 'deps', type: 'in', category: 'dependency' }],
        outPorts: [{ id: 'out-memo-val', name: 'memoValue', type: 'out', category: 'data' }],
      };
    case 'useCallback':
      return {
        inPorts: [{ id: 'in-callback-deps', name: 'deps', type: 'in', category: 'dependency' }],
        outPorts: [{ id: 'out-callback-fn', name: 'callback', type: 'out', category: 'action' }],
      };
    case 'useContext':
      return {
        inPorts: [{ id: 'in-context-val', name: 'value', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-context-data', name: 'context', type: 'out', category: 'data' }],
      };
    case 'useId':
      return {
        inPorts: [{ id: 'in-id-prefix', name: 'prefix', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-id-val', name: 'id', type: 'out', category: 'data' }],
      };
    case 'useTransition':
      return {
        inPorts: [{ id: 'in-trans-action', name: 'start', type: 'in', category: 'action' }],
        outPorts: [{ id: 'out-trans-pending', name: 'isPending', type: 'out', category: 'data' }],
      };
    case 'useLayoutEffect':
      return {
        inPorts: [{ id: 'in-layout-deps', name: 'deps', type: 'in', category: 'dependency' }],
        outPorts: [{ id: 'out-layout-run', name: 'effect', type: 'out', category: 'effect' }],
      };
    case 'Timer':
      return {
        inPorts: [{ id: 'in-timer-reset', name: 'reset', type: 'in', category: 'action' }],
        outPorts: [{ id: 'out-timer-tick', name: 'onTick', type: 'out', category: 'event' }],
      };
    default:
      return {
        inPorts: [{ id: 'in-default', name: 'in', type: 'in', category: 'data' }],
        outPorts: [{ id: 'out-default', name: 'out', type: 'out', category: 'data' }],
      };
  }
};

export const PlaygroundPage: React.FC<PlaygroundPageProps> = ({
  initialTutorialId = 'counter',
  initialView = 'builder',
}) => {
  // Load initial project (or from local storage)
  const initialProject = TUTORIAL_PROJECTS[initialTutorialId] || TUTORIAL_PROJECTS.counter;

  const [nodes, setNodes] = useState<PlaygroundNode[]>(initialProject.nodes);
  const [connections, setConnections] = useState<PlaygroundConnection[]>(initialProject.connections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-btn-1');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'builder' | 'canvas' | 'code' | 'preview'>(initialView);
  const [zoom, setZoom] = useState<number>(0.8);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<{ nodes: PlaygroundNode[]; connections: PlaygroundConnection[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: PlaygroundNode[]; connections: PlaygroundConnection[] }[]>([]);

  // Execution trace state
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [highlightedConnectionId, setHighlightedConnectionId] = useState<string | null>(null);

  const pushState = useCallback((newNodes: PlaygroundNode[], newConnections: PlaygroundConnection[]) => {
    setHistory((prev) => [...prev.slice(-20), { nodes, connections }]);
    setFuture([]);
    setNodes(newNodes);
    setConnections(newConnections);
  }, [nodes, connections]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture((prev) => [{ nodes, connections }, ...prev]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setNodes(previous.nodes);
    setConnections(previous.connections);
  }, [history, nodes, connections]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((prev) => [...prev, { nodes, connections }]);
    setFuture((prev) => prev.slice(1));
    setNodes(next.nodes);
    setConnections(next.connections);
  }, [future, nodes, connections]);

  // Keyboard Shortcuts for Undo & Redo (Cmd+Z / Ctrl+Z, Cmd+Shift+Z / Ctrl+Shift+Z or Ctrl+Y)
  useKeyboardShortcut('z', handleUndo, { meta: true });
  useKeyboardShortcut('z', handleRedo, { meta: true, shift: true });
  useKeyboardShortcut('y', handleRedo, { meta: true });


  const handleAddNode = (type: NodeType, subtype: UISubtype | LogicSubtype) => {
    const id = `node-${subtype.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const ports = getDefaultPorts(subtype);

    let initialProps: Record<string, any> = {};
    if (subtype === 'Button') {
      initialProps = { content: 'Click Me', variant: 'primary', actionType: 'increment' };
    } else if (subtype === 'Text') {
      initialProps = { content: 'Count: {{count}}' };
    } else if (subtype === 'Heading') {
      initialProps = { content: 'Dashboard Header' };
    } else if (subtype === 'Input') {
      initialProps = { placeholder: 'Type search...', inputType: 'text' };
    } else if (subtype === 'Switch') {
      initialProps = { label: 'Dark Theme', checked: false };
    } else if (subtype === 'Dropdown') {
      initialProps = { content: 'Choose Option', options: ['Alpha', 'Beta', 'Gamma'] };
    } else if (subtype === 'Slider') {
      initialProps = { label: 'Volume', min: 0, max: 100, step: 1, initialValue: 50 };
    } else if (subtype === 'Checkbox') {
      initialProps = { label: 'Remember choices', checked: false };
    } else if (subtype === 'Form') {
      initialProps = { content: 'Feedback Form' };
    } else if (subtype === 'DummyData') {
      const defaultPreset = DUMMY_DATA_PRESETS.products;
      initialProps = {
        title: defaultPreset.defaultTitle,
        datasetPreset: defaultPreset.id,
        displayStyle: defaultPreset.defaultStyle,
        items: [...defaultPreset.items],
        totalCount: defaultPreset.items.length,
      };
    } else if (subtype === 'Kanban') {
      initialProps = {
        title: 'Project Kanban Board',
        columns: ['Todo', 'In Progress', 'Done'],
      };
    } else if (subtype === 'useState') {
      initialProps = { stateName: 'count', initialValue: 0 };
    } else if (subtype === 'useEffect') {
      initialProps = {
        depsType: 'empty',
        deps: [],
        effectTask: 'documentTitle',
        hasCleanup: true,
        cleanupTask: 'clearInterval',
        effectCode: 'document.title = `Count: ${count}`;',
        cleanupCode: 'document.title = "React App";',
      };
    } else if (subtype === 'useRef') {
      initialProps = {
        refType: 'dom',
        initialValue: 'null',
      };
    } else if (subtype === 'useReducer') {
      initialProps = {
        reducerActions: ['INCREMENT', 'DECREMENT', 'RESET'],
        reducerInitialState: 0,
      };
    } else if (subtype === 'useMemo') {
      initialProps = {
        memoExpression: 'count * 2',
        deps: ['count'],
      };
    } else if (subtype === 'useCallback') {
      initialProps = {
        callbackFnName: 'handleClick',
        deps: ['count'],
        callbackBody: 'console.log("Action performed with:", count);',
      };
    } else if (subtype === 'useContext') {
      initialProps = {
        contextName: 'ThemeContext',
        initialValue: 'dark',
      };
    } else if (subtype === 'useId') {
      initialProps = {
        prefix: ':r1:',
        elementName: 'inputId',
      };
    } else if (subtype === 'useTransition') {
      initialProps = {
        isPending: false,
        transitionTask: 'filterResults',
      };
    } else if (subtype === 'useLayoutEffect') {
      initialProps = {
        depsType: 'empty',
        deps: [],
        layoutTask: 'measureTooltipRect',
      };
    } else if (subtype === 'Timer') {
      initialProps = { delay: 1000 };
    }

    // Smart non-overlapping blueprint column layout
    const columnX = type === 'ui' ? 80 : 480;
    const sameColumnNodes = nodes.filter((n) => (type === 'ui' ? n.type === 'ui' : n.type === 'logic'));
    
    let nextY = type === 'ui' ? 60 : 180;
    if (sameColumnNodes.length > 0) {
      const maxY = Math.max(...sameColumnNodes.map((n) => n.position.y));
      nextY = maxY + 140;
    }

    const newNode: PlaygroundNode = {
      id,
      type,
      subtype,
      label: subtype,
      position: { x: columnX, y: nextY },
      props: initialProps,
      inPorts: ports.inPorts,
      outPorts: ports.outPorts,
    };

    pushState([...nodes, newNode], connections);
    setSelectedNodeId(id);
  };

  // Move Node
  const handleMoveNode = (id: string, newPos: { x: number; y: number }) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, position: newPos } : n))
    );
  };

  // Connect Ports & Modules
  const handleConnect = (
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ) => {
    const node1 = nodes.find((n) => n.id === sourceNodeId);
    const node2 = nodes.find((n) => n.id === targetNodeId);

    if (!node1 || !node2 || sourceNodeId === targetNodeId) return;

    // Normalize connection orientation so click order never breaks the logic
    let finalSourceId = sourceNodeId;
    let finalSourcePort = sourcePortId;
    let finalTargetId = targetNodeId;
    let finalTargetPort = targetPortId;
    let type: PlaygroundConnection['type'] = 'data';

    const triggerControls = ['Button', 'Input', 'Switch', 'Dropdown', 'Slider', 'Checkbox', 'Form', 'Timer'];
    const isNode1Trigger = triggerControls.includes(node1.subtype);
    const isNode2Receiver = ['useState', 'useReducer'].includes(node2.subtype);
    const isNode2Trigger = triggerControls.includes(node2.subtype);
    const isNode1Receiver = ['useState', 'useReducer'].includes(node1.subtype);

    if (isNode1Trigger && isNode2Receiver) {
      type = 'event';
    } else if (isNode2Trigger && isNode1Receiver) {
      finalSourceId = targetNodeId;
      finalSourcePort = targetPortId;
      finalTargetId = sourceNodeId;
      finalTargetPort = sourcePortId;
      type = 'event';
    } else if (['useState', 'useRef'].includes(node1.subtype) && !['useState', 'useRef', 'useEffect', 'Timer'].includes(node2.subtype)) {
      type = 'data';
    } else if (['useState', 'useRef'].includes(node2.subtype) && !['useState', 'useRef', 'useEffect', 'Timer'].includes(node1.subtype)) {
      finalSourceId = targetNodeId;
      finalSourcePort = targetPortId;
      finalTargetId = sourceNodeId;
      finalTargetPort = sourcePortId;
      type = 'data';
    } else if (
      (node1.subtype === 'Form' || node1.subtype === 'Card' || node1.subtype === 'Container') &&
      node2.type === 'ui' &&
      node2.subtype !== 'Form' &&
      node2.subtype !== 'Card' &&
      node2.subtype !== 'Container'
    ) {
      type = 'child';
      finalSourceId = node1.id;
      finalSourcePort = sourcePortId || 'out-form-fields';
      finalTargetId = node2.id;
      finalTargetPort = targetPortId || 'in-child';
    } else if (
      (node2.subtype === 'Form' || node2.subtype === 'Card' || node2.subtype === 'Container') &&
      node1.type === 'ui' &&
      node1.subtype !== 'Form' &&
      node1.subtype !== 'Card' &&
      node1.subtype !== 'Container'
    ) {
      type = 'child';
      finalSourceId = node2.id;
      finalSourcePort = targetPortId || 'out-form-fields';
      finalTargetId = node1.id;
      finalTargetPort = sourcePortId || 'in-child';
    } else if (node1.subtype === 'useEffect' || node2.subtype === 'useEffect') {
      type = 'dependency';
    }

    const newConnection: PlaygroundConnection = {
      id: `conn-${Date.now().toString().slice(-4)}`,
      sourceNodeId: finalSourceId,
      sourcePortId: finalSourcePort,
      targetNodeId: finalTargetId,
      targetPortId: finalTargetPort,
      type,
    };

    // Auto-register dependencies when wiring with useEffect, or assign parentId when wiring with Form
    let updatedNodes = nodes;
    if (type === 'child') {
      updatedNodes = nodes.map((n) => (n.id === finalTargetId ? { ...n, parentId: finalSourceId } : n));
    } else if (node1.subtype === 'useState' && node2.subtype === 'useEffect') {
      const varName = node1.props.stateName || 'count';
      const currentDeps = node2.props.deps || [];
      if (!currentDeps.includes(varName)) {
        const newDeps = [...currentDeps, varName];
        updatedNodes = nodes.map((n) =>
          n.id === node2.id
            ? { ...n, props: { ...n.props, deps: newDeps, depsType: 'auto' } }
            : n
        );
      }
    } else if (node2.subtype === 'useState' && node1.subtype === 'useEffect') {
      const varName = node2.props.stateName || 'count';
      const currentDeps = node1.props.deps || [];
      if (!currentDeps.includes(varName)) {
        const newDeps = [...currentDeps, varName];
        updatedNodes = nodes.map((n) =>
          n.id === node1.id
            ? { ...n, props: { ...n.props, deps: newDeps, depsType: 'auto' } }
            : n
        );
      }
    }

    // Avoid duplicate connections between same pair of nodes
    if (
      !connections.some(
        (c) =>
          (c.sourceNodeId === finalSourceId && c.targetNodeId === finalTargetId) ||
          (c.sourceNodeId === finalTargetId && c.targetNodeId === finalSourceId)
      )
    ) {
      pushState(updatedNodes, [...connections, newConnection]);
    }
  };

  const handleDeleteConnection = useCallback(
    (connId: string) => {
      const conn = connections.find((c) => c.id === connId);
      let updatedNodes = nodes;
      if (conn && conn.type === 'child') {
        updatedNodes = nodes.map((n) =>
          n.id === conn.targetNodeId && n.parentId === conn.sourceNodeId
            ? { ...n, parentId: undefined }
            : n.id === conn.sourceNodeId && n.parentId === conn.targetNodeId
            ? { ...n, parentId: undefined }
            : n
        );
      }
      pushState(
        updatedNodes,
        connections.filter((c) => c.id !== connId)
      );
      setSelectedConnectionId((prev) => (prev === connId ? null : prev));
    },
    [nodes, connections, pushState]
  );

  // Update Props from Inspector
  const handleUpdateProps = (nodeId: string, updatedProps: Record<string, any>) => {
    const updatedNodes = nodes.map((n) =>
      n.id === nodeId ? { ...n, props: { ...n.props, ...updatedProps } } : n
    );
    pushState(updatedNodes, connections);
  };

  // Delete Node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const updatedNodes = nodes.filter((n) => n.id !== nodeId);
      const updatedConnections = connections.filter(
        (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      );
      pushState(updatedNodes, updatedConnections);
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [nodes, connections, selectedNodeId, pushState]
  );

  // Duplicate Node
  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;

      const newId = `node-${target.subtype.toLowerCase()}-${Date.now().toString().slice(-4)}`;
      const copy: PlaygroundNode = {
        ...target,
        id: newId,
        position: { x: target.position.x + 30, y: target.position.y + 30 },
      };

      pushState([...nodes, copy], connections);
      setSelectedNodeId(newId);
    },
    [nodes, connections, pushState]
  );

  // Reorder UI nodes sequence for Live Preview and code generation
  const handleReorderUINodes = useCallback(
    (newOrderedUiNodeIds: string[]) => {
      const uiNodesMap = new Map(nodes.filter((n) => n.type === 'ui').map((n) => [n.id, n]));
      const nonUiNodes = nodes.filter((n) => n.type !== 'ui');

      const orderedUiNodes: PlaygroundNode[] = [];
      newOrderedUiNodeIds.forEach((id, index) => {
        const node = uiNodesMap.get(id);
        if (node) {
          orderedUiNodes.push({
            ...node,
            props: {
              ...node.props,
              uiOrder: index,
            },
          });
          uiNodesMap.delete(id);
        }
      });
      uiNodesMap.forEach((node) => orderedUiNodes.push(node));

      pushState([...orderedUiNodes, ...nonUiNodes], connections);
    },
    [nodes, connections, pushState]
  );

  // Keyboard Shortcuts: Delete/Backspace (Delete Node or Wire), Cmd+D/Ctrl+D (Duplicate Node), Escape (Deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, select or contenteditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          handleDeleteNode(selectedNodeId);
        } else if (selectedConnectionId) {
          e.preventDefault();
          handleDeleteConnection(selectedConnectionId);
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && selectedNodeId) {
        e.preventDefault();
        handleDuplicateNode(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedConnectionId, handleDeleteNode, handleDeleteConnection, handleDuplicateNode]);

  // Trace Action Triggered from Live Preview
  const handleTraceAction = useCallback((step: TraceStep) => {
    setHighlightedNodeId(step.sourceNodeId);
    const matchingConn = connections.find(
      (c) => c.sourceNodeId === step.sourceNodeId && c.targetNodeId === step.targetNodeId
    );
    if (matchingConn) {
      setHighlightedConnectionId(matchingConn.id);
    }

    setTimeout(() => {
      setHighlightedNodeId(step.targetNodeId || null);
      setTimeout(() => {
        setHighlightedNodeId(null);
        setHighlightedConnectionId(null);
      }, 700);
    }, 500);
  }, [connections]);

  const { popupState, showAlert, showConfirm, closePopup } = usePopupAlert();

  // Assign or unassign a node's parent container (Form / Card) with visible wire
  const handleSetNodeParent = useCallback(
    (nodeId: string, parentId: string | undefined) => {
      const updatedNodes = nodes.map((n) => (n.id === nodeId ? { ...n, parentId } : n));

      // Remove previous child wire for this node
      let updatedConns = connections.filter(
        (c) => !(c.type === 'child' && (c.sourceNodeId === nodeId || c.targetNodeId === nodeId))
      );

      // If assigned to a form/container, create a visible wire between the container and this component!
      if (parentId) {
        const parentNode = nodes.find((n) => n.id === parentId);
        const childNode = nodes.find((n) => n.id === nodeId);
        const sourcePort =
          parentNode?.outPorts.find((p) => p.name === 'fields' || p.name === 'child')?.id ||
          parentNode?.outPorts[0]?.id ||
          'out-form-fields';
        const targetPort = childNode?.inPorts[0]?.id || 'in-child';

        updatedConns.push({
          id: `conn-child-${parentId}-${nodeId}`,
          sourceNodeId: parentId,
          sourcePortId: sourcePort,
          targetNodeId: nodeId,
          targetPortId: targetPort,
          type: 'child',
        });
      }

      pushState(updatedNodes, updatedConns);
    },
    [nodes, connections, pushState]
  );

  // Instantly add a new child item inside a Form or Container and wire it to the form
  const handleAddChildToContainer = useCallback(
    (containerId: string, subtype: UISubtype) => {
      const container = nodes.find((n) => n.id === containerId);
      if (!container) return;

      const id = `node-${subtype.toLowerCase()}-${Date.now().toString().slice(-4)}`;
      const ports = getDefaultPorts(subtype);
      const childCount = nodes.filter((n) => n.parentId === containerId).length;

      // Position child in a neat column to the right of the Form
      const position = {
        x: container.position.x + 240,
        y: container.position.y + childCount * 115,
      };

      let initialProps: Record<string, any> = {};
      if (subtype === 'Input') {
        initialProps = { placeholder: `Form field ${childCount + 1}...`, inputType: 'text' };
      } else if (subtype === 'Button') {
        initialProps = { content: 'Submit Form', variant: 'primary', actionType: 'increment' };
      } else if (subtype === 'Switch') {
        initialProps = { label: 'Agree to terms', checked: false };
      } else if (subtype === 'Dropdown') {
        initialProps = { content: 'Choose option', options: ['Option A', 'Option B', 'Option C'] };
      } else if (subtype === 'Checkbox') {
        initialProps = { label: 'Remember me', checked: false };
      } else if (subtype === 'Text') {
        initialProps = { content: 'Instructions' };
      }

      const newNode: PlaygroundNode = {
        id,
        type: 'ui',
        subtype,
        label: `${subtype}`,
        position,
        props: initialProps,
        inPorts: ports.inPorts,
        outPorts: ports.outPorts,
        parentId: containerId,
      };

      const sourcePort =
        container.outPorts.find((p) => p.name === 'fields' || p.name === 'child')?.id ||
        container.outPorts[0]?.id ||
        'out-form-fields';
      const targetPort = ports.inPorts[0]?.id || 'in-child';

      const newConnection: PlaygroundConnection = {
        id: `conn-child-${containerId}-${id}`,
        sourceNodeId: containerId,
        sourcePortId: sourcePort,
        targetNodeId: id,
        targetPortId: targetPort,
        type: 'child',
      };

      pushState([...nodes, newNode], [...connections, newConnection]);
      setSelectedNodeId(id);
    },
    [nodes, connections, pushState]
  );

  // Load Preset
  const handleLoadTutorial = (tutorialKey: string) => {
    const project = TUTORIAL_PROJECTS[tutorialKey];
    if (project) {
      pushState(project.nodes, project.connections);
      setSelectedNodeId(project.nodes[0]?.id || null);
      setZoom(0.8);
    }
  };

  // Save Project with Custom Popup Alert
  const handleSave = () => {
    const project: PlaygroundProject = {
      id: `project-${Date.now()}`,
      name: 'Custom React App',
      updatedAt: Date.now(),
      nodes,
      connections,
      selectedNodeId,
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYGROUND_STATE) || '[]');
      localStorage.setItem(STORAGE_KEYS.PLAYGROUND_STATE, JSON.stringify([project, ...existing.slice(0, 9)]));
      showAlert(
        t('playground.alerts.saveTitle'),
        t('playground.alerts.saveMessage', { nodes: nodes.length, conns: connections.length }),
        AlertVariant.SUCCESS
      );
    } catch (e) {
      showAlert(t('settings.importErrorTitle'), String(e), AlertVariant.DANGER);
    }
  };

  // Reset Workspace with Custom Confirmation Dialog
  const handleReset = () => {
    showConfirm({
      title: t('playground.alerts.resetTitle'),
      message: t('playground.alerts.resetMessage'),
      type: AlertVariant.WARNING,
      confirmText: t('playground.alerts.resetConfirm'),
      cancelText: t('playground.alerts.resetCancel'),
      onConfirm: () => {
        pushState([], []);
        setSelectedNodeId(null);
      },
    });
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const generatedCode = generateReactCode(nodes, connections, 'App');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
      }}
      className="playground-page"
    >
      {/* Top Toolbar */}
      <CanvasToolbar
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(2, z + 0.1))}
        onZoomOut={() => setZoom((z) => Math.max(0.5, z - 0.1))}
        onZoomReset={() => setZoom((z) => (Math.abs(z - 0.8) < 0.05 ? 1 : 0.8))}
        onReset={handleReset}
        onSave={handleSave}
        onLoadTutorial={handleLoadTutorial}
        activeView={activeView}
        onViewChange={setActiveView}
        isLeftCollapsed={isLeftCollapsed}
        onToggleLeftPanel={() => setIsLeftCollapsed(!isLeftCollapsed)}
        isRightCollapsed={isRightCollapsed}
        onToggleRightPanel={() => setIsRightCollapsed(!isRightCollapsed)}
        nodes={nodes}
        onReorderUINodes={handleReorderUINodes}
      />

      {/* Main Multi-Panel Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {activeView === 'builder' || activeView === 'canvas' ? (
          <>
            {/* Left: Palette */}
            <div className="hide-mobile" style={{ height: '100%' }}>
              <ComponentPalette
                onAddNode={handleAddNode}
                isCollapsed={isLeftCollapsed}
                onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
              />
            </div>

            {/* Center: Infinite Visual Builder */}
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              <VisualCanvas
                nodes={nodes}
                connections={connections}
                selectedNodeId={selectedNodeId}
                selectedConnectionId={selectedConnectionId}
                highlightedNodeId={highlightedNodeId}
                highlightedConnectionId={highlightedConnectionId}
                onSelectNode={setSelectedNodeId}
                onSelectConnection={setSelectedConnectionId}
                onMoveNode={handleMoveNode}
                onConnect={handleConnect}
                onSwitchToPreview={() => setActiveView('preview')}
                zoom={zoom}
                onZoomChange={setZoom}
                onDeleteNode={handleDeleteNode}
                onDeleteConnection={handleDeleteConnection}
                onUpdateProps={handleUpdateProps}
              />
            </div>

            {/* Right: Inspector */}
            <div className="hide-mobile" style={{ height: '100%' }}>
              <Inspector
                selectedNode={selectedNode}
                allNodes={nodes}
                connections={connections}
                onUpdateProps={handleUpdateProps}
                onDeleteNode={handleDeleteNode}
                onDuplicateNode={handleDuplicateNode}
                onConnect={handleConnect}
                onDeleteConnection={handleDeleteConnection}
                onSetNodeParent={handleSetNodeParent}
                onAddChildToContainer={handleAddChildToContainer}
                isCollapsed={isRightCollapsed}
                onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
                onDeselect={() => setSelectedNodeId(null)}
              />
            </div>
          </>
        ) : activeView === 'preview' ? (
          <div style={{ flex: 1, height: '100%' }}>
            <ErrorBoundary fallbackTitle="Live Component Preview">
              <LivePreviewPanel
                nodes={nodes}
                connections={connections}
                onTraceAction={handleTraceAction}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <div style={{ flex: 1, height: '100%' }}>
            <CodePanel code={generatedCode} />
          </div>
        )}
      </div>

      {/* Global Custom Alert / Confirmation Popup (Replaces Browser alert() and confirm()) */}
      <CustomPopupAlert {...popupState} onClose={closePopup} />
    </div>
  );
};
