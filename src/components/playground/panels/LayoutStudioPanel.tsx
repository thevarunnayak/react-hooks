import React, { useState, useMemo, useRef } from 'react';
import {
  Layers,
  LayoutGrid,
  Boxes,
  GripVertical,
  Plus,
  Trash2,
  Columns,
  Rows,
  Sparkles,
  RotateCcw,
  Heading as HeadingIcon,
  MousePointerClick,
  TextCursorInput,
  ToggleLeft,
  ListFilter,
  Sliders,
  CheckSquare,
  Square,
  FileText,
  Tag,
  Database,
  Columns3,
  Type,
  LogOut,
  Eye,
  CreditCard,
  ArrowUpDown,
  ArrowUpRight,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { PlaygroundNode, DeviceViewportType, FlexContainerConfig } from '../../../types/playground';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';
import { JustifyDropdown, GapDropdown, ItemSizingDropdown } from './LayoutDropdowns';
import {
  WrapDropdown,
  ExistingContainerOption,
  MergeElementCandidate,
  sanitizeHtmlId,
} from './WrapDropdown';

export interface LayoutStudioPanelProps {
  nodes: PlaygroundNode[];
  onUpdateNodes: (updatedNodes: PlaygroundNode[]) => void;
  onReorderUINodes: (orderedIds: string[]) => void;
  onUpdateProps: (nodeId: string, newProps: Record<string, any>) => void;
  activeDevice?: DeviceViewportType;
}

export type ContainerChild =
  | {
      kind: 'node';
      id: string;
      node: PlaygroundNode;
    }
  | {
      kind: 'container';
      id: string; // groupId
      groupId: string;
      parentGroup?: string;
      config: FlexContainerConfig & { containerType?: 'div' | 'card' };
      children: ContainerChild[];
      items: PlaygroundNode[];
    };

export type FlowBlock =
  | {
      type: 'container';
      id: string; // groupId
      groupId: string;
      parentGroup?: string;
      children: ContainerChild[];
      items: PlaygroundNode[];
      config: FlexContainerConfig & { containerType?: 'div' | 'card' };
    }
  | {
      type: 'node';
      id: string; // node.id
      node: PlaygroundNode;
    };

export const LayoutStudioPanel: React.FC<LayoutStudioPanelProps> = ({
  nodes,
  onUpdateNodes,
  onReorderUINodes,
  onUpdateProps,
  activeDevice = 'desktop',
}) => {
  // Multi-selection state
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  // Block Drag and Drop state (reordering containers and standalone nodes interchangeably)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

  // Child Drag and Drop state
  const [draggedChildId, setDraggedChildId] = useState<string | null>(null);
  const [dragOverChildId, setDragOverChildId] = useState<string | null>(null);
  const [dragOverContainerId, setDragOverContainerId] = useState<string | null>(null);

  // Container rename inline state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');

  // Synchronous ref to track dragged item across HTML5 DnD event lifecycles
  const draggedIdRef = useRef<string | null>(null);

  // Active insertion gap drop index (0 before first block, 1..n between blocks, n after last block)
  const [dropInsertionIndex, setDropInsertionIndex] = useState<number | null>(null);

  // Active view mode in the studio: 'builder' | 'split' | 'preview'
  const [studioViewMode, setStudioViewMode] = useState<'builder' | 'split' | 'preview'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 900) {
      return 'builder';
    }
    return 'split';
  });

  // Filter UI nodes in current sequence
  const uiNodes = useMemo(() => {
    return (nodes || [])
      .filter((n): n is PlaygroundNode => Boolean(n && n.type === 'ui'))
      .sort((a, b) => {
        const orderA = typeof a.props?.uiOrder === 'number' ? a.props.uiOrder : (nodes || []).indexOf(a);
        const orderB = typeof b.props?.uiOrder === 'number' ? b.props.uiOrder : (nodes || []).indexOf(b);
        return orderA - orderB;
      });
  }, [nodes]);

  // Active dragged node ID (whether dragged as a flow block or container child)
  const activeDraggedNodeId =
    draggedChildId || (draggedBlockId && uiNodes.some((n) => n.id === draggedBlockId) ? draggedBlockId : null);

  // Safely extract the source dragged ID from ref, state, or dataTransfer
  const getSourceDraggedId = (e?: React.DragEvent): string | null => {
    if (draggedIdRef.current) return draggedIdRef.current;
    if (activeDraggedNodeId) return activeDraggedNodeId;
    if (draggedBlockId) return draggedBlockId;
    if (draggedChildId) return draggedChildId;
    if (e && e.dataTransfer) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) return raw.replace(/^(block|child):/, '');
      } catch {
        // ignore
      }
    }
    return null;
  };

  // Helper to test if a group is an ancestor of another group
  const isAncestorGroup = (ancestorId: string, currentGroupId: string, allNodes: PlaygroundNode[]): boolean => {
    let curr: string | undefined = currentGroupId;
    const visited = new Set<string>();
    while (curr) {
      if (curr === ancestorId) return true;
      if (visited.has(curr)) break;
      visited.add(curr);
      const parent = allNodes.find((n) => n.props?.layoutGroup === curr)?.props?.parentGroup;
      curr = parent;
    }
    return false;
  };

  // Helper to extract UI node IDs from a container's children hierarchy
  const getUINodeIdsFromChildren = (children: ContainerChild[], allNodes: PlaygroundNode[]): string[] => {
    const ids: string[] = [];
    for (const child of children) {
      if (child.kind === 'node') {
        ids.push(child.id);
      } else {
        const subGroupNodes = allNodes.filter((n) => n.props?.layoutGroup === child.groupId && !n.props?.isContainerHolder);
        subGroupNodes.forEach((n) => ids.push(n.id));
      }
    }
    return ids;
  };

  // Helper to build a recursive container child object
  const buildContainerChild = (groupId: string, visited: Set<string> = new Set()): Extract<ContainerChild, { kind: 'container' }> => {
    visited.add(groupId);
    const groupItems = uiNodes.filter((n) => n.props?.layoutGroup === groupId);
    const firstNode = groupItems[0];
    const isCard = firstNode?.props?.containerType === 'card' || firstNode?.props?.containerBorder === true;
    const config: FlexContainerConfig & { containerType?: 'div' | 'card' } = {
      id: groupId,
      name: firstNode?.props?.layoutGroupName || (isCard ? 'Card Container' : 'Div Wrapper'),
      display: firstNode?.props?.containerDisplay || 'flex',
      flexDirection: firstNode?.props?.containerDirection || 'row',
      justifyContent: firstNode?.props?.containerJustify || 'flex-start',
      alignItems: firstNode?.props?.containerAlign || 'center',
      flexWrap: firstNode?.props?.containerWrap || 'wrap',
      gap: firstNode?.props?.containerGap || '12px',
      padding: firstNode?.props?.containerPadding || (isCard ? '16px' : '0px'),
      backgroundColor: firstNode?.props?.containerBg || (isCard ? 'card' : 'transparent'),
      borderRadius: firstNode?.props?.containerRadius || (isCard ? 'var(--radius-xl)' : '0px'),
      border: isCard,
      containerType: isCard ? 'card' : 'div',
    };

    const realLeafNodes = groupItems.filter((n) => !n.props?.isContainerHolder);

    // Find nested container groupIds directly inside this groupId
    const nestedGroupIds: string[] = [];
    uiNodes.forEach((n) => {
      const lg = n.props?.layoutGroup;
      if (lg && lg !== groupId && n.props?.parentGroup === groupId && !nestedGroupIds.includes(lg) && !visited.has(lg)) {
        nestedGroupIds.push(lg);
      }
    });

    const children: ContainerChild[] = [];
    // Nested containers
    for (const nestedId of nestedGroupIds) {
      children.push(buildContainerChild(nestedId, new Set(visited)));
    }
    // Direct leaf nodes
    for (const leaf of realLeafNodes) {
      children.push({ kind: 'node', id: leaf.id, node: leaf });
    }

    // Sort children according to their order in uiNodes
    children.sort((a, b) => {
      const indexA = uiNodes.findIndex((n) => (a.kind === 'node' ? n.id === a.id : n.props?.layoutGroup === a.groupId));
      const indexB = uiNodes.findIndex((n) => (b.kind === 'node' ? n.id === b.id : n.props?.layoutGroup === b.groupId));
      return indexA - indexB;
    });

    return {
      kind: 'container',
      id: groupId,
      groupId,
      parentGroup: firstNode?.props?.parentGroup,
      children,
      items: realLeafNodes,
      config,
    };
  };

  // Unified flow blocks: preserves true document order so containers stay at original position!
  const flowBlocks = useMemo(() => {
    const blocks: FlowBlock[] = [];
    const processedGroupIds = new Set<string>();

    for (const node of uiNodes) {
      // If node belongs to a nested container, its parent container will include it!
      if (node.props?.parentGroup) continue;

      const groupId = node.props?.layoutGroup;
      if (groupId) {
        if (!processedGroupIds.has(groupId)) {
          processedGroupIds.add(groupId);
          const containerChild = buildContainerChild(groupId);
          blocks.push({
            type: 'container',
            id: groupId,
            groupId,
            parentGroup: containerChild.parentGroup,
            children: containerChild.children,
            items: containerChild.items,
            config: containerChild.config,
          });
        }
      } else if (!node.props?.isContainerHolder) {
        blocks.push({
          type: 'node',
          id: node.id,
          node,
        });
      }
    }

    return blocks;
  }, [uiNodes]);

  // List of existing containers for WrapDropdown options
  const existingContainersList = useMemo<ExistingContainerOption[]>(() => {
    return flowBlocks
      .filter((b): b is FlowBlock & { type: 'container' } => b.type === 'container')
      .map((b) => ({
        groupId: b.groupId,
        name: b.config.name || `${b.config.containerType === 'card' ? 'Card' : 'Div'} Container`,
        itemCount: b.children.length,
        containerType: b.config.containerType || 'div',
      }));
  }, [flowBlocks]);

  const getNodeTitle = (node: PlaygroundNode): string => {
    if (!node) return 'Component';
    const p = node.props || {};
    return p.content || (p as any).title || (p as any).label || p.placeholder || node.label || node.subtype || 'Component';
  };

  // Helper to get other UI nodes for merge candidates
  const getOtherNodesList = (excludeNodeId: string): MergeElementCandidate[] => {
    return uiNodes
      .filter((n) => n.id !== excludeNodeId && !n.props?.isContainerHolder)
      .map((n) => ({
        id: n.id,
        title: getNodeTitle(n),
        subtype: n.subtype,
      }));
  };

  // Start renaming a container
  const handleStartRenameContainer = (groupId: string, currentName: string) => {
    setEditingGroupId(groupId);
    setEditingGroupName(currentName);
  };

  // Save container name
  const handleSaveContainerName = (groupId: string) => {
    const trimmed = editingGroupName.trim();
    if (trimmed) {
      handleUpdateContainerProp(groupId, 'layoutGroupName', trimmed);
      handleUpdateContainerProp(groupId, 'layoutGroupId', sanitizeHtmlId(trimmed));
    }
    setEditingGroupId(null);
  };

  // Count containers for stats (all unique layoutGroups)
  const containerCount = useMemo(() => {
    const groupSet = new Set<string>();
    uiNodes.forEach((n) => {
      if (n.props?.layoutGroup) groupSet.add(n.props.layoutGroup);
    });
    return groupSet.size;
  }, [uiNodes]);

  // Multi-selection handlers
  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedNodeIds(new Set());
  };

  // Group selected nodes into a new container at their CURRENT position (minIndex)
  const handleGroupSelected = (
    direction: 'row' | 'column' | 'grid',
    containerType: 'div' | 'card' = 'div',
    explicitNodeIds?: Set<string>,
    customName?: string
  ) => {
    const targetIds = explicitNodeIds && explicitNodeIds.size > 0 ? explicitNodeIds : selectedNodeIds;
    if (targetIds.size === 0) return;
    const newGroupId = `group-${Date.now()}`;
    const isCard = containerType === 'card';
    const isGrid = direction === 'grid';
    const isRow = direction === 'row';

    const defaultName = isGrid
      ? `2-Col Grid (${targetIds.size} items)`
      : `${isCard ? 'Card' : 'Div'} ${isRow ? 'Row' : 'Col'} (${targetIds.size} items)`;

    const groupName = customName?.trim() || defaultName;
    const groupIdClean = sanitizeHtmlId(groupName);

    // Find the earliest index among selected items in uiNodes so the row stays in place!
    const selectedIndices = uiNodes
      .map((n, idx) => (targetIds.has(n.id) ? idx : -1))
      .filter((idx) => idx >= 0);
    const minIndex = selectedIndices.length > 0 ? Math.min(...selectedIndices) : 0;

    const selectedItems = uiNodes.filter((n) => targetIds.has(n.id));
    const unselectedBefore = uiNodes.slice(0, minIndex).filter((n) => !targetIds.has(n.id));
    const unselectedAfter = uiNodes.slice(minIndex).filter((n) => !targetIds.has(n.id));

    // Construct the new order of UI nodes with the group positioned at minIndex
    const newUIOrderNodes = [...unselectedBefore, ...selectedItems, ...unselectedAfter];
    const newUIOrderMap = new Map<string, number>();
    newUIOrderNodes.forEach((n, idx) => newUIOrderMap.set(n.id, idx));

    const updated = nodes.map((n) => {
      if (targetIds.has(n.id)) {
        return {
          ...n,
          props: {
            ...n.props,
            uiOrder: newUIOrderMap.get(n.id) ?? n.props?.uiOrder,
            layoutGroup: newGroupId,
            layoutGroupName: groupName,
            layoutGroupId: groupIdClean,
            containerType: isCard ? 'card' : 'div',
            containerDisplay: isGrid ? 'grid' : 'flex',
            containerDirection: isGrid ? 'row' : direction,
            containerJustify: 'flex-start',
            containerAlign: 'center',
            containerWrap: 'wrap',
            containerGap: '12px',
            containerPadding: isCard ? '16px' : '0px',
            containerBg: isCard ? 'card' : 'transparent',
            containerRadius: isCard ? 'var(--radius-xl)' : '0px',
            containerBorder: isCard,
            flexWidth: isGrid ? '1/2' : 'flex-1',
          },
        };
      }
      if (n.type === 'ui' && newUIOrderMap.has(n.id)) {
        return {
          ...n,
          props: {
            ...n.props,
            uiOrder: newUIOrderMap.get(n.id),
          },
        };
      }
      return n;
    });

    onUpdateNodes(updated);
    setSelectedNodeIds(new Set());
  };

  // Add a new empty Div or Card container into document flow
  const handleAddEmptyContainer = (containerType: 'div' | 'card' = 'div', customName?: string) => {
    const isCard = containerType === 'card';
    const newGroupId = `group-${Date.now()}`;
    const defaultName = `${isCard ? 'Card' : 'Div'} Row (Empty)`;
    const groupName = customName?.trim() || defaultName;
    const groupIdClean = sanitizeHtmlId(groupName);
    const newHolderNode: PlaygroundNode = {
      id: `container-holder-${Date.now()}`,
      type: 'ui',
      subtype: 'Container',
      label: isCard ? 'Card Container' : 'Div Wrapper',
      position: { x: 60, y: 60 },
      inPorts: [],
      outPorts: [],
      props: {
        content: isCard ? 'Card Container' : 'Div Wrapper',
        layoutGroup: newGroupId,
        layoutGroupName: `${isCard ? 'Card' : 'Div'} Row (Empty)`,
        containerType: containerType,
        containerDisplay: 'flex',
        containerDirection: 'row',
        containerJustify: 'flex-start',
        containerAlign: 'center',
        containerWrap: 'wrap',
        containerGap: '12px',
        containerPadding: isCard ? '16px' : '0px',
        containerBg: isCard ? 'card' : 'transparent',
        containerRadius: isCard ? 'var(--radius-xl)' : '0px',
        containerBorder: isCard,
        isContainerHolder: true,
        uiOrder: nodes.filter((n) => n.type === 'ui').length,
      },
    };

    onUpdateNodes([...nodes, newHolderNode]);
  };

  // Unwrap / Dissolve container back to standalone (or adopt into parent container)
  const handleUnwrapContainer = (groupId: string) => {
    const groupNodes = nodes.filter((n) => n.props?.layoutGroup === groupId);
    const parentGroup = groupNodes[0]?.props?.parentGroup;

    const updated = nodes
      .filter((n) => !(n.props?.layoutGroup === groupId && n.props?.isContainerHolder))
      .map((n) => {
        // Nested containers directly inside this groupId get adopted by parentGroup
        if (n.props?.parentGroup === groupId) {
          const nextProps = { ...n.props };
          if (parentGroup) {
            nextProps.parentGroup = parentGroup;
          } else {
            delete nextProps.parentGroup;
          }
          return { ...n, props: nextProps };
        }
        // Leaf nodes directly inside this groupId
        if (n.props?.layoutGroup === groupId) {
          const nextProps = { ...n.props };
          if (parentGroup) {
            nextProps.layoutGroup = parentGroup;
            const parentFirst = nodes.find((x) => x.props?.layoutGroup === parentGroup);
            nextProps.parentGroup = parentFirst?.props?.parentGroup;
            nextProps.containerType = parentFirst?.props?.containerType;
            nextProps.containerDirection = parentFirst?.props?.containerDirection;
          } else {
            delete nextProps.layoutGroup;
            delete nextProps.parentGroup;
            delete nextProps.layoutGroupName;
            delete nextProps.containerType;
            delete nextProps.containerDisplay;
            delete nextProps.containerDirection;
            delete nextProps.containerJustify;
            delete nextProps.containerAlign;
            delete nextProps.containerWrap;
            delete nextProps.containerGap;
            delete nextProps.containerPadding;
            delete nextProps.containerBg;
            delete nextProps.containerRadius;
            delete nextProps.containerBorder;
            delete nextProps.flexWidth;
          }
          return { ...n, props: nextProps };
        }
        return n;
      });
    onUpdateNodes(updated);
  };

  // Eject nested container to top level (removes parentGroup)
  const handleEjectContainer = (groupId: string) => {
    const updated = nodes.map((n) => {
      if (n.props?.layoutGroup === groupId) {
        const nextProps = { ...n.props };
        delete nextProps.parentGroup;
        return { ...n, props: nextProps };
      }
      return n;
    });
    onUpdateNodes(updated);
  };

  // Switch container style between 'div' (pure wrapper) and 'card' (white/surface card)
  const handleUpdateContainerType = (groupId: string, newType: 'div' | 'card') => {
    const isCard = newType === 'card';
    const updated = nodes.map((n) => {
      if (n.props?.layoutGroup === groupId) {
        return {
          ...n,
          props: {
            ...n.props,
            containerType: newType,
            containerBorder: isCard,
            containerBg: isCard ? 'card' : 'transparent',
            containerPadding: isCard ? '16px' : '0px',
            containerRadius: isCard ? 'var(--radius-xl)' : '0px',
          },
        };
      }
      return n;
    });
    onUpdateNodes(updated);
  };

  // Eject single child from container (moves up one level or to standalone)
  const handleEjectChild = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    const parentGroup = targetNode?.props?.parentGroup;

    const updated = nodes.map((n) => {
      if (n.id === nodeId) {
        const nextProps = { ...n.props };
        if (parentGroup) {
          nextProps.layoutGroup = parentGroup;
          const parentFirst = nodes.find((x) => x.props?.layoutGroup === parentGroup);
          nextProps.parentGroup = parentFirst?.props?.parentGroup;
          nextProps.containerType = parentFirst?.props?.containerType;
          nextProps.containerDirection = parentFirst?.props?.containerDirection;
        } else {
          delete nextProps.layoutGroup;
          delete nextProps.parentGroup;
          delete nextProps.containerType;
          delete nextProps.flexWidth;
        }
        return { ...n, props: nextProps };
      }
      return n;
    });
    onUpdateNodes(updated);
  };

  // Update container CSS properties for all children in the group
  const handleUpdateContainerProp = (groupId: string, propKey: string, propVal: any) => {
    const updated = nodes.map((n) => {
      if (n.props?.layoutGroup === groupId) {
        return {
          ...n,
          props: {
            ...n.props,
            [propKey]: propVal,
          },
        };
      }
      return n;
    });
    onUpdateNodes(updated);
  };

  // Auto-group by canvas visual Y position proximity
  const handleAutoGroupByCanvas = () => {
    const sorted = [...uiNodes].sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));
    const groups: PlaygroundNode[][] = [];
    let currentGroup: PlaygroundNode[] = [];

    sorted.forEach((node) => {
      if (currentGroup.length === 0) {
        currentGroup.push(node);
      } else {
        const firstNodeY = currentGroup[0].position?.y ?? 0;
        const currentY = node.position?.y ?? 0;
        if (Math.abs(currentY - firstNodeY) <= 35) {
          currentGroup.push(node);
        } else {
          groups.push(currentGroup);
          currentGroup = [node];
        }
      }
    });
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    const updated = nodes.map((n) => {
      if (n.type !== 'ui') return n;
      const targetGroupIndex = groups.findIndex((g) => g.some((item) => item.id === n.id));
      if (targetGroupIndex >= 0 && groups[targetGroupIndex].length > 1) {
        const groupId = `row-auto-${targetGroupIndex + 1}`;
        return {
          ...n,
          props: {
            ...n.props,
            layoutGroup: groupId,
            layoutGroupName: `Div Row ${targetGroupIndex + 1}`,
            containerType: 'div',
            containerDisplay: 'flex',
            containerDirection: 'row',
            containerJustify: 'flex-start',
            containerAlign: 'center',
            containerWrap: 'wrap',
            containerGap: '12px',
            containerPadding: '0px',
            containerBg: 'transparent',
            containerRadius: '0px',
            containerBorder: false,
            flexWidth: 'flex-1',
          },
        };
      } else {
        const nextProps = { ...n.props };
        delete nextProps.layoutGroup;
        delete nextProps.containerType;
        return { ...n, props: nextProps };
      }
    });

    onUpdateNodes(updated);
  };

  // Reset entire layout to single stacked column
  const handleResetLayout = () => {
    const updated = nodes
      .filter((n) => !n.props?.isContainerHolder)
      .map((n) => {
        if (n.type === 'ui') {
          const nextProps = { ...n.props };
          delete nextProps.layoutGroup;
          delete nextProps.containerType;
          delete nextProps.flexWidth;
          return { ...n, props: nextProps };
        }
        return n;
      });
    onUpdateNodes(updated);
  };

  // ----------------------------------------------------
  // Drop single item or entire container into container
  // ----------------------------------------------------
  const handleDropIntoContainer = (sourceId: string, containerId: string) => {
    if (!sourceId || sourceId === containerId) return;

    // Guard against circular nesting
    if (isAncestorGroup(sourceId, containerId, nodes)) {
      return;
    }

    // Get target container config
    const targetGroupNodes = uiNodes.filter((n) => n.props?.layoutGroup === containerId);
    if (targetGroupNodes.length === 0) return;
    const targetFirst = targetGroupNodes[0];
    const targetContainerType = targetFirst.props?.containerType || 'div';
    const targetDirection = targetFirst.props?.containerDirection || 'row';
    const targetGroupName =
      targetFirst.props?.layoutGroupName?.replace(' (Empty)', '') || (targetContainerType === 'card' ? 'Card Container' : 'Div Wrapper');

    // Case 1: sourceId is an entire container group (NESTED CONTAINER: Div inside Div)!
    const sourceGroupNodes = uiNodes.filter((n) => n.props?.layoutGroup === sourceId);
    if (sourceGroupNodes.length > 0) {
      const sourceIds = new Set(sourceGroupNodes.map((n) => n.id));

      // Reorder in document flow so source nodes sit right after target container's current nodes
      const remainingNodes = uiNodes.filter((n) => !sourceIds.has(n.id));
      let insertAt = remainingNodes.length;
      const targetIndices = remainingNodes
        .map((n, idx) => (n.props?.layoutGroup === containerId ? idx : -1))
        .filter((idx) => idx >= 0);
      if (targetIndices.length > 0) {
        insertAt = Math.max(...targetIndices) + 1;
      }

      const updatedSourceNodes = sourceGroupNodes.map((n) => ({
        ...n,
        props: {
          ...n.props,
          parentGroup: containerId,
        },
      }));

      const newOrder = [
        ...remainingNodes.slice(0, insertAt),
        ...updatedSourceNodes,
        ...remainingNodes.slice(insertAt),
      ];

      const orderMap = new Map<string, number>();
      newOrder.forEach((n, idx) => orderMap.set(n.id, idx));

      const updated = nodes.map((n) => {
        if (sourceIds.has(n.id)) {
          return {
            ...n,
            props: {
              ...n.props,
              parentGroup: containerId,
              uiOrder: orderMap.get(n.id) ?? n.props?.uiOrder,
            },
          };
        }
        if (n.type === 'ui' && orderMap.has(n.id)) {
          return {
            ...n,
            props: {
              ...n.props,
              uiOrder: orderMap.get(n.id),
            },
          };
        }
        return n;
      });

      onUpdateNodes(updated);
      handleDragEnd();
      return;
    }

    // Case 2: sourceId is an individual node
    const sourceIndex = uiNodes.findIndex((n) => n.id === sourceId);
    if (sourceIndex === -1) return;

    const sourceNode = uiNodes[sourceIndex];
    // Remove target's placeholder node ONLY if target container has no nested child containers
    const targetHasNestedContainers = uiNodes.some((n) => n.props?.parentGroup === containerId);
    const shouldRemoveHolder = !targetHasNestedContainers;

    const remainingNodes = uiNodes.filter(
      (n) => n.id !== sourceId && !(shouldRemoveHolder && n.props?.layoutGroup === containerId && n.props?.isContainerHolder)
    );

    let insertAt = remainingNodes.findIndex((n) => n.props?.layoutGroup === containerId);
    if (insertAt === -1) {
      const originalHolderIndex = uiNodes.findIndex(
        (n) => n.props?.layoutGroup === containerId && n.props?.isContainerHolder
      );
      insertAt = originalHolderIndex >= 0 ? Math.min(originalHolderIndex, remainingNodes.length) : remainingNodes.length;
    } else {
      const lastTargetItemIndex = remainingNodes
        .map((n, idx) => (n.props?.layoutGroup === containerId ? idx : -1))
        .filter((idx) => idx >= 0)
        .pop();
      insertAt = lastTargetItemIndex !== undefined ? lastTargetItemIndex + 1 : remainingNodes.length;
    }

    const movedWithGroup: PlaygroundNode = {
      ...sourceNode,
      props: {
        ...sourceNode.props,
        layoutGroup: containerId,
        parentGroup: targetFirst.props?.parentGroup,
        layoutGroupName: targetGroupName,
        containerType: targetContainerType,
        containerDirection: targetDirection,
        flexWidth: sourceNode.props?.flexWidth || 'flex-1',
        isContainerHolder: undefined,
      },
    };

    const newOrder = [
      ...remainingNodes.slice(0, insertAt),
      movedWithGroup,
      ...remainingNodes.slice(insertAt),
    ];

    const orderMap = new Map<string, number>();
    newOrder.forEach((n, idx) => orderMap.set(n.id, idx));

    const updated = nodes
      .filter((n) => !(shouldRemoveHolder && n.props?.layoutGroup === containerId && n.props?.isContainerHolder))
      .map((n) => {
        if (n.id === sourceId) {
          return {
            ...n,
            props: {
              ...n.props,
              layoutGroup: containerId,
              parentGroup: targetFirst.props?.parentGroup,
              layoutGroupName: targetGroupName,
              containerType: targetContainerType,
              containerDirection: targetDirection,
              flexWidth: n.props?.flexWidth || 'flex-1',
              isContainerHolder: undefined,
              uiOrder: orderMap.get(n.id),
            },
          };
        }
        if (n.type === 'ui' && orderMap.has(n.id)) {
          return {
            ...n,
            props: {
              ...n.props,
              uiOrder: orderMap.get(n.id),
            },
          };
        }
        return n;
      });

    onUpdateNodes(updated);
    handleDragEnd();
  };

  // ----------------------------------------------------
  // Wrap Two Nodes Together (Drag Node A onto Node B or Container)
  // ----------------------------------------------------
  const handleWrapTwoNodes = (
    sourceId: string,
    targetId: string,
    direction: 'row' | 'column' = 'row',
    containerType: 'div' | 'card' = 'div'
  ) => {
    if (sourceId === targetId) return;

    const sourceIsContainer = uiNodes.some((n) => n.props?.layoutGroup === sourceId);
    const targetIsContainer = uiNodes.some((n) => n.props?.layoutGroup === targetId);

    // If target is a container, drop source into target! (Div into Div, or Item into Div)
    if (targetIsContainer) {
      handleDropIntoContainer(sourceId, targetId);
      return;
    }

    // If target is inside an existing container, add source into that container
    const targetNode = uiNodes.find((n) => n.id === targetId);
    if (targetNode?.props?.layoutGroup) {
      handleDropIntoContainer(sourceId, targetNode.props.layoutGroup);
      return;
    }

    // If source is a container, drop target into source
    if (sourceIsContainer) {
      handleDropIntoContainer(targetId, sourceId);
      return;
    }

    // If source is inside an existing container, add target into that container
    const sourceNode = uiNodes.find((n) => n.id === sourceId);
    if (sourceNode?.props?.layoutGroup) {
      handleDropIntoContainer(targetId, sourceNode.props.layoutGroup);
      return;
    }

    if (!sourceNode || !targetNode) return;

    const isCard = containerType === 'card';
    const isRow = direction === 'row';

    // Target node is standalone: create a new container wrapping both items in place
    const newGroupId = `group-${Date.now()}`;
    const groupName = `${isCard ? 'Card' : 'Div'} ${isRow ? 'Row' : 'Col'} (2 items)`;

    const targetIndex = uiNodes.findIndex((n) => n.id === targetId);
    const remainingNodes = uiNodes.filter((n) => n.id !== sourceId && n.id !== targetId);
    const insertIndex = remainingNodes.filter(
      (n) => uiNodes.findIndex((x) => x.id === n.id) < targetIndex
    ).length;

    const wrappedPair = [targetNode, sourceNode];
    const newOrderNodes = [
      ...remainingNodes.slice(0, insertIndex),
      ...wrappedPair,
      ...remainingNodes.slice(insertIndex),
    ];

    const orderMap = new Map<string, number>();
    newOrderNodes.forEach((n, idx) => orderMap.set(n.id, idx));

    const updated = nodes.map((n) => {
      if (n.id === sourceId || n.id === targetId) {
        return {
          ...n,
          props: {
            ...n.props,
            uiOrder: orderMap.get(n.id),
            layoutGroup: newGroupId,
            layoutGroupName: groupName,
            containerType: isCard ? 'card' : 'div',
            containerDisplay: 'flex',
            containerDirection: direction,
            containerJustify: 'flex-start',
            containerAlign: 'center',
            containerWrap: 'wrap',
            containerGap: '12px',
            containerPadding: isCard ? '16px' : '0px',
            containerBg: isCard ? 'card' : 'transparent',
            containerRadius: isCard ? 'var(--radius-xl)' : '0px',
            containerBorder: isCard,
            flexWidth: 'flex-1',
          },
        };
      }
      if (n.type === 'ui' && orderMap.has(n.id)) {
        return {
          ...n,
          props: {
            ...n.props,
            uiOrder: orderMap.get(n.id),
          },
        };
      }
      return n;
    });

    onUpdateNodes(updated);
    handleDragEnd();
  };

  // ----------------------------------------------------
  // WrapDropdown Action Handlers (Fallback for Drag-and-Drop)
  // ----------------------------------------------------
  const handleWrapInNew = (
    nodeId: string,
    direction: 'row' | 'column' = 'row',
    containerType: 'div' | 'card' = 'div',
    customName?: string
  ) => {
    handleGroupSelected(direction, containerType, new Set([nodeId]), customName);
  };

  const handleMoveToContainer = (nodeId: string, targetContainerId: string) => {
    handleDropIntoContainer(nodeId, targetContainerId);
  };

  const handleMergeWithNodes = (
    sourceNodeId: string,
    targetNodeIds: string[],
    customName?: string,
    direction: 'row' | 'column' = 'row',
    containerType: 'div' | 'card' = 'div'
  ) => {
    const combined = new Set([sourceNodeId, ...targetNodeIds]);
    handleGroupSelected(direction, containerType, combined, customName);
  };

  // ----------------------------------------------------
  // Drag End & Cleanup Handler
  // ----------------------------------------------------
  const handleDragEnd = () => {
    draggedIdRef.current = null;
    setDraggedBlockId(null);
    setDraggedChildId(null);
    setDragOverBlockId(null);
    setDragOverChildId(null);
    setDragOverContainerId(null);
    setDropInsertionIndex(null);
  };

  // ----------------------------------------------------
  // Block Drag and Drop Handlers (Reorder Rows & Items)
  // ----------------------------------------------------
  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    draggedIdRef.current = blockId;
    try {
      e.dataTransfer.setData('text/plain', blockId);
      e.dataTransfer.setData('application/x-reactlabz-node', blockId);
      e.dataTransfer.effectAllowed = 'move';
    } catch {
      // ignore
    }
    requestAnimationFrame(() => {
      setDraggedBlockId(blockId);
    });
  };

  const handleBlockDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBlockId !== blockId) {
      setDragOverBlockId(blockId);
    }
  };

  const handleBlockDragLeave = (e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    if (e.currentTarget) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        return;
      }
    }
    if (dragOverBlockId === blockId) {
      setDragOverBlockId(null);
    }
  };

  const handleBlockDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceBlockId = getSourceDraggedId(e) || draggedBlockId;
    handleDragEnd();

    if (!sourceBlockId || sourceBlockId === targetBlockId) return;

    const sourceIndex = flowBlocks.findIndex((b) => b.id === sourceBlockId);
    const targetIndex = flowBlocks.findIndex((b) => b.id === targetBlockId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newBlocks = [...flowBlocks];
    const [movedBlock] = newBlocks.splice(sourceIndex, 1);
    newBlocks.splice(targetIndex, 0, movedBlock);

    // Flatten newBlocks back to an ordered list of UI node IDs
    const orderedUINodeIds: string[] = [];
    for (const block of newBlocks) {
      if (block.type === 'container') {
        const childIds = getUINodeIdsFromChildren(block.children, uiNodes);
        if (childIds.length > 0) {
          orderedUINodeIds.push(...childIds);
        } else {
          const holder = uiNodes.find(
            (n) => n.props?.layoutGroup === block.groupId && n.props?.isContainerHolder
          );
          if (holder) orderedUINodeIds.push(holder.id);
        }
      } else {
        orderedUINodeIds.push(block.node.id);
      }
    }

    const orderMap = new Map<string, number>();
    orderedUINodeIds.forEach((id, idx) => orderMap.set(id, idx));

    const updatedNodes = nodes.map((n) => {
      if (n.type === 'ui' && orderMap.has(n.id)) {
        return {
          ...n,
          props: {
            ...n.props,
            uiOrder: orderMap.get(n.id),
          },
        };
      }
      return n;
    });

    onUpdateNodes(updatedNodes);
  };

  // ----------------------------------------------------
  // Child Drag Handlers (Reorder within or between containers)
  // ----------------------------------------------------
  const handleChildDragStart = (e: React.DragEvent, childId: string) => {
    e.stopPropagation();
    draggedIdRef.current = childId;
    try {
      e.dataTransfer.setData('text/plain', childId);
      e.dataTransfer.setData('application/x-reactlabz-node', childId);
      e.dataTransfer.effectAllowed = 'move';
    } catch {
      // ignore
    }
    requestAnimationFrame(() => {
      setDraggedChildId(childId);
    });
  };

  const handleChildDragOver = (e: React.DragEvent, childId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverChildId !== childId) {
      setDragOverChildId(childId);
    }
  };

  const handleChildDragLeave = (e: React.DragEvent, childId: string) => {
    e.stopPropagation();
    if (e.currentTarget) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        return;
      }
    }
    if (dragOverChildId === childId) {
      setDragOverChildId(null);
    }
  };

  const handleChildDrop = (e: React.DragEvent, targetChildId: string, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceChildId = getSourceDraggedId(e);
    handleDragEnd();

    if (!sourceChildId || sourceChildId === targetChildId) return;

    // If source is a container, or is from outside this container, drop it into the container
    const isSourceContainer = uiNodes.some((n) => n.props?.layoutGroup === sourceChildId);
    const sourceNode = uiNodes.find((n) => n.id === sourceChildId);
    if (isSourceContainer || (sourceNode && sourceNode.props?.layoutGroup !== targetGroupId)) {
      handleDropIntoContainer(sourceChildId, targetGroupId);
      return;
    }

    const sourceIndex = uiNodes.findIndex((n) => n.id === sourceChildId);
    const targetIndex = uiNodes.findIndex((n) => n.id === targetChildId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newOrder = [...uiNodes];
    const [moved] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderMap = new Map<string, number>();
    newOrder.forEach((n, idx) => orderMap.set(n.id, idx));

    const updated = nodes.map((n) => {
      if (n.type === 'ui' && orderMap.has(n.id)) {
        return {
          ...n,
          props: {
            ...n.props,
            uiOrder: orderMap.get(n.id),
          },
        };
      }
      return n;
    });

    onUpdateNodes(updated);
  };

  // ----------------------------------------------------
  // Insert / Reorder block at specific index in document flow (between blocks)
  // ----------------------------------------------------
  const handleInsertBlockAt = (draggedId: string, targetBlockIndex: number) => {
    const sourceBlockIndex = flowBlocks.findIndex((b) => b.id === draggedId);

    if (sourceBlockIndex !== -1) {
      // Reordering an existing top-level block
      if (sourceBlockIndex === targetBlockIndex || sourceBlockIndex === targetBlockIndex - 1) {
        handleDragEnd();
        return;
      }
      const newBlocks = [...flowBlocks];
      const [movedBlock] = newBlocks.splice(sourceBlockIndex, 1);
      const finalIndex = sourceBlockIndex < targetBlockIndex ? targetBlockIndex - 1 : targetBlockIndex;
      newBlocks.splice(finalIndex, 0, movedBlock);

      const orderedUINodeIds: string[] = [];
      for (const block of newBlocks) {
        if (block.type === 'container') {
          const childIds = getUINodeIdsFromChildren(block.children, uiNodes);
          if (childIds.length > 0) {
            orderedUINodeIds.push(...childIds);
          } else {
            const holder = uiNodes.find(
              (n) => n.props?.layoutGroup === block.groupId && n.props?.isContainerHolder
            );
            if (holder) orderedUINodeIds.push(holder.id);
          }
        } else {
          orderedUINodeIds.push(block.node.id);
        }
      }

      const orderMap = new Map<string, number>();
      orderedUINodeIds.forEach((id, idx) => orderMap.set(id, idx));

      const updatedNodes = nodes.map((n) => {
        if (n.type === 'ui' && orderMap.has(n.id)) {
          return {
            ...n,
            props: {
              ...n.props,
              uiOrder: orderMap.get(n.id),
            },
          };
        }
        return n;
      });

      onUpdateNodes(updatedNodes);
      handleDragEnd();
      return;
    }

    // Dragged item is a child inside a container that's dropped into an insertion gap
    const draggedNode = uiNodes.find((n) => n.id === draggedId);
    if (draggedNode && draggedNode.props?.layoutGroup) {
      const standaloneProps: Record<string, any> = { ...draggedNode.props };
      delete standaloneProps.layoutGroup;
      delete standaloneProps.containerType;
      delete standaloneProps.flexWidth;

      const standaloneNode: PlaygroundNode = {
        ...draggedNode,
        props: standaloneProps,
      };

      const newBlocks: FlowBlock[] = [];
      let inserted = false;
      flowBlocks.forEach((block, idx) => {
        if (idx === targetBlockIndex) {
          newBlocks.push({ type: 'node', id: standaloneNode.id, node: standaloneNode });
          inserted = true;
        }
        if (block.type === 'container') {
          const remainingItems = block.items.filter((item) => item.id !== draggedId);
          if (remainingItems.length > 0) {
            newBlocks.push({ ...block, items: remainingItems });
          }
        } else if (block.id !== draggedId) {
          newBlocks.push(block);
        }
      });
      if (!inserted) {
        newBlocks.push({ type: 'node', id: standaloneNode.id, node: standaloneNode });
      }

      const orderedUINodeIds: string[] = [];
      for (const block of newBlocks) {
        if (block.type === 'container') {
          const childIds = getUINodeIdsFromChildren(block.children, uiNodes);
          if (childIds.length > 0) {
            orderedUINodeIds.push(...childIds);
          } else {
            const holder = uiNodes.find(
              (n) => n.props?.layoutGroup === block.groupId && n.props?.isContainerHolder
            );
            if (holder) orderedUINodeIds.push(holder.id);
          }
        } else {
          orderedUINodeIds.push(block.node.id);
        }
      }

      const orderMap = new Map<string, number>();
      orderedUINodeIds.forEach((id, idx) => orderMap.set(id, idx));

      const updatedNodes = nodes.map((n) => {
        if (n.id === draggedId) {
          const nextProps: Record<string, any> = { ...n.props, uiOrder: orderMap.get(n.id) };
          delete nextProps.layoutGroup;
          delete nextProps.containerType;
          delete nextProps.flexWidth;
          return { ...n, props: nextProps };
        }
        if (n.type === 'ui' && orderMap.has(n.id)) {
          return {
            ...n,
            props: {
              ...n.props,
              uiOrder: orderMap.get(n.id),
            },
          };
        }
        return n;
      });

      onUpdateNodes(updatedNodes);
      handleDragEnd();
    }
  };

  // ----------------------------------------------------
  // Render Interactive Insertion Gap (Drop zone between blocks)
  // ----------------------------------------------------
  const renderInsertionGap = (index: number) => {
    const isDraggingAny = Boolean(draggedBlockId || draggedChildId || draggedIdRef.current);
    const isTarget = dropInsertionIndex === index;

    return (
      <div
        key={`flow-gap-${index}`}
        data-gap-index={index}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          if (dropInsertionIndex !== index) {
            setDropInsertionIndex(index);
          }
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          if (e.currentTarget) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            if (
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom
            ) {
              return;
            }
          }
          if (dropInsertionIndex === index) {
            setDropInsertionIndex(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const sourceId = getSourceDraggedId(e);
          if (sourceId) {
            handleInsertBlockAt(sourceId, index);
          }
          handleDragEnd();
        }}
        style={{
          width: '100%',
          flexShrink: 0,
          minHeight: isTarget ? '26px' : '6px',
          margin: isTarget ? '3px 0' : '0px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isTarget
            ? 'var(--accent-primary-subtle)'
            : isDraggingAny
            ? 'rgba(99, 102, 241, 0.05)'
            : 'transparent',
          border: isTarget
            ? '2px dashed var(--accent-primary)'
            : isDraggingAny
            ? '1px dashed rgba(99, 102, 241, 0.25)'
            : '1px solid transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: 'var(--accent-primary)',
          fontSize: '11px',
          fontWeight: 600,
          transition: 'all 100ms ease-out',
          boxSizing: 'border-box',
          cursor: isDraggingAny ? 'copy' : 'default',
          userSelect: 'none',
        }}
      >
        {isTarget && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none' }}>
            <ArrowUpDown size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>Place item here in order</span>
          </span>
        )}
      </div>
    );
  };

  // Render Interactive Insertion Gap for Preview Canvas (Right Column)
  const renderPreviewInsertionGap = (index: number) => {
    const isDraggingAny = Boolean(draggedBlockId || draggedChildId || draggedIdRef.current);
    const isTarget = dropInsertionIndex === index;

    return (
      <div
        key={`preview-gap-${index}`}
        data-preview-gap-index={index}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          if (dropInsertionIndex !== index) {
            setDropInsertionIndex(index);
          }
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          if (e.currentTarget) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            if (
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom
            ) {
              return;
            }
          }
          if (dropInsertionIndex === index) {
            setDropInsertionIndex(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const sourceId = getSourceDraggedId(e);
          if (sourceId) {
            handleInsertBlockAt(sourceId, index);
          }
          handleDragEnd();
        }}
        style={{
          width: '100%',
          flexShrink: 0,
          minHeight: isTarget ? '24px' : '4px',
          margin: isTarget ? '3px 0' : '0px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isTarget
            ? 'var(--accent-primary-subtle)'
            : isDraggingAny
            ? 'rgba(99, 102, 241, 0.05)'
            : 'transparent',
          border: isTarget
            ? '2px dashed var(--accent-primary)'
            : isDraggingAny
            ? '1px dashed rgba(99, 102, 241, 0.25)'
            : '1px solid transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 100ms ease-out',
          boxSizing: 'border-box',
        }}
      >
        {isTarget && (
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)', pointerEvents: 'none' }}>
            Drop to place here in document flow
          </span>
        )}
      </div>
    );
  };

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

  const deviceWidthMap: Record<DeviceViewportType, string> = {
    desktop: '100%',
    laptop: '1024px',
    tablet: '768px',
    mobile: '375px',
  };

  // Render a container card (top-level or nested recursively)
  const renderContainerBlock = (
    containerBlock: {
      groupId: string;
      config: FlexContainerConfig & { containerType?: 'div' | 'card' };
      children: ContainerChild[];
      items: PlaygroundNode[];
      parentGroup?: string;
    },
    isNested: boolean = false
  ): React.ReactNode => {
    const { groupId, config, children, items } = containerBlock;
    const isDirectionRow = config.flexDirection === 'row';
    const isCard = config.containerType === 'card';
    const currentDraggedId = getSourceDraggedId();
    const isDraggedFromOutside = Boolean(
      currentDraggedId &&
      currentDraggedId !== groupId &&
      !items.some((i) => i.id === currentDraggedId) &&
      !children.some((c) => (c.kind === 'container' ? c.groupId === currentDraggedId : c.id === currentDraggedId))
    );
    const isDragOver = dragOverBlockId === groupId && draggedBlockId !== groupId;
    const isContainerTargeted = (dragOverContainerId === groupId || isDragOver) && isDraggedFromOutside;

    return (
      <div
        key={groupId}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleBlockDragOver(e, groupId);
          if (dragOverContainerId !== groupId) setDragOverContainerId(groupId);
        }}
        onDragLeave={(e) => {
          handleBlockDragLeave(e, groupId);
          if (dragOverContainerId === groupId) setDragOverContainerId(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const sourceId = getSourceDraggedId(e);
          if (sourceId && sourceId !== groupId) {
            handleDropIntoContainer(sourceId, groupId);
          } else {
            handleBlockDrop(e, groupId);
          }
          handleDragEnd();
        }}
        onDragEnd={handleDragEnd}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minHeight: 'fit-content',
          borderRadius: isNested ? 'var(--radius-lg)' : 'var(--radius-xl)',
          backgroundColor: isNested
            ? isCard
              ? 'var(--bg-surface)'
              : 'rgba(99, 102, 241, 0.03)'
            : 'var(--bg-surface-elevated)',
          border: isContainerTargeted
            ? '2px solid var(--accent-primary)'
            : isNested
            ? '1.5px dashed var(--border-default)'
            : '1px solid var(--border-default)',
          boxShadow: isContainerTargeted
            ? '0 0 0 2px var(--accent-primary), 0 8px 24px rgba(99, 102, 241, 0.28)'
            : isNested
            ? 'var(--shadow-xs)'
            : 'var(--shadow-sm)',
          overflow: 'hidden',
          outline: 'none',
          transition: 'all var(--transition-fast)',
          opacity: draggedBlockId === groupId ? 0.45 : 1,
          width: '100%',
          boxSizing: 'border-box',
          margin: isNested ? '4px 0' : undefined,
        }}
      >
        {/* Container Control Header */}
        <div
          draggable={true}
          onDragStart={(e) => {
            const el = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as HTMLElement | null;
            if (el?.closest('select, input, [data-no-drag="true"], button, a')) {
              e.preventDefault();
              return;
            }
            handleBlockDragStart(e, groupId);
          }}
          onDragEnd={handleDragEnd}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isNested ? '6px 10px' : '8px 12px',
            backgroundColor: isNested
              ? 'var(--bg-surface-elevated)'
              : isCard
              ? 'var(--bg-surface)'
              : 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            borderTopLeftRadius: isNested ? 'var(--radius-lg)' : 'var(--radius-xl)',
            borderTopRightRadius: isNested ? 'var(--radius-lg)' : 'var(--radius-xl)',
            flexWrap: 'wrap',
            gap: '8px',
            cursor: 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            ...({ WebkitUserDrag: 'element' } as any),
          }}
          title="Drag container to reorder or drop into another container"
        >
          {/* Left: Drag Handle, Container Type & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'grab', userSelect: 'none' }}>
            <div
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px 4px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                cursor: 'grab',
                userSelect: 'none',
              }}
              title="Drag container"
            >
              <GripVertical size={14} style={{ pointerEvents: 'none' }} />
            </div>

            {!isNested ? (
              <input
                data-no-drag="true"
                type="checkbox"
                checked={items.length > 0 && items.every((item) => selectedNodeIds.has(item.id))}
                disabled={items.length === 0}
                onChange={(e) => {
                  e.stopPropagation();
                  const allSelected = items.length > 0 && items.every((item) => selectedNodeIds.has(item.id));
                  const nextSelected = new Set(selectedNodeIds);
                  items.forEach((item) => {
                    if (allSelected) {
                      nextSelected.delete(item.id);
                    } else {
                      nextSelected.add(item.id);
                    }
                  });
                  setSelectedNodeIds(nextSelected);
                }}
                style={{ cursor: items.length === 0 ? 'not-allowed' : 'pointer', outline: 'none', opacity: items.length === 0 ? 0.4 : 1 }}
              />
            ) : null}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isNested ? '20px' : '24px',
                height: isNested ? '20px' : '24px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isCard ? 'rgba(99, 102, 241, 0.15)' : 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary)',
                userSelect: 'none',
              }}
            >
              {isCard ? <CreditCard size={isNested ? 12 : 14} /> : <Boxes size={isNested ? 12 : 14} />}
            </div>

            {editingGroupId === groupId ? (
              <div
                data-no-drag="true"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editingGroupName}
                  onChange={(e) => setEditingGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveContainerName(groupId);
                    if (e.key === 'Escape') setEditingGroupId(null);
                  }}
                  autoFocus
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--accent-primary)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'var(--font-mono)',
                    width: '130px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveContainerName(groupId)}
                  style={{
                    padding: '2px 5px',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Save Name & ID"
                >
                  <Check size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGroupId(null)}
                  style={{
                    padding: '2px 5px',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Cancel"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div
                data-no-drag="true"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartRenameContainer(groupId, config.name || `${isCard ? 'Card' : 'Div'} Container`);
                }}
                title="Click to rename container (sets HTML id in generated code)"
              >
                <span style={{ fontSize: isNested ? '11.5px' : '12.5px', fontWeight: 700, color: 'var(--text-primary)', userSelect: 'none' }}>
                  {isNested ? `↳ Nested ${isCard ? 'Card' : 'Div'}` : config.name || `${isCard ? 'Card' : 'Div'} Container`}
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--accent-primary)',
                    fontWeight: 600,
                  }}
                  title="Generated HTML id attribute in TSX"
                >
                  #{sanitizeHtmlId(config.name || `${isCard ? 'card' : 'div'}-${groupId}`)}
                </span>
                <Edit2 size={11} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
              </div>
            )}

            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isCard ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                color: isCard ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: 600,
                border: '1px solid var(--border-subtle)',
                userSelect: 'none',
              }}
            >
              {children.length === 0 ? 'Empty' : `${children.length} ${children.length === 1 ? 'item' : 'items'}`}
            </span>
          </div>

          {/* Right: Controls (Div/Card, Row/Col, Justify, Gap, Eject, Unwrap) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Div vs Card Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <button
                type="button"
                onClick={() => handleUpdateContainerType(groupId, 'div')}
                style={{
                  padding: '2px 6px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: !isCard ? 'var(--accent-primary)' : 'transparent',
                  color: !isCard ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                Div
              </button>
              <button
                type="button"
                onClick={() => handleUpdateContainerType(groupId, 'card')}
                style={{
                  padding: '2px 6px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: isCard ? 'var(--accent-primary)' : 'transparent',
                  color: isCard ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                Card
              </button>
            </div>

            {/* Direction Toggle */}
            <button
              type="button"
              onClick={() => handleUpdateContainerProp(groupId, 'containerDirection', isDirectionRow ? 'column' : 'row')}
              title={`Switch to ${isDirectionRow ? 'Column' : 'Row'} layout`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                fontSize: '10.5px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {isDirectionRow ? <Rows size={11} /> : <Columns size={11} />}
              <span>{isDirectionRow ? '⇄ Row' : '⇅ Col'}</span>
            </button>

            {/* Justify Content */}
            <JustifyDropdown
              value={config.justifyContent || 'flex-start'}
              onChange={(val) => handleUpdateContainerProp(groupId, 'containerJustify', val)}
            />

            {/* Gap Selector */}
            <GapDropdown
              value={config.gap || '12px'}
              onChange={(val) => handleUpdateContainerProp(groupId, 'containerGap', val)}
            />

            {/* Eject Container (Only shown for nested containers) */}
            {isNested && (
              <button
                type="button"
                onClick={() => handleEjectContainer(groupId)}
                title="Eject nested container out to top level"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '2px 6px',
                  fontSize: '10.5px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  fontWeight: 600,
                }}
              >
                <ArrowUpRight size={11} />
                <span>Eject</span>
              </button>
            )}

            {/* Unwrap / Dissolve */}
            <button
              type="button"
              onClick={() => handleUnwrapContainer(groupId)}
              title="Dissolve container back to standalone elements"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                fontSize: '10.5px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-danger)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <Trash2 size={11} />
              <span className="hide-mobile">Unwrap</span>
            </button>
          </div>
        </div>

        {/* Drop Target Indicator */}
        {isContainerTargeted && children.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '2px dashed var(--accent-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-primary)',
              fontSize: '12px',
              fontWeight: 600,
              margin: '8px 12px 0 12px',
            }}
          >
            <Plus size={15} />
            <span>Drop to add inside {isCard ? 'Card' : 'Div'} container</span>
          </div>
        )}

        {/* Child Items Area (renders leaf nodes and nested container cards) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragOverContainerId !== groupId) setDragOverContainerId(groupId);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const sourceId = getSourceDraggedId(e);
            if (sourceId && sourceId !== groupId) {
              handleDropIntoContainer(sourceId, groupId);
            }
            handleDragEnd();
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: isNested ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
            borderBottomLeftRadius: isNested ? 'var(--radius-lg)' : 'var(--radius-xl)',
            borderBottomRightRadius: isNested ? 'var(--radius-lg)' : 'var(--radius-xl)',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {children.length === 0 ? (
            <div
              style={{
                width: '100%',
                padding: '18px 14px',
                borderRadius: 'var(--radius-md)',
                border: isContainerTargeted
                  ? '2px dashed var(--accent-primary)'
                  : '1.5px dashed var(--border-default)',
                backgroundColor: isContainerTargeted
                  ? 'var(--accent-primary-subtle)'
                  : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: isContainerTargeted ? 'var(--accent-primary)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
                textAlign: 'center',
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600 }}>
                <Boxes size={16} />
                <span>Empty {isCard ? 'Card' : 'Div'} Container</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Drag other elements or another Div here to place inside
              </span>
            </div>
          ) : (
            children.map((childItem) => {
              if (childItem.kind === 'container') {
                return (
                  <div key={childItem.groupId} style={{ flex: '1 1 100%', width: '100%', flexShrink: 0 }}>
                    {renderContainerBlock(childItem, true)}
                  </div>
                );
              }

              const node = childItem.node;
              const isSelected = selectedNodeIds.has(node.id);
              const title = getNodeTitle(node);
              const isChildDragOver = dragOverChildId === node.id && draggedChildId !== node.id;

              return (
                <div
                  key={node.id}
                  draggable={true}
                  onDragStart={(e) => {
                    const el = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as HTMLElement | null;
                    if (el?.closest('input, select, [data-no-drag="true"], button, a')) {
                      e.preventDefault();
                      return;
                    }
                    handleChildDragStart(e, node.id);
                  }}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleChildDragOver(e, node.id)}
                  onDragLeave={(e) => handleChildDragLeave(e, node.id)}
                  onDrop={(e) => handleChildDrop(e, node.id, groupId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    boxShadow: isChildDragOver
                      ? '0 0 0 2px var(--accent-primary), 0 4px 14px rgba(99, 102, 241, 0.25)'
                      : 'var(--shadow-xs)',
                    outline: 'none',
                    flex: '1 1 100%',
                    width: '100%',
                    minWidth: 0,
                    gap: '8px',
                    cursor: 'grab',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    ...({ WebkitUserDrag: 'element' } as any),
                    transition: 'all var(--transition-fast)',
                    boxSizing: 'border-box',
                  }}
                  title="Drag item to reorder within container or drop outside"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, cursor: 'grab', userSelect: 'none' }}>
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        cursor: 'grab',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px 4px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        userSelect: 'none',
                      }}
                      title="Drag to reorder item"
                    >
                      <GripVertical size={13} style={{ pointerEvents: 'none' }} />
                    </div>

                    <input
                      data-no-drag="true"
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleToggleSelect(node.id, e as any)}
                      style={{ cursor: 'pointer', flexShrink: 0, outline: 'none' }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22px',
                        height: '22px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0,
                        userSelect: 'none',
                      }}
                    >
                      {getSubtypeIcon(node.subtype)}
                    </div>

                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden', userSelect: 'none' }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          userSelect: 'none',
                        }}
                        title={title}
                      >
                        {title}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <WrapDropdown
                      nodeId={node.id}
                      nodeTitle={title}
                      existingContainers={existingContainersList.filter((c) => c.groupId !== groupId)}
                      otherNodes={getOtherNodesList(node.id)}
                      selectedNodeIds={selectedNodeIds}
                      onWrapInNew={handleWrapInNew}
                      onMoveToContainer={handleMoveToContainer}
                      onMergeWithNodes={handleMergeWithNodes}
                      compact={true}
                    />

                    <ItemSizingDropdown
                      value={node.props?.flexWidth || 'flex-1'}
                      onChange={(val) => onUpdateProps(node.id, { flexWidth: val })}
                    />

                    <div
                      data-no-drag="true"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEjectChild(node.id);
                      }}
                      title="Eject from container"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        outline: 'none',
                        userSelect: 'none',
                      }}
                    >
                      <LogOut size={11} />
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Visual Drop Target indicator */}
          {children.length > 0 && dragOverContainerId === groupId && activeDraggedNodeId && !children.some((c) => (c.kind === 'node' ? c.id === activeDraggedNodeId : c.groupId === activeDraggedNodeId)) && (
            <div
              style={{
                flex: '1 1 100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary-subtle)',
                border: '1.5px dashed var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: 'var(--accent-primary)',
                fontSize: '11px',
                fontWeight: 600,
                pointerEvents: 'none',
                boxSizing: 'border-box',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <Plus size={12} />
              <span>Drop to add into {isCard ? 'Card' : 'Div'} container</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render a preview container for the split preview right column
  const renderPreviewContainer = (containerBlock: {
    groupId: string;
    config: FlexContainerConfig & { containerType?: 'div' | 'card' };
    children: ContainerChild[];
    items: PlaygroundNode[];
  }): React.ReactNode => {
    const { groupId, config, children } = containerBlock;
    const isCard = config.containerType === 'card';

    const isTargeted = dragOverContainerId === groupId;

    return (
      <div
        key={groupId}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (dragOverContainerId !== groupId) setDragOverContainerId(groupId);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget && (e.currentTarget as any).contains && (e.currentTarget as any).contains(e.relatedTarget as Node)) {
            return;
          }
          if (dragOverContainerId === groupId) setDragOverContainerId(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const sourceId = getSourceDraggedId(e);
          if (sourceId && sourceId !== groupId) {
            handleDropIntoContainer(sourceId, groupId);
          }
          handleDragEnd();
        }}
        style={{
          display: config.display || 'flex',
          flexDirection: config.flexDirection || 'row',
          justifyContent: config.justifyContent || 'flex-start',
          alignItems: config.alignItems || 'center',
          flexWrap: 'wrap',
          gap: config.gap || '12px',
          padding: isCard ? '16px' : (config.padding || '0px'),
          borderRadius: isCard ? 'var(--radius-xl)' : '0px',
          backgroundColor: isTargeted ? 'var(--accent-primary-subtle)' : isCard ? '#ffffff' : 'transparent',
          border: isTargeted ? '2px dashed var(--accent-primary)' : isCard ? '1px solid var(--border-default)' : 'none',
          boxShadow: isCard ? 'var(--shadow-sm)' : 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'all var(--transition-fast)',
        }}
      >
        {children.length === 0 ? (
          <div
            draggable={true}
            onDragStart={(e) => handleBlockDragStart(e, groupId)}
            onDragEnd={handleDragEnd}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'grab',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              ...({ WebkitUserDrag: 'element' } as any),
            }}
            title="Empty container · Drag to reorder or drop elements inside"
          >
            <GripVertical size={12} />
            <Boxes size={14} />
            <span>Empty {isCard ? 'Card' : 'Div'} Container</span>
          </div>
        ) : (
          children.map((child) => {
            if (child.kind === 'container') {
              return (
                <div key={child.groupId} style={{ flex: '1 1 100%', width: '100%' }}>
                  {renderPreviewContainer(child)}
                </div>
              );
            }
            return (
              <div
                key={child.node.id}
                draggable={true}
                onDragStart={(e) => handleChildDragStart(e, child.node.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleChildDragOver(e, child.node.id)}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleChildDrop(e, child.node.id, groupId);
                  handleDragEnd();
                }}
                style={{
                  flex: child.node.props?.flexWidth === 'flex-1' || !child.node.props?.flexWidth ? '1 1 0%' : 'none',
                  minWidth: 0,
                  width:
                    child.node.props?.flexWidth === 'full' || child.node.props?.flexWidth === '100%'
                      ? '100%'
                      : child.node.props?.flexWidth === '1/2' || child.node.props?.flexWidth === '50%'
                      ? 'calc(50% - 6px)'
                      : child.node.props?.flexWidth === '1/3' || child.node.props?.flexWidth === '33.3%'
                      ? 'calc(33.333% - 8px)'
                      : child.node.props?.flexWidth === '1/4' || child.node.props?.flexWidth === '25%'
                      ? 'calc(25% - 8px)'
                      : child.node.props?.flexWidth === 'auto'
                      ? 'auto'
                      : child.node.props?.flexWidth === 'flex-1' || !child.node.props?.flexWidth
                      ? '100%'
                      : child.node.props?.flexWidth,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: dragOverChildId === child.node.id ? '2px dashed var(--accent-primary)' : '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                  cursor: 'grab',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  ...({ WebkitUserDrag: 'element' } as any),
                  transition: 'all var(--transition-fast)',
                }}
                title="Drag to reorder inside container or drop out"
              >
                <GripVertical size={12} style={{ color: 'var(--text-muted)' }} />
                {getSubtypeIcon(child.node.subtype)}
                <span>{getNodeTitle(child.node)}</span>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        overflow: 'hidden',
      }}
      className="layout-studio-panel"
    >
      {/* Studio Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {/* Left: View Mode Toggle & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Layout &amp; Flex Studio
            </h2>
          </div>

          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-subtle)',
              color: 'var(--accent-primary-text)',
              fontWeight: 600,
            }}
          >
            {uiNodes.length} UI {uiNodes.length === 1 ? 'Component' : 'Components'} · {containerCount}{' '}
            {containerCount === 1 ? 'Container' : 'Containers'}
          </span>

          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setStudioViewMode('builder')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: studioViewMode === 'builder' ? 600 : 500,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: studioViewMode === 'builder' ? 'var(--accent-primary)' : 'transparent',
                color: studioViewMode === 'builder' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="View Tree Structure"
            >
              <Boxes size={12} />
              <span>Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setStudioViewMode('preview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: studioViewMode === 'preview' ? 600 : 500,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: studioViewMode === 'preview' ? 'var(--accent-primary)' : 'transparent',
                color: studioViewMode === 'preview' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="View Interactive Live Layout Canvas"
            >
              <Eye size={12} />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              className="hide-tablet"
              onClick={() => setStudioViewMode('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: studioViewMode === 'split' ? 600 : 500,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: studioViewMode === 'split' ? 'var(--accent-primary)' : 'transparent',
                color: studioViewMode === 'split' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="Side-by-Side Split View"
            >
              <Columns size={12} />
              <span>Split</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Tooltip content="Add a new empty Div flex container into document flow">
            <Button
              size="xs"
              variant="primary"
              icon={<Boxes size={13} />}
              onClick={() => handleAddEmptyContainer('div')}
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              + Add Empty Div
            </Button>
          </Tooltip>

          <Tooltip content="Auto-detect elements with similar vertical canvas coordinates and group into flex rows">
            <Button
              size="xs"
              variant="secondary"
              icon={<Sparkles size={12} style={{ color: 'var(--accent-warning)' }} />}
              onClick={handleAutoGroupByCanvas}
            >
              Auto-Group by Canvas
            </Button>
          </Tooltip>

          <Tooltip content="Reset all groupings into a clean single vertical stack">
            <Button size="xs" variant="ghost" icon={<RotateCcw size={12} />} onClick={handleResetLayout}>
              Reset Stack
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Floating Multi-Select Action Banner */}
      {selectedNodeIds.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 18px',
            backgroundColor: 'var(--accent-primary-subtle)',
            borderBottom: '1px solid var(--accent-primary)',
            gap: '12px',
            animation: 'fadeIn 150ms ease-out',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary-text)' }}>
              {selectedNodeIds.size} {selectedNodeIds.size === 1 ? 'item' : 'items'} selected
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Wrap in Div (Pure Wrapper, No CSS) */}
            <button
              type="button"
              onClick={() => handleGroupSelected('row', 'div')}
              title="Wrap in a pure <div> layout row (no border, transparent, no padding)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Rows size={13} />
              <span>Wrap in Div (Row)</span>
            </button>

            {/* Wrap in Card (White / Surface Card) */}
            <button
              type="button"
              onClick={() => handleGroupSelected('row', 'card')}
              title="Wrap in a Card row (white background, border, 16px padding, shadow)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--accent-primary)',
                cursor: 'pointer',
              }}
            >
              <CreditCard size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>Wrap in Card</span>
            </button>

            {/* Wrap in Div Column */}
            <button
              type="button"
              onClick={() => handleGroupSelected('column', 'div')}
              title="Wrap in a pure <div> column"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
              }}
            >
              <Columns size={13} />
              <span>Wrap in Div (Col)</span>
            </button>

            {/* Wrap in 2-Col Grid */}
            <button
              type="button"
              onClick={() => handleGroupSelected('grid', 'div')}
              title="Wrap in a 2-column grid"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={13} />
              <span>Wrap in 2-Col Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Body (Split or Full) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left Column: Layout & Flex Tree Composer */}
        {(studioViewMode === 'builder' || studioViewMode === 'split') && (
          <div
            style={{
              flex: studioViewMode === 'split' ? '0 0 52%' : '1 1 100%',
              borderRight: studioViewMode === 'split' ? '1px solid var(--border-default)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: 'clamp(10px, 2vw, 20px)',
              gap: '6px',
            }}
          >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Document Flow &amp; Flexbox Containers
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleAddEmptyContainer('div')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  border: '1px solid var(--accent-primary)',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                title="Add a new empty Div wrapper ready to receive elements or other Divs"
              >
                <Plus size={12} />
                <span>+ Empty Div</span>
              </button>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Drag ⠿ to reorder rows &amp; items · Check items to wrap
              </span>
            </div>
          </div>

          {/* Unified Flow Blocks: All Containers and Standalone Elements in True Document Order */}
          {flowBlocks.map((block, index) => {
            const isDragOver = dragOverBlockId === block.id && draggedBlockId !== block.id;

            if (block.type === 'container') {
              return (
                <React.Fragment key={`block-frag-${block.groupId}`}>
                  {renderInsertionGap(index)}
                  {renderContainerBlock(block, false)}
                </React.Fragment>
              );
          } else {
            // Standalone Element Block
            const node = block.node;
            const isSelected = selectedNodeIds.has(node.id);
            const title = getNodeTitle(node);
            const currentDraggedId = getSourceDraggedId();
            const isHoveredByAnotherNode = Boolean(
              isDragOver && currentDraggedId && currentDraggedId !== node.id
            );
            const draggedNode = currentDraggedId ? uiNodes.find((n) => n.id === currentDraggedId) : null;
            const draggedTitle = draggedNode ? getNodeTitle(draggedNode) : 'item';

            return (
              <React.Fragment key={`block-frag-${node.id}`}>
                {renderInsertionGap(index)}
                <div
                  key={node.id}
                  draggable={true}
                  onDragStart={(e) => {
                    const el = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as HTMLElement | null;
                    if (el?.closest('input, select, [data-no-drag="true"], button, a')) {
                      e.preventDefault();
                      return;
                    }
                    handleBlockDragStart(e, block.id);
                  }}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleBlockDragOver(e, block.id)}
                  onDragLeave={(e) => handleBlockDragLeave(e, block.id)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sourceId = getSourceDraggedId(e);
                    if (sourceId && sourceId !== node.id) {
                      handleWrapTwoNodes(sourceId, node.id, 'row', 'div');
                    } else {
                      handleBlockDrop(e, block.id);
                    }
                    handleDragEnd();
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    minHeight: 'fit-content',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
                    border: isSelected
                      ? '1px solid var(--accent-primary)'
                      : isHoveredByAnotherNode
                      ? '2px dashed var(--accent-primary)'
                      : '1px solid var(--border-default)',
                    boxShadow: isHoveredByAnotherNode
                      ? '0 0 0 2px var(--accent-primary), 0 8px 22px rgba(99, 102, 241, 0.3)'
                      : isDragOver
                      ? '0 0 0 2px var(--accent-primary), 0 6px 18px rgba(99, 102, 241, 0.25)'
                      : 'var(--shadow-xs)',
                    outline: 'none',
                    cursor: 'grab',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    ...({ WebkitUserDrag: 'element' } as any),
                    transition: 'border 100ms ease, box-shadow 100ms ease',
                    boxSizing: 'border-box',
                    width: '100%',
                  }}
                  title="Drag to reorder in document flow, or drop onto another item to wrap in a Div row"
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: '10px',
                      cursor: 'grab',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, cursor: 'grab', userSelect: 'none' }}>
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          cursor: 'grab',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px 4px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          userSelect: 'none',
                        }}
                        title="Drag to reorder in document flow, or drag onto another item to wrap"
                      >
                        <GripVertical size={14} style={{ pointerEvents: 'none' }} />
                      </div>

                      <input
                        data-no-drag="true"
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelect(node.id, e as any)}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      />

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          flexShrink: 0,
                          userSelect: 'none',
                        }}
                      >
                        {getSubtypeIcon(node.subtype)}
                      </div>

                      <div style={{ minWidth: 0, userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', userSelect: 'none' }}>
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
                              userSelect: 'none',
                            }}
                          >
                            {node.subtype}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <WrapDropdown
                        nodeId={node.id}
                        nodeTitle={title}
                        existingContainers={existingContainersList}
                        otherNodes={getOtherNodesList(node.id)}
                        selectedNodeIds={selectedNodeIds}
                        onWrapInNew={handleWrapInNew}
                        onMoveToContainer={handleMoveToContainer}
                        onMergeWithNodes={handleMergeWithNodes}
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* Drag-over indicator: Non-shifting floating badge */}
                  {isHoveredByAnotherNode && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '-10px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        pointerEvents: 'none',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                        zIndex: 10,
                      }}
                    >
                      <Rows size={10} />
                      <span>Drop to wrap together</span>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          }
        })}
        {flowBlocks.length > 0 && renderInsertionGap(flowBlocks.length)}
        </div>
      )}

      {/* Right Column: Responsive Live Frame Viewport */}
      {(studioViewMode === 'preview' || studioViewMode === 'split') && (
        <div
          style={{
            flex: studioViewMode === 'split' ? '0 0 48%' : '1 1 100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-surface)',
            overflow: 'hidden',
          }}
        >
            {/* Viewport Frame Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Interactive Layout Canvas
                </span>
              </div>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                Width: {deviceWidthMap[activeDevice]} ({activeDevice})
              </span>
            </div>

            {/* Interactive Device Viewport Simulator */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                backgroundColor: 'var(--bg-app)',
              }}
            >
              <div
                style={{
                  width: deviceWidthMap[activeDevice],
                  maxWidth: '100%',
                  minHeight: '400px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: activeDevice === 'mobile' ? '32px' : 'var(--radius-xl)',
                  padding: activeDevice === 'mobile' ? '28px 16px' : '20px',
                  boxShadow: 'var(--shadow-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 200ms ease-out',
                }}
              >
                {/* Visual rendering of flex groups and standalone elements in exact sequence */}
                {flowBlocks.map((block, index) => {
                  if (block.type === 'container') {
                    return (
                      <React.Fragment key={block.groupId}>
                        {renderPreviewInsertionGap(index)}
                        {renderPreviewContainer(block)}
                      </React.Fragment>
                    );
                  } else {
                    const child = block.node;
                    const isDragOver = dragOverBlockId === child.id && draggedBlockId !== child.id;
                    const currentDraggedId = getSourceDraggedId();
                    const isHoveredByAnotherNode = Boolean(
                      isDragOver && currentDraggedId && currentDraggedId !== child.id
                    );

                    return (
                      <React.Fragment key={child.id}>
                        {renderPreviewInsertionGap(index)}
                        <div
                          key={child.id}
                          draggable={true}
                          onDragStart={(e) => {
                            handleBlockDragStart(e, child.id);
                          }}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleBlockDragOver(e, child.id)}
                          onDragLeave={(e) => handleBlockDragLeave(e, child.id)}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const sourceId = getSourceDraggedId(e);
                            if (sourceId && sourceId !== child.id) {
                              handleWrapTwoNodes(sourceId, child.id, 'row', 'div');
                            } else {
                              handleBlockDrop(e, child.id);
                            }
                            handleDragEnd();
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface)',
                            border: isHoveredByAnotherNode
                              ? '2px dashed var(--accent-primary)'
                              : isDragOver
                              ? '1.5px dashed var(--accent-primary)'
                              : '1px solid var(--border-default)',
                            boxShadow: isHoveredByAnotherNode
                              ? '0 0 0 2px var(--accent-primary), 0 4px 14px rgba(99, 102, 241, 0.25)'
                              : 'var(--shadow-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            width: '100%',
                            boxSizing: 'border-box',
                            cursor: 'grab',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            ...({ WebkitUserDrag: 'element' } as any),
                            transition: 'all var(--transition-fast)',
                          }}
                          title="Drag to reorder or drop onto another item to wrap in Div row"
                        >
                          <GripVertical size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            {getSubtypeIcon(child.subtype)}
                          </div>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getNodeTitle(child)}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  }
                })}
                {flowBlocks.length > 0 && renderPreviewInsertionGap(flowBlocks.length)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

