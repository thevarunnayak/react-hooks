import React, { useState, useEffect, useRef } from 'react';
import { PlaygroundNode, PlaygroundConnection, TraceStep } from '../../../types/playground';
import { RotateCcw, Zap, SearchX, Search, X, ShoppingBag, Trash2, Plus, Minus, Tag, CheckCircle, ArrowLeft, ArrowRight, Check, Layers, AlertCircle, PanelBottom, PanelRight, Loader2, Ruler, MessageSquare, Target, Sparkles, Sun, Moon, Palette, TrendingUp, Shield, Activity, Timer, Bell, Monitor, Database, GripVertical, Columns3, Smartphone, Tablet, Tv, Code, Users, CheckSquare, Globe, BookOpen, ChevronDown, ListFilter, Sliders } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { formatKeybinding } from '../../../utils/platform';
import { ExpandedArchitecturesCard } from './architectures/ExpandedArchitecturesPanel';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { DUMMY_DATA_PRESETS, getDummyDataPreset, DummyDataItem, DummyDataPreset } from '../../../constants/dummyDataPresets';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface LivePreviewPanelProps {
  nodes: PlaygroundNode[];
  connections: PlaygroundConnection[];
  onTraceAction?: (step: TraceStep) => void;
  activeDevice?: 'desktop' | 'laptop' | 'tablet' | 'mobile';
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  nodes,
  connections,
  onTraceAction,
  activeDevice = 'desktop',
}) => {
  // Live state values mapped by hook node id
  const [hookStates, setHookStates] = useState<Record<string, any>>({});
  const [renderCount, setRenderCount] = useState(1);
  const [traceLogs, setTraceLogs] = useState<TraceStep[]>([]);
  const [isTracing, setIsTracing] = useState(true);

  // Selected product from dropdown (for cart preset)
  const [selectedProduct, setSelectedProduct] = useState('Pro License ($49)');
  // Real cart items for Cart Card
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 'item-pro', name: 'Pro License', price: 49, quantity: 1 },
  ]);

  // Multi-step form wizard state
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({
    'node-form-email': 'user@company.com',
    'node-form-username': 'johndoe',
    'node-form-fullname': 'John Doe',
    'node-form-plan': 'Pro Team ($29/mo)',
    'node-form-terms': true,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formStepError, setFormStepError] = useState<string | null>(null);

  // Concurrent Catalog Filter (useTransition) state
  const [catalogInput, setCatalogInput] = useState('');
  const [catalogDeferred, setCatalogDeferred] = useState('');
  const [isCatalogPending, setIsCatalogPending] = useState(false);
  const transitionTimeoutRef = useRef<any>(null);

  // Synchronous DOM Measurement (useLayoutEffect) state
  const [targetSize, setTargetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showTooltip, setShowTooltip] = useState(true);
  const [measuredRect, setMeasuredRect] = useState<{ width: number; height: number; top: number; left: number }>({
    width: 240,
    height: 42,
    top: 180,
    left: 120,
  });
  const [useLayoutTimingMode, setUseLayoutTimingMode] = useState<'layout' | 'passive'>('layout');
  const [isFlickering, setIsFlickering] = useState(false);
  const anchorElementRef = useRef<HTMLDivElement>(null);

  // Global Theme Context (useContext) state
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>('dark');

  // Dummy Data Preset & Style overrides in Live Preview (allows live interactive toggling)
  const [dummyDataPresetOverrides, setDummyDataPresetOverrides] = useState<Record<string, string>>({});
  const [dummyDataStyleOverrides, setDummyDataStyleOverrides] = useState<Record<string, 'cards' | 'pills' | 'grid' | 'table'>>({});

  // Document Auto-Save Draft state & refs (useRef + useEffect)
  const [docContent, setDocContent] = useState<string>('React hooks enable declarative synchronization with external side-effects.');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const isDirtyRef = useRef<boolean>(false);

  // Template 10: Audio Player
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(35);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Template 11: Undo / Redo History
  const [historyStack, setHistoryStack] = useState<{ past: string[]; present: string; future: string[] }>({
    past: [],
    present: 'Step 1: Initial Setup',
    future: [],
  });

  // Template 12: Live Ticker
  const [btcPrice, setBtcPrice] = useState<number>(64420.5);
  const [btcDelta, setBtcDelta] = useState<number>(2.45);

  // Template 13: Accessible Form with Stable IDs
  const [a11yUsername, setA11yUsername] = useState<string>('varun_developer');
  const [a11yEmail, setA11yEmail] = useState<string>('varun@enterprise.dev');
  const [a11ySaved, setA11ySaved] = useState<boolean>(false);
  const [a11yActiveId, setA11yActiveId] = useState<string | null>(null);

  // Template 14: Accessible Modal & Focus Trap
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Template 15: Kanban Board
  const [kanbanFilter, setKanbanFilter] = useState<string>('All Columns');
  const [kanbanTasks, setKanbanTasks] = useState<Array<{ id: string; title: string; col: 'Todo' | 'In Progress' | 'Done' }>>([
    { id: '1', title: 'Implement Auth Middleware', col: 'Todo' },
    { id: '2', title: 'Refactor Context Provider', col: 'In Progress' },
    { id: '3', title: 'Fix Layout Flicker Bug', col: 'Done' },
  ]);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Template 16: Order Tax & Shipping Calculator
  const [calcWeight, setCalcWeight] = useState<number>(4);

  // Template 17: Password Strength Analyzer
  const [pwdValue, setPwdValue] = useState<string>('Antigravity#2026');

  // Template 18: Infinite Scroll Viewport Observer
  const [pageItems, setPageItems] = useState<number>(5);

  // Template 19: Flash Sale Countdown
  const [flashSeconds, setFlashSeconds] = useState<number>(300);

  // Template 20: Toast Notification Queue
  const [toastQueue, setToastQueue] = useState<Array<{ id: string; message: string }>>([
    { id: 't-1', message: 'System deployment completed successfully' },
  ]);

  // Template 21: Window Breakpoint Tracker
  const [simWindowWidth, setSimWindowWidth] = useState<number>(1024);
  const [isUserOverridingWidth, setIsUserOverridingWidth] = useState<boolean>(false);

  // Template 22: LocalStorage Sync
  const [lsSyncedText, setLsSyncedText] = useState<string>(() => {
    try {
      return localStorage.getItem('local_first_cache') || 'Hello Local-First';
    } catch {
      return 'Hello Local-First';
    }
  });

  // Template 23: Multi-Tab Dashboard Caching
  const [activeTab, setActiveTab] = useState<string>('Overview');

  // Template 24: Animated Stat Counter
  const [animTarget, setAnimTarget] = useState<number>(25000);
  const [animDurationMs, setAnimDurationMs] = useState<number>(2000);
  const [animCount, setAnimCount] = useState<number>(25000);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animRafRef = useRef<number | null>(null);

  // Template 25: Rating Review
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Trace dock position (right or bottom) and resizable dimensions
  const [tracePosition, setTracePosition] = useState<'bottom' | 'right'>('bottom');
  const [traceHeight, setTraceHeight] = useState<number>(180);
  const [traceWidth, setTraceWidth] = useState<number>(360);
  const [isDraggingTrace, setIsDraggingTrace] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Drag resizing handler for Execution Trace split
  useEffect(() => {
    if (!isDraggingTrace) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();

      if (tracePosition === 'bottom') {
        const newHeight = rect.bottom - e.clientY;
        const maxHeight = Math.max(140, rect.height - 120);
        setTraceHeight(Math.max(90, Math.min(newHeight, maxHeight)));
      } else {
        const newWidth = rect.right - e.clientX;
        const maxWidth = Math.max(220, rect.width - 220);
        setTraceWidth(Math.max(180, Math.min(newWidth, maxWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTrace(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTrace, tracePosition]);

  const onTraceActionRef = useRef(onTraceAction);
  useEffect(() => {
    onTraceActionRef.current = onTraceAction;
  });

  const prevMeasureRef = useRef<{ size: string; mode: string }>({ size: '', mode: '' });

  // Synchronous DOM Measurement before browser paint (useLayoutEffect)
  React.useLayoutEffect(() => {
    if (!anchorElementRef.current) return;

    if (useLayoutTimingMode === 'layout') {
      const rect = anchorElementRef.current.getBoundingClientRect();
      const newRect = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left),
      };

      // Guard: only update state if measurements actually changed to prevent render loops!
      setMeasuredRect((prev) => {
        if (
          prev.width === newRect.width &&
          prev.height === newRect.height &&
          prev.top === newRect.top &&
          prev.left === newRect.left
        ) {
          return prev;
        }
        return newRect;
      });

      setHookStates((prev) => {
        const existingPos = prev['node-state-pos'];
        if (
          existingPos &&
          existingPos.width === newRect.width &&
          existingPos.height === newRect.height &&
          existingPos.top === newRect.top &&
          existingPos.left === newRect.left &&
          prev['node-state-size'] === targetSize
        ) {
          return prev;
        }
        return {
          ...prev,
          'node-state-pos': newRect,
          'node-state-size': targetSize,
        };
      });

      if (prevMeasureRef.current.size !== targetSize || prevMeasureRef.current.mode !== useLayoutTimingMode) {
        prevMeasureRef.current = { size: targetSize, mode: useLayoutTimingMode };
        const step: TraceStep = {
          id: Math.random().toString(),
          sourceNodeId: 'node-layout-dom',
          description: `useLayoutEffect: Synchronously measured DOM rect (${newRect.width}px × ${newRect.height}px) before paint (0ms flicker)`,
          timestamp: Date.now(),
          type: 'effect',
        };
        setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
        onTraceActionRef.current?.(step);
      }
    } else {
      // Simulate useEffect post-paint flicker/jump
      setIsFlickering(true);
      const timer = setTimeout(() => {
        if (!anchorElementRef.current) return;
        const rect = anchorElementRef.current.getBoundingClientRect();
        const newRect = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
        };

        setMeasuredRect((prev) => {
          if (
            prev.width === newRect.width &&
            prev.height === newRect.height &&
            prev.top === newRect.top &&
            prev.left === newRect.left
          ) {
            return prev;
          }
          return newRect;
        });
        setIsFlickering(false);

        if (prevMeasureRef.current.size !== targetSize || prevMeasureRef.current.mode !== useLayoutTimingMode) {
          prevMeasureRef.current = { size: targetSize, mode: useLayoutTimingMode };
          const step: TraceStep = {
            id: Math.random().toString(),
            sourceNodeId: 'node-layout-dom',
            description: `useEffect: Asynchronously measured DOM after paint -> Triggered visible layout shift / jump!`,
            timestamp: Date.now(),
            type: 'effect',
          };
          setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
          onTraceActionRef.current?.(step);
        }
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [targetSize, showTooltip, useLayoutTimingMode]);

  // Helper for Template 21: Responsive Breakpoint Engine
  const getBreakpointInfo = (width: number) => {
    if (width < 640) {
      return {
        name: 'Mobile',
        label: 'Mobile (< 640px)',
        color: '#6366f1',
        cols: 1,
        tag: 'Single-Column Mobile Stack',
        icon: Smartphone,
      };
    }
    if (width < 1024) {
      return {
        name: 'Tablet',
        label: 'Tablet (640px – 1024px)',
        color: '#f59e0b',
        cols: 2,
        tag: 'Dual-Column Tablet Grid',
        icon: Tablet,
      };
    }
    if (width < 1440) {
      return {
        name: 'Desktop',
        label: 'Desktop (1024px – 1440px)',
        color: '#10b981',
        cols: 3,
        tag: 'Triple-Column Desktop Grid',
        icon: Monitor,
      };
    }
    return {
      name: 'Ultrawide',
      label: 'Ultrawide (> 1440px)',
      color: '#8b5cf6',
      cols: 4,
      tag: 'Quad-Column Dashboard',
      icon: Tv,
    };
  };

  // Synchronous Viewport Window Listener (Template 21: useLayoutEffect)
  React.useLayoutEffect(() => {
    if (!nodes.some((n) => n.id === 'node-head-vp' || n.id === 'node-state-vp')) return;

    const handleWindowResize = () => {
      if (!isUserOverridingWidth) {
        const w = window.innerWidth;
        setSimWindowWidth(w);
        const bp = getBreakpointInfo(w);
        const step: TraceStep = {
          id: Math.random().toString(),
          sourceNodeId: 'node-layout-vp',
          targetNodeId: 'node-state-vp',
          description: `useLayoutEffect: Synchronously measured window (${w}px) before paint -> Switched to "${bp.name}"`,
          timestamp: Date.now(),
          type: 'effect',
        };
        setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
        onTraceActionRef.current?.(step);
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [nodes, isUserOverridingWidth]);

  // Animation runner for Template 24: Animated Stat Counter on Reveal
  const startCounterAnimation = (target: number = animTarget, duration: number = animDurationMs) => {
    if (animRafRef.current) {
      cancelAnimationFrame(animRafRef.current);
    }
    setIsAnimating(true);
    setAnimCount(0);
    const startTime = performance.now();

    const stepTrace: TraceStep = {
      id: Math.random().toString(),
      sourceNodeId: 'node-layout-anim',
      targetNodeId: 'node-state-anim',
      description: `useLayoutEffect [rAF] -> Started smooth interpolation: 0 → ${target.toLocaleString()} over ${duration}ms (cubic ease-out)`,
      timestamp: Date.now(),
      type: 'effect',
    };
    setTraceLogs((prev) => [stepTrace, ...prev.slice(0, 5)]);
    onTraceActionRef.current?.(stepTrace);

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / Math.max(duration, 100), 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(ease * target);
      setAnimCount(currentVal);
      setHookStates((prev) => ({ ...prev, 'node-state-anim': currentVal }));

      if (progress < 1) {
        animRafRef.current = requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
        setAnimCount(target);
        animRafRef.current = null;
        const completeStep: TraceStep = {
          id: Math.random().toString(),
          sourceNodeId: 'node-layout-anim',
          targetNodeId: 'node-text-counter',
          description: `rAF Interpolation Complete: Reached milestone ${target.toLocaleString()} at 60 FPS`,
          timestamp: Date.now(),
          type: 'effect',
        };
        setTraceLogs((prev) => [completeStep, ...prev.slice(0, 5)]);
        onTraceActionRef.current?.(completeStep);
      }
    };

    animRafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (animRafRef.current) {
        cancelAnimationFrame(animRafRef.current);
      }
    };
  }, []);

  // Track previous deps and cleanups for useEffect lifecycle execution
  const prevEffectDepsRef = React.useRef<Record<string, any[]>>({});
  const activeCleanupsRef = React.useRef<Record<string, (() => void) | undefined>>({});

  // Initialize state values from node definitions (keyed by state IDs and initial values)
  const nodeStructureKey = nodes
    .filter((n) => n.type === 'logic' && (n.subtype === 'useState' || n.subtype === 'useReducer'))
    .map((n) => `${n.id}:${JSON.stringify(n.props.initialValue ?? n.props.reducerInitialState)}`)
    .join('|');

  useEffect(() => {
    const initial: Record<string, any> = {};
    nodes.forEach((n) => {
      if (n.type === 'logic' && n.subtype === 'useState') {
        initial[n.id] = n.props.initialValue ?? 0;
      } else if (n.type === 'logic' && n.subtype === 'useReducer') {
        initial[n.id] = n.props.reducerInitialState ?? 0;
      }
    });
    setHookStates(initial);
  }, [nodeStructureKey]);

  // Auto-Save Draft periodic interval effect (useRef + useEffect)
  useEffect(() => {
    const hasAutoSave = nodes.some((n) => n.id === 'node-input-doc' || n.id === 'node-ref-dirty');
    if (!hasAutoSave) return;

    const intervalId = setInterval(() => {
      if (isDirtyRef.current) {
        setSaveStatus('saving');
        setTimeout(() => {
          isDirtyRef.current = false;
          setSaveStatus('saved');
          const timeStr = new Date().toLocaleTimeString();
          setLastSavedTime(timeStr);

          const step: TraceStep = {
            id: Math.random().toString(),
            sourceNodeId: 'node-effect-save',
            targetNodeId: 'node-state-status',
            description: `useEffect [2.5s AutoSave Interval] -> Detected isDirtyRef.current === true -> Saved draft to cloud at ${timeStr}! (isDirtyRef reset to false)`,
            timestamp: Date.now(),
            type: 'state_change',
          };
          setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
          onTraceActionRef.current?.(step);
        }, 400);
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [nodes]);

  // Template 10: Audio Player playback simulation
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.max(100, Math.round(1000 / playbackSpeed));
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev >= 100 ? 0 : prev + 1));
    }, intervalTime);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Template 12: Live Crypto Ticker websocket stream simulation
  useEffect(() => {
    const hasTicker = nodes.some((n) => n.id === 'node-text-btc');
    if (!hasTicker) return;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 85;
      setBtcPrice((prev) => Math.max(10000, Number((prev + delta).toFixed(2))));
      setBtcDelta(Number(((delta / 64420) * 100).toFixed(2)));
    }, 800);
    return () => clearInterval(interval);
  }, [nodes]);

  // Template 19: Flash Sale countdown simulation
  useEffect(() => {
    const hasSale = nodes.some((n) => n.id === 'node-text-sale');
    if (!hasSale) return;
    const interval = setInterval(() => {
      setFlashSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [nodes]);

  // Template 14: Esc keydown listener for Accessible Modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        const step: TraceStep = {
          id: Math.random().toString(),
          sourceNodeId: 'node-effect-modal',
          targetNodeId: 'node-state-modal',
          description: 'Keydown [Escape] -> Focus Trap cleanup & Modal closed',
          timestamp: Date.now(),
          type: 'state_change',
        };
        setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
        onTraceActionRef.current?.(step);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  // Template 24: rAF smooth numeric interpolation
  useEffect(() => {
    const hasAnim = nodes.some((n) => n.id === 'node-text-counter');
    if (!hasAnim) return;
    let animId: number;
    let start = 0;
    const target = 10000;
    const step = () => {
      start += Math.ceil((target - start) * 0.08);
      setAnimCount(start);
      if (start < target) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [nodes]);

  // Execute active useEffect lifecycles when dependencies change or component mounts
  useEffect(() => {
    const effectNodes = nodes.filter((n) => n.type === 'logic' && n.subtype === 'useEffect');

    effectNodes.forEach((effNode) => {
      const depsType = effNode.props.depsType || 'empty';
      const declaredDeps = effNode.props.deps || [];

      // Extract current dependency values from state nodes
      const currentDepValues = declaredDeps.map((depName: string) => {
        const stateNode = nodes.find(
          (n) => n.type === 'logic' && n.subtype === 'useState' && n.props.stateName === depName
        );
        return stateNode ? hookStates[stateNode.id] : undefined;
      });

      const prevDepValues = prevEffectDepsRef.current[effNode.id];
      let shouldRun = false;

      if (!prevDepValues) {
        // Initial Mount
        shouldRun = true;
      } else if (depsType === 'none') {
        // Runs on every render
        shouldRun = true;
      } else if (depsType === 'empty') {
        // Mount only
        shouldRun = false;
      } else {
        // Check if any declared dependency changed
        shouldRun = currentDepValues.some((val: any, idx: number) => val !== prevDepValues[idx]);
      }

      prevEffectDepsRef.current[effNode.id] = currentDepValues;

      if (shouldRun) {
        // 1. Run previous cleanup if registered
        const prevCleanup = activeCleanupsRef.current[effNode.id];
        if (prevCleanup) {
          prevCleanup();
          activeCleanupsRef.current[effNode.id] = undefined;
          const cleanupStep: TraceStep = {
            id: Math.random().toString(),
            sourceNodeId: effNode.id,
            description: `useEffect [cleanup]: Ran cleanup (${effNode.props.cleanupCode || 'cleanup()'})`,
            timestamp: Date.now(),
            type: 'cleanup',
          };
          setTraceLogs((prev) => [cleanupStep, ...prev.slice(0, 5)]);
          onTraceAction?.(cleanupStep);
        }

        // 2. Run effect body
        const task = effNode.props.effectTask || 'documentTitle';
        const effectStep: TraceStep = {
          id: Math.random().toString(),
          sourceNodeId: effNode.id,
          description: `useEffect [effect]: Executed [${task}] -> ${effNode.props.effectCode || 'effect logic'}`,
          timestamp: Date.now(),
          type: 'effect',
        };
        setTraceLogs((prev) => [effectStep, ...prev.slice(0, 5)]);
        onTraceAction?.(effectStep);

        // 3. Register cleanup function for next invocation & execute active timers
        if (effNode.props.effectTask === 'interval') {
          // Check if condition allows running (isRunning state or unconditional)
          const isRunningState = nodes.find(
            (n) => n.type === 'logic' && n.subtype === 'useState' && n.props.stateName === 'isRunning'
          );
          const isRunningVal = isRunningState ? Boolean(hookStates[isRunningState.id]) : true;

          if (isRunningVal) {
            const targetState = nodes.find(
              (n) =>
                n.type === 'logic' &&
                n.subtype === 'useState' &&
                (n.props.stateName === 'seconds' || n.props.stateName === 'time' || n.props.stateName === 'count')
            );
            if (targetState) {
              const timerId = window.setInterval(() => {
                setHookStates((prev) => {
                  const currentSec = typeof prev[targetState.id] === 'number' ? prev[targetState.id] : 0;
                  return { ...prev, [targetState.id]: currentSec + 1 };
                });
                setRenderCount((c) => c + 1);
              }, 1000);

              activeCleanupsRef.current[effNode.id] = () => {
                window.clearInterval(timerId);
              };
            }
          }
        } else if (effNode.props.effectTask === 'dataFetch') {
          // Execute live 300ms debounce timer updating debouncedQuery
          const targetDebouncedState = nodes.find(
            (n) => n.type === 'logic' && n.subtype === 'useState' && n.props.stateName === 'debouncedQuery'
          );
          if (targetDebouncedState) {
            const currentQ = currentDepValues[0] ?? '';
            const timer = window.setTimeout(() => {
              setHookStates((prev) => ({ ...prev, [targetDebouncedState.id]: currentQ }));
              setRenderCount((c) => c + 1);
            }, 300);

            activeCleanupsRef.current[effNode.id] = () => {
              window.clearTimeout(timer);
            };
          }
        } else if (effNode.props.hasCleanup !== false) {
          activeCleanupsRef.current[effNode.id] = () => {
            console.log(`[Cleaned up effect ${effNode.id}]`);
          };
        }
      }
    });
  }, [nodes, hookStates, onTraceAction]);

  // Clean up all timers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(activeCleanupsRef.current).forEach((cleanup) => cleanup?.());
    };
  }, []);

  // Find bound hook for any UI node
  const getBoundHook = (uiNodeId: string): PlaygroundNode | undefined => {
    const conn = connections.find(
      (c) =>
        (c.sourceNodeId === uiNodeId && (c.type === 'event' || c.type === 'data')) ||
        (c.targetNodeId === uiNodeId && (c.type === 'event' || c.type === 'data'))
    );
    if (conn) {
      const targetHookId = conn.sourceNodeId === uiNodeId ? conn.targetNodeId : conn.sourceNodeId;
      return nodes.find((n) => n.id === targetHookId && n.type === 'logic' && (n.subtype === 'useState' || n.subtype === 'useReducer'));
    }
    return nodes.find((n) => n.type === 'logic' && (n.subtype === 'useState' || n.subtype === 'useReducer'));
  };

  // Execute an action triggered by UI interaction (Button click, Form submit)
  const triggerEvent = (uiNodeId: string, eventName: string) => {
    const targetHook = getBoundHook(uiNodeId);

    if (targetHook && targetHook.subtype === 'useState') {
      const prevVal = hookStates[targetHook.id] ?? targetHook.props.initialValue ?? 0;
      const uiNode = nodes.find((n) => n.id === uiNodeId);
      const actionType = uiNode?.props.actionType || 'increment';
      const amount = uiNode?.props.actionAmount ?? 1;

      let nextVal = prevVal;
      let actionDesc = '';

      if (actionType === 'decrement') {
        nextVal = typeof prevVal === 'number' ? prevVal - amount : prevVal;
        actionDesc = `Decrement (-${amount})`;
      } else if (actionType === 'reset') {
        nextVal = targetHook.props.initialValue ?? 0;
        actionDesc = `Reset (${nextVal})`;
        // Also pause timer if an isRunning state exists
        const runningNode = nodes.find(
          (n) => n.type === 'logic' && n.subtype === 'useState' && n.props.stateName === 'isRunning'
        );
        if (runningNode) {
          setHookStates((prev) => ({ ...prev, [runningNode.id]: false }));
        }
      } else if (actionType === 'toggle') {
        nextVal = !prevVal;
        actionDesc = `Toggle (${nextVal})`;
      } else if (actionType === 'setValue') {
        nextVal = uiNode?.props.actionValue ?? 0;
        actionDesc = `Set (${nextVal})`;
      } else {
        nextVal = typeof prevVal === 'number' ? prevVal + amount : prevVal;
        actionDesc = amount === 1 ? 'Increment (+1)' : `Increment (+${amount})`;
      }

      setHookStates((prev) => ({ ...prev, [targetHook.id]: nextVal }));
      setRenderCount((c) => c + 1);

      const step: TraceStep = {
        id: Math.random().toString(),
        sourceNodeId: uiNodeId,
        targetNodeId: targetHook.id,
        description: `Click <Button "${uiNode?.props.content || 'Button'}" /> -> ${actionDesc} -> ${targetHook.props.stateName || 'state'}: ${prevVal} → ${nextVal}`,
        timestamp: Date.now(),
        type: 'click',
      };

      setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
      onTraceAction?.(step);
    } else if (targetHook && targetHook.subtype === 'useReducer') {
      const prevVal = hookStates[targetHook.id] ?? targetHook.props.reducerInitialState ?? 0;
      const uiNode = nodes.find((n) => n.id === uiNodeId);

      const isCartAction = uiNode?.id === 'node-btn-cart' || uiNode?.props.content?.toLowerCase().includes('cart');
      let productName = 'Pro License';
      let productPrice = 49;
      if (isCartAction) {
        const match = selectedProduct.match(/^(.*?)\s*\(\$(\d+)\)/);
        if (match) {
          productName = match[1].trim();
          productPrice = parseInt(match[2], 10);
        } else {
          productName = selectedProduct;
        }

        setCartItems((prev) => {
          const existing = prev.find((item) => item.name === productName);
          if (existing) {
            return prev.map((item) =>
              item.name === productName ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...prev, { id: `item-${Date.now()}`, name: productName, price: productPrice, quantity: 1 }];
        });
      }

      const nextVal = typeof prevVal === 'number' ? prevVal + 1 : prevVal;

      setHookStates((prev) => ({ ...prev, [targetHook.id]: nextVal }));
      setRenderCount((c) => c + 1);

      const step: TraceStep = {
        id: Math.random().toString(),
        sourceNodeId: uiNodeId,
        targetNodeId: targetHook.id,
        description: isCartAction
          ? `Click <Button "${uiNode?.props.content || 'Button'}" /> -> dispatch({ type: 'ADD_ITEM', payload: '${productName}' }) -> totalItems: ${nextVal}`
          : `Click <Button "${uiNode?.props.content || 'Button'}" /> -> dispatch({ type: 'INCREMENT' }) -> state: ${prevVal} → ${nextVal}`,
        timestamp: Date.now(),
        type: 'click',
      };

      setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
      onTraceAction?.(step);
    } else {
      const uiNode = nodes.find((n) => n.id === uiNodeId);
      const step: TraceStep = {
        id: Math.random().toString(),
        sourceNodeId: uiNodeId,
        targetNodeId: targetHook?.id,
        description: targetHook
          ? `Click <Button "${uiNode?.props.content || 'Button'}" /> -> Triggered ${targetHook.subtype} pipeline`
          : `Click <Button "${uiNode?.props.content || 'Button'}" /> -> Dispatched event`,
        timestamp: Date.now(),
        type: 'click',
      };
      setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
      onTraceAction?.(step);
      setRenderCount((c) => c + 1);
    }
  };

  const handleUpdateCartItemQty = (itemId: string, delta: number) => {
    const targetHook = nodes.find((n) => n.subtype === 'useReducer');
    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      const totalItems = updated.reduce((sum, item) => sum + item.quantity, 0);
      if (targetHook) {
        setHookStates((prevHooks) => ({ ...prevHooks, [targetHook.id]: totalItems }));
      }
      return updated;
    });

    setRenderCount((c) => c + 1);

    const step: TraceStep = {
      id: Math.random().toString(),
      sourceNodeId: 'node-card-cart',
      targetNodeId: targetHook?.id,
      description: `Cart [Qty ${delta > 0 ? '+1' : '-1'}] -> dispatch({ type: 'UPDATE_QUANTITY' })`,
      timestamp: Date.now(),
      type: 'state_change',
    };
    setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
    onTraceAction?.(step);
  };

  const handleRemoveCartItem = (itemId: string) => {
    const targetHook = nodes.find((n) => n.subtype === 'useReducer');
    setCartItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === itemId);
      const updated = prev.filter((i) => i.id !== itemId);
      const totalItems = updated.reduce((sum, item) => sum + item.quantity, 0);
      if (targetHook) {
        setHookStates((prevHooks) => ({ ...prevHooks, [targetHook.id]: totalItems }));
      }

      const step: TraceStep = {
        id: Math.random().toString(),
        sourceNodeId: 'node-card-cart',
        targetNodeId: targetHook?.id,
        description: `Cart [Remove] -> dispatch({ type: 'REMOVE_ITEM', payload: '${itemToRemove?.name || 'item'}' })`,
        timestamp: Date.now(),
        type: 'state_change',
      };
      setTraceLogs((prevLogs) => [step, ...prevLogs.slice(0, 5)]);
      onTraceAction?.(step);

      return updated;
    });
    setRenderCount((c) => c + 1);
  };

  const handleClearCart = () => {
    const targetHook = nodes.find((n) => n.subtype === 'useReducer');
    setCartItems([]);
    if (targetHook) {
      setHookStates((prev) => ({ ...prev, [targetHook.id]: 0 }));
    }
    setRenderCount((c) => c + 1);
    const step: TraceStep = {
      id: Math.random().toString(),
      sourceNodeId: 'node-card-cart',
      targetNodeId: targetHook?.id,
      description: "Cart [Clear] -> dispatch({ type: 'CLEAR_CART' }) -> totalItems: 0",
      timestamp: Date.now(),
      type: 'state_change',
    };
    setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
    onTraceAction?.(step);
  };

  // Direct value changes (Switch toggle, Slider change, Input typing, Dropdown select)
  const triggerValueChange = (uiNodeId: string, nextVal: any, eventName: string) => {
    const targetHook = getBoundHook(uiNodeId);
    const uiNode = nodes.find((n) => n.id === uiNodeId);

    // Check for useTransition in architecture (e.g. catalog_filter)
    const transitionHook = nodes.find((n) => n.type === 'logic' && n.subtype === 'useTransition');
    const deferredHook = nodes.find(
      (n) => n.type === 'logic' && n.subtype === 'useState' && n.props.stateName === 'deferredQuery'
    );

    if (transitionHook && (uiNodeId === 'node-input-cat' || targetHook?.props.stateName === 'inputQuery')) {
      // 1. Immediate urgent update: high-priority state for responsive typing without UI freeze
      setCatalogInput(nextVal);
      setHookStates((prev) => ({
        ...prev,
        [targetHook?.id || 'node-state-input']: nextVal,
        [transitionHook.id]: true, // isPending: true
      }));
      setIsCatalogPending(true);
      setRenderCount((c) => c + 1);

      const urgentStep: TraceStep = {
        id: Math.random().toString(),
        sourceNodeId: uiNodeId,
        targetNodeId: targetHook?.id,
        description: `1. [Urgent Input] inputQuery: "${nextVal}" (Keystroke rendered immediately at 60 FPS)`,
        timestamp: Date.now(),
        type: 'state_change',
      };
      setTraceLogs((prev) => [urgentStep, ...prev.slice(0, 5)]);
      onTraceAction?.(urgentStep);

      // Cancel previous transition if user is actively typing (React concurrent interruption behavior)
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // 2. Schedule non-urgent background transition for 10,000+ catalog item filtering
      transitionTimeoutRef.current = setTimeout(() => {
        setIsCatalogPending(false);
        setCatalogDeferred(nextVal);
        setHookStates((prev) => ({
          ...prev,
          [transitionHook.id]: false, // isPending: false
          ...(deferredHook ? { [deferredHook.id]: nextVal } : {}),
        }));
        setRenderCount((c) => c + 1);

        const transitionStep: TraceStep = {
          id: Math.random().toString(),
          sourceNodeId: transitionHook.id,
          targetNodeId: deferredHook?.id,
          description: `2. [Transition Committed] isPending: false -> 10,000 catalog items filtered for "${nextVal}"`,
          timestamp: Date.now(),
          type: 'state_change',
        };
        setTraceLogs((prev) => [transitionStep, ...prev.slice(0, 5)]);
        onTraceAction?.(transitionStep);
      }, 350);

      return;
    }

    if (targetHook && targetHook.subtype === 'useState') {
      const prevVal = hookStates[targetHook.id];
      setHookStates((prev) => ({ ...prev, [targetHook.id]: nextVal }));
      setRenderCount((c) => c + 1);

      const step: TraceStep = {
        id: Math.random().toString(),
        sourceNodeId: uiNodeId,
        targetNodeId: targetHook.id,
        description: `${uiNode?.subtype || 'Control'} [${eventName}] -> ${targetHook.props.stateName || 'state'}: ${JSON.stringify(prevVal)} → ${JSON.stringify(nextVal)}`,
        timestamp: Date.now(),
        type: 'state_change',
      };

      setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
      onTraceAction?.(step);
    }
  };

  const handleReset = () => {
    // Run any active effect cleanups before resetting
    Object.values(activeCleanupsRef.current).forEach((cleanup) => cleanup?.());
    activeCleanupsRef.current = {};
    prevEffectDepsRef.current = {};

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setCatalogInput('');
    setCatalogDeferred('');
    setIsCatalogPending(false);
    setActiveTheme('dark');
    setDocContent('React hooks enable declarative synchronization with external side-effects.');
    setSaveStatus('saved');
    setLastSavedTime('Just now');
    isDirtyRef.current = false;

    const initial: Record<string, any> = {};
    nodes.forEach((n) => {
      if (n.type === 'logic' && n.subtype === 'useState') {
        initial[n.id] = n.props.initialValue ?? 0;
      } else if (n.type === 'logic' && n.subtype === 'useReducer') {
        initial[n.id] = n.props.reducerInitialState ?? 0;
      }
    });
    setHookStates(initial);
    if (nodes.some((n) => n.id === 'node-reducer-cart' || n.props.variant === 'cart')) {
      setCartItems([{ id: 'item-pro', name: 'Pro License', price: 49, quantity: 1 }]);
      setSelectedProduct('Pro License ($49)');
    }
    setFormStep(1);
    setFormData({
      'node-form-email': 'user@company.com',
      'node-form-username': 'johndoe',
      'node-form-fullname': 'John Doe',
      'node-form-plan': 'Pro Team ($29/mo)',
      'node-form-terms': true,
    });
    setFormSubmitted(false);
    setFormStepError(null);
    setRenderCount(1);

    // Reset Template states
    setIsPlaying(false);
    setCurrentTime(35);
    setPlaybackSpeed(1.0);
    setHistoryStack({ past: [], present: 'Step 1: Initial Setup', future: [] });
    setBtcPrice(64420.5);
    setBtcDelta(2.45);
    setA11yUsername('varun_developer');
    setA11yEmail('varun@enterprise.dev');
    setA11ySaved(false);
    setA11yActiveId(null);
    setIsModalOpen(false);
    setKanbanFilter('All Columns');
    setKanbanTasks([
      { id: '1', title: 'Implement Auth Middleware', col: 'Todo' },
      { id: '2', title: 'Refactor Context Provider', col: 'In Progress' },
      { id: '3', title: 'Fix Layout Flicker Bug', col: 'Done' },
    ]);
    setDraggingTaskId(null);
    setDragOverCol(null);
    setCalcWeight(4);
    setPwdValue('Antigravity#2026');
    setPageItems(5);
    setFlashSeconds(300);
    setToastQueue([{ id: 't-1', message: 'System deployment completed successfully' }]);
    setSimWindowWidth(1024);
    setIsUserOverridingWidth(false);
    setActiveTab('Overview');
    setAnimTarget(25000);
    setAnimDurationMs(2000);
    setAnimCount(25000);
    setIsAnimating(false);
    if (animRafRef.current) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }
    setReviewStars(5);
    setReviewSubmitted(false);

    setTraceLogs([
      {
        id: Math.random().toString(),
        sourceNodeId: 'reset',
        description: 'Component reset: Ran cleanups and re-initialized state',
        timestamp: Date.now(),
        type: 'cleanup',
      },
    ]);
  };

  // Interpolate state variables: "Count: {{count}}" -> "Count: 7"
  const resolveTemplate = (template: string = ''): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      if (varName === 'theme') {
        return activeTheme;
      }
      if (varName === 'saveStatus') {
        return saveStatus;
      }
      if (varName === 'count') {
        if (nodes.some((n) => n.id === 'node-text-btc')) {
          return btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (nodes.some((n) => n.id === 'node-text-total')) {
          const weight = hookStates['node-state-weight'] ?? calcWeight;
          return Math.round(50 + Number(weight) * 5 + (50 + Number(weight) * 5) * 0.1).toString();
        }
        if (nodes.some((n) => n.id === 'node-text-pages')) {
          return String(hookStates['node-state-pages'] ?? pageItems);
        }
        if (nodes.some((n) => n.id === 'node-text-sale')) {
          return String(flashSeconds);
        }
        if (nodes.some((n) => n.id === 'node-badge-toast')) {
          return String(toastQueue.length);
        }
        if (nodes.some((n) => n.id === 'node-text-vp')) {
          return String(simWindowWidth);
        }
        if (nodes.some((n) => n.id === 'node-text-counter')) {
          return animCount.toLocaleString();
        }
      }
      const hookNode = nodes.find(
        (n) => n.type === 'logic' && n.subtype === 'useState' && (n.props.stateName === varName || varName === 'count')
      );
      if (hookNode && hookStates[hookNode.id] !== undefined) {
        return String(hookStates[hookNode.id]);
      }
      return match;
    });
  };

  const uiNodes = nodes
    .filter((n) => n.type === 'ui')
    .sort((a, b) => {
      const orderA = typeof a.props?.uiOrder === 'number' ? a.props.uiOrder : nodes.indexOf(a);
      const orderB = typeof b.props?.uiOrder === 'number' ? b.props.uiOrder : nodes.indexOf(b);
      return orderA - orderB;
    });

  const renderKanbanBoard = (nodeId = 'node-kanban-board', title = 'Sprint Task Kanban Board') => {
    const columns: Array<{ col: 'Todo' | 'In Progress' | 'Done'; title: string; color: string; badgeBg: string }> = [
      { col: 'Todo', title: 'Todo', color: '#6366f1', badgeBg: 'rgba(99, 102, 241, 0.15)' },
      { col: 'In Progress', title: 'In Progress', color: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.15)' },
      { col: 'Done', title: 'Done', color: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)' },
    ];

    const visibleCols = columns.filter((c) => kanbanFilter === 'All Columns' || kanbanFilter === c.col);

    return (
      <div
        key={nodeId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '14px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header with Title and Drag Hint */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Columns3 size={15} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </span>
          </div>
          <span
            style={{
              fontSize: '10.5px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              color: '#8b5cf6',
              fontWeight: 600,
            }}
          >
            Drag &amp; Drop Cards to Transition
          </span>
        </div>

        {/* Columns Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: visibleCols.length === 1 ? '1fr' : 'repeat(3, 1fr)',
            gap: '10px',
            width: '100%',
          }}
        >
          {visibleCols.map(({ col, title: colTitle, color, badgeBg }) => {
            const colTasks = kanbanTasks.filter((t) => t.col === col);
            const isOver = dragOverCol === col;

            return (
              <div
                key={col}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={() => setDragOverCol(col)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
                  if (!taskId) return;
                  const taskToMove = kanbanTasks.find((t) => t.id === taskId);
                  if (!taskToMove || taskToMove.col === col) return;

                  setKanbanTasks((prev) =>
                    prev.map((item) => (item.id === taskId ? { ...item, col } : item))
                  );

                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: nodeId,
                    targetNodeId: 'node-reducer-kanban',
                    description: `Kanban [Drag & Drop] -> dispatch({ type: 'MOVE_TASK', id: '${taskId}', to: '${col}' }) -> Moved "${taskToMove.title}" to ${col}`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: isOver ? '2px dashed #3b82f6' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minHeight: '160px',
                  transition: 'all 150ms ease',
                  boxShadow: isOver ? '0 0 14px rgba(59, 130, 246, 0.25)' : 'none',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: color,
                      }}
                    />
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {colTitle}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: badgeBg,
                      color,
                      fontWeight: 700,
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 6px',
                        fontSize: '10.5px',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        userSelect: 'none',
                      }}
                    >
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const isBeingDragged = draggingTaskId === t.id;
                      const tagInfo =
                        t.id === '1'
                          ? { name: 'Backend', bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }
                          : t.id === '2'
                          ? { name: 'State', bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }
                          : t.id === '3'
                          ? { name: 'Bugfix', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }
                          : { name: 'Task', bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' };

                      return (
                        <div
                          key={t.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', t.id);
                            setDraggingTaskId(t.id);
                          }}
                          onDragEnd={() => {
                            setDraggingTaskId(null);
                            setDragOverCol(null);
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: isBeingDragged
                              ? '1px dashed var(--accent-primary)'
                              : '1px solid var(--border-default)',
                            opacity: isBeingDragged ? 0.45 : 1,
                            cursor: 'grab',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            transition: 'all 120ms ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '9px',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                backgroundColor: tagInfo.bg,
                                color: tagInfo.color,
                                fontWeight: 700,
                              }}
                            >
                              {tagInfo.name}
                            </span>
                            <GripVertical size={12} style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {t.title}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUIElement = (node: PlaygroundNode): React.ReactNode => {
    const content = resolveTemplate(node.props.content || '');
    const boundHook = getBoundHook(node.id);

    switch (node.subtype) {
      case 'Button': {
        let buttonLabel = content || 'Button';
        if (boundHook && boundHook.props.stateName === 'isRunning') {
          const isRunning = Boolean(hookStates[boundHook.id]);
          buttonLabel = isRunning ? 'Pause' : 'Start';
        }

        if (node.id === 'node-btn-dom') {
          const targetWidthPx = targetSize === 'small' ? 160 : targetSize === 'medium' ? 240 : 340;
          return (
            <div
              key={node.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '16px 14px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {/* Timing mode selector pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  padding: '3px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setUseLayoutTimingMode('layout')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    backgroundColor: useLayoutTimingMode === 'layout' ? '#ec4899' : 'transparent',
                    color: useLayoutTimingMode === 'layout' ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 150ms ease',
                  }}
                >
                  ⚡ useLayoutEffect (Zero Flicker)
                </button>
                <button
                  type="button"
                  onClick={() => setUseLayoutTimingMode('passive')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    backgroundColor: useLayoutTimingMode === 'passive' ? 'var(--accent-warning)' : 'transparent',
                    color: useLayoutTimingMode === 'passive' ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 150ms ease',
                  }}
                >
                  Simulate useEffect (Flicker Lag)
                </button>
              </div>

              {/* Size switcher buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Anchor Width:</span>
                {(['small', 'medium', 'large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setTargetSize(sz)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: targetSize === sz ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      backgroundColor: targetSize === sz ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
                      color: targetSize === sz ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 120ms ease',
                    }}
                  >
                    {sz} ({sz === 'small' ? '160px' : sz === 'medium' ? '240px' : '340px'})
                  </button>
                ))}
              </div>

              {/* Anchor Button Container with Ref */}
              <div
                ref={anchorElementRef}
                style={{
                  width: `${targetWidthPx}px`,
                  transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button
                  style={{ width: '100%', justifyContent: 'center' }}
                  variant="primary"
                  onClick={() => {
                    const nextSize = targetSize === 'small' ? 'medium' : targetSize === 'medium' ? 'large' : 'small';
                    setTargetSize(nextSize);
                  }}
                >
                  <Target size={14} />
                  <span>Target Anchor ({targetWidthPx}px)</span>
                </Button>
              </div>
            </div>
          );
        }

        if (node.id === 'node-btn-play') {
          return (
            <Button
              key={node.id}
              variant={isPlaying ? 'secondary' : 'primary'}
              onClick={() => {
                const next = !isPlaying;
                setIsPlaying(next);
                setHookStates((prev) => ({ ...prev, 'node-state-play': next }));
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-ref-audio',
                  description: `Button [onClick] -> audioRef.current.${next ? 'play()' : 'pause()'} -> isPlaying: ${next}`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>{isPlaying ? 'Pause Audio Stream' : 'Play Audio Stream'}</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-speed-down') {
          const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
          const currentIndex = speeds.indexOf(playbackSpeed);
          const nextSpeed = currentIndex > 0 ? speeds[currentIndex - 1] : speeds[0];
          return (
            <Button
              key={node.id}
              variant="secondary"
              disabled={playbackSpeed <= 0.5}
              onClick={() => {
                setPlaybackSpeed(nextSpeed);
                setHookStates((prev) => ({ ...prev, 'node-state-speed': nextSpeed }));
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-state-speed',
                  description: `Button [onClick] -> audioRef.current.playbackRate = ${nextSpeed.toFixed(2)}x (Slower speed)`,
                  timestamp: Date.now(),
                  type: 'state_change',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Decrease Speed (-0.25x)</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-speed-up') {
          const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
          const currentIndex = speeds.indexOf(playbackSpeed);
          const nextSpeed = currentIndex < speeds.length - 1 ? speeds[currentIndex + 1] : speeds[speeds.length - 1];
          return (
            <Button
              key={node.id}
              variant="secondary"
              disabled={playbackSpeed >= 2.0}
              onClick={() => {
                setPlaybackSpeed(nextSpeed);
                setHookStates((prev) => ({ ...prev, 'node-state-speed': nextSpeed }));
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-state-speed',
                  description: `Button [onClick] -> audioRef.current.playbackRate = ${nextSpeed.toFixed(2)}x (Faster speed)`,
                  timestamp: Date.now(),
                  type: 'state_change',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Increase Speed (+0.25x)</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-undo') {
          return (
            <Button
              key={node.id}
              variant="secondary"
              disabled={historyStack.past.length === 0}
              onClick={() => {
                if (historyStack.past.length === 0) return;
                const prevStep = historyStack.past[historyStack.past.length - 1];
                setHistoryStack((prev) => ({
                  past: prev.past.slice(0, -1),
                  present: prevStep,
                  future: [prev.present, ...prev.future],
                }));
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-reducer-undo',
                  description: `Button [onClick] -> dispatch({ type: 'UNDO' }) -> Restored "${prevStep}"`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Undo Step ({formatKeybinding('Ctrl+Z')})</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-redo') {
          return (
            <Button
              key={node.id}
              variant="secondary"
              disabled={historyStack.future.length === 0}
              onClick={() => {
                if (historyStack.future.length === 0) return;
                const nextStep = historyStack.future[0];
                setHistoryStack((prev) => ({
                  past: [...prev.past, prev.present],
                  present: nextStep,
                  future: prev.future.slice(1),
                }));
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-reducer-undo',
                  description: `Button [onClick] -> dispatch({ type: 'REDO' }) -> Advanced to "${nextStep}"`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Redo Step ({formatKeybinding('Ctrl+Y')})</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-mutate') {
          return (
            <Button
              key={node.id}
              variant="primary"
              onClick={() => {
                const nextStep = `Step ${historyStack.past.length + 2}: Mutate State`;
                setHistoryStack((prev) => ({
                  past: [...prev.past, prev.present],
                  present: nextStep,
                  future: [],
                }));
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-reducer-undo',
                  description: `Button [onClick] -> dispatch({ type: 'PUSH_STATE' }) -> "${nextStep}"`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Push New Mutation Step</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-a11y-save') {
          return (
            <Button
              key={node.id}
              variant="primary"
              onClick={() => {
                setA11ySaved(true);
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-state-profile',
                  description: `Button [onClick] -> Form Validated with Accessible IDs (:r1:, :r2:) -> Saved Profile: @${a11yUsername} (${a11yEmail})`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>{a11ySaved ? '✓ Profile Saved' : 'Save Profile Settings'}</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-modal-open') {
          return (
            <Button
              key={node.id}
              variant="primary"
              onClick={() => {
                setIsModalOpen(true);
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-state-modal',
                  description: 'Button [onClick] -> setIsOpen(true) -> Focus trapped to modal dialog',
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Open Accessible Dialog</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-task-add') {
          return (
            <Button
              key={node.id}
              variant="primary"
              onClick={() => {
                const newId = String(Date.now());
                const newTask = { id: newId, title: `Sprint Task #${kanbanTasks.length + 1}`, col: 'Todo' as const };
                setKanbanTasks((prev) => [newTask, ...prev]);
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-reducer-kanban',
                  description: `Button [onClick] -> dispatch({ type: 'CREATE_CARD', title: "${newTask.title}" })`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>+ New Task Card</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-toast') {
          return (
            <Button
              key={node.id}
              variant="primary"
              onClick={() => {
                const toastId = Math.random().toString();
                const newToast = { id: toastId, message: `Toast Notification #${toastQueue.length + 1}` };
                setToastQueue((prev) => [...prev, newToast]);
                setTimeout(() => {
                  setToastQueue((prev) => prev.filter((t) => t.id !== toastId));
                }, 3000);
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-reducer-toast',
                  description: `Button [onClick] -> dispatch({ type: 'ADD_TOAST' }) -> Auto-dismiss in 3s`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Trigger Notification Toast</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-submit-rev') {
          return (
            <Button
              key={node.id}
              variant="primary"
              onClick={() => {
                setReviewSubmitted(true);
                const step: TraceStep = {
                  id: Math.random().toString(),
                  sourceNodeId: node.id,
                  targetNodeId: 'node-reducer-rev',
                  description: `Button [onClick] -> dispatch({ type: 'SUBMIT_REVIEW', stars: ${reviewStars} })`,
                  timestamp: Date.now(),
                  type: 'click',
                };
                setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                onTraceActionRef.current?.(step);
              }}
            >
              <span>Submit Review</span>
            </Button>
          );
        }

        if (node.id === 'node-btn-anim-trigger') {
          return (
            <Button
              key={node.id}
              variant="primary"
              disabled={isAnimating}
              onClick={() => {
                startCounterAnimation(animTarget, animDurationMs);
              }}
            >
              <span>{isAnimating ? '⚡ Interpolating at 60 FPS...' : (node.props.content || '▶ Play Milestone Animation')}</span>
            </Button>
          );
        }

        let safeBtnVariant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
        if (node.props.variant === 'secondary') safeBtnVariant = 'secondary';
        else if (node.props.variant === 'outline') safeBtnVariant = 'outline';
        else if (node.props.variant === 'ghost') safeBtnVariant = 'ghost';
        else if (node.props.variant === 'danger') safeBtnVariant = 'danger';

        return (
          <Button
            key={node.id}
            variant={safeBtnVariant}
            onClick={() => triggerEvent(node.id, 'onClick')}
            style={node.props?.layoutGroup ? { width: '100%', justifyContent: 'center' } : undefined}
          >
            {buttonLabel}
          </Button>
        );
      }

      case 'Text': {
        if (node.id === 'node-text-vp') {
          const bp = getBreakpointInfo(simWindowWidth);
          return (
            <p
              key={node.id}
              style={{
                fontSize: `${node.props.fontSize || 15}px`,
                color: 'var(--text-primary)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Width: <strong>{simWindowWidth}px</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: bp.color, fontWeight: 600 }}>{bp.tag}</span>
            </p>
          );
        }

        if (node.id === 'node-text-counter') {
          return (
            <div
              key={node.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Global Community Milestone
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontSize: `${node.props.fontSize || 28}px`,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: isAnimating ? 'var(--accent-primary)' : 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    transition: 'color 150ms ease',
                  }}
                >
                  {animCount.toLocaleString()}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  + Active Builders
                </span>
              </div>
            </div>
          );
        }

        return (
          <p
            key={node.id}
            style={{
              fontSize: `${node.props.fontSize || 15}px`,
              color: 'var(--text-primary)',
              fontWeight: 500,
            }}
          >
            {content || 'Text'}
          </p>
        );
      }

      case 'Heading':
        return (
          <h3
            key={node.id}
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {content || 'Heading'}
          </h3>
        );

      case 'Input': {
        if (node.id === 'node-input-doc') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {content && (
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {content}
                </label>
              )}
              <textarea
                rows={5}
                placeholder={node.props.placeholder || 'Start drafting your document...'}
                value={docContent}
                onChange={(e) => {
                  const next = e.target.value;
                  setDocContent(next);
                  isDirtyRef.current = true;
                  setSaveStatus('unsaved');

                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-ref-dirty',
                    description: `Editor [onChange] -> isDirtyRef.current = true (Silently tracked via useRef with 0 redundant re-renders)`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '110px',
                  lineHeight: '1.5',
                  boxSizing: 'border-box',
                  width: '100%',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Words: {docContent.trim() ? docContent.trim().split(/\s+/).length : 0} • Characters: {docContent.length}</span>
                <span>Silent Draft Sync active (2.5s interval)</span>
              </div>
            </div>
          );
        }

        if (node.id === 'node-input-username') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <label
                htmlFor=":r1:"
                onClick={() => {
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-id-username',
                    description: 'Label [onClick] -> Screen reader focus linked via htmlFor=":r1:" -> input#:r1: focused',
                    timestamp: Date.now(),
                    type: 'click',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: a11yActiveId === ':r1:' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 150ms ease',
                }}
              >
                <span>Unique Username</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>(htmlFor=":r1:")</span>
              </label>
              <input
                id=":r1:"
                type="text"
                placeholder={node.props.placeholder || 'Enter username...'}
                value={a11yUsername}
                onFocus={() => {
                  setA11yActiveId(':r1:');
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-id-username',
                    description: 'Input [onFocus] -> Screen reader accessibility confirmed on input#:r1:',
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                onBlur={() => setA11yActiveId(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  setA11yUsername(val);
                  setA11ySaved(false);
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-state-profile',
                    description: `Input [onChange] -> Bound to :r1: -> username: "${val}"`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: a11yActiveId === ':r1:' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
            </div>
          );
        }

        if (node.id === 'node-input-email') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <label
                htmlFor=":r2:"
                onClick={() => {
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-id-email',
                    description: 'Label [onClick] -> Screen reader focus linked via htmlFor=":r2:" -> input#:r2: focused',
                    timestamp: Date.now(),
                    type: 'click',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: a11yActiveId === ':r2:' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 150ms ease',
                }}
              >
                <span>Primary Email</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>(htmlFor=":r2:")</span>
              </label>
              <input
                id=":r2:"
                type="email"
                placeholder={node.props.placeholder || 'Enter email...'}
                value={a11yEmail}
                onFocus={() => {
                  setA11yActiveId(':r2:');
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-id-email',
                    description: 'Input [onFocus] -> Screen reader accessibility confirmed on input#:r2:',
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                onBlur={() => setA11yActiveId(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  setA11yEmail(val);
                  setA11ySaved(false);
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-state-profile',
                    description: `Input [onChange] -> Bound to :r2: -> email: "${val}"`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: a11yActiveId === ':r2:' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
            </div>
          );
        }

        if (node.id === 'node-input-pwd') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Secret Password
              </label>
              <input
                type="password"
                value={pwdValue}
                placeholder={node.props.placeholder || 'Enter password...'}
                onChange={(e) => {
                  const val = e.target.value;
                  setPwdValue(val);
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-memo-entropy',
                    description: `Input [onChange] -> computeEntropy("${val.replace(/./g, '*')}") -> Re-evaluated strength score`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </div>
          );
        }

        if (node.id === 'node-input-ls') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Local-First Cache Input
              </label>
              <input
                type="text"
                value={lsSyncedText}
                placeholder={node.props.placeholder || 'Type here to sync to disk...'}
                onChange={(e) => {
                  const val = e.target.value;
                  setLsSyncedText(val);
                  try {
                    localStorage.setItem('local_first_cache', val);
                  } catch {}
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-state-ls',
                    description: `Input [onChange] -> localStorage.setItem("local_first_cache", "${val}")`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </div>
          );
        }

        if (node.id === 'node-input-target') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Target Milestone Value
                </label>
                <span style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  Goal: {animTarget.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                min={100}
                max={1000000}
                step={1000}
                value={animTarget}
                disabled={isAnimating}
                placeholder={node.props.placeholder || 'e.g. 50000'}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 0);
                  setAnimTarget(val);
                  setHookStates((prev) => ({ ...prev, 'node-state-target': val }));
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-state-target',
                    description: `Input [onChange] -> targetMilestone: ${val.toLocaleString()}`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                }}
              />
              {/* Quick preset buttons */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                {[10000, 25000, 50000, 100000].map((presetVal) => (
                  <button
                    key={presetVal}
                    type="button"
                    disabled={isAnimating}
                    onClick={() => {
                      setAnimTarget(presetVal);
                      setHookStates((prev) => ({ ...prev, 'node-state-target': presetVal }));
                      const step: TraceStep = {
                        id: Math.random().toString(),
                        sourceNodeId: node.id,
                        targetNodeId: 'node-state-target',
                        description: `Quick Preset -> targetMilestone: ${presetVal.toLocaleString()}`,
                        timestamp: Date.now(),
                        type: 'state_change',
                      };
                      setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                      onTraceActionRef.current?.(step);
                    }}
                    style={{
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: animTarget === presetVal ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: animTarget === presetVal ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-elevated)',
                      color: animTarget === presetVal ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      cursor: isAnimating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {presetVal >= 1000 ? `${presetVal / 1000}k` : presetVal}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        const boundVal = boundHook && hookStates[boundHook.id] !== undefined ? hookStates[boundHook.id] : node.props.value;
        let currentVal = formData[node.id] !== undefined ? formData[node.id] : (boundVal !== undefined ? boundVal : '');
        if (node.id === 'node-input-cat') {
          currentVal = catalogInput;
        }
        return (
          <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            {content && <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{content}</label>}
            <input
              type={node.props.inputType || 'text'}
              placeholder={node.props.placeholder || 'Type here...'}
              value={currentVal}
              onChange={(e) => {
                const next = e.target.value;
                setFormData((prev) => ({ ...prev, [node.id]: next }));
                setFormStepError(null);
                triggerValueChange(node.id, next, 'onChange');
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
              }}
            />
          </div>
        );
      }

      case 'Switch': {
        const isThemeSwitch = node.id === 'node-switch-theme' || nodes.some((n) => n.subtype === 'useContext');
        const isDark = activeTheme === 'dark';
        const boundVal = isThemeSwitch
          ? isDark
          : boundHook && hookStates[boundHook.id] !== undefined
          ? Boolean(hookStates[boundHook.id])
          : Boolean(node.props.checked);

        const handleToggle = () => {
          if (isThemeSwitch) {
            const nextTheme = isDark ? 'light' : 'dark';
            setActiveTheme(nextTheme);
            setHookStates((prev) => ({
              ...prev,
              'node-state-theme': nextTheme,
              'node-ctx-theme': nextTheme,
            }));

            const step: TraceStep = {
              id: Math.random().toString(),
              sourceNodeId: node.id,
              targetNodeId: 'node-ctx-theme',
              description: `Switch [onToggle] -> ThemeContext.Provider broadcast: theme = "${nextTheme}" (Updated deep child consumers with 0 prop drilling)`,
              timestamp: Date.now(),
              type: 'state_change',
            };
            setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
            onTraceActionRef.current?.(step);
          } else {
            triggerValueChange(node.id, !boundVal, 'onToggle');
          }
        };

        const labelText = isThemeSwitch
          ? (node.props.label || (isDark ? 'Dark Palette Active' : 'Light Palette Active'))
          : (content || node.props.label || 'Toggle Switch');

        return (
          <div
            key={node.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isThemeSwitch && (
                isDark ? <Moon size={15} style={{ color: '#a855f7' }} /> : <Sun size={15} style={{ color: '#f59e0b' }} />
              )}
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {labelText}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={boundVal}
              onClick={handleToggle}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: boundVal ? (isThemeSwitch ? '#a855f7' : 'var(--accent-primary)') : 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                padding: '2px',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: '2px',
                  left: boundVal ? '22px' : '2px',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>
        );
      }

      case 'Dropdown': {
        const options = node.props.options && node.props.options.length > 0
          ? node.props.options
          : ['Light', 'Dark', 'System'];
        const currentVal = node.id === 'node-dropdown-kanban'
          ? kanbanFilter
          : node.id === 'node-dropdown-tabs'
          ? activeTab
          : node.id === 'node-dropdown-cart' || node.props.options?.some((o: string) => o.includes('$'))
          ? selectedProduct
          : boundHook && hookStates[boundHook.id] !== undefined
          ? String(hookStates[boundHook.id])
          : options[0];
        return (
          <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            {content && <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{content}</label>}
            <CustomSelect
              value={currentVal}
              options={options}
              onChange={(val) => {
                if (node.id === 'node-dropdown-kanban') {
                  setKanbanFilter(val);
                } else if (node.id === 'node-dropdown-tabs') {
                  setActiveTab(val);
                } else if (node.id === 'node-dropdown-cart' || options.some((o: string) => o.includes('$'))) {
                  setSelectedProduct(val);
                }
                triggerValueChange(node.id, val, 'onChange');
              }}
              fullWidth
              size="lg"
            />
          </div>
        );
      }

      case 'Slider': {
        if (node.id === 'node-slider-audio') {
          const mins = Math.floor(currentTime * 0.0345);
          const secs = Math.floor((currentTime * 0.0345 - mins) * 60);
          const timeFormatted = `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>Audio Track Timeline Scrubbing</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                  {timeFormatted} / 03:27 ({playbackSpeed.toFixed(2)}x)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  setHookStates((prev) => ({ ...prev, 'node-state-time': val }));
                }}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>
          );
        }

        if (node.id === 'node-slider-weight') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>Freight Shipping Weight</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700 }}>{calcWeight} kg</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={calcWeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCalcWeight(val);
                  setHookStates((prev) => ({ ...prev, 'node-state-weight': val }));
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-state-weight',
                    description: `Slider [onChange] -> setWeight(${val}kg) -> Recalculating useMemo total`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>
          );
        }

        if (node.id === 'node-slider-vp') {
          const bp = getBreakpointInfo(simWindowWidth);
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>Simulate Viewport Width</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: bp.color, fontWeight: 700 }}>
                  {simWindowWidth}px ({bp.name})
                </span>
              </div>
              <input
                type="range"
                min={360}
                max={1920}
                step={10}
                value={simWindowWidth}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIsUserOverridingWidth(true);
                  setSimWindowWidth(val);
                  setHookStates((prev) => ({ ...prev, 'node-state-vp': val }));
                  const nextBp = getBreakpointInfo(val);
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-layout-vp',
                    description: `Slider [onChange] -> windowWidth: ${val}px -> useLayoutEffect triggered synchronous layout sync -> Breakpoint: "${nextBp.name}" (${nextBp.cols} Col)`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{ width: '100%', accentColor: bp.color, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>360px (Mobile)</span>
                <span>768px (Tablet)</span>
                <span>1024px (Desktop)</span>
                <span>1920px (4K)</span>
              </div>
            </div>
          );
        }

        if (node.id === 'node-slider-duration') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>Animation Duration</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {(animDurationMs / 1000).toFixed(1)}s ({animDurationMs}ms)
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={250}
                value={animDurationMs}
                disabled={isAnimating}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAnimDurationMs(val);
                  setHookStates((prev) => ({ ...prev, 'node-state-duration': val }));
                  const step: TraceStep = {
                    id: Math.random().toString(),
                    sourceNodeId: node.id,
                    targetNodeId: 'node-state-duration',
                    description: `Slider [onChange] -> durationMs: ${val}ms (${(val / 1000).toFixed(1)}s)`,
                    timestamp: Date.now(),
                    type: 'state_change',
                  };
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: isAnimating ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>0.5s Fast</span>
                <span>2.0s Balanced</span>
                <span>5.0s Cinematic</span>
              </div>
            </div>
          );
        }

        if (node.id === 'node-slider-stars') {
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>Star Satisfaction Rating</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                  {'★'.repeat(reviewStars)}{'☆'.repeat(5 - reviewStars)} ({reviewStars}/5)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={reviewStars}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setReviewStars(val);
                  setReviewSubmitted(false);
                }}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
            </div>
          );
        }

        const min = node.props.min ?? 0;
        const max = node.props.max ?? 100;
        const step = node.props.step ?? 1;
        const currentVal = boundHook && hookStates[boundHook.id] !== undefined
          ? Number(hookStates[boundHook.id])
          : (node.props.initialValue ?? 50);
        return (
          <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{content || node.props.label || 'Range Slider'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>{currentVal}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentVal}
              onChange={(e) => triggerValueChange(node.id, Number(e.target.value), 'onChange')}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        );
      }

      case 'Checkbox': {
        const boundVal = boundHook && hookStates[boundHook.id] !== undefined
          ? Boolean(hookStates[boundHook.id])
          : Boolean(node.props.checked);
        return (
          <label
            key={node.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 0',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={boundVal}
              onChange={(e) => triggerValueChange(node.id, e.target.checked, 'onChange')}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
              {content || node.props.label || 'Checkbox option'}
            </span>
          </label>
        );
      }

      case 'Form': {
        const children = uiNodes.filter((c) => c.parentId === node.id);
        const isMulti = Boolean(node.props.isMultiStep || (Array.isArray(node.props.steps) && node.props.steps.length > 1) || node.id === 'node-form-container');
        const steps: string[] = Array.isArray(node.props.steps) && node.props.steps.length > 0
          ? node.props.steps
          : isMulti
          ? ['Account Info', 'Personal Profile', 'Review & Confirm']
          : ['Step 1'];

        if (isMulti) {
          const totalSteps = steps.length;
          const currentStepTitle = steps[formStep - 1] || `Step ${formStep}`;
          const currentChildren = children.filter((c) => (c.props.step || 1) === formStep);
          const isReviewStep = formStep === totalSteps;

          const handleNextStep = () => {
            if (formStep === 1) {
              const email = formData['node-form-email'] || '';
              if (!email || !email.includes('@') || !email.includes('.')) {
                setFormStepError('Please provide a valid work email (e.g. user@domain.com)');
                return;
              }
              const username = formData['node-form-username'] || '';
              if (!username || username.trim().length < 3) {
                setFormStepError('Username must be at least 3 characters');
                return;
              }
            }
            setFormStepError(null);
            const nextStep = Math.min(formStep + 1, totalSteps);
            setFormStep(nextStep);
            setRenderCount((c) => c + 1);

            nodes.forEach((n) => {
              if (n.type === 'logic' && n.subtype === 'useState' && n.props.stateName === 'currentStep') {
                setHookStates((prev) => ({ ...prev, [n.id]: nextStep }));
              }
              if (n.type === 'logic' && n.subtype === 'useReducer') {
                setHookStates((prev) => ({ ...prev, [n.id]: nextStep }));
              }
            });

            const step: TraceStep = {
              id: Math.random().toString(),
              sourceNodeId: 'node-form-container',
              description: `Wizard: Next Step -> Advanced to Step ${nextStep} (dispatch NEXT_STEP)`,
              timestamp: Date.now(),
              type: 'state_change',
            };
            setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
            onTraceAction?.(step);
          };

          const handlePrevStep = () => {
            setFormStepError(null);
            const prevStep = Math.max(formStep - 1, 1);
            setFormStep(prevStep);
            setRenderCount((c) => c + 1);

            nodes.forEach((n) => {
              if (n.type === 'logic' && n.subtype === 'useState' && n.props.stateName === 'currentStep') {
                setHookStates((prev) => ({ ...prev, [n.id]: prevStep }));
              }
              if (n.type === 'logic' && n.subtype === 'useReducer') {
                setHookStates((prev) => ({ ...prev, [n.id]: prevStep }));
              }
            });

            const step: TraceStep = {
              id: Math.random().toString(),
              sourceNodeId: 'node-form-container',
              description: `Wizard: Back Button -> Returned to Step ${prevStep} (dispatch PREV_STEP)`,
              timestamp: Date.now(),
              type: 'state_change',
            };
            setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
            onTraceAction?.(step);
          };

          const handleCompleteWizard = () => {
            setFormSubmitted(true);
            setRenderCount((c) => c + 1);

            nodes.forEach((n) => {
              if (n.type === 'logic' && n.subtype === 'useReducer') {
                setHookStates((prev) => ({ ...prev, [n.id]: 'SUBMIT_SUCCESS' }));
              }
            });

            const step: TraceStep = {
              id: Math.random().toString(),
              sourceNodeId: 'node-form-container',
              description: "Wizard: Completed Registration -> dispatch({ type: 'SUBMIT_SUCCESS' })",
              timestamp: Date.now(),
              type: 'state_change',
            };
            setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
            onTraceAction?.(step);
          };

          return (
            <div
              key={node.id}
              style={{
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              {/* Stepper Header */}
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {content || 'Multi-Step Registration'}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--accent-primary-subtle)',
                      color: 'var(--accent-primary)',
                      fontWeight: 700,
                    }}
                  >
                    Step {formStep} of {totalSteps}
                  </span>
                </div>

                {/* Stepper Progress Fill Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-surface)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(formStep / totalSteps) * 100}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-primary)',
                      transition: 'width 250ms ease',
                    }}
                  />
                </div>

                {/* Step Pills / Icons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  {steps.map((stepName, sIdx) => {
                    const stepNum = sIdx + 1;
                    const isCompleted = stepNum < formStep;
                    const isCurrent = stepNum === formStep;
                    return (
                      <div
                        key={sIdx}
                        onClick={() => {
                          if (stepNum <= formStep) {
                            setFormStep(stepNum);
                            setFormStepError(null);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: stepNum <= formStep ? 'pointer' : 'default',
                          opacity: stepNum > formStep ? 0.6 : 1,
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted
                              ? '#10b981'
                              : isCurrent
                              ? 'var(--accent-primary)'
                              : 'var(--bg-surface)',
                            border: isCurrent
                              ? '2px solid var(--accent-primary)'
                              : '1px solid var(--border-default)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                        >
                          {isCompleted ? <Check size={11} strokeWidth={3} /> : stepNum}
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        >
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {formSubmitted ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                      }}
                    >
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Account Registered Successfully!
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                        Wizard state validated and dispatched via <code>useReducer</code>.
                      </p>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        maxWidth: '320px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        textAlign: 'left',
                        fontSize: '11.5px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div>
                        <strong>Email:</strong> {formData['node-form-email'] || 'user@company.com'}
                      </div>
                      <div>
                        <strong>Username:</strong> {formData['node-form-username'] || 'johndoe'}
                      </div>
                      <div>
                        <strong>Full Name:</strong> {formData['node-form-fullname'] || 'John Doe'}
                      </div>
                      <div>
                        <strong>Plan:</strong> {formData['node-form-plan'] || 'Developer Plan (Free)'}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormStep(1);
                        setFormStepError(null);
                      }}
                    >
                      Start New Registration
                    </Button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {currentStepTitle}
                    </div>

                    {formStepError && (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: 'var(--accent-danger)',
                          fontSize: '11.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <AlertCircle size={14} />
                        <span>{formStepError}</span>
                      </div>
                    )}

                    {/* Render fields for active step */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentChildren.length > 0
                        ? currentChildren.map(renderUIElement)
                        : (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No fields assigned to this step. Assign fields in Inspector.
                          </div>
                        )}
                    </div>

                    {/* If on final review step, render review summary breakdown */}
                    {isReviewStep && (
                      <div
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          fontSize: '11.5px',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          Review Registration Summary:
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Email Address:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {formData['node-form-email'] || 'user@company.com'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Username:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {formData['node-form-username'] || 'johndoe'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Full Name:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {formData['node-form-fullname'] || 'John Doe'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Account Plan:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {formData['node-form-plan'] || 'Developer Plan (Free)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Step Navigation Controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <button
                        type="button"
                        disabled={formStep === 1}
                        onClick={handlePrevStep}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'transparent',
                          color: formStep === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: formStep === 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: formStep === 1 ? 0.5 : 1,
                        }}
                      >
                        <ArrowLeft size={13} />
                        <span>Back</span>
                      </button>

                      {isReviewStep ? (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleCompleteWizard}
                        >
                          Complete Registration
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleNextStep}
                        >
                          <span>Next Step</span>
                          <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }

        return (
          <form
            key={node.id}
            onSubmit={(e) => {
              e.preventDefault();
              triggerEvent(node.id, 'onSubmit');
            }}
            style={{
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
            }}
          >
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              {content || 'Form Container'}
            </div>
            {children.length > 0 ? children.map(renderUIElement) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Inputs placed inside will be grouped here.
              </div>
            )}
            <Button type="submit" variant="primary" size="sm">
              Submit Form
            </Button>
          </form>
        );
      }

      case 'Badge': {
        if (node.id === 'node-badge-sync') {
          const isSaved = saveStatus === 'saved';
          const isSaving = saveStatus === 'saving';
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSaving
                  ? 'rgba(37, 99, 235, 0.12)'
                  : isSaved
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
                color: isSaving ? '#2563eb' : isSaved ? '#10b981' : '#f59e0b',
                border: `1px solid ${
                  isSaving
                    ? 'rgba(37, 99, 235, 0.3)'
                    : isSaved
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(245, 158, 11, 0.3)'
                }`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 200ms ease',
              }}
            >
              {isSaving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : isSaved ? (
                <CheckCircle size={13} />
              ) : (
                <RotateCcw size={13} />
              )}
              <span>
                {isSaving
                  ? 'Auto-saving draft to cloud...'
                  : isSaved
                  ? `Saved to Cloud • ${lastSavedTime}`
                  : 'Unsaved edits (Auto-saving in 2s...)'}
              </span>
            </div>
          );
        }

        if (node.id === 'node-badge-theme' || (nodes.some((n) => n.subtype === 'useContext') && node.id === 'node-badge-theme')) {
          const isDark = activeTheme === 'dark';
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(37, 99, 235, 0.12)',
                color: isDark ? '#c084fc' : '#2563eb',
                border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(37, 99, 235, 0.3)'}`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {isDark ? <Moon size={13} style={{ color: '#c084fc' }} /> : <Sun size={13} style={{ color: '#2563eb' }} />}
              <span>Context: Theme = {activeTheme.toUpperCase()} (0 Prop Drilling)</span>
            </div>
          );
        }

        const transNode = nodes.find((n) => n.subtype === 'useTransition');
        if (node.id === 'node-badge-cat' || (transNode && node.subtype === 'Badge')) {
          const isPending = isCatalogPending || Boolean(hookStates[transNode?.id || '']);
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isPending ? '#f59e0b' : '#10b981',
                border: `1px solid ${isPending ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                fontSize: '11px',
                fontWeight: 700,
                transition: 'all 150ms ease',
                alignSelf: 'flex-start',
              }}
            >
              {isPending ? (
                <>
                  <Loader2 size={12} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>isPending: true — Filtering 10,000 items in background...</span>
                </>
              ) : (
                <>
                  <Check size={12} strokeWidth={3} />
                  <span>isPending: false — 10,000 catalog items synchronized</span>
                </>
              )}
            </div>
          );
        }
        if (node.id === 'node-badge-speed') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Zap size={13} />
              <span>
                Speed: {playbackSpeed.toFixed(2)}x {playbackSpeed === 1.0 ? '(Normal Rate)' : playbackSpeed > 1 ? '(Accelerated)' : '(Slowed Down)'}
              </span>
            </div>
          );
        }
        if (node.id === 'node-badge-history') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#6366f1',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <RotateCcw size={13} />
              <span>
                {historyStack.present} (Past: {historyStack.past.length} | Future: {historyStack.future.length})
              </span>
            </div>
          );
        }

        if (node.id === 'node-badge-ticker') {
          const isPos = btcDelta >= 0;
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isPos ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isPos ? '#10b981' : '#ef4444',
                border: `1px solid ${isPos ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                transition: 'all 200ms ease',
              }}
            >
              <TrendingUp size={13} style={{ transform: isPos ? 'none' : 'rotate(180deg)' }} />
              <span>
                {isPos ? `+${btcDelta}% 24h High` : `${btcDelta}% 24h Low`} • Live Stream
              </span>
            </div>
          );
        }

        if (node.id === 'node-badge-a11y') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: a11ySaved ? 'rgba(16, 185, 129, 0.18)' : a11yActiveId ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                color: a11ySaved ? '#10b981' : a11yActiveId ? '#3b82f6' : '#10b981',
                border: `1px solid ${a11ySaved ? 'rgba(16, 185, 129, 0.4)' : a11yActiveId ? 'rgba(59, 130, 246, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                transition: 'all 200ms ease',
              }}
            >
              <CheckCircle size={13} />
              <span>
                {a11ySaved
                  ? `✓ Profile Saved (@${a11yUsername || 'anonymous'}) • useId Verified`
                  : a11yActiveId
                  ? `Focus Linked: input#${a11yActiveId} ↔ label[htmlFor="${a11yActiveId}"]`
                  : 'WCAG 2.1 AAA Compliant useId Handles (:r1:, :r2:)'}
              </span>
            </div>
          );
        }

        if (node.id === 'node-badge-modal') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isModalOpen ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                color: isModalOpen ? '#f59e0b' : 'var(--text-muted)',
                border: `1px solid ${isModalOpen ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)'}`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Shield size={13} />
              <span>{isModalOpen ? 'Focus Trap: Active (Esc to exit)' : 'Modal: Closed'}</span>
            </div>
          );
        }

        if (node.id === 'node-badge-kanban') {
          const todoCount = kanbanTasks.filter((t) => t.col === 'Todo').length;
          const inProgCount = kanbanTasks.filter((t) => t.col === 'In Progress').length;
          const doneCount = kanbanTasks.filter((t) => t.col === 'Done').length;
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Layers size={13} />
              <span>
                Sprint: {kanbanTasks.length} Tasks ({todoCount} Todo, {inProgCount} Progress, {doneCount} Done)
              </span>
            </div>
          );
        }

        if (node.id === 'node-badge-calc') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Sparkles size={13} />
              <span>
                useMemo: Base $50 + Freight ${calcWeight * 5} + Tax ${Math.round((50 + calcWeight * 5) * 0.1)}
              </span>
            </div>
          );
        }

        if (node.id === 'node-badge-strength') {
          let score = 0;
          if (pwdValue.length >= 8) score++;
          if (pwdValue.length >= 12) score++;
          if (/[A-Z]/.test(pwdValue)) score++;
          if (/[0-9]/.test(pwdValue)) score++;
          if (/[^A-Za-z0-9]/.test(pwdValue)) score++;

          const label = score >= 5 ? 'Bulletproof' : score >= 4 ? 'Strong' : score >= 3 ? 'Medium' : 'Weak';
          const color = score >= 4 ? '#10b981' : score >= 3 ? '#f59e0b' : '#ef4444';
          const bg = score >= 4 ? 'rgba(16, 185, 129, 0.15)' : score >= 3 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';

          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: bg,
                color: color,
                border: `1px solid ${color}55`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Shield size={13} />
              <span>Entropy Score: {label} ({score}/5 complexity checks)</span>
            </div>
          );
        }

        if (node.id === 'node-badge-scroll') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Activity size={13} />
              <span>IntersectionObserver: Sentinel Active (Page {pageItems})</span>
            </div>
          );
        }

        if (node.id === 'node-badge-sale') {
          const active = flashSeconds > 0;
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                color: active ? '#ef4444' : 'var(--text-muted)',
                border: `1px solid ${active ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-subtle)'}`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Timer size={13} />
              <span>{active ? 'Flash Promo Active: 50% Off' : 'Promo Expired: Sale Ended'}</span>
            </div>
          );
        }

        if (node.id === 'node-badge-toast') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Bell size={13} />
              <span>Queue Count: {toastQueue.length} Active Notifications</span>
            </div>
          );
        }

        if (node.id === 'node-badge-vp') {
          const bp = getBreakpointInfo(simWindowWidth);
          const BpIcon = bp.icon;
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: `${bp.color}1f`,
                color: bp.color,
                border: `1px solid ${bp.color}59`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                transition: 'all 200ms ease',
              }}
            >
              <BpIcon size={13} />
              <span>Screen: {bp.label} ({simWindowWidth}px) • useLayoutEffect Synced</span>
            </div>
          );
        }

        if (node.id === 'node-badge-ls') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Database size={13} />
              <span>LocalStorage Synced ({lsSyncedText.length} bytes cached)</span>
            </div>
          );
        }

        if (node.id === 'node-badge-tab') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Sparkles size={13} />
              <span>Tab: "{activeTab}" • Cache Hit (0ms Render)</span>
            </div>
          );
        }

        if (node.id === 'node-badge-anim') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isAnimating ? 'rgba(99, 102, 241, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                color: isAnimating ? '#6366f1' : '#10b981',
                border: `1px solid ${isAnimating ? 'rgba(99, 102, 241, 0.4)' : 'rgba(16, 185, 129, 0.35)'}`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                transition: 'all 200ms ease',
              }}
            >
              <Zap size={13} style={{ animation: isAnimating ? 'spin 1.5s linear infinite' : 'none' }} />
              <span>
                {isAnimating
                  ? `⚡ rAF Interpolating: ${animCount.toLocaleString()} / ${animTarget.toLocaleString()} (${(animDurationMs / 1000).toFixed(1)}s @ 60 FPS)`
                  : `✓ Milestone Reached: ${animCount.toLocaleString()} Active Builders (60 FPS)`}
              </span>
            </div>
          );
        }

        if (node.id === 'node-badge-review') {
          return (
            <div
              key={node.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: reviewSubmitted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: reviewSubmitted ? '#10b981' : '#f59e0b',
                border: `1px solid ${reviewSubmitted ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <CheckCircle size={13} />
              <span>
                {reviewSubmitted
                  ? `Review Submitted: ${reviewStars}/5 Stars (useReducer Workflow Complete)`
                  : `Satisfaction: ${reviewStars}/5 Stars (Ready to Submit)`}
              </span>
            </div>
          );
        }

        return (
          <Badge key={node.id} variant="primary">
            {content || 'Badge'}
          </Badge>
        );
      }

      case 'DummyData': {
        // Robust query resolution across connections, debouncedQuery state, and raw input state
        let rawQuery = '';
        let debouncedQuery = '';

        // Check if there are states named query / debouncedQuery
        nodes.forEach((n) => {
          if (n.type === 'logic' && n.subtype === 'useState') {
            if (n.props.stateName === 'query' || n.props.stateName === 'search') {
              rawQuery = String(hookStates[n.id] || '');
            } else if (n.props.stateName === 'debouncedQuery') {
              debouncedQuery = String(hookStates[n.id] || '');
            }
          }
        });

        // Check direct connections to DummyData
        const incomingConns = connections.filter((c) => c.targetNodeId === node.id || c.sourceNodeId === node.id);
        for (const conn of incomingConns) {
          const otherId = conn.targetNodeId === node.id ? conn.sourceNodeId : conn.targetNodeId;
          const otherNode = nodes.find((n) => n.id === otherId);
          if (otherNode) {
            if (otherNode.type === 'logic' && otherNode.subtype === 'useState') {
              const val = String(hookStates[otherNode.id] || '');
              if (otherNode.props.stateName === 'debouncedQuery') {
                debouncedQuery = val;
              } else {
                rawQuery = val;
              }
            } else if (otherNode.type === 'ui' && otherNode.subtype === 'Input') {
              const boundState = getBoundHook(otherNode.id);
              if (boundState && hookStates[boundState.id] !== undefined) {
                rawQuery = String(hookStates[boundState.id] || '');
              }
            }
          }
        }

        // Active filter term: prioritize debouncedQuery or catalogDeferred if present, fallback to rawQuery
        const hasTransition = nodes.some((n) => n.subtype === 'useTransition') || node.id === 'node-dummy-cat';
        const activeFilter = (hasTransition ? catalogDeferred : (debouncedQuery || rawQuery || '')).trim();
        const isDebouncing = Boolean(rawQuery && rawQuery !== debouncedQuery && !hasTransition);
        const isTransitionPending = Boolean(hasTransition && isCatalogPending);

        // Resolve Preset and Display Style (with live interactive override support)
        const activePresetKey = dummyDataPresetOverrides[node.id] || node.props.datasetPreset || 'products';
        const preset = getDummyDataPreset(activePresetKey);
        const activeStyle: 'cards' | 'pills' | 'grid' | 'table' =
          dummyDataStyleOverrides[node.id] || node.props.displayStyle || preset.defaultStyle || 'cards';
        const title = node.props.title || preset.defaultTitle;

        // Determine whether to use rich items or plain items
        const isCustomPlain = node.props.datasetPreset === 'custom';
        const rawPlainList: string[] = node.props.items || preset.items;
        const richItemsList: DummyDataItem[] = preset.richItems || [];

        const qLower = activeFilter.toLowerCase();
        const filteredRich = richItemsList.filter((item) => {
          if (!qLower) return true;
          return (
            item.title.toLowerCase().includes(qLower) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(qLower)) ||
            (item.badge && item.badge.toLowerCase().includes(qLower)) ||
            (item.value && item.value.toLowerCase().includes(qLower))
          );
        });

        const filteredPlain = rawPlainList.filter((item) =>
          !qLower ? true : item.toLowerCase().includes(qLower)
        );

        const totalCount = node.props.totalCount || (isCustomPlain ? rawPlainList.length : richItemsList.length);
        const currentCount = isCustomPlain ? filteredPlain.length : filteredRich.length;

        const clearSearch = () => {
          setCatalogInput('');
          setCatalogDeferred('');
          setIsCatalogPending(false);
          const updated: Record<string, any> = {};
          nodes.forEach((n) => {
            if (
              n.type === 'logic' &&
              n.subtype === 'useState' &&
              (n.props.stateName === 'query' ||
                n.props.stateName === 'debouncedQuery' ||
                n.props.stateName === 'search' ||
                n.props.stateName === 'inputQuery' ||
                n.props.stateName === 'deferredQuery')
            ) {
              updated[n.id] = '';
            }
          });
          setHookStates((prev) => ({ ...prev, ...updated }));
          setRenderCount((c) => c + 1);
        };

        const renderHighlightedText = (text: string, query: string) => {
          if (!query.trim()) return text;
          const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
          return (
            <span>
              {parts.map((part, idx) =>
                part.toLowerCase() === query.toLowerCase() ? (
                  <mark
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.25)',
                      color: 'var(--accent-primary)',
                      padding: '1px 3px',
                      borderRadius: '2px',
                      fontWeight: 700,
                    }}
                  >
                    {part}
                  </mark>
                ) : (
                  part
                )
              )}
            </span>
          );
        };

        const renderPresetIcon = (presetId: string, size = 12) => {
          switch (presetId) {
            case 'products': return <ShoppingBag size={size} style={{ color: 'var(--accent-primary)' }} />;
            case 'frameworks': return <Code size={size} style={{ color: '#06b6d4' }} />;
            case 'team': return <Users size={size} style={{ color: '#8b5cf6' }} />;
            case 'finance': return <TrendingUp size={size} style={{ color: '#10b981' }} />;
            case 'tasks': return <CheckSquare size={size} style={{ color: '#f59e0b' }} />;
            case 'countries': return <Globe size={size} style={{ color: '#3b82f6' }} />;
            case 'articles': return <BookOpen size={size} style={{ color: '#ec4899' }} />;
            case 'colors': return <Palette size={size} style={{ color: '#8b5cf6' }} />;
            default: return <Database size={size} style={{ color: 'var(--accent-primary)' }} />;
          }
        };

        return (
          <div
            key={node.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Header with Title, Live Preset Switcher, Style Controls and Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '10px',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {renderPresetIcon(activePresetKey, 14)}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--accent-primary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {title}
                  </span>
                </div>

                {/* Items Counter Badge */}
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {node.props.totalCount
                    ? `${currentCount} of ${node.props.totalCount.toLocaleString()} items`
                    : `${currentCount} / ${totalCount} items`}
                </span>

                {/* Live Preset Switcher Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <select
                    value={activePresetKey}
                    onChange={(e) =>
                      setDummyDataPresetOverrides((prev) => ({
                        ...prev,
                        [node.id]: e.target.value,
                      }))
                    }
                    style={{
                      padding: '2px 6px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    title="Switch Mock Dataset Preset"
                  >
                    {Object.values(DUMMY_DATA_PRESETS).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Side: Style Selector, Debounce / Transition Indicator, Clear Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {/* Style Switcher Pills */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    padding: '2px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {(['cards', 'pills', 'grid', 'table'] as const).map((styleOpt) => {
                    const isCurrent = activeStyle === styleOpt;
                    return (
                      <button
                        key={styleOpt}
                        type="button"
                        onClick={() =>
                          setDummyDataStyleOverrides((prev) => ({
                            ...prev,
                            [node.id]: styleOpt,
                          }))
                        }
                        style={{
                          padding: '2px 6px',
                          fontSize: '9.5px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          borderRadius: 'var(--radius-xs)',
                          border: 'none',
                          backgroundColor: isCurrent ? 'var(--accent-primary)' : 'transparent',
                          color: isCurrent ? '#ffffff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                        title={`Display as ${styleOpt}`}
                      >
                        {styleOpt}
                      </button>
                    );
                  })}
                </div>

                {isDebouncing && (
                  <span
                    style={{
                      fontSize: '9.5px',
                      color: 'var(--accent-warning)',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 600,
                    }}
                  >
                    Debouncing 300ms...
                  </span>
                )}
                {isTransitionPending && (
                  <span
                    style={{
                      fontSize: '9.5px',
                      color: 'var(--accent-warning)',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Loader2 size={10} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Filtering 10,000 items...</span>
                  </span>
                )}
                {activeFilter && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: '2px 4px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                    title="Clear filter"
                  >
                    <X size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content: Rich Multi-Style Dataset OR Polished Empty State */}
            {currentCount === 0 ? (
              <div
                style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-default)',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-danger)',
                  }}
                >
                  <SearchX size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    No Matching Results Found
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.4 }}>
                    No records matched &ldquo;<strong style={{ color: 'var(--text-primary)' }}>{activeFilter}</strong>&rdquo;. Try searching for different keywords or clear the filter.
                  </span>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  icon={<RotateCcw size={11} />}
                  onClick={clearSearch}
                  style={{ marginTop: '4px' }}
                >
                  Reset Search Filter
                </Button>
              </div>
            ) : (
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  opacity: isTransitionPending ? 0.6 : 1,
                  transition: 'opacity 150ms ease',
                  paddingRight: '2px',
                }}
              >
                {/* 1. CARDS STYLE */}
                {activeStyle === 'cards' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {!isCustomPlain &&
                      filteredRich.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            gap: '10px',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {renderHighlightedText(item.title, activeFilter)}
                            </span>
                            {item.subtitle && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {renderHighlightedText(item.subtitle, activeFilter)}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 7px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'var(--accent-primary-subtle)',
                                  color: item.badgeColor || 'var(--accent-primary)',
                                  fontWeight: 600,
                                  border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : 'var(--border-subtle)'}`,
                                }}
                              >
                                {renderHighlightedText(item.badge, activeFilter)}
                              </span>
                            )}
                            {item.value && (
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: item.valueColor || 'var(--accent-success)',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                {renderHighlightedText(item.value, activeFilter)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                    {isCustomPlain &&
                      filteredPlain.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <span>{renderHighlightedText(item, activeFilter)}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            MATCH
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* 2. PILLS STYLE */}
                {activeStyle === 'pills' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {!isCustomPlain &&
                      filteredRich.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-default)',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--shadow-xs)',
                          }}
                        >
                          <span>{renderHighlightedText(item.title, activeFilter)}</span>
                          {item.value && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'rgba(99, 102, 241, 0.12)',
                                color: item.badgeColor || 'var(--accent-primary)',
                                fontWeight: 700,
                              }}
                            >
                              {renderHighlightedText(item.value, activeFilter)}
                            </span>
                          )}
                        </div>
                      ))}

                    {isCustomPlain &&
                      filteredPlain.map((item, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-default)',
                            fontSize: '11.5px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {renderHighlightedText(item, activeFilter)}
                        </span>
                      ))}
                  </div>
                )}

                {/* 3. GRID STYLE */}
                {activeStyle === 'grid' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                    {!isCustomPlain &&
                      filteredRich.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {renderHighlightedText(item.title, activeFilter)}
                            </span>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: '9.5px',
                                  padding: '1px 5px',
                                  borderRadius: 'var(--radius-xs)',
                                  backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'var(--accent-primary-subtle)',
                                  color: item.badgeColor || 'var(--accent-primary)',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {renderHighlightedText(item.badge, activeFilter)}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                              {renderHighlightedText(item.subtitle, activeFilter)}
                            </span>
                          )}
                          {item.value && (
                            <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: item.valueColor || 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                                {renderHighlightedText(item.value, activeFilter)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}

                    {isCustomPlain &&
                      filteredPlain.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {renderHighlightedText(item, activeFilter)}
                        </div>
                      ))}
                  </div>
                )}

                {/* 4. TABLE STYLE */}
                {activeStyle === 'table' && (
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '6px 8px', fontWeight: 600 }}>Item Name</th>
                          <th style={{ padding: '6px 8px', fontWeight: 600 }}>Category / Role</th>
                          <th style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'right' }}>Metric / Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!isCustomPlain &&
                          filteredRich.map((item) => (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: '1px solid var(--border-subtle)',
                                transition: 'background-color var(--transition-fast)',
                              }}
                            >
                              <td style={{ padding: '7px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span>{renderHighlightedText(item.title, activeFilter)}</span>
                                  {item.subtitle && (
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                      {renderHighlightedText(item.subtitle, activeFilter)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '7px 8px' }}>
                                {item.badge && (
                                  <span
                                    style={{
                                      fontSize: '9.5px',
                                      padding: '1px 6px',
                                      borderRadius: 'var(--radius-xs)',
                                      backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'var(--accent-primary-subtle)',
                                      color: item.badgeColor || 'var(--accent-primary)',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {renderHighlightedText(item.badge, activeFilter)}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: item.valueColor || 'var(--accent-primary)' }}>
                                {item.value ? renderHighlightedText(item.value, activeFilter) : '—'}
                              </td>
                            </tr>
                          ))}

                        {isCustomPlain &&
                          filteredPlain.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td colSpan={2} style={{ padding: '7px 8px', color: 'var(--text-primary)' }}>
                                {renderHighlightedText(item, activeFilter)}
                              </td>
                              <td style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                                MATCH
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'Card':
      case 'Container': {
        const expandedVariants = new Set([
          'optimisticProduct',
          'formActionPipeline',
          'deferredSearch',
          'externalStore',
          'websocketDashboard',
          'collabPresence',
          'raceController',
          'paginatedGrid',
          'virtualizedFeed',
          'dndKanban',
          'commandPalette',
          'undoableForm',
          'multiSourceDashboard',
          'requestDedup',
          'resourceCacheTtl',
          'errorBoundaryRecovery',
          'suspenseStreaming',
          'serverClientBoundary',
          'optimisticCheckout',
          'offlineNotes',
          'notificationSync',
          'collabCursorTracker',
          'fileUploadManager',
          'featureFlagRuntime',
          'performanceObservatory',
        ]);

        if (expandedVariants.has(node.props.variant as string)) {
          return (
            <ErrorBoundary key={node.id} fallbackTitle={`Preview Error (${node.props.title || node.props.variant})`}>
              <ExpandedArchitecturesCard
                node={node}
                onTraceAction={(step) => {
                  setTraceLogs((prev) => [step, ...prev.slice(0, 5)]);
                  onTraceActionRef.current?.(step);
                }}
              />
            </ErrorBoundary>
          );
        }

        if (node.props.variant === 'cart' || node.id === 'node-card-cart') {
          const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const discount = Math.round(subtotal * 0.1 * 100) / 100;
          const total = Math.round((subtotal - discount) * 100) / 100;

          return (
            <div
              key={node.id}
              style={{
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {node.props.title || 'Your Shopping Cart'}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Managed via <code>useReducer</code> + <code>useMemo</code>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: totalItems > 0 ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                      color: totalItems > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                  {totalItems > 0 && (
                    <button
                      onClick={handleClearCart}
                      title="Clear Cart (dispatch CLEAR_CART)"
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent-danger)';
                        e.currentTarget.style.borderColor = 'var(--accent-danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cartItems.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <ShoppingBag size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Your cart is empty
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '240px' }}>
                      Select a product in the dropdown above and click <strong>Add to Cart</strong> to dispatch an item.
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        gap: '12px',
                      }}
                    >
                      {/* Product Name & Unit Price */}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-surface)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        <button
                          onClick={() => handleUpdateCartItemQty(item.id, -1)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                          }}
                          title="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, minWidth: '16px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCartItemQty(item.id, 1)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                          }}
                          title="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Line Item Total & Remove */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', minWidth: '55px', textAlign: 'right' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveCartItem(item.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Summary & useMemo Discount */}
              {cartItems.length > 0 && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span>Subtotal ({totalItems} items):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                      <Tag size={12} />
                      <span style={{ fontWeight: 600 }}>VIP Discount (useMemo 10%):</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: '4px',
                      paddingTop: '8px',
                      borderTop: '1px dashed var(--border-default)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Estimated Total:</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Floating Tooltip Card (Synchronously positioned above anchor)
        if (node.props.variant === 'tooltip' || node.id === 'node-card-tooltip') {
          const isLagging = useLayoutTimingMode === 'passive' && isFlickering;
          return (
            <div
              key={node.id}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: isLagging ? '1px dashed var(--accent-danger)' : '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                  transform: isLagging ? 'translate(-20px, 6px)' : 'none',
                  transition: isLagging ? 'none' : 'transform 180ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} style={{ color: '#ec4899' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Floating Tooltip
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isLagging ? 'rgba(239, 68, 68, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                      color: isLagging ? 'var(--accent-danger)' : '#ec4899',
                      fontWeight: 700,
                    }}
                  >
                    {isLagging ? '⚠ Paint Flicker Detected!' : '✓ Zero Flicker (Sync Pre-Paint)'}
                  </span>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Synchronously measured anchor width: <strong style={{ color: 'var(--text-primary)' }}>{measuredRect.width}px</strong>.
                  Tooltip is dynamically centered at <code>{Math.round(measuredRect.left + measuredRect.width / 2)}px</code> before screen repaint.
                </div>

                {/* Downward triangle caret pointing to anchor */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid var(--border-default)',
                  }}
                />
              </div>
            </div>
          );
        }

        // Live DOM Bounding Box Metrics Card
        if (node.props.variant === 'metrics' || node.id === 'node-card-metrics') {
          return (
            <div
              key={node.id}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ruler size={14} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Live DOM Bounding Box Metrics
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  getBoundingClientRect()
                </span>
              </div>

              {/* 4-Stat Metric Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Width', val: `${measuredRect.width}px` },
                  { label: 'Height', val: `${measuredRect.height}px` },
                  { label: 'Left (X)', val: `${measuredRect.left}px` },
                  { label: 'Top (Y)', val: `${measuredRect.top}px` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {stat.label}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: useLayoutTimingMode === 'layout' ? '#ec4899' : '#f59e0b' }} />
                <span>
                  Execution Timing: <strong>{useLayoutTimingMode === 'layout' ? 'useLayoutEffect (blocks browser paint until aligned)' : 'useEffect (runs after browser paint, producing flicker)'}</strong>
                </span>
              </div>
            </div>
          );
        }

        // Theme Context Consumer Card (Directly consumes ThemeContext with 0 prop drilling)
        if (node.props.variant === 'themeConsumer' || node.id === 'node-card-theme') {
          const isDark = activeTheme === 'dark';
          return (
            <div
              key={node.id}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
                transition: 'all 220ms ease',
                boxSizing: 'border-box',
              }}
            >
              {/* Header with Avatar and Consumer Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? '#6366f1' : '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '14px',
                    }}
                  >
                    AR
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                      Alex Rivera
                    </h4>
                    <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      Staff Frontend Architect
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(37, 99, 235, 0.12)',
                    color: isDark ? '#c084fc' : '#2563eb',
                    fontWeight: 700,
                  }}
                >
                  useContext(ThemeContext)
                </span>
              </div>

              {/* Token Palette Preview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { name: 'Surface', hex: isDark ? '#0f172a' : '#ffffff' },
                  { name: 'Accent', hex: isDark ? '#a855f7' : '#2563eb' },
                  { name: 'Text', hex: isDark ? '#f8fafc' : '#0f172a' },
                  { name: 'Border', hex: isDark ? '#334155' : '#e2e8f0' },
                ].map((token) => (
                  <div
                    key={token.name}
                    style={{
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: token.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                    <span style={{ fontSize: '9px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>{token.name}</span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: isDark ? '#cbd5e1' : '#334155' }}>{token.hex}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  fontSize: '11px',
                  color: isDark ? '#94a3b8' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Active Context Value:</span>
                <strong style={{ color: isDark ? '#c084fc' : '#2563eb', textTransform: 'uppercase' }}>
                  {activeTheme} Mode
                </strong>
              </div>
            </div>
          );
        }

        // Responsive Layout Frame Card (Template 21: Responsive Breakpoint Engine)
        if ((node.props.variant as string) === 'responsiveLayout' || node.id === 'node-card-vp') {
          const bp = getBreakpointInfo(simWindowWidth);
          const BpIcon = bp.icon;
          return (
            <div
              key={node.id}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: `1px solid ${bp.color}45`,
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'border-color 200ms ease',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BpIcon size={15} style={{ color: bp.color }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {node.props.content || 'Adaptive Dashboard Grid'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: `${bp.color}1f`,
                    color: bp.color,
                    fontWeight: 700,
                  }}
                >
                  {bp.cols} {bp.cols === 1 ? 'Column' : 'Columns'} Active ({bp.name})
                </span>
              </div>

              {/* Dynamic Responsive Columns Grid based on simulated viewport width */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${bp.cols}, 1fr)`,
                  gap: '8px',
                  width: '100%',
                  transition: 'all 200ms ease',
                }}
              >
                {[
                  { title: 'Network Traffic', val: '4.8 MB/s', desc: 'Sync before paint' },
                  { title: 'Heap Memory', val: '42.6 MB', desc: '0ms layout flicker' },
                  { title: 'Worker Threads', val: '8 Active', desc: 'Pre-paint verified' },
                  { title: 'Render Frame', val: '60 FPS', desc: 'Synchronous read' },
                ]
                  .slice(0, bp.cols === 1 ? 2 : bp.cols === 2 ? 2 : 4)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.title}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.val}</span>
                      <span style={{ fontSize: '9.5px', color: bp.color, fontWeight: 600 }}>{item.desc}</span>
                    </div>
                  ))}
              </div>
            </div>
          );
        }

        const children = uiNodes.filter((c) => c.parentId === node.id);
        return (
          <div
            key={node.id}
            style={{
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {children.length > 0
              ? children.map(renderUIElement)
              : content || 'Card Container'}
          </div>
        );
      }

      case 'Kanban':
        return renderKanbanBoard(node.id, node.props.title || 'Sprint Task Kanban Board');

      default:
        return <div key={node.id}>{content}</div>;
    }
  };

  const rootNodes = uiNodes.filter((n) => !n.parentId || !uiNodes.some((p) => p.id === n.parentId));

  // Render root nodes respecting flexbox layoutGroup rows/containers (with recursive nested containers)
  const renderLayoutNodes = () => {
    const renderedGroups = new Set<string>();
    const elements: React.ReactNode[] = [];

    const renderContainerGroup = (groupId: string): React.ReactNode => {
      const groupNodes = uiNodes.filter((n) => n.props?.layoutGroup === groupId);
      if (groupNodes.length === 0) return null;
      const realGroupNodes = groupNodes.filter((n) => !n.props?.isContainerHolder);
      const firstNode = groupNodes[0];
      const isRow = (firstNode?.props?.containerDirection || 'row') === 'row';
      const isGrid = firstNode?.props?.containerDisplay === 'grid';
      const isCard =
        firstNode?.props?.containerType === 'card' ||
        (firstNode?.props?.containerBorder === true && firstNode?.props?.containerType !== 'div');

      // Find any nested container groups inside this container
      const nestedGroupIds: string[] = [];
      uiNodes.forEach((n) => {
        const lg = n.props?.layoutGroup;
        if (lg && lg !== groupId && n.props?.parentGroup === groupId && !nestedGroupIds.includes(lg)) {
          nestedGroupIds.push(lg);
        }
      });

      const hasChildren = realGroupNodes.length > 0 || nestedGroupIds.length > 0;

      if (!hasChildren) {
        return (
          <div
            key={`layout-group-${groupId}`}
            style={{
              width: '100%',
              padding: '24px 16px',
              borderRadius: isCard ? (firstNode?.props?.containerRadius || 'var(--radius-xl)') : 'var(--radius-md)',
              border: isCard ? '1px solid var(--border-default)' : '1.5px dashed var(--border-default)',
              backgroundColor: isCard
                ? activeTheme === 'dark'
                  ? 'var(--bg-surface-elevated)'
                  : '#ffffff'
                : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontWeight: 600 }}>Empty {isCard ? 'Card' : 'Div'} Container</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Drag elements into this container in Layout Studio
            </span>
          </div>
        );
      }

      return (
        <div
          key={`layout-group-${groupId}`}
          style={{
            display: isGrid ? 'grid' : 'flex',
            gridTemplateColumns: isGrid ? 'repeat(auto-fit, minmax(180px, 1fr))' : undefined,
            flexDirection: isRow ? 'row' : 'column',
            justifyContent: firstNode?.props?.containerJustify || 'flex-start',
            alignItems: firstNode?.props?.containerAlign || 'center',
            flexWrap: 'wrap', // In case of overlap, move to next line!
            gap: firstNode?.props?.containerGap || '12px',
            width: '100%',
            padding: isCard ? (firstNode?.props?.containerPadding || '16px') : '0px',
            borderRadius: isCard ? (firstNode?.props?.containerRadius || 'var(--radius-xl)') : '0px',
            backgroundColor: isCard
              ? activeTheme === 'dark'
                ? 'var(--bg-surface-elevated)'
                : '#ffffff'
              : 'transparent',
            border: isCard ? '1px solid var(--border-default)' : 'none',
            boxShadow: isCard ? 'var(--shadow-sm)' : 'none',
            boxSizing: 'border-box',
          }}
        >
          {/* Render nested containers recursively */}
          {nestedGroupIds.map((nestedGroupId) => (
            <div
              key={`nested-wrap-${nestedGroupId}`}
              style={{
                flex: '1 1 0%',
                width: '100%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              {renderContainerGroup(nestedGroupId)}
            </div>
          ))}

          {/* Render direct leaf nodes */}
          {realGroupNodes.map((child) => {
            const childWidth = child.props?.flexWidth;
            const isFlex1 = childWidth === 'flex-1' || !childWidth;
            return (
              <div
                key={child.id}
                style={{
                  flex: isFlex1 ? '1 1 0%' : 'none',
                  width:
                    childWidth === 'full' || childWidth === '100%'
                      ? '100%'
                      : childWidth === '1/2' || childWidth === '50%'
                      ? 'calc(50% - 6px)'
                      : childWidth === '1/3' || childWidth === '33.3%'
                      ? 'calc(33.333% - 8px)'
                      : childWidth === '1/4' || childWidth === '25%'
                      ? 'calc(25% - 8px)'
                      : childWidth === 'auto'
                      ? 'auto'
                      : childWidth && !isFlex1
                      ? childWidth
                      : isRow && !isFlex1
                      ? undefined
                      : '100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                }}
              >
                {renderUIElement(child)}
              </div>
            );
          })}
        </div>
      );
    };

    rootNodes.forEach((node) => {
      // Nested containers are rendered recursively by their parent container
      if (node.props?.parentGroup) return;
      if (node.props?.isContainerHolder && !node.props?.layoutGroup) return;
      const group = node.props?.layoutGroup;
      if (group) {
        if (!renderedGroups.has(group)) {
          renderedGroups.add(group);
          elements.push(renderContainerGroup(group));
        }
      } else {
        if (!node.props?.isContainerHolder) {
          elements.push(renderUIElement(node));
        }
      }
    });

    return elements;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        padding: 'var(--space-4)',
        gap: 'var(--space-3)',
        overflow: 'hidden',
      }}
      className="live-preview-panel"
    >
      {/* Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-success)',
              boxShadow: '0 0 8px var(--accent-success)',
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
            Live React Application Preview
          </span>
          <Badge variant="primary" size="sm">
            Render #{renderCount}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Position Selector (Bottom or Right) */}
          {isTracing && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setTracePosition('bottom')}
                title="Dock Trace at Bottom"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: tracePosition === 'bottom' ? 'var(--accent-primary)' : 'transparent',
                  color: tracePosition === 'bottom' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 120ms ease',
                }}
              >
                <PanelBottom size={12} />
                <span>Bottom</span>
              </button>
              <button
                type="button"
                onClick={() => setTracePosition('right')}
                title="Dock Trace on Right"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: tracePosition === 'right' ? 'var(--accent-primary)' : 'transparent',
                  color: tracePosition === 'right' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 120ms ease',
                }}
              >
                <PanelRight size={12} />
                <span>Right</span>
              </button>
            </div>
          )}

          <Button
            size="xs"
            variant={isTracing ? 'primary' : 'outline'}
            icon={<Zap size={12} />}
            onClick={() => setIsTracing(!isTracing)}
          >
            {isTracing ? 'Trace: ON' : 'Trace: OFF'}
          </Button>
          <Button size="xs" variant="ghost" icon={<RotateCcw size={12} />} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Outer Split Container (Responsive: Column when bottom, Row when right) */}
      <div
        ref={splitContainerRef}
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: tracePosition === 'right' ? 'row' : 'column',
          gap: 0,
          position: 'relative',
          userSelect: isDraggingTrace ? 'none' : 'auto',
          cursor: isDraggingTrace ? (tracePosition === 'right' ? 'col-resize' : 'row-resize') : 'default',
        }}
      >
        {/* Rendered Application Sandbox */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            padding: 'var(--space-6)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          {rootNodes.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
              Workspace is empty. Add UI components and hooks to render your live application!
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                maxWidth:
                  activeDevice === 'mobile'
                    ? '375px'
                    : activeDevice === 'tablet'
                    ? '768px'
                    : activeDevice === 'laptop'
                    ? '1024px'
                    : '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                border: activeDevice === 'mobile' ? '8px solid var(--border-default)' : 'none',
                borderRadius: activeDevice === 'mobile' ? '36px' : 'none',
                padding: activeDevice === 'mobile' ? '28px 14px' : '0px',
                backgroundColor: activeDevice === 'mobile' ? 'var(--bg-surface)' : 'transparent',
                boxShadow: activeDevice === 'mobile' ? 'var(--shadow-xl)' : 'none',
                transition: 'all 200ms ease-out',
              }}
            >
              {renderLayoutNodes()}

              {/* Kanban Board Columns View (rendered if not already provided by a Kanban UI node) */}
              {!nodes.some((n) => n.subtype === 'Kanban') && nodes.some((n) => n.id === 'node-head-kanban') && (
                renderKanbanBoard('node-kanban-fallback', 'Sprint Task Kanban Board')
              )}

              {/* Toast Queue Active Notifications View */}
              {toastQueue.length > 0 && nodes.some((n) => n.id === 'node-head-toast') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: '4px' }}>
                  {toastQueue.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={13} style={{ color: 'var(--accent-primary)' }} />
                        <span>{t.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setToastQueue((prev) => prev.filter((item) => item.id !== t.id))}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accessible Modal Overlay Dialog */}
          {isModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px',
              }}
              onClick={() => setIsModalOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  width: '100%',
                  maxWidth: '400px',
                  boxShadow: 'var(--shadow-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Confirm Action Modal
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '14px',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Focus is currently trapped within this dialog. Press <strong>Esc</strong> to close the modal and trigger effect cleanup.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                    Close (Esc)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resizable Divider & Execution Trace Stream */}
        {isTracing && (
          <>
            {/* Draggable Divider Handle */}
            <div
              onMouseDown={() => setIsDraggingTrace(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 10,
                flexShrink: 0,
                ...(tracePosition === 'bottom'
                  ? {
                      height: '14px',
                      width: '100%',
                      cursor: 'row-resize',
                      margin: '2px 0',
                    }
                  : {
                      width: '14px',
                      height: '100%',
                      cursor: 'col-resize',
                      margin: '0 2px',
                    }),
              }}
              title="Drag to resize Execution Trace"
            >
              {tracePosition === 'bottom' ? (
                <div
                  style={{
                    width: '48px',
                    height: '4px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isDraggingTrace ? 'var(--accent-primary)' : 'var(--border-default)',
                    transition: 'background-color 150ms ease',
                  }}
                />
              ) : (
                <div
                  style={{
                    height: '48px',
                    width: '4px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isDraggingTrace ? 'var(--accent-primary)' : 'var(--border-default)',
                    transition: 'background-color 150ms ease',
                  }}
                />
              )}
            </div>

            {/* Execution Trace Stream Container (Fixed dimensions, never grows out of bounds) */}
            <div
              style={{
                flexShrink: 0,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                ...(tracePosition === 'bottom'
                  ? {
                      height: `${traceHeight}px`,
                      width: '100%',
                    }
                  : {
                      width: `${traceWidth}px`,
                      height: '100%',
                    }),
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={13} style={{ color: 'var(--accent-warning)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                    EXECUTION TRACE
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--accent-warning-subtle)',
                      color: 'var(--accent-warning-text)',
                      fontWeight: 700,
                    }}
                  >
                    {traceLogs.length}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {traceLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTraceLogs([])}
                      title="Clear Trace Logs"
                      style={{
                        padding: '2px 6px',
                        fontSize: '10px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 120ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent-danger)';
                        e.currentTarget.style.borderColor = 'var(--accent-danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                      }}
                    >
                      <Trash2 size={11} />
                      <span>Clear</span>
                    </button>
                  )}
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {tracePosition === 'bottom' ? `${traceHeight}px` : `${traceWidth}px`}
                  </span>
                </div>
              </div>

              {/* Log Stream List (Scrollable internally without pushing parent or live preview) */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                {traceLogs.length === 0 ? (
                  <div
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    No execution events captured yet. Interact with components to trace hook dispatches & renders.
                  </div>
                ) : (
                  traceLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {log.description}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
