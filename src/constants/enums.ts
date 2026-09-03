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
  CODE = 'code',
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
