/**
 * Maps each React Hook to its dedicated visual architecture project in TUTORIAL_PROJECTS.
 * Ensures clicking "Open in Builder" from any hook lesson loads the tailored, working example.
 */
export const HOOK_TO_TUTORIAL_MAP: Record<string, string> = {
  useState: 'counter',
  useEffect: 'auto_save_draft',
  useContext: 'theme_switcher',
  useRef: 'dom_measurement',
  useReducer: 'cart',
  useCallback: 'performance_observatory',
  useMemo: 'catalog_filter',
  useLayoutEffect: 'animated_counter',
  useTransition: 'catalog_filter',
  useDeferredValue: 'deferred_search',
  useId: 'accessible_form',
  useSyncExternalStore: 'external_store',
  useImperativeHandle: 'modal_dialog',
  useActionState: 'async_form_pipeline',
  useOptimistic: 'optimistic_product',
};

/**
 * Maps Custom Hooks from the catalog to matching architecture projects in TUTORIAL_PROJECTS.
 */
export const CUSTOM_HOOK_TO_TUTORIAL_MAP: Record<string, string> = {
  useToggle: 'theme_switcher',
  useLocalStorage: 'local_storage_sync',
  useDebounce: 'search',
  useInterval: 'live_ticker',
  useMediaQuery: 'viewport_tracker',
  usePrevious: 'undo_redo',
  useOnlineStatus: 'offline_first_notes',
  useClickOutside: 'modal_dialog',
  useEventListener: 'viewport_tracker',
  useClipboard: 'command_palette',
  useIntersectionObserver: 'infinite_scroll',
  useWebSocket: 'websocket_dashboard',
  useHistory: 'undo_redo',
  useThrottle: 'collab_cursor_tracker',
  useIdleTimer: 'auto_save_draft',
  useDragAndDrop: 'dnd_kanban',
};

export const getTutorialForHook = (hookId: string): string => {
  return HOOK_TO_TUTORIAL_MAP[hookId] || 'counter';
};

export const getTutorialForCustomHook = (customHookId: string): string => {
  return CUSTOM_HOOK_TO_TUTORIAL_MAP[customHookId] || 'counter';
};
