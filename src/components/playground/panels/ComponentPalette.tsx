import {
  Layers,
  Square,
  Type,
  Heading as HeadingIcon,
  MousePointerClick,
  TextCursorInput,
  Tag,
  Cpu,
  Sparkles,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ListFilter,
  Sliders,
  CheckSquare,
  FileText,
  Network,
  Calculator,
  Play,
  Hash,
  Activity,
  Eye,
  Database,
  Columns3,
} from 'lucide-react';
import { Tooltip } from '../../ui/Tooltip';
import { NodeType, UISubtype, LogicSubtype } from '../../../constants/enums';
import { t } from '../../../i18n/i18n';

export interface ComponentPaletteProps {
  onAddNode: (type: NodeType, subtype: UISubtype | LogicSubtype) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onAddNode,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Interactive Form Controls
  const formControlItems: { subtype: UISubtype; label: string; icon: React.ReactNode; desc: string }[] = [
    { subtype: UISubtype.BUTTON, label: 'Button', icon: <MousePointerClick size={14} />, desc: t('playground.palette.buttonDesc') },
    { subtype: UISubtype.INPUT, label: 'Input Field', icon: <TextCursorInput size={14} />, desc: t('playground.palette.inputDesc') },
    { subtype: UISubtype.SWITCH, label: 'Toggle Switch', icon: <ToggleLeft size={14} />, desc: t('playground.palette.switchDesc') },
    { subtype: UISubtype.DROPDOWN, label: 'Dropdown Select', icon: <ListFilter size={14} />, desc: t('playground.palette.dropdownDesc') },
    { subtype: UISubtype.SLIDER, label: 'Range Slider', icon: <Sliders size={14} />, desc: t('playground.palette.sliderDesc') },
    { subtype: UISubtype.CHECKBOX, label: 'Checkbox', icon: <CheckSquare size={14} />, desc: t('playground.palette.checkboxDesc') },
  ];

  // Display & Containers
  const displayItems: { subtype: UISubtype; label: string; icon: React.ReactNode; desc: string }[] = [
    { subtype: UISubtype.HEADING, label: 'Heading', icon: <HeadingIcon size={14} />, desc: t('playground.palette.headingDesc') },
    { subtype: UISubtype.TEXT, label: 'Text Display', icon: <Type size={14} />, desc: t('playground.palette.textDesc') },
    { subtype: UISubtype.DUMMY_DATA, label: 'Dummy Data', icon: <Database size={14} style={{ color: '#6366f1' }} />, desc: 'Mock API dataset with live search filtering' },
    { subtype: UISubtype.BADGE, label: 'Badge', icon: <Tag size={14} />, desc: 'Status pill badge' },
    { subtype: UISubtype.CARD, label: 'Card Container', icon: <Square size={14} />, desc: t('playground.palette.cardDesc') },
    { subtype: UISubtype.FORM, label: 'Form Container', icon: <FileText size={14} />, desc: t('playground.palette.formDesc') },
    { subtype: UISubtype.KANBAN, label: 'Kanban Board', icon: <Columns3 size={14} style={{ color: '#8b5cf6' }} />, desc: t('playground.palette.kanbanDesc') },
  ];

