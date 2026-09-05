/**
 * Centralized TypeScript Enums for React Hooks Lab
 */

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum NodeType {
  UI = 'ui',
  LOGIC = 'logic',
}

export enum UISubtype {
  BUTTON = 'Button',
  TEXT = 'Text',
  HEADING = 'Heading',
  INPUT = 'Input',
  SWITCH = 'Switch',
  DROPDOWN = 'Dropdown',
  SLIDER = 'Slider',
  CHECKBOX = 'Checkbox',
  FORM = 'Form',
  CARD = 'Card',
  CONTAINER = 'Container',
  BADGE = 'Badge',
  DIVIDER = 'Divider',
  DUMMY_DATA = 'DummyData',
  KANBAN = 'Kanban',
}

export enum LogicSubtype {
  USE_STATE = 'useState',
  USE_EFFECT = 'useEffect',
  USE_REF = 'useRef',
  USE_REDUCER = 'useReducer',
  USE_MEMO = 'useMemo',
  USE_CALLBACK = 'useCallback',
  USE_CONTEXT = 'useContext',
  USE_ID = 'useId',
  USE_TRANSITION = 'useTransition',
  USE_LAYOUT_EFFECT = 'useLayoutEffect',
  USE_DEFERRED_VALUE = 'useDeferredValue',
  USE_OPTIMISTIC = 'useOptimistic',
  USE_ACTION_STATE = 'useActionState',
  USE_FORM_STATUS = 'useFormStatus',
  USE_SYNC_EXTERNAL_STORE = 'useSyncExternalStore',
  TIMER = 'Timer',
  EVENT = 'Event',
}

export enum ConnectionType {
  EVENT = 'event',
  DATA = 'data',
  STATE = 'state',
  EFFECT = 'effect',
  DEPENDENCY = 'dependency',
  CHILD = 'child',
}

export enum PlaygroundView {
  BUILDER = 'builder',
  CANVAS = 'canvas',
  PREVIEW = 'preview',
  LAYOUT = 'layout',
  CODE = 'code',
}

export enum DeviceViewport {
  DESKTOP = 'desktop',
  LAPTOP = 'laptop',
  TABLET = 'tablet',
  MOBILE = 'mobile',
}

export enum PortType {
  IN = 'in',
  OUT = 'out',
}

export enum PortCategory {
  EVENT = 'event',
  DATA = 'data',
  ACTION = 'action',
  DEPENDENCY = 'dependency',
  EFFECT = 'effect',
  STATE = 'state',
}

export enum AlertVariant {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}

export enum TooltipPlacement {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}
