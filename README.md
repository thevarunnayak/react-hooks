# React Hooks Lab — Interactive Learning & Visual Canvas

> **Master React Hooks by actually using them.**  
> Learn the mental model. See what React is doing under the hood. Experiment with live visualizers. Break and fix real examples. Construct components on a visual canvas.

An interactive educational web application built with **React 19, TypeScript, and Vite**, designed as a hands-on learning environment without any backend or database requirements.

---

## Core Features

### 1. Visual Canvas & Component Builder (Figma-meets-ReactFlow)
- **UI Components that look like real UI**: Place Buttons, Inputs, Cards, Headings, and Badges directly onto an infinite dot-grid canvas.
- **Logic & Hook Nodes**: Add `useState`, `useEffect`, `useRef`, `useReducer`, and Timers with typed connection ports.
- **Semantic Connections**: Wire UI events (`Button.onClick` → `setCount`), state data (`count` → `Text {{count}}`), and effect triggers.
- **Live Preview with Execution Tracing**: Interact with the rendered application; button clicks pulse the path across the canvas (`User Click → Event → State Update → Render → UI Update`).
- **Real-Time Code Generator**: Generates clean, idiomatic React TypeScript code dynamically from your visual composition.
- **Pre-built Presets**: Instant loading of Counter, Stopwatch, Search, Todo, and Shopping Cart projects.
- **Undo / Redo**: Robust command history stack (`⌘Z` / `⌘ShiftZ`).

### 2. Deep Interactive Visualizers & Labs
- **Render Visualizer**: Live render counters and causality diffs ("Why did this render?").
- **Referential Equality Visualizer**: Live comparison of memory addresses (`0xCAFE` vs new allocations), explaining why unmemoized objects break `useEffect` and `React.memo`.
- **Closure Visualizer**: Interactive async timer demonstrating stale closures in callbacks and how `useRef` or functional updates solve them.
- **Effect Lifecycle Visualizer**: Visual progression from Render → Commit → Screen Paint → Cleanup → Effect execution.
- **State Update & Batching Lab**: Side-by-side comparison of direct updates `setCount(count + 1)` vs queued functional updates `setCount(c => c + 1)`.
- **Strict Mode Lab**: Visualizing development double-invocations (`Mount → Unmount → Mount`) and cleanup idempotency.
- **Concurrent React Lab**: `useTransition` and `useDeferredValue` with CPU lag testing to demonstrate non-blocking typing.

### 3. Comprehensive 20-Part Hook Curriculum (18+ Hooks)
Every hook follows the standardized 20-part educational specification:
- Core: `useState`, `useEffect`, `useContext`, `useRef`, `useReducer`, `useCallback`, `useMemo`
- Lifecycle & DOM: `useLayoutEffect`, `useImperativeHandle`
- Concurrent & Modern: `useTransition`, `useDeferredValue`, `useId`, `useSyncExternalStore`
- React 19: `useActionState`, `useOptimistic`

### 4. Curated Custom Hooks Catalog (40+ Hooks) & Builder
- Searchable catalog across State, Effects, Storage, DOM & Sensors, Performance, and Browser APIs.
- Includes `useLocalStorage`, `useDebounce`, `useInterval`, `useClickOutside`, `useMediaQuery`, `useClipboard`, `usePrevious`, etc.
- "Build Your Own Hook" wizard generating boilerplate, hints, and test structures.

### 5. Real-Time Architectures & Senior Interview Prep
- 25+ real-time interactive architecture patterns (Counter, Stopwatch, Debounced Search, Shopping Cart, Kanban, Form Validation, Window Resize, etc.).
- Interactive challenge quizzes: Predict Output, Find Bug, Fix Hook, Optimize.
- Senior React Engineer interview question bank with short answers, deep dives, and candidate pitfalls.

### 6. Local-First Storage & Apple-Inspired Design
- 100% client-side privacy: Notes, bookmarks, challenge progress, and canvas projects persist in `localStorage`.
- Settings drawer with **JSON Data Export & Import**.
- System, Light, and Dark mode support with CSS variables.
- Global `⌘K` Command Palette for instant keyboard navigation.

---

## Getting Started Locally

### Prerequisites
- Node.js `v18+` (tested on Node v25)
- npm `v9+`

### Installation & Development Server
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at http://localhost:5173
```

### Production Build & Type Check
```bash
npm run build
```

---

## Architecture & Scalable Directory Structure

```text
src/
├── types/                # Strict TypeScript models (Hook, Canvas, Challenge, Storage)
├── styles/               # Apple-style tokens, reset, typography, and utility classes
├── hooks/                # App custom hooks (useLocalStorage, useTheme, useDebounce, etc.)
├── components/
│   ├── ui/               # Reusable UI primitives (Button, Card, Badge, Modal, Tabs, etc.)
│   ├── layout/           # AppShell, Header, Sidebar, Drawer, CommandPalette, SettingsModal
│   ├── visualization/    # RenderVisualizer, ReferentialVisualizer, ClosureVisualizer, etc.
│   ├── labs/             # Dedicated deep-dive labs (useStateLab, useEffectLab, etc.)
│   ├── playground/       # THE VISUAL CANVAS & REACT COMPONENT BUILDER
│   │   ├── canvas/       # Infinite viewport, SVG connections, toolbar
│   │   ├── nodes/        # UIComponentNode (real UI) & LogicHookNode
│   │   ├── panels/       # ComponentPalette, Inspector, LivePreviewPanel, CodePanel
│   │   └── engine/       # Code generator, history stack, and serialization
│   └── tutorials/        # Preset configurations & real-time architectures
├── data/
│   ├── hooks/            # 18+ Comprehensive Hook guides (20-part format)
│   ├── custom-hooks/     # 40+ curated custom hook implementations & demos
│   ├── challenges/       # Quizzes, output prediction, and debugging
│   └── interviews/       # Senior React interview question bank
└── pages/                # HomePage, HookLessonPage, PlaygroundPage, HookMapPage, etc.
```

---

## Adding New Content

### Adding a Hook Lesson
1. Create a data file in `src/data/hooks/<hookName>.ts` matching the `HookLessonData` interface.
2. Export it from `src/data/hooks/index.ts`.
3. The hook will automatically appear in the Sidebar, Hook Map, and `⌘K` search index.

### Adding a Custom Hook
1. Add an item to `CUSTOM_HOOKS_CATALOG` in `src/data/custom-hooks/catalog.ts`.
2. Include problem, solution, parameters, implementation, and demo code.

### Adding a Real-Time Architecture Preset
1. Define a `PlaygroundProject` in `src/components/playground/tutorials/tutorialConfigs.ts`.
2. Add the option to the preset selector in `CanvasToolbar.tsx`.

---

## Privacy & Zero-Backend Architecture

All user data (lesson notes, bookmarks, custom canvas projects, and theme preferences) is stored exclusively in the browser's `localStorage`. No accounts, analytics trackers, or external cloud databases are used. You can export or import your entire learning state as a clean JSON backup at any time from the Settings menu.
