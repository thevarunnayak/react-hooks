import React, { useState } from 'react';
import { PlaygroundNode, PlaygroundConnection } from '../../../types/playground';
import { Trash2, Copy, Link, Settings, ChevronRight, ChevronLeft, X, PlusCircle, ArrowRight, Zap, Layers, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CustomSelect } from '../../ui/CustomSelect';
import { Tooltip } from '../../ui/Tooltip';
import { NodeType, UISubtype, LogicSubtype } from '../../../constants/enums';
import { t } from '../../../i18n/i18n';

export interface InspectorProps {
  selectedNode: PlaygroundNode | null;
  allNodes: PlaygroundNode[];
  connections: PlaygroundConnection[];
  onUpdateProps: (nodeId: string, updatedProps: Record<string, any>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onConnect?: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => void;
  onDeleteConnection?: (connId: string) => void;
  onSetNodeParent?: (nodeId: string, parentId: string | undefined) => void;
  onAddChildToContainer?: (containerId: string, subtype: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onDeselect?: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedNode,
  allNodes,
  connections,
  onUpdateProps,
  onDeleteNode,
  onDuplicateNode,
  onConnect,
  onDeleteConnection,
  onSetNodeParent,
  onAddChildToContainer,
  isCollapsed = false,
  onToggleCollapse,
  onDeselect,
}) => {
  // Collapsed view (Slim bar with expand button)
  if (isCollapsed) {
    return (
      <div
        style={{
          width: '48px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 4px',
          gap: '12px',
        }}
        className="inspector-collapsed"
      >
        <Tooltip content={t('playground.inspector.expandTooltip')} placement="left">
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </Tooltip>

        <div style={{ width: '28px', height: '1px', backgroundColor: 'var(--border-subtle)' }} />

        <div
          title={selectedNode ? `Active: ${selectedNode.subtype}` : 'Inspector (No selection)'}
          style={{
            color: selectedNode ? 'var(--accent-primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={18} />
        </div>
      </div>
    );
  }

  // Expanded Empty State
  if (!selectedNode) {
    return (
      <div
        style={{
          padding: 'var(--space-5)',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          height: '100%',
          width: '280px',
          minWidth: '280px',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-xs)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '12px',
          position: 'relative',
        }}
      >
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Inspector"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        <Settings size={28} style={{ color: 'var(--border-default)' }} />
        <span>Click any module in the workbench to inspect properties, wire ports, or edit state.</span>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Press Esc to deselect at any time.</span>
      </div>
    );
  }

  const nodeConnections = connections.filter(
    (c) => c.sourceNodeId === selectedNode.id || c.targetNodeId === selectedNode.id
  );

  // Other available modules to connect with
  const otherNodes = allNodes.filter((n) => n.id !== selectedNode.id);

  const handleInstantConnect = (targetNodeId: string) => {
    if (!onConnect) return;
    const targetNode = allNodes.find((n) => n.id === targetNodeId);
    if (!targetNode) return;

    const sourcePortId = selectedNode.outPorts[0]?.id || selectedNode.inPorts[0]?.id || 'port-out';
    const targetPortId = targetNode.inPorts[0]?.id || targetNode.outPorts[0]?.id || 'port-in';

    onConnect(selectedNode.id, sourcePortId, targetNodeId, targetPortId);
  };

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        height: '100%',
        overflowY: 'auto',
        width: '280px',
        minWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
      className="canvas-inspector"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            {selectedNode.type === NodeType.UI ? t('playground.inspector.uiTypeBadge') : t('playground.inspector.logicTypeBadge')}
          </span>
          <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {selectedNode.subtype}
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onDeselect && (
            <Tooltip content={t('playground.inspector.deselectTooltip')} shortcut="Esc" placement="bottom">
              <button
                onClick={onDeselect}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </Tooltip>
          )}

          <Tooltip content={t('playground.inspector.duplicateTooltip')} shortcut="⌘D" placement="bottom">
            <Button
              size="xs"
              variant="ghost"
              icon={<Copy size={12} />}
              onClick={() => onDuplicateNode(selectedNode.id)}
            />
          </Tooltip>
          <Tooltip content={t('playground.inspector.deleteTooltip')} shortcut="Del" placement="bottom">
            <Button
              size="xs"
              variant="ghost"
              icon={<Trash2 size={12} style={{ color: 'var(--accent-danger)' }} />}
              onClick={() => onDeleteNode(selectedNode.id)}
            />
          </Tooltip>

          {onToggleCollapse && (
            <Tooltip content={t('playground.inspector.collapseTooltip')} placement="bottom">
              <button
                onClick={onToggleCollapse}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Dynamic Properties */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Content (For Button, Text, Heading) */}
        {selectedNode.type === 'ui' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
              CONTENT / TEMPLATE
            </label>
            <input
              type="text"
              value={selectedNode.props.content || ''}
              onChange={(e) => onUpdateProps(selectedNode.id, { content: e.target.value })}
              placeholder="e.g. Count: {{count}}"
              style={{
                padding: '6px 10px',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Use <code>{`{{stateName}}`}</code> to bind dynamic state variables.
            </span>
          </div>
        )}

        {/* Button Variant & On-Click Action Programming */}
        {selectedNode.subtype === 'Button' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                VARIANT
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {(['primary', 'secondary', 'outline', 'danger'] as const).map((v) => {
                  const isCurrent = (selectedNode.props.variant || 'primary') === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onUpdateProps(selectedNode.id, { variant: v })}
                      style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                        backgroundColor: isCurrent ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
                        color: isCurrent ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Programming the Button Action */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '10px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ON CLICK TASK / ACTION
                </label>
                <Zap size={13} style={{ color: 'var(--accent-primary)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                {[
                  { id: 'increment', label: 'Increment (+1)' },
                  { id: 'decrement', label: 'Decrement (-1)' },
                  { id: 'reset', label: 'Reset (0)' },
                  { id: 'toggle', label: 'Toggle (!bool)' },
                  { id: 'setValue', label: 'Set Value' },
                ].map((act) => {
                  const isSelected = (selectedNode.props.actionType || 'increment') === act.id;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => onUpdateProps(selectedNode.id, { actionType: act.id })}
                      style={{
                        padding: '6px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                        backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                        color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {act.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom step amount for increment / decrement */}
              {(selectedNode.props.actionType === 'increment' || selectedNode.props.actionType === 'decrement') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Amount:</span>
                  <input
                    type="number"
                    value={selectedNode.props.actionAmount ?? 1}
                    onChange={(e) => onUpdateProps(selectedNode.id, { actionAmount: Number(e.target.value) || 1 })}
                    style={{
                      width: '60px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              )}

              {/* Custom target value for setValue */}
              {selectedNode.props.actionType === 'setValue' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Value:</span>
                  <input
                    type="text"
                    value={selectedNode.props.actionValue ?? 0}
                    onChange={(e) => {
                      const val = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                      onUpdateProps(selectedNode.id, { actionValue: val });
                    }}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              )}

              {/* Generated React onClick Code Line */}
              <div
                style={{
                  marginTop: '4px',
                  padding: '6px 8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-warning)',
                  wordBreak: 'break-all',
                }}
              >
                <code>{(() => {
                  const conn = connections.find(
                    (c) =>
                      (c.sourceNodeId === selectedNode.id && (c.type === 'event' || c.type === 'data')) ||
                      (c.targetNodeId === selectedNode.id && (c.type === 'event' || c.type === 'data'))
                  );
                  let targetHook: PlaygroundNode | undefined;
                  if (conn) {
                    const targetHookId = conn.sourceNodeId === selectedNode.id ? conn.targetNodeId : conn.sourceNodeId;
                    targetHook = allNodes.find((n) => n.id === targetHookId);
                  } else {
                    targetHook = allNodes.find((n) => n.type === 'logic' && n.subtype === 'useState');
                  }
                  if (!targetHook || targetHook.subtype !== 'useState') {
                    return 'onClick={() => {/* Wire to useState to activate */}}';
                  }
                  const stateName = targetHook.props.stateName || 'count';
                  const setterName = targetHook.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
                  const act = selectedNode.props.actionType || 'increment';
                  const amt = selectedNode.props.actionAmount ?? 1;
                  if (act === 'decrement') return `onClick={() => ${setterName}(s => s - ${amt})}`;
                  if (act === 'reset') return `onClick={() => ${setterName}(${targetHook.props.initialValue ?? 0})}`;
                  if (act === 'toggle') return `onClick={() => ${setterName}(s => !s)}`;
                  if (act === 'setValue') return `onClick={() => ${setterName}(${JSON.stringify(selectedNode.props.actionValue ?? 0)})}`;
                  return amt === 1 ? `onClick={() => ${setterName}(s => s + 1)}` : `onClick={() => ${setterName}(s => s + ${amt})}`;
                })()}</code>
              </div>
            </div>
          </>
        )}

        {/* Switch / Toggle Props */}
        {selectedNode.subtype === 'Switch' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                TOGGLE LABEL
              </label>
              <input
                type="text"
                value={selectedNode.props.label || selectedNode.props.content || 'Toggle Mode'}
                onChange={(e) => onUpdateProps(selectedNode.id, { label: e.target.value, content: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Default State</span>
              <button
                type="button"
                onClick={() => onUpdateProps(selectedNode.id, { checked: !selectedNode.props.checked })}
                style={{
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedNode.props.checked ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                  color: selectedNode.props.checked ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                }}
              >
                {selectedNode.props.checked ? 'ON (true)' : 'OFF (false)'}
              </button>
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)' }}>
              <code>{`<input type="checkbox" role="switch" checked={state} onChange={e => setState(e.target.checked)} />`}</code>
            </div>
          </>
        )}

        {/* Dropdown / Select Props */}
        {selectedNode.subtype === 'Dropdown' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                OPTIONS (COMMA-SEPARATED)
              </label>
              <input
                type="text"
                value={(selectedNode.props.options || ['Light', 'Dark', 'System']).join(', ')}
                onChange={(e) => {
                  const opts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  onUpdateProps(selectedNode.id, { options: opts });
                }}
                placeholder="e.g. Light, Dark, System"
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {(selectedNode.props.options || ['Light', 'Dark', 'System']).length} options configured.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                INTERACTIVE PREVIEW
              </label>
              <CustomSelect
                options={selectedNode.props.options || ['Light', 'Dark', 'System']}
                defaultValue={(selectedNode.props.options || ['Light', 'Dark', 'System'])[0]}
                fullWidth
                size="md"
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)' }}>
              <code>{`<CustomDropdown options={${JSON.stringify(selectedNode.props.options || ['Light', 'Dark', 'System'])}} value={val} onChange={setVal} />`}</code>
            </div>
          </>
        )}

        {/* Slider / Range Props */}
        {selectedNode.subtype === 'Slider' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MIN</label>
                <input
                  type="number"
                  value={selectedNode.props.min ?? 0}
                  onChange={(e) => onUpdateProps(selectedNode.id, { min: Number(e.target.value) || 0 })}
                  style={{
                    padding: '4px 6px',
                    fontSize: '11px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAX</label>
                <input
                  type="number"
                  value={selectedNode.props.max ?? 100}
                  onChange={(e) => onUpdateProps(selectedNode.id, { max: Number(e.target.value) || 100 })}
                  style={{
                    padding: '4px 6px',
                    fontSize: '11px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>STEP</label>
                <input
                  type="number"
                  value={selectedNode.props.step ?? 1}
                  onChange={(e) => onUpdateProps(selectedNode.id, { step: Number(e.target.value) || 1 })}
                  style={{
                    padding: '4px 6px',
                    fontSize: '11px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)' }}>
              <code>{`<input type="range" min={${selectedNode.props.min ?? 0}} max={${selectedNode.props.max ?? 100}} onChange={e => setValue(Number(e.target.value))} />`}</code>
            </div>
          </>
        )}

        {/* Input Field Props */}
        {selectedNode.subtype === 'Input' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                PLACEHOLDER TEXT
              </label>
              <input
                type="text"
                value={selectedNode.props.placeholder || 'Type here...'}
                onChange={(e) => onUpdateProps(selectedNode.id, { placeholder: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                INPUT TYPE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {(['text', 'number', 'email', 'password'] as const).map((t) => {
                  const isCurrent = (selectedNode.props.inputType || 'text') === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onUpdateProps(selectedNode.id, { inputType: t })}
                      style={{
                        padding: '4px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-xs)',
                        border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                        backgroundColor: isCurrent ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
                        color: isCurrent ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)' }}>
              <code>{`<input value={text} onChange={e => setText(e.target.value)} />`}</code>
            </div>
          </>
        )}

        {/* Checkbox Props */}
        {selectedNode.subtype === 'Checkbox' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                CHECKBOX LABEL
              </label>
              <input
                type="text"
                value={selectedNode.props.label || selectedNode.props.content || 'I agree'}
                onChange={(e) => onUpdateProps(selectedNode.id, { label: e.target.value, content: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)' }}>
              <code>{`<input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />`}</code>
            </div>
          </>
        )}

        {/* Form & Container Props with Nested Controls Management */}
        {(selectedNode.subtype === 'Form' || selectedNode.subtype === 'Card' || selectedNode.subtype === 'Container') && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                {selectedNode.subtype.toUpperCase()} TITLE
              </label>
              <input
                type="text"
                value={selectedNode.props.content || `${selectedNode.subtype} Container`}
                onChange={(e) => onUpdateProps(selectedNode.id, { content: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Form Multi-Step Wizard Configuration */}
            {selectedNode.subtype === 'Form' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '6px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={13} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Multi-Step Wizard
                    </span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedNode.props.isMultiStep)}
                      onChange={(e) => {
                        const isEnabled = e.target.checked;
                        const initialSteps = isEnabled
                          ? (selectedNode.props.steps && selectedNode.props.steps.length > 0
                              ? selectedNode.props.steps
                              : ['Account Info', 'Profile Details', 'Review & Confirm'])
                          : undefined;
                        onUpdateProps(selectedNode.id, {
                          isMultiStep: isEnabled,
                          steps: initialSteps,
                          activeStep: isEnabled ? 1 : undefined,
                        });
                      }}
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                {selectedNode.props.isMultiStep && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        WIZARD STEPS ({(selectedNode.props.steps || []).length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentSteps: string[] = selectedNode.props.steps || ['Step 1'];
                          const nextNum = currentSteps.length + 1;
                          onUpdateProps(selectedNode.id, {
                            steps: [...currentSteps, `Step ${nextNum}: Details`],
                            activeStep: nextNum,
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 7px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-xs)',
                          border: '1px dashed var(--accent-primary)',
                          backgroundColor: 'var(--accent-primary-subtle)',
                          color: 'var(--accent-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={11} />
                        <span>Add Step</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(selectedNode.props.steps || ['Step 1']).map((stepName: string, stepIdx: number) => {
                        const stepNum = stepIdx + 1;
                        const isActive = (selectedNode.props.activeStep || 1) === stepNum;
                        return (
                          <div
                            key={stepIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 6px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface)',
                              border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            }}
                          >
                            <span
                              onClick={() => onUpdateProps(selectedNode.id, { activeStep: stepNum })}
                              title="Click to preview this step in form"
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                minWidth: '22px',
                              }}
                            >
                              #{stepNum}
                            </span>
                            <input
                              type="text"
                              value={stepName}
                              onChange={(e) => {
                                const updated = [...(selectedNode.props.steps || [])];
                                updated[stepIdx] = e.target.value;
                                onUpdateProps(selectedNode.id, { steps: updated });
                              }}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                padding: '3px 6px',
                                fontSize: '11px',
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                              }}
                            />
                            {(selectedNode.props.steps || []).length > 1 && (
                              <button
                                type="button"
                                title="Delete step"
                                onClick={() => {
                                  const updated = (selectedNode.props.steps || []).filter((_: any, i: number) => i !== stepIdx);
                                  onUpdateProps(selectedNode.id, {
                                    steps: updated,
                                    activeStep: Math.min(selectedNode.props.activeStep || 1, updated.length),
                                  });
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nested Controls Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                  FORM FIELDS &amp; CONTROLS ({allNodes.filter((n) => n.parentId === selectedNode.id).length})
                </label>
              </div>

              {allNodes.filter((n) => n.parentId === selectedNode.id).length === 0 ? (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-default)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  No fields nested inside this form yet.
                  <br />
                  Use the quick-add buttons below to add inputs, switches, or buttons.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {allNodes
                    .filter((n) => n.parentId === selectedNode.id)
                    .map((child, idx) => (
                      <div
                        key={child.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--accent-primary)',
                              width: '16px',
                            }}
                          >
                            {idx + 1}.
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {child.subtype}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            ({child.props.content || child.props.placeholder || child.props.label || 'field'})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {selectedNode.props.isMultiStep && (
                            <select
                              value={child.props.step || 1}
                              onChange={(e) => {
                                onUpdateProps(child.id, { step: parseInt(e.target.value, 10) });
                              }}
                              style={{
                                fontSize: '10px',
                                padding: '2px 4px',
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                              }}
                              title="Assign field to step"
                            >
                              {(selectedNode.props.steps || ['Step 1']).map((_: string, sIdx: number) => (
                                <option key={sIdx} value={sIdx + 1}>
                                  Step {sIdx + 1}
                                </option>
                              ))}
                            </select>
                          )}

                        {onSetNodeParent && (
                          <Tooltip content={t('playground.inspector.removeFieldTooltip')} placement="left">
                            <button
                              type="button"
                              onClick={() => onSetNodeParent(child.id, undefined)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '2px 5px',
                                borderRadius: 'var(--radius-xs)',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 150ms ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--accent-danger)';
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <X size={12} />
                              {t('common.remove')}
                            </button>
                          </Tooltip>
                        )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Add New Field to Form Quick Buttons */}
              {onAddChildToContainer && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('playground.inspector.quickAddTitle')}:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    {[
                      { subtype: UISubtype.INPUT, label: t('playground.inspector.addInput') },
                      { subtype: UISubtype.BUTTON, label: t('playground.inspector.addButton') },
                      { subtype: UISubtype.SWITCH, label: t('playground.inspector.addSwitch') },
                      { subtype: UISubtype.DROPDOWN, label: t('playground.inspector.addDropdown') },
                      { subtype: UISubtype.CHECKBOX, label: t('playground.inspector.addCheckbox') },
                      { subtype: UISubtype.TEXT, label: t('playground.inspector.addText') },
                    ].map((item) => (
                      <button
                        key={item.subtype}
                        type="button"
                        onClick={() => onAddChildToContainer(selectedNode.id, item.subtype)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-primary)';
                          e.currentTarget.style.color = 'var(--accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-default)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)', marginTop: '4px' }}>
              <code>{`<form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>\n  {/* ${allNodes.filter((n) => n.parentId === selectedNode.id).length} nested inputs & controls */}\n</form>`}</code>
            </div>
          </>
        )}

        {/* Kanban Board Module Props */}
        {selectedNode.subtype === 'Kanban' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                KANBAN BOARD TITLE
              </label>
              <input
                type="text"
                value={selectedNode.props.title || 'Sprint Board'}
                onChange={(e) => onUpdateProps(selectedNode.id, { title: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Interactive drag-and-drop task board managing <strong>Todo</strong>, <strong>In Progress</strong>, and <strong>Done</strong> workflow states.
            </div>
          </div>
        )}

        {/* Container / Form Nesting Selector for Standard UI Elements */}
        {selectedNode.type === NodeType.UI && selectedNode.subtype !== UISubtype.FORM && selectedNode.subtype !== UISubtype.CARD && selectedNode.subtype !== UISubtype.CONTAINER && selectedNode.subtype !== UISubtype.KANBAN && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                {t('playground.inspector.nestingTitle')}
              </label>
              {selectedNode.parentId && onSetNodeParent && (
                <button
                  type="button"
                  onClick={() => onSetNodeParent(selectedNode.id, undefined)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-danger)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {t('playground.inspector.standaloneOption')}
                </button>
              )}
            </div>

            {(() => {
              const containerOptions = [
                { value: '', label: t('playground.inspector.standaloneOption') },
                ...allNodes
                  .filter((n) => n.subtype === UISubtype.FORM || n.subtype === UISubtype.CARD || n.subtype === UISubtype.CONTAINER)
                  .map((c) => ({
                    value: c.id,
                    label: `${c.subtype}: ${c.props.content || c.label || c.subtype}`,
                  })),
              ];

              if (containerOptions.length === 1) {
                return (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No Form or Card container on canvas. Add a Form from the palette to nest this element inside.
                  </div>
                );
              }

              return (
                <CustomSelect
                  options={containerOptions}
                  value={selectedNode.parentId || ''}
                  onChange={(val) => onSetNodeParent && onSetNodeParent(selectedNode.id, val || undefined)}
                  fullWidth
                  size="md"
                  variant="elevated"
                />
              );
            })()}
          </div>
        )}

        {/* useState Props */}
        {selectedNode.subtype === 'useState' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                STATE VARIABLE NAME
              </label>
              <input
                type="text"
                value={selectedNode.props.stateName || 'count'}
                onChange={(e) => onUpdateProps(selectedNode.id, { stateName: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                INITIAL VALUE
              </label>
              <input
                type="text"
                value={selectedNode.props.initialValue ?? 0}
                onChange={(e) => {
                  const val = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                  onUpdateProps(selectedNode.id, { initialValue: val });
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </>
        )}

        {/* useEffect Props */}
        {selectedNode.subtype === 'useEffect' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                DEPENDENCIES (DEPS)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {(
                  [
                    { id: 'empty', label: '[] Mount' },
                    { id: 'auto', label: 'Auto-wire' },
                    { id: 'none', label: 'None (All)' },
                    { id: 'custom', label: 'Custom' },
                  ] as const
                ).map((m) => {
                  const isCurrent = (selectedNode.props.depsType || 'empty') === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        let newDeps = selectedNode.props.deps || [];
                        if (m.id === 'empty' || m.id === 'none') newDeps = [];
                        onUpdateProps(selectedNode.id, { depsType: m.id, deps: newDeps });
                      }}
                      style={{
                        padding: '4px 2px',
                        fontSize: '9.5px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-xs)',
                        border: isCurrent ? '1px solid var(--accent-purple)' : '1px solid var(--border-default)',
                        backgroundColor: isCurrent ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-surface-elevated)',
                        color: isCurrent ? 'var(--accent-purple)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {selectedNode.props.depsType === 'custom' && (
                <input
                  type="text"
                  placeholder="e.g. count, theme"
                  value={(selectedNode.props.deps || []).join(', ')}
                  onChange={(e) => {
                    const depsArr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    onUpdateProps(selectedNode.id, { deps: depsArr });
                  }}
                  style={{
                    marginTop: '4px',
                    padding: '6px 10px',
                    fontSize: 'var(--text-xs)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              )}

              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Active: <code>{selectedNode.props.depsType === 'none' ? 'None (Runs on every render)' : `[${(selectedNode.props.deps || []).join(', ')}]`}</code>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                EFFECT EXECUTION LOGIC
              </label>
              <CustomSelect
                value={selectedNode.props.effectTask || 'documentTitle'}
                onChange={(task) => {
                  let effectCode = selectedNode.props.effectCode;
                  let cleanupCode = selectedNode.props.cleanupCode;
                  let cleanupTask = selectedNode.props.cleanupTask || 'clearInterval';

                  if (task === 'documentTitle') {
                    effectCode = 'document.title = `Application Active (${count})`;';
                    cleanupCode = 'document.title = "React Hooks App";';
                  } else if (task === 'interval') {
                    effectCode = 'const id = setInterval(() => console.log("Tick"), 1000);';
                    cleanupCode = 'clearInterval(id);';
                    cleanupTask = 'clearInterval';
                  } else if (task === 'eventListener') {
                    effectCode = 'const onResize = () => console.log(window.innerWidth); window.addEventListener("resize", onResize);';
                    cleanupCode = 'window.removeEventListener("resize", onResize);';
                    cleanupTask = 'removeListener';
                  } else if (task === 'dataFetch') {
                    effectCode = 'fetch("/api/status").then(r => r.json()).then(console.log);';
                    cleanupCode = '// cancel request';
                    cleanupTask = 'abortFetch';
                  }

                  onUpdateProps(selectedNode.id, {
                    effectTask: task,
                    effectCode,
                    cleanupCode,
                    cleanupTask,
                  });
                }}
                options={[
                  { value: 'documentTitle', label: 'Update Document Title' },
                  { value: 'interval', label: 'Interval Timer / Poller' },
                  { value: 'eventListener', label: 'Window Event Listener (resize/scroll)' },
                  { value: 'dataFetch', label: 'Fetch API Simulation' },
                  { value: 'custom', label: 'Custom JavaScript Code' },
                ]}
                fullWidth
                variant="elevated"
                size="md"
              />

              <textarea
                rows={2}
                value={selectedNode.props.effectCode || 'document.title = `Count: ${count}`;'}
                onChange={(e) => onUpdateProps(selectedNode.id, { effectCode: e.target.value })}
                placeholder="Effect code..."
                style={{
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                  CLEANUP FUNCTION (RETURN)
                </label>
                <button
                  type="button"
                  onClick={() => onUpdateProps(selectedNode.id, { hasCleanup: !selectedNode.props.hasCleanup })}
                  style={{
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: selectedNode.props.hasCleanup !== false ? 'var(--accent-purple)' : 'var(--bg-surface-elevated)',
                    color: selectedNode.props.hasCleanup !== false ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                  }}
                >
                  {selectedNode.props.hasCleanup !== false ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {selectedNode.props.hasCleanup !== false && (
                <textarea
                  rows={2}
                  value={selectedNode.props.cleanupCode || 'clearInterval(id);'}
                  onChange={(e) => onUpdateProps(selectedNode.id, { cleanupCode: e.target.value })}
                  placeholder="Cleanup code (clearInterval, removeEventListener)..."
                  style={{
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                />
              )}
            </div>

            <div
              style={{
                padding: '6px 8px',
                backgroundColor: 'rgba(0,0,0,0.35)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-purple)',
                whiteSpace: 'pre-wrap',
              }}
            >
              <code>
                {`useEffect(() => {\n  ${selectedNode.props.effectCode || '/* effect */'}\n${
                  selectedNode.props.hasCleanup !== false
                    ? `  return () => {\n    ${selectedNode.props.cleanupCode || '/* cleanup */'}\n  };\n`
                    : ''
                }}, ${selectedNode.props.depsType === 'none' ? '' : `[${(selectedNode.props.deps || []).join(', ')}]`});`}
              </code>
            </div>
          </>
        )}

        {/* useRef Props */}
        {selectedNode.subtype === 'useRef' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                REF PURPOSE / MODE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                {(['dom', 'mutable'] as const).map((mode) => {
                  const isCurrent = (selectedNode.props.refType || 'dom') === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onUpdateProps(selectedNode.id, { refType: mode })}
                      style={{
                        padding: '5px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-xs)',
                        border: isCurrent ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                        backgroundColor: isCurrent ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface-elevated)',
                        color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {mode === 'dom' ? 'DOM Element Ref' : 'Mutable Value Container'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                INITIAL VALUE (.current)
              </label>
              <input
                type="text"
                value={selectedNode.props.initialValue ?? 'null'}
                onChange={(e) => onUpdateProps(selectedNode.id, { initialValue: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              <code>{`const ref = useRef(${selectedNode.props.initialValue ?? 'null'});`}</code>
            </div>
          </>
        )}

        {/* useReducer Props */}
        {selectedNode.subtype === 'useReducer' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                ACTION TYPES (COMMA-SEPARATED)
              </label>
              <input
                type="text"
                value={(selectedNode.props.reducerActions || ['INCREMENT', 'DECREMENT', 'RESET']).join(', ')}
                onChange={(e) => {
                  const acts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  onUpdateProps(selectedNode.id, { reducerActions: acts });
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                INITIAL STATE
              </label>
              <input
                type="text"
                value={selectedNode.props.reducerInitialState ?? 0}
                onChange={(e) => {
                  const v = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                  onUpdateProps(selectedNode.id, { reducerInitialState: v });
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)' }}>
              <code>{`const [state, dispatch] = useReducer(reducer, ${JSON.stringify(selectedNode.props.reducerInitialState ?? 0)});`}</code>
            </div>
          </>
        )}

        {/* useMemo Props */}
        {selectedNode.subtype === 'useMemo' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                MEMOIZED CALCULATION EXPRESSION
              </label>
              <input
                type="text"
                value={selectedNode.props.memoExpression || 'count * 2'}
                onChange={(e) => onUpdateProps(selectedNode.id, { memoExpression: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                DEPENDENCIES (DEPS)
              </label>
              <input
                type="text"
                value={(selectedNode.props.deps || ['count']).join(', ')}
                onChange={(e) => {
                  const d = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  onUpdateProps(selectedNode.id, { deps: d });
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
              <code>{`const memoized = useMemo(() => ${selectedNode.props.memoExpression || 'count * 2'}, [${(selectedNode.props.deps || ['count']).join(', ')}]);`}</code>
            </div>
          </>
        )}

        {/* useCallback Props */}
        {selectedNode.subtype === 'useCallback' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                CALLBACK FUNCTION NAME
              </label>
              <input
                type="text"
                value={selectedNode.props.callbackFnName || 'handleClick'}
                onChange={(e) => onUpdateProps(selectedNode.id, { callbackFnName: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                DEPENDENCIES (DEPS)
              </label>
              <input
                type="text"
                value={(selectedNode.props.deps || ['count']).join(', ')}
                onChange={(e) => {
                  const d = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  onUpdateProps(selectedNode.id, { deps: d });
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
              <code>{`const ${selectedNode.props.callbackFnName || 'handleClick'} = useCallback(() => { ... }, [${(selectedNode.props.deps || ['count']).join(', ')}]);`}</code>
            </div>
          </>
        )}

        {/* useContext Props */}
        {selectedNode.subtype === 'useContext' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                CONTEXT NAME
              </label>
              <input
                type="text"
                value={selectedNode.props.contextName || 'ThemeContext'}
                onChange={(e) => onUpdateProps(selectedNode.id, { contextName: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
              <code>{`const value = useContext(${selectedNode.props.contextName || 'ThemeContext'});`}</code>
            </div>
          </>
        )}

        {/* Timer Props */}
        {selectedNode.subtype === 'Timer' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                INTERVAL DELAY (MS)
              </label>
              <input
                type="number"
                value={selectedNode.props.delay ?? 1000}
                onChange={(e) => onUpdateProps(selectedNode.id, { delay: Number(e.target.value) || 1000 })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-danger)' }}>
              <code>{`setInterval(() => triggerTick(), ${selectedNode.props.delay ?? 1000});`}</code>
            </div>
          </>
        )}

        {/* useId Inspector */}
        {selectedNode.subtype === 'useId' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                ELEMENT VARIABLE NAME
              </label>
              <input
                type="text"
                value={selectedNode.props.elementName || 'inputId'}
                onChange={(e) => onUpdateProps(selectedNode.id, { elementName: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#14b8a6' }}>
              <code>{`const ${selectedNode.props.elementName || 'inputId'} = useId();\n// Generates unique, stable, SSR-safe ID`}</code>
            </div>
          </>
        )}

        {/* useTransition Inspector */}
        {selectedNode.subtype === 'useTransition' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                TRANSITION TASK NAME
              </label>
              <input
                type="text"
                value={selectedNode.props.transitionTask || 'filterResults'}
                onChange={(e) => onUpdateProps(selectedNode.id, { transitionTask: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
              <code>{`const [isPending, startTransition] = useTransition();\nstartTransition(() => { ${selectedNode.props.transitionTask || 'filterResults'}(); });`}</code>
            </div>
          </>
        )}

        {/* useLayoutEffect Inspector */}
        {selectedNode.subtype === 'useLayoutEffect' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                DOM MEASUREMENT TASK
              </label>
              <input
                type="text"
                value={selectedNode.props.layoutTask || 'measureDOM'}
                onChange={(e) => onUpdateProps(selectedNode.id, { layoutTask: e.target.value })}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-xs)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#ec4899' }}>
              <code>{`useLayoutEffect(() => {\n  // Runs synchronously before screen paint\n  ${selectedNode.props.layoutTask || 'measureDOM'}();\n}, []);`}</code>
            </div>
          </>
        )}
      </div>

      {/* Instant Module Connection Section */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Link size={12} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            Connect or Unlink Modules
          </span>
        </div>

        {otherNodes.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Add another module from the palette to connect.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Click to link or unlink:
            </span>
            {otherNodes.map((other) => {
              const matchingConn = connections.find(
                (c) =>
                  (c.sourceNodeId === selectedNode.id && c.targetNodeId === other.id) ||
                  (c.sourceNodeId === other.id && c.targetNodeId === selectedNode.id)
              );
              const isAlreadyConnected = Boolean(matchingConn);

              return (
                <button
                  key={other.id}
                  type="button"
                  onClick={() => {
                    if (matchingConn) {
                      onDeleteConnection?.(matchingConn.id);
                    } else if (onConnect) {
                      const sourcePortId = selectedNode.outPorts[0]?.id || selectedNode.inPorts[0]?.id || 'port-out';
                      const targetPortId = other.inPorts[0]?.id || other.outPorts[0]?.id || 'port-in';
                      onConnect(selectedNode.id, sourcePortId, other.id, targetPortId);
                    }
                  }}
                  title={isAlreadyConnected ? 'Click to unlink' : 'Click to link'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isAlreadyConnected ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isAlreadyConnected ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-default)'}`,
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{other.subtype}</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      ({other.type === 'ui' ? 'UI' : 'Logic'})
                    </span>
                  </div>
                  {isAlreadyConnected ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--accent-danger)', fontWeight: 700 }}>
                      <span>UNLINK</span>
                      <X size={11} />
                    </span>
                  ) : (
                    <ArrowRight size={12} style={{ color: 'var(--accent-primary)' }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Connected Wires List */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
          Active Wires ({nodeConnections.length})
        </span>

        {nodeConnections.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
            No wires connected yet. Click any module above or drag port wires to connect.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
            {nodeConnections.map((c) => {
              const otherId = c.sourceNodeId === selectedNode.id ? c.targetNodeId : c.sourceNodeId;
              const otherNode = allNodes.find((n) => n.id === otherId);

              return (
                <div
                  key={c.id}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link size={11} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {otherNode ? otherNode.subtype : 'Module'}
                    </span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)' }}>
                      [{c.type}]
                    </span>
                  </div>

                  {onDeleteConnection && (
                    <Tooltip content={t('playground.inspector.unlinkWireTooltip')} placement="left">
                      <button
                        onClick={() => onDeleteConnection(c.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--accent-danger)',
                          cursor: 'pointer',
                          transition: 'all 120ms ease',
                        }}
                      >
                        <X size={10} />
                        {t('playground.inspector.unlinkWireText')}
                      </button>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
