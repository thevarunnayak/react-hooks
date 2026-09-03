export {
  NodeType as NodeTypeEnum,
  UISubtype as UISubtypeEnum,
  LogicSubtype as LogicSubtypeEnum,
  ConnectionType as ConnectionTypeEnum,
  PlaygroundView as PlaygroundViewEnum,
  PortType as PortTypeEnum,
  PortCategory as PortCategoryEnum,
} from '../constants/enums';

export type NodeType = 'ui' | 'logic';

export type UISubtype =
  | 'Button'
  | 'Text'
  | 'Heading'
  | 'Input'
  | 'Switch'
  | 'Dropdown'
  | 'Slider'
  | 'Checkbox'
  | 'Form'
  | 'Card'
  | 'Container'
  | 'Badge'
  | 'Divider'
  | 'DummyData'
  | 'Kanban';

export type LogicSubtype =
  | 'useState'
  | 'useEffect'
  | 'useRef'
  | 'useReducer'
  | 'useMemo'
  | 'useCallback'
  | 'useContext'
  | 'useId'
  | 'useTransition'
  | 'useLayoutEffect'
  | 'Timer'
  | 'Event';

export type ConnectionType =
  | 'event'        // e.g. Button.onClick -> setCount
  | 'data'         // e.g. count -> Text.content
  | 'state'        // e.g. state -> consumer
  | 'effect'       // e.g. trigger effect
  | 'dependency'   // e.g. count -> useEffect dep
  | 'child';       // parent/child relationship

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface NodePort {
  id: string;
  name: string;
  type: 'in' | 'out';
  category: 'event' | 'data' | 'action' | 'dependency' | 'effect';
}

export interface PlaygroundNode {
  id: string;
  type: NodeType;
  subtype: UISubtype | LogicSubtype;
  label: string;
  position: CanvasPosition;
  parentId?: string; // For component hierarchy nesting
  props: {
    content?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'cart' | 'tooltip' | 'metrics' | 'themeConsumer' | 'responsiveLayout';
    size?: 'sm' | 'md' | 'lg';
    placeholder?: string;
    checked?: boolean;
    disabled?: boolean;
    color?: string;
    fontSize?: number;
    initialValue?: any;
    stateName?: string;
    setterName?: string;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    inputType?: string;
    actionType?: string;
    actionAmount?: number;
    actionValue?: any;
    delay?: number;
    deps?: string[];
    depsType?: 'empty' | 'auto' | 'custom' | 'none';
    effectTask?: 'documentTitle' | 'interval' | 'eventListener' | 'dataFetch' | 'custom';
    effectCode?: string;
    hasCleanup?: boolean;
    cleanupTask?: 'clearInterval' | 'removeListener' | 'abortFetch' | 'custom';
    cleanupCode?: string;
    refType?: 'dom' | 'mutable';
    reducerActions?: string[];
    reducerInitialState?: any;
    memoExpression?: string;
    memoDeps?: string[];
    callbackFnName?: string;
    callbackParams?: string;
    callbackBody?: string;
    contextName?: string;
    contextDefaultValue?: any;
    [key: string]: any;
  };
  inPorts: NodePort[];
  outPorts: NodePort[];
}

export interface PlaygroundConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  type: ConnectionType;
  label?: string;
}

export interface TraceStep {
  id: string;
  sourceNodeId: string;
  targetNodeId?: string;
  description: string;
  timestamp: number;
  type: 'click' | 'setter' | 'state_change' | 'render' | 'effect' | 'cleanup';
}

export interface PlaygroundProject {
  id: string;
  name: string;
  description?: string;
  updatedAt: number;
  nodes: PlaygroundNode[];
  connections: PlaygroundConnection[];
  selectedNodeId?: string | null;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  hooks?: string[];
}