  const logicItems: { subtype: LogicSubtype; label: string; icon: React.ReactNode; desc: string }[] = [
    { subtype: LogicSubtype.USE_STATE, label: 'useState', icon: <Cpu size={14} style={{ color: 'var(--accent-primary)' }} />, desc: t('playground.palette.useStateDesc') },
    { subtype: LogicSubtype.USE_EFFECT, label: 'useEffect', icon: <Sparkles size={14} style={{ color: 'var(--accent-purple)' }} />, desc: t('playground.palette.useEffectDesc') },
    { subtype: LogicSubtype.USE_REF, label: 'useRef', icon: <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />, desc: t('playground.palette.useRefDesc') },
    { subtype: LogicSubtype.USE_REDUCER, label: 'useReducer', icon: <Sliders size={14} style={{ color: 'var(--accent-warning)' }} />, desc: t('playground.palette.useReducerDesc') },
    { subtype: LogicSubtype.USE_MEMO, label: 'useMemo', icon: <Calculator size={14} style={{ color: '#10b981' }} />, desc: t('playground.palette.useMemoDesc') },
    { subtype: LogicSubtype.USE_CALLBACK, label: 'useCallback', icon: <Play size={14} style={{ color: '#3b82f6' }} />, desc: t('playground.palette.useCallbackDesc') },
    { subtype: LogicSubtype.USE_CONTEXT, label: 'useContext', icon: <Network size={14} style={{ color: '#8b5cf6' }} />, desc: t('playground.palette.useContextDesc') },
    { subtype: LogicSubtype.USE_ID, label: 'useId', icon: <Hash size={14} style={{ color: '#14b8a6' }} />, desc: t('playground.palette.useIdDesc') },
    { subtype: LogicSubtype.USE_TRANSITION, label: 'useTransition', icon: <Activity size={14} style={{ color: '#f59e0b' }} />, desc: t('playground.palette.useTransitionDesc') },
    { subtype: LogicSubtype.USE_LAYOUT_EFFECT, label: 'useLayoutEffect', icon: <Eye size={14} style={{ color: '#ec4899' }} />, desc: t('playground.palette.useLayoutEffectDesc') },
    { subtype: LogicSubtype.TIMER, label: 'Timer / Interval', icon: <Clock size={14} style={{ color: 'var(--accent-danger)' }} />, desc: t('playground.palette.timerDesc') },
  ];

  const allUiItems = [...formControlItems, ...displayItems];

  // Collapsed view (Slim bar with icon buttons)
  if (isCollapsed) {
    return (
      <div
        style={{
          width: '48px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 4px',
          gap: '8px',
        }}
        className="component-palette-collapsed"
      >
        <Tooltip content={t('playground.palette.expandTooltip')} placement="right">
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
              marginBottom: '4px',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </Tooltip>

        <div style={{ width: '28px', height: '1px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Quick add icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', flex: 1 }}>
          {allUiItems.map((item) => (
            <Tooltip key={item.subtype} content={`${item.label} — ${item.desc}`} placement="right">
              <button
                onClick={() => onAddNode(NodeType.UI, item.subtype)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </button>
            </Tooltip>
          ))}

          <div style={{ width: '28px', height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

          {logicItems.map((item) => (
            <Tooltip key={item.subtype} content={`${item.label} — ${item.desc}`} placement="right">
              <button
                onClick={() => onAddNode(NodeType.LOGIC, item.subtype)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        height: '100%',
        overflowY: 'auto',
        width: '240px',
        minWidth: '240px',
      }}
      className="component-palette"
    >
      {/* Header with Collapse button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          {t('playground.palette.title')}
        </span>
        {onToggleCollapse && (
          <Tooltip content={t('playground.palette.collapseTooltip')} placement="left">
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
              <ChevronLeft size={16} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Interactive Form Controls */}
      <div>
        <h4 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {t('playground.palette.uiSection')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {formControlItems.map((item) => (
            <button
              key={item.subtype}
              onClick={() => onAddNode(NodeType.UI, item.subtype)}
              title={item.desc}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              className="palette-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-primary)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <Plus size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Display & Containers */}
      <div>
        <h4 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Display & Layout
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {displayItems.map((item) => (
            <button
              key={item.subtype}
              onClick={() => onAddNode(NodeType.UI, item.subtype)}
              title={item.desc}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              className="palette-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <Plus size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* React Logic & Hooks */}
      <div>
        <h4 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
          React Logic & Hooks
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {logicItems.map((item) => (
            <button
              key={item.subtype}
              onClick={() => onAddNode(NodeType.LOGIC, item.subtype)}
              title={item.desc}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              className="palette-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              <Plus size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
