# ReactLabz - Interactive React Hooks Studio & Visual Architecture Lab

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zero Backend](https://img.shields.io/badge/Zero_Backend-100%25_Client--Side-10B981?style=for-the-badge&logo=safari&logoColor=white)](#privacy--zero-backend-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

**Stop guessing what React hooks are doing under the hood.**  
A visual, hands-on diagnostic laboratory for React engineers. Inspect state snapshots, debug memory leaks and stale closures, compare referential identity, and construct functional components on an infinite visual canvas.

[**Explore Live Demo**](https://reactlabz.vercel.app/) · [**Report Issue**](https://github.com/thevarunnayak/react-hooks/issues) · [**Request Feature**](https://github.com/thevarunnayak/react-hooks/issues)

</div>

---

## Visual Tour

<div align="center">

### Home & Interactive Fiber Telemetry
![ReactLabz Home](docs/screenshots/home.png)

### Infinite Visual Component Builder & Canvas Playground
![Visual Builder Canvas](docs/screenshots/playground.png)

### Visual Layout & Flex Studio
![Layout & Flex Studio](docs/screenshots/layout_studio.png)

</div>

---

## Highlights & Core Features

### 1. Visual Component Builder & Infinite Playground (`#playground`)
*Figma-meets-ReactFlow component construction with zero build step.*
- **Infinite Dot-Grid Canvas**: Pan, smooth zoom (0.5x to 2.0x), grid snap, mini-map, and canvas reset.
- **Rendered UI Component Nodes**: Nodes render as actual interactive UI elements rather than abstract boxes:
  - Buttons (Primary, Secondary, Outline, Danger)
  - Inputs, Headings, and dynamic Text with reactive template binding (`{{count}}`)
  - Switches, Checkboxes, Range Sliders, and Dropdowns
  - Cards, Containers, Badges, and Feedback Forms
  - **Curated Dummy Data Nodes**: 8 rich preset datasets (*Products*, *Frameworks*, *Team*, *Crypto/Stocks*, *Kanban Tasks*, *Countries*, *Articles*, *Tokens*) with 4 switchable display formats (*Cards*, *Pills*, *Grid*, *Table*).
  - **Interactive Kanban Board**: Fully draggable cards across columns with real-time status counts.
- **Logic & Hook Nodes**: Add `useState`, `useEffect`, `useRef`, `useReducer`, `useMemo`, `useCallback`, `useContext`, `useId`, `useTransition`, `useLayoutEffect`, `useDeferredValue`, `useOptimistic`, `useActionState`, `useFormStatus`, `useSyncExternalStore`, and Timers.
- **Semantic Port Wiring**:
  - `Event` (amber): Button clicks → state setter / action dispatch
  - `Data` (cyan): State values → UI text / input content
  - `Dependency` (purple): State triggers → `useEffect` / `useMemo` dependency arrays
- **Interactive Live Preview with Execution Tracing**: Interact with the rendered application; button clicks pulse the path across the canvas (`User Click → Event → State Update → Render → UI Update`).
- **UI Sequence Ordering Control**:
  - Reorder components via Up/Down/Top/Bottom controls or native **drag-and-drop handles**.
  - 1-click **"Auto-Sort by Canvas"** automatically aligns the UI layout top-to-bottom and left-to-right based on canvas coordinates.
  - Floating, draggable sequence modal window with instant position reset.
- **Dynamic Real-Time Code Generator**: Generates clean, production-ready, idiomatic TypeScript React code respecting the exact UI sequence, state variables, hooks, imports, and handlers.
- **50 Curated Real-Time Architecture Presets**: Instant loading of architectures ranging from simple Counters and Stopwatches to complex Race Condition Controllers, WebSockets, Suspense Streaming, and Performance Observatories.
- **Full Undo / Redo**: Robust command pattern history stack (`⌘Z` / `⌘ShiftZ`).

---

### 2. Visual Layout & Flex Studio (`#playground` - Layout Studio)
*Hierarchical flexbox composition, recursive container nesting, and responsive device simulation.*
- **Visual Container Composer**: Wrap arbitrary UI elements into semantic `<div>` or `<Card>` containers with instant flex direction toggling (`Row ⇄` / `Col ⇅`).
- **Custom Justify, Gap & Item Sizing Controls**:
  - **Custom Justify Dropdown**: Full flexbox alignment support (`Start`, `Center`, `End`, `Space Between`, `Space Around`, `Space Evenly`, `Stretch`) plus an inline **Custom Value** input for specialized alignment rules.
  - **Custom Gap Dropdown**: Comprehensive presets (`0px`, `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`), rapid `-2px` / `+2px` stepper buttons, and an inline **Custom Gap** field supporting arbitrary pixel or rem spacing (`14px`, `18px`, `2rem`, etc.).
  - **Custom Item Flex Sizing Dropdown**: Replaced native selects on child items with a custom sizing popover featuring presets (`flex-1`, `auto`, `100% Width`, `50% Width`, `33.3% Width`, `25% Width`), quick fixed-width chips (`120px` to `320px`), and an arbitrary custom width input (`px`, `%`, `fr`).
  - **Portal Floating Menus**: Custom menus float above the canvas layout with smooth backdrop blur and boundary collision protection, preventing clipping from container rounded borders.
- **Recursive Container Nesting & Ejection**:
  - Drag containers into other containers to create complex multi-tiered UI architectures with full drag-and-drop reordering.
  - Dedicated **Eject** control to promote nested containers back to the top-level document flow.
  - **Unwrap / Dissolve** containers cleanly back to standalone elements with one click.
- **Responsive Multi-Device Preview**:
  - Live preview simulation across **Desktop**, **Laptop**, **Tablet**, and **Mobile** viewports with realistic container wrapping and styling.
  - Switch between **Split View** (Structure Tree + Interactive Layout Canvas) and **Structure Only** focus mode.
- **Smart Auto-Grouping**: 1-click clustering that detects canvas Y-axis proximity and groups visually aligned components into flex rows automatically.
- **Code Generation Sync**: Generates clean, production-ready React JSX with inline flexbox styles and nested containers that mirror the layout hierarchy exactly.

---

### 3. Deep Interactive Visualizers & Diagnostics
- **Render Visualizer**: Live render counters and causality diffs ("Why did this render?").
- **Referential Equality Visualizer**: Live comparison of memory addresses (`0xCAFE` vs new allocations), explaining why unmemoized objects break `useEffect` and `React.memo`.
- **Closure Visualizer**: Interactive async timer demonstrating stale closures in callbacks and how `useRef` or functional updates solve them.
- **Effect Lifecycle Visualizer**: Visual progression from Render → Commit → Screen Paint → Cleanup → Effect execution.
- **State Update & Batching Lab**: Side-by-side comparison of direct updates `setCount(count + 1)` vs queued functional updates `setCount(c => c + 1)`.
- **Strict Mode Lab**: Visualizing development double-invocations (`Mount → Unmount → Mount`) and cleanup idempotency.
- **Concurrent React Lab**: `useTransition` and `useDeferredValue` with CPU lag testing to demonstrate non-blocking typing.

---

### 4. Comprehensive 20-Part Hook Curriculum (18+ Hooks)
Every hook follows a standardized 20-part educational specification:
- **Core Hooks**: `useState`, `useEffect`, `useContext`, `useRef`, `useReducer`, `useCallback`, `useMemo`
- **Lifecycle & DOM**: `useLayoutEffect`, `useImperativeHandle`
- **Concurrent & Modern**: `useTransition`, `useDeferredValue`, `useId`, `useSyncExternalStore`
- **React 19 Modern Hooks**: `useActionState`, `useOptimistic`, `useFormStatus`

---

### 5. Curated Custom Hooks Catalog (40+ Hooks) & Builder (`#custom-hooks`)
- Searchable catalog across State, Effects, Storage, DOM & Sensors, Performance, and Browser APIs.
- Includes `useLocalStorage`, `useDebounce`, `useInterval`, `useClickOutside`, `useMediaQuery`, `useClipboard`, `usePrevious`, `useThrottle`, `useOnlineStatus`, `useIdleTimer`, etc.
- **"Build Your Own Hook"** wizard generating boilerplate, hints, parameters, and test structures.

<div align="center">

![Custom Hooks Catalog](docs/screenshots/custom_hooks.png)

</div>

---

### 6. Senior React Interview Preparation & Real-Time Challenges (`#challenges`)
- **Interactive Challenge Lab**:
  - Predict Output
  - Find the Bug
  - Fix the Hook
  - Optimize Performance
- **Senior React Interview Simulator**:
  - Multi-tier difficulty tracks: `Junior`, `Mid`, `Senior`, `Lead`, `Principal`, `Architect`.
  - Short answers, architectural deep dives, common candidate pitfalls, and interactive follow-up questions.

<div align="center">

![Interactive Challenges](docs/screenshots/challenges.png)

</div>

---

### 7. Universal Command Palette (`⌘K`) with AI Speech-to-Text
- Global modal searching across all hooks, custom hooks, architecture blueprints, and interview challenges.
- Fuzzy keyword and full-content matching with highlighted text snippets.
- **Web Speech API Microphone Input**: Real-time voice search with animated listening indicator and automatic background scroll locking.
- Fast category filter pills (`All`, `Hooks`, `Custom Hooks`, `Architectures`, `Challenges`, `Interview`).

---

### 8. Local-First Privacy & Zero Backend
- **100% Client-Side Privacy**: All notes, bookmarks, challenge progress, and canvas projects persist strictly in the browser's `localStorage`.
- **Zero Cloud Dependence**: No mandatory account registration, cookies, or external databases.
- **JSON State Backup & Restore**: Export and import your entire workspace state with 1 click from the Settings drawer.
- **Theme System**: Dark, Light, and System modes with sleek glassmorphic surfaces and high-contrast typography.

---

### 9. Origin Story & Community Ideas Mailbox (`#about`)
- **The Core Problem Statement**: Why mastering React hooks is deceptively difficult when candidates only memorize surface syntax without understanding Fiber reconciliation, closures, and the reactive render pipeline.
- **Origin & Vision**: The story of turning invisible runtime mechanics into an interactive visual diagnostic laboratory.
- **Community Co-Creation**: Direct suggestion mailbox to submit custom UI ideas, tricky interview questions, and feature requests.

---

## Project Structure

```text
react-hooks/
├── public/
│   ├── og-image.svg          # 1200x630 Social card preview
│   ├── robots.txt            # Search crawler directives
│   ├── sitemap.xml           # XML sitemap for SEO
│   └── site.webmanifest      # PWA application manifest
├── docs/
│   └── screenshots/          # High-resolution application screenshots
├── src/
│   ├── types/                # Strict TypeScript models (Playground, Challenges, Hooks)
│   ├── styles/               # Design tokens, variables, typography, and glassmorphic UI
│   ├── hooks/                # Core hooks (useLocalStorage, useClickOutside, useTheme, etc.)
│   ├── i18n/                 # Localization dictionaries
│   ├── data/
│   │   ├── hooks/            # 18+ Comprehensive Hook guides (20-part spec)
│   │   ├── custom-hooks/     # 40+ Curated custom hook implementations
│   │   ├── challenges/       # Bug finding, output prediction, and optimization
│   │   └── interviews/       # Senior React interview question bank
│   ├── components/
│   │   ├── ui/               # Primitives (Button, Card, Badge, Modal, Tabs, Tooltip)
│   │   ├── layout/           # AppShell, Header, Sidebar, CommandPalette, SettingsDrawer
│   │   ├── visualization/    # RenderVisualizer, ReferentialVisualizer, ClosureVisualizer
│   │   ├── labs/             # Dedicated hook deep-dive interactive labs
│   │   └── playground/       # VISUAL CANVAS & COMPONENT BUILDER
│   │       ├── canvas/       # Dot-grid viewport, SVG wires, CanvasToolbar
│   │       ├── nodes/        # UIComponentNode (real UI) & LogicHookNode
│   │       ├── panels/       # ComponentPalette, Inspector, LivePreviewPanel, UIOrderModal
│   │       ├── engine/       # Code generator, history stack, and wiring engine
│   │       └── tutorials/    # 50 curated real-time architecture blueprints
│   └── pages/                # HomePage, PlaygroundPage, HookLessonPage, ChallengesPage, etc.
└── package.json
```

---

## Getting Started Locally

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on Node v20/v24/v25)
- **Package Manager**: `npm` (v9+) or `pnpm` / `yarn`

### Installation & Development
```bash
# 1. Clone repository
git clone https://github.com/thevarunnayak/react-hooks.git
cd react-hooks

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:5173
```

### Production Build & Linting
```bash
# Type check and build production bundle
npm run build

# Run fast Oxlint static analysis
npm run lint

# Preview production build locally
npm run preview
```

---

## Adding New Content

### Adding a Hook Lesson
1. Create a lesson definition in `src/data/hooks/<hookName>.ts` implementing the `HookLessonData` interface.
2. Export it from `src/data/hooks/index.ts`.
3. The hook will automatically populate the Sidebar, Hook Map, and `⌘K` search index.

### Adding a Custom Hook
1. Add an entry to `CUSTOM_HOOKS_CATALOG` in `src/data/custom-hooks/catalog.ts`.
2. Provide category, parameters, returns, implementation code, and an interactive sandbox component.

### Adding a Real-Time Architecture Blueprint
1. Define a new `PlaygroundProject` configuration in `src/components/playground/tutorials/tutorialConfigs.ts`.
2. Specify initial nodes, connections, category, difficulty, and educational concepts.
3. It will immediately appear in the **Load Preset** dropdown on the canvas toolbar.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
Built with ❤️ for the React Developer Community.
</div>
