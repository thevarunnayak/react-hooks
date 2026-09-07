import { InterviewQuestionItem } from '../../types/challenge';

export const INTERVIEW_QUESTIONS_BY_CATEGORY: Record<string, InterviewQuestionItem[]> = {
  "React Architecture & Rendering Model": [
  {
    id: 'int-1',
    category: 'React Architecture & Rendering Model',
    question: "Explain React's rendering model from a state update to DOM commit.",
    difficulty: 'Senior',
    shortAnswer: "A state update schedules work on the component's Fiber. React enters the render phase (calling component functions, computing JSX, diffing against previous Fibers), followed by the commit phase (synchronously applying DOM mutations, running layout effects, and scheduling passive effects).",
    mentalModel: `[Trigger: setState] ──► [Lane Scheduled on FiberRoot]
                            │
                            ▼
      [Render Phase: Pure & Interruptible Computation]
      ┌─────────────────────────────────────────────────┐
      │ WorkInProgress Tree (beginWork / completeWork)  │
      │ • Call component function, evaluate hooks       │
      │ • Reconcile new JSX against current Fiber       │
      │ • Tag Fibers with flags (Placement, Update, etc)│
      └─────────────────────────────────────────────────┘
                            │
                            ▼
     [Commit Phase: Synchronous Host DOM Modifications]
      ┌─────────────────────────────────────────────────┐
      │ 1. Before Mutation: Read getSnapshotBeforeUpdate│
      │ 2. Mutation Phase: Synchronously mutate DOM     │
      │ 3. Layout Phase: Fire useLayoutEffect / ref sync│
      └─────────────────────────────────────────────────┘
                            │
                            ▼
       [Browser Paint] ──► [Passive Phase: useEffect async]`,
    deepDive: "The lifecycle proceeds in three distinct phases: 1) Trigger/Schedule: setState schedules a lane on the Fiber root. 2) Render phase (pure & interruptible): React traverses the work-in-progress Fiber tree using beginWork/completeWork, evaluating JSX elements and computing the effect list without touching the actual DOM. 3) Commit phase (synchronous & un-interruptible): React applies DOM insertions, updates, and deletions in the mutation sub-phase, fires useLayoutEffect synchronously, allows the browser to paint, and asynchronously flushes passive effects (useEffect).",
    stepByStep: [
      "Trigger: An event handler or effect calls a state setter (e.g., setState). React allocates an Update object, appends it to the Fiber's updateQueue, and marks the Fiber with a prioritized Lane.",
      "Schedule: ensureRootIsScheduled notifies the React scheduler to queue a microtask (Sync lane) or MessageChannel task (Concurrent lane) on the browser event loop.",
      "Render (beginWork): React descends from the FiberRoot down through the tree, invoking component functions, running hook reducers, and reconciling returned JSX children against existing current Fibers.",
      "Render (completeWork): React bubbles back up, allocating DOM instances for new nodes, setting initial properties, and aggregating subtree effect flags (SubtreeFlags).",
      "Commit (Mutation): React enters the synchronous commitRoot pass, swapping the current tree pointer with workInProgress (double-buffering) and executing physical DOM mutations.",
      "Commit (Layout): React synchronously executes useLayoutEffect cleanup and setup functions and resolves mutable refs.",
      "Browser Paint: The main thread yields to the browser engine to perform style recalculation, layout reflow, and pixel rasterization.",
      "Passive Effects: React asynchronously fires useEffect cleanups and setups via a scheduled task after paint without blocking user responsiveness.",
    ],
    practicalExample: "In a high-throughput financial trading ticker, rapid price updates trigger state setters at 60fps. React groups these updates into Sync or Transition lanes. While low-priority background chart recomputations occur in an interruptible render pass, high-priority order-entry clicks immediately preempt background rendering, keeping the user interface snappy and responsive.",
    commonPitfalls: [
      'Confusing rendering with DOM painting; rendering is simply calculating the new UI description in memory.',
      'Assuming state updates immediately re-run the component on the next line of JavaScript.',
    ],
    misconceptions: [
      "Believing that calling setState immediately invokes the component function on the next line of JavaScript.",
      "Assuming useEffect runs before the user sees the screen update. Only useLayoutEffect runs before browser paint.",
      "Thinking React elements returned by JSX are actual DOM elements rather than lightweight, immutable descriptor objects.",
    ],
    followUp: {
      question: 'What happens if a state setter is invoked synchronously during the render phase of another component?',
      answer: 'React throws the error: "Cannot update a component while rendering a different component". State updates can only be queued during render for the same component (which triggers an immediate re-render loop check) or inside effects/event handlers.',
    },
    interviewInsight: "Top candidates stand out by dividing their answer explicitly into the three formal phases: Trigger, Render, and Commit. Emphasize that the Render phase is pure calculation in memory, whereas the Commit phase is host-bound and synchronous. Mentioning the distinction between layout effects (synchronous pre-paint) and passive effects (asynchronous post-paint) immediately signals senior-level maturity.",
    relatedConcepts: ['Fiber Architecture', 'Concurrent Lanes', 'useLayoutEffect vs useEffect', 'Double Buffering'],
  },
  {
    id: 'int-2',
    category: 'React Architecture & Rendering Model',
    question: 'What is the difference between rendering and committing in React?',
    difficulty: 'Senior',
    shortAnswer: 'Rendering is the process of invoking component functions to produce React elements and calculating the diff. Committing is the physical application of those calculated changes to the host environment (DOM).',
    mentalModel: `[Render Phase: Computational & Virtual]
┌──────────────────────────────────────────────┐
│ • Evaluates component functions & JSX        │
│ • Runs purely in memory (JavaScript thread) │
│ • Can be paused, aborted, or restarted       │
│ • Zero DOM mutations or browser reflows      │
└──────────────────────────────────────────────┘
                       │
                       ▼  (Only if diff detected)
[Commit Phase: Physical & Host-Bound]
┌──────────────────────────────────────────────┐
│ • Modifies actual HTML DOM elements          │
│ • Runs synchronously without interruption    │
│ • Mutates node text, attributes, children    │
│ • Triggers browser reflow and layout         │
└──────────────────────────────────────────────┘`,
    deepDive: 'Rendering is completely decoupled from the host platform. It evaluates components, handles hooks, and creates a work-in-progress Fiber tree. In concurrent mode, rendering can be paused, aborted, or restarted without visible side effects. Committing is always synchronous: it attaches/detaches DOM nodes, updates attributes, and invokes layout lifecycle methods. A component can render multiple times without ever committing if higher-priority work supersedes it.',
    stepByStep: [
      "Step 1: A render is scheduled by state, parent render, or context change.",
      "Step 2: React executes the component function, passing current props and resolving hook states.",
      "Step 3: React compares the returned JSX structure against the prior Fiber representation (reconciliation).",
      "Step 4: If no differences exist, React bails out early, skipping child re-renders and the commit phase entirely.",
      "Step 5: If differences exist, React marks the Fiber with mutation flags and hands the workInProgress tree to the commit phase.",
      "Step 6: In the commit phase, the DOM renderer imperatively invokes node.appendChild, node.removeChild, or element.setAttribute.",
    ],
    practicalExample: "Consider a search autocomplete dropdown with React.memo on each list item. When the query changes, the container component renders. For item components whose props have not changed, React executes the memo comparator during the render phase and bails out. As a result, 0 DOM mutations occur in the commit phase for those untouched items, eliminating unnecessary reflows.",
    commonPitfalls: [
      'Assuming that seeing a console.log inside a component body means DOM elements were updated on screen.',
      'Assuming React.memo prevents DOM mutations instead of skipping the render phase computation.',
    ],
    misconceptions: [
      "Believing a component render always alters DOM nodes. A component can render 1,000 times without a single DOM node changing if the diff produces identical results.",
      "Assuming React.memo protects the DOM. React.memo skips the render-phase function call; reconciliation already protects the DOM from redundant writes.",
    ],
    followUp: {
      question: 'Can React render a component without ever committing the result?',
      answer: 'Yes. In Concurrent React (e.g. useTransition or startTransition), if a high-priority user interaction (like typing in an input) arrives while a low-priority render is executing, React will abandon or discard the low-priority workInProgress tree. The component renders in memory, but zero changes are committed to the DOM.',
    },
    interviewInsight: "Highlight that rendering is platform-agnostic (the exact same render engine powers React DOM, React Native, and React Three Fiber), while committing is host-environment specific. Mentioning that N renders can result in 0 commits in Concurrent React will immediately convince the interviewer of your senior grasp.",
    relatedConcepts: ['Reconciliation', 'Host Config', 'React Native Bridge', 'Concurrent Mode Bailout'],
  },
  {
    id: 'int-3',
    category: 'React Architecture & Rendering Model',
    question: 'Why does React use a virtual representation of the UI?',
    difficulty: 'Senior',
    shortAnswer: 'Virtual UI representations decouple the declarative description of views from imperative host platform operations, allowing cross-platform targeting, diffing, and fine-grained scheduling.',
    mentalModel: `[Declarative Component Code]
              │ (returns)
              ▼
[Virtual UI Elements (Plain JS Objects)]
{ type: 'button', props: { className: 'primary', onClick } }
              │
              ▼ (Scheduler & Reconciler)
      ┌───────┴───────┐
      ▼               ▼
[Browser DOM]   [React Native Native Views]   [Canvas / WebGL (R3F)]`,
    deepDive: 'The primary architectural advantage of React elements (lightweight plain JS objects describing what should appear) is not raw speed over direct DOM operations, but declarative expressiveness and schedulability. With a virtual representation, React can batch updates, prioritize critical user interactions over background data processing (Concurrent React), run on multiple platforms (React Native, Three.js via Fiber), and minimize expensive layout recalculations.',
    stepByStep: [
      "Step 1: Declarative Abstraction: Developers write JSX representing target state at any point in time, without writing imperative manual node creation and removal code.",
      "Step 2: Tree Diffing in JS Memory: Comparing plain JavaScript objects in heap memory is orders of magnitude cheaper than querying and mutating browser DOM nodes.",
      "Step 3: Batching & Scheduling: Instead of immediately touching the DOM on every event, React batches multiple virtual changes and applies them in a single coalesced layout pass.",
      "Step 4: Platform Portability: The virtual element schema is target-neutral, enabling React to render to DOM, iOS UIKit, Android Views, PDF engines, and WebGL canvases.",
    ],
    practicalExample: "In a multi-platform design system (e.g. at Airbnb or Meta), business logic and state management are written once using React hooks. The virtual tree output is rendered via react-dom on web and react-native on mobile, saving months of duplicated engineering effort while guaranteeing consistent UI state.",
    commonPitfalls: [
      'Claiming the Virtual DOM is inherently faster than manual DOM manipulation; direct targeted DOM mutation is technically faster, but impossible to manage scalably at application scale.',
    ],
    misconceptions: [
      "Thinking the Virtual DOM was created primarily for raw speed. Highly tuned handwritten vanilla JS DOM operations are always faster than VDOM diffing. The VDOM exists for declarative predictability and scheduling control.",
      "Confusing the Virtual DOM with the Browser's Shadow DOM. Shadow DOM is a browser-native web component encapsulation API; Virtual DOM is a purely JavaScript-level diffing pattern.",
    ],
    followUp: {
      question: 'How does modern compilation (like Svelte or React Compiler) challenge the traditional Virtual DOM approach?',
      answer: 'Compilers like Svelte analyze reactive dependencies at build time to generate direct, targeted DOM mutation code without a runtime virtual tree diff. Similarly, the React Compiler memoizes hook dependencies and component outputs at build time, reducing runtime reconciliation overhead while preserving React\'s mental model.',
    },
    interviewInsight: "Never say 'The Virtual DOM makes React faster than vanilla JS'. Clarify that it provides predictable, declarative scalability: it ensures an application remains consistently fast enough across complex, enterprise-scale codebases without requiring manual imperative DOM micro-management.",
    relatedConcepts: ['Shadow DOM vs Virtual DOM', 'Declarative UI', 'Cross-Platform Architecture', 'React Compiler'],
  },
  {
    id: 'int-4',
    category: 'React Architecture & Rendering Model',
    question: 'What problem does reconciliation solve?',
    difficulty: 'Senior',
    shortAnswer: 'Reconciliation solves the problem of finding the minimal set of host mutations required to update the screen from one virtual tree state to the next in O(n) heuristic time.',
    mentalModel: `General Tree Edit Distance (Levenshtein Trees):
[Tree A: 1000 nodes] ──► O(n³) = 1,000,000,000 operations ──► Complete UI Freeze!

React Heuristic Reconciliation:
[Tree A: 1000 nodes] ──► O(n)  = 1,000 operations         ──► ~1ms (60 FPS Smooth!)

Heuristic 1: Different Element Types Produce Different Trees
<div> ──► <section>  (Tear down old subtree, mount fresh subtree)

Heuristic 2: Stable Keys Across Siblings
[Item A, Item B] ──► [Item B, Item A] (Re-order nodes, do not recreate)`,
    deepDive: 'A general tree-to-tree edit distance algorithm (e.g. Levenshtein tree algorithms) runs in O(n^3) time. For 1,000 nodes, that would take 1 billion comparisons. Reconciliation applies two heuristic assumptions: 1) Two elements of different types will produce different trees. 2) The developer can hint which elements are stable across renders with a key prop. This brings computational complexity down from O(n^3) to O(n).',
    stepByStep: [
      "Step 1: React compares the root elements of the two trees.",
      "Step 2: If element types differ (e.g. <div> to <span> or <Header> to <Nav>), React tears down the entire existing subtree, unmounting components and discarding their DOM nodes.",
      "Step 3: If element types match, React inspects props, updating only changed attributes (e.g. className or style) and retaining the underlying DOM instance.",
      "Step 4: React recursively reconciles children. For list items, it compares stable 'key' attributes to determine insertions, deletions, and moves instead of rebuilding the list.",
    ],
    practicalExample: "When rendering a virtualized feed of 500 social media cards, inserting a new post at the top without keys forces React to mutate all 500 cards. By assigning each post a unique database ID as its 'key', React reconciles the list in O(n), inserting exactly 1 new DOM node at the top and leaving the other 499 untouched.",
    commonPitfalls: [
      'Failing to articulate why O(n^3) makes naive tree diffing unusable in 60fps applications.',
    ],
    misconceptions: [
      "Assuming React performs a comprehensive mathematical graph diff. It is strictly a single-pass heuristic comparison.",
      "Using array indexes as keys for dynamic lists. When items are sorted, inserted, or filtered, index keys trick reconciliation into mutating wrong component state.",
    ],
    followUp: {
      question: 'Why does changing a component type from <div> to <span> destroy all internal child component state?',
      answer: 'Because heuristic #1 assumes different types never share internal layout or state structure. React unmounts the old Fiber subtree completely, destroying all hook states, refs, and child DOM nodes, and constructs an entirely fresh Fiber subtree.',
    },
    interviewInsight: "Mention the exact big-O complexity: naive tree diffing is O(n^3), which for 1,000 nodes is 10^9 operations (guaranteed frame drops). React's heuristic diff reduces this to O(n). Explicitly naming both heuristics (type comparison and keys) shows true depth.",
    relatedConcepts: ['Heuristic Diffing', 'Key Prop Mechanics', 'Fiber Subtree Flags', 'Unmounting Lifecycle'],
  },
  {
    id: 'int-5',
    category: 'React Architecture & Rendering Model',
    question: 'How does React determine whether a component needs to re-render?',
    difficulty: 'Senior',
    shortAnswer: 'By default, a component re-renders whenever its state changes, its parent re-renders, or a Context it subscribes to publishes a new reference.',
    mentalModel: `Does Component Need to Re-Render?
                  │
                  ▼
       [Did Parent Re-render?]
         ├── NO ──► [Did Own State Change?] ────► YES: Re-render
         │          └── [Did Context Change?] ──► YES: Re-render
         │
         └── YES ─► [Is Component Wrapped in React.memo?]
                      ├── NO  ──► Re-render (Default React Behavior)
                      └── YES ──► [Did Props Change? (Shallow Compare)]
                                    ├── YES ──► Re-render
                                    └── NO  ──► Bailout (Skip Render!)`,
    deepDive: 'Unless explicitly wrapped in React.memo, React does not check whether a component\'s props have changed. If parent component A re-renders, child component B will re-render regardless of whether B received identical props. React skips re-rendering only if: 1) The component was memoized and shallow prop comparison passes, 2) The element is identical by reference (bailout in beginWork), or 3) Context value reference has not changed.',
    stepByStep: [
      "Step 1: Check Fiber lanes: Does this Fiber have pending updates queued in its lane? If yes, execute render.",
      "Step 2: Check parent render pass: In beginWork, if the parent is rendering, React checks if the child element has the same props reference (Object.is) as the current Fiber.",
      "Step 3: Check React.memo: If wrapped in memo, shallow-compare each prop in prevProps against nextProps.",
      "Step 4: Bailout: If props are shallow-equal and no local state or context has changed, React calls bailoutOnAlreadyFinishedWork, cloning child pointers without re-running component code.",
      "Step 5: Context check: If any consumed React Context provider emitted a new value reference, bypass memoization and force component execution.",
    ],
    practicalExample: "In a collaborative document editor, typing in the title bar triggers a state update in the page root. If the canvas component holding 10,000 vector shapes is wrapped in React.memo and its props are stable, React bails out in beginWork in under 0.1ms, maintaining 120 FPS typing latency.",
    commonPitfalls: [
      'Believing React automatically checks props for equality before re-rendering child components.',
      'Overlooking that context updates bypass parent React.memo barriers.',
    ],
    misconceptions: [
      "Believing React checks if props changed before re-rendering children by default. In vanilla React, when a parent renders, all its children re-render unconditionally.",
      "Assuming React.memo protects a component from re-rendering when a consumed Context changes. Context consumption always forces a re-render regardless of memo.",
    ],
    followUp: {
      question: 'How can you prevent a child from re-rendering without using React.memo?',
      answer: 'By lifting the child element out and passing it as a `children` prop from a stable parent. Because the JSX element instance was created by an outer component that did not re-render, its object reference is identical. React hits the reference-equality bailout in `beginWork` automatically.',
    },
    interviewInsight: "Emphasize that parent re-rendering is the #1 cause of child re-renders. A junior candidate often says 'components re-render when their props change'. A senior candidate immediately corrects this: 'Components re-render when their parent renders, regardless of props, unless memoized.'",
    relatedConcepts: ['React.memo', 'beginWork Bailout', 'Context Propagation', 'Children Prop Optimization'],
  },
  {
    id: 'int-6',
    category: 'React Architecture & Rendering Model',
    question: 'What causes a React component to render?',
    difficulty: 'Senior',
    shortAnswer: 'Four main triggers: 1) State update via useState setter or useReducer dispatch, 2) Parent component re-rendering, 3) Consumed Context value reference changing, and 4) useSyncExternalStore notification.',
    mentalModel: `[Four Triggers of a React Render]
┌──────────────────────────────────────────────────────────────┐
│ 1. Local State: useState / useReducer update queued          │
│ 2. Parent Cascade: Parent component evaluated in render      │
│ 3. Context Change: Subscribed Context provider value changed │
│ 4. External Store: useSyncExternalStore listener fired       │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
        [React Scheduler Queues Microtask]
                         │
                         ▼
             [Component Body Evaluates]`,
    deepDive: 'Props changing does NOT directly trigger a render on its own; rather, the parent component re-rendering creates new JSX element instances (props), which leads to the child re-rendering. Custom hooks trigger renders exclusively through their underlying useState or useReducer instances. Directly mutating a variable or a useRef does not schedule any work and will never trigger a render.',
    stepByStep: [
      "1. Internal State Mutation: Calling setState or dispatch queues an update on the component Fiber.",
      "2. Parent Re-evaluation: The parent executes its render phase, generating new React element descriptors for its children.",
      "3. Context Value Mutation: React iterates through the list of Fibers subscribed to a Context (dependencies linked list) and marks them for re-render when the Provider's value prop changes.",
      "4. External Store Subscription: useSyncExternalStore registers an onStoreChange callback that triggers a render when external mutable state (like Redux or Zustand) updates.",
    ],
    practicalExample: "In a real-time chat application, incoming WebSocket messages update a global Zustand store. The store invokes the useSyncExternalStore listener, causing only the message list component to render, leaving sidebar, headers, and composer components completely untouched.",
    commonPitfalls: [
      'Listing "props change" as an independent trigger separate from parent re-rendering.',
      'Expecting ref.current mutations to schedule a render.',
    ],
    misconceptions: [
      "Believing mutating useRef.current triggers a render. useRef is simply a persistent plain JavaScript object that produces zero scheduling signals.",
      "Believing custom hooks have their own render lifecycle. Custom hooks run within the calling component's execution context.",
    ],
    followUp: {
      question: 'Why does passing an unchanged state value to setState (e.g. setCount(5) when count is already 5) sometimes still render once?',
      answer: 'If the Fiber has not yet computed the transition or if it has pending lanes, React may do a fast shallow check (eager state) and bailout before scheduling. However, if work is already scheduled on the Fiber, React may enter the component once, see that the state is equal, and immediately bailout without touching children or DOM.',
    },
    interviewInsight: "Be pedantic about props: 'Props changing' is not an autonomous trigger. The trigger is the parent re-rendering. Clarifying this distinction separates engineers who truly understand the component tree execution model from those who rely on high-level heuristics.",
    relatedConcepts: ['useSyncExternalStore', 'Eager State Bailout', 'useRef Mechanics', 'Context Dependencies'],
  },
  {
    id: 'int-7',
    category: 'React Architecture & Rendering Model',
    question: 'Does a component rendering necessarily mean the DOM changes?',
    difficulty: 'Senior',
    shortAnswer: 'No. Rendering simply calls the component function to produce React elements. If the returned elements diff to the exact same structure and props as the previous render, no DOM mutations occur.',
    mentalModel: `[Render: JS Computation] ──────► [Reconciliation: In-Memory Diff]
Component Function Runs                  New JSX vs Previous Fiber
Total: 100 Renders                       Structure & Props Identical!
                                                    │
                                                    ▼
                                         [Commit Phase: DOM]
                                         ZERO DOM Changes!
                                         ZERO Browser Paints!`,
    deepDive: 'This separation between the Render Phase (computation) and Commit Phase (DOM mutations) is fundamental. You can observe a component render 100 times in the React Profiler without a single DOM node being altered or reflowed if the returned JSX evaluates to identical attributes and children. However, excessive re-renders still consume CPU cycles executing JavaScript logic.',
    stepByStep: [
      "1. Component function runs and executes JavaScript logic inside its body.",
      "2. The function returns a React element tree (JSX objects).",
      "3. React's reconciler diffs the returned React elements against the existing Fiber tree.",
      "4. If all tag names, attributes, text contents, and child keys are identical, React flags the Fiber with 0 mutation flags.",
      "5. During commitRoot, React skips this Fiber, leaving the existing browser DOM nodes completely untouched.",
    ],
    practicalExample: "In an analytics dashboard, a polling interval triggers every second at the root to check notification counts. Even though subcomponents re-run their render functions every second, if the notification count remains '0', React makes zero mutations to the DOM, avoiding costly browser layout reflows.",
    commonPitfalls: [
      'Assuming that eliminating DOM changes completely solves all rendering performance problems (unnecessary JS execution in render still causes frame drops).',
    ],
    misconceptions: [
      "Assuming if the DOM doesn't change, the app has zero performance bottlenecks. Heavy JS computations (filtering arrays, regex parsing) during unnecessary renders can still cause input lag and frame drops.",
      "Believing React Profiler 'Render' timeline measures browser DOM paint time. It measures JavaScript component execution time.",
    ],
    followUp: {
      question: 'How do you verify whether a render actually resulted in a DOM modification in browser dev tools?',
      answer: 'In Chrome DevTools, open the Rendering drawer and enable "Paint Flashing" or "Layout Shift Regions". If a component re-renders but the DOM is unchanged, no green paint flash will appear over the element.',
    },
    interviewInsight: "Point out that rendering is a CPU cost (JavaScript heap execution), whereas DOM mutation is a GPU/Layout cost (browser reflow, style recalculation, and rasterization). Both matter, but separating them is the cornerstone of React performance engineering.",
    relatedConcepts: ['Paint Flashing', 'React Profiler', 'Layout Thrashing', 'Pure Components'],
  },
  {
    id: 'int-8',
    category: 'React Architecture & Rendering Model',
    question: "Explain the difference between React's render phase and commit phase.",
    difficulty: 'Senior',
    shortAnswer: 'The render phase is computational, asynchronous, and interruptible in concurrent mode. The commit phase is side-effectful, synchronous, and uninterruptible.',
    mentalModel: `┌───────────────────────────────────────────────────────────┐
│ RENDER PHASE (Interruptible, Pure, Asynchronous)         │
│ • Runs beginWork and completeWork                         │
│ • Evaluates component functions and hooks                 │
│ • Builds workInProgress Fiber tree                        │
│ • Can yield to browser thread (5ms time-slicing)         │
│ • ZERO DOM mutations                                      │
└───────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│ COMMIT PHASE (Uninterruptible, Synchronous, Side-Effectful)│
│ 1. Before Mutation: getSnapshotBeforeUpdate               │
│ 2. Mutation: appendChild, removeChild, textContent        │
│ 3. Layout: useLayoutEffect (synchronous pre-paint)        │
│ 4. BROWSER PAINT (Pixels rendered to display)            │
│ 5. Passive Effects: useEffect (asynchronous post-paint)   │
└───────────────────────────────────────────────────────────┘`,
    deepDive: 'Render Phase: Traverses Fibers, calls component functions, resolves hook values, evaluates reconciliation diffs, and flags nodes that need DOM work. In React 18 Concurrent mode, this phase can yield back to the browser event loop. Commit Phase: Divides into three sub-phases: 1) Before Mutation (getSnapshotBeforeUpdate), 2) Mutation (inserting, removing, updating DOM nodes), and 3) Layout (synchronous execution of useLayoutEffect and componentDidMount/Update). Browser paint occurs after Layout phase, followed by asynchronous passive effects (useEffect).',
    stepByStep: [
      "Render Phase: Traverses Fibers down (beginWork) and up (completeWork), computing JSX and effect tags.",
      "Commit Subphase 1 (Before Mutation): Reads pre-commit snapshots (e.g. scroll positions) before DOM is modified.",
      "Commit Subphase 2 (Mutation): Synchronously executes DOM deletions, placements, and attribute updates.",
      "Commit Subphase 3 (Layout): Swaps current fiber pointer, resolves DOM refs, and synchronously invokes useLayoutEffect.",
      "Browser Paint: Browser updates the display pixels on screen.",
      "Passive Phase: React executes useEffect cleanup and setup functions asynchronously.",
    ],
    practicalExample: "Measuring a tooltip position before paint: When opening a tooltip, you must position it relative to the button without flickering. You read button coordinates and apply tooltip position inside `useLayoutEffect` (Commit Layout phase). The browser paints only once with the correctly calculated coordinates, eliminating visible visual jumping.",
    commonPitfalls: [
      'Believing useLayoutEffect runs after the browser paints the pixels on screen.',
      'Placing network requests or DOM mutations inside the render phase.',
    ],
    misconceptions: [
      "Assuming useEffect runs synchronously with DOM changes. useEffect is intentionally deferred until after browser paint to keep interactions responsive.",
      "Believing you can safely trigger external side effects (like analytics logging or API calls) in the render phase body.",
    ],
    followUp: {
      question: 'What happens if useLayoutEffect calls setState synchronously?',
      answer: 'React immediately halts and schedules a synchronous render and commit pass before the browser has a chance to paint the current frame. This ensures the user never sees intermediate or unstyled layout state, but running heavy code here directly degrades frame rate.',
    },
    interviewInsight: "Always detail the three distinct sub-phases of Commit: Before Mutation, Mutation, and Layout. Mentioning where the browser paint sits (between Layout and Passive useEffect) demonstrates principal-level clarity.",
    relatedConcepts: ['useLayoutEffect', 'useEffect Scheduling', 'Time Slicing', 'DOM Snapshots'],
  },
  {
    id: 'int-9',
    category: 'React Architecture & Rendering Model',
    question: 'Why must render-phase code be pure?',
    difficulty: 'Architect',
    shortAnswer: 'Because React can call render functions multiple times, discard incomplete work, or run rendering out of order. Impure functions create race conditions, memory leaks, and unpredictable UI bugs.',
    mentalModel: `[Impure Component: Modifies Global Variable]
Render 1 (Started) ──► Mutates globalCart.total += 10
Higher Priority Task Preempts! ──► Render 1 DISCARDED!
Render 2 (Restarted) ──► Mutates globalCart.total += 10
Result: Cart total corrupted to +20 instead of +10!

[Pure Component: Input Props/State -> Output JSX]
Render 1 (Started) ──► Produces JSX descriptor A
Higher Priority Task Preempts! ──► Discarded safely with ZERO side effects!
Render 2 (Restarted) ──► Produces JSX descriptor A cleanly`,
    deepDive: 'In Concurrent React, a render phase can be started, paused when higher-priority work (like typing in an input) arrives, and discarded completely. If a render function mutates global variables, attaches event listeners, or initiates network requests, those side effects will duplicate or leave corrupted state behind when renders are aborted or restarted.',
    stepByStep: [
      "1. React's scheduler begins rendering a low-priority component tree.",
      "2. An impure render function executes, mutating an outside object or triggering a network call.",
      "3. A high-priority user interaction interrupts the render pass.",
      "4. React abandons the in-progress work and garbage collects the work-in-progress Fiber tree.",
      "5. Because the render was aborted, no commit phase runs and no cleanup runs.",
      "6. When React restarts rendering later, the impure code executes again, causing duplicated side effects and corrupted state.",
    ],
    practicalExample: "If an analytics logging call `analytics.track('PageView')` is placed in the component body instead of `useEffect`, React Strict Mode in development will log 2 views, and Concurrent React during aborted transitions could log 3 or 4 views for a single visit, corrupting business metrics.",
    commonPitfalls: [
      'Calling Math.random() or Date.now() during render and expecting SSR and client hydration to match.',
      'Pushing items into an external array or modifying object arguments during render.',
    ],
    misconceptions: [
      "Thinking React Strict Mode double-rendering is a bug. It is an intentional development tool designed specifically to expose impure render functions.",
      "Believing side effects in render functions are fine if 'I know it only renders once'. In Concurrent React, there is never a guarantee a component renders once.",
    ],
    followUp: {
      question: 'How does React StrictMode help enforce render phase purity in development?',
      answer: 'React StrictMode intentionally invokes component functions, useState initializers, and useMemo callbacks twice in development mode. If a function is pure, f(x) produces the exact same result both times with no side effects. If it is impure (e.g. mutating an external array), the bug manifests immediately in development.',
    },
    interviewInsight: "Connect purity directly to Concurrent Mode. Explain that purity is what allows React to treat rendering like a git branch: it can fork work, throw it away if abandoned, or rebase it on top of new state without corrupting the application.",
    relatedConcepts: ['Strict Mode Double Render', 'Idempotence', 'Time Slicing Safety', 'SSR Hydration Mismatch'],
  },
  {
    id: 'int-10',
    category: 'React Architecture & Rendering Model',
    question: 'What would happen if a component caused a side effect during rendering?',
    difficulty: 'Senior',
    shortAnswer: 'It leads to duplicated side effects, memory leaks, tearing in concurrent mode, and hydration mismatches during server rendering.',
    mentalModel: `Component Body Executes:
├── PURE: const total = price * quantity; (SAFE)
└── IMPURE: window.addEventListener('resize', handler); (DANGEROUS!)
      │
      ├─► Strict Mode Double Render: Event listener attached TWICE!
      ├─► Concurrent Discard: Listener attached, but component never mounted!
      └─► Memory Leak: No cleanup hook exists to detach the listener!`,
    deepDive: 'In React Strict Mode in development, React intentionally renders every component twice to catch impure render-phase code. If a component registers an event listener, fetches data, or increments a global counter during render, Strict Mode causes it to execute twice immediately. In production Concurrent Mode, partial renders discarded due to priority preemption will leave lingering side effects that were never cleaned up.',
    stepByStep: [
      "1. A side effect is executed in the component body (e.g. document.title = newTitle).",
      "2. In SSR, the server renders the component; client-specific APIs (window, document) crash Node.js.",
      "3. In Strict Mode, the body executes twice, doubling the side effect.",
      "4. In Concurrent Mode, an aborted render never reaches the commit phase, so no cleanup function runs.",
      "5. Event listeners or subscriptions remain dangling in memory indefinitely, causing memory leaks.",
    ],
    practicalExample: "A junior developer puts `fetch('/api/user')` directly in the component body. During search filtering, the component re-renders on every keystroke, firing 20 un-cancellable HTTP requests in 2 seconds, overloading the backend API and creating UI race conditions.",
    commonPitfalls: [
      'Blaming Strict Mode for "running my code twice" instead of realizing the code contained illegal render-phase side effects.',
    ],
    misconceptions: [
      "Assuming side effects are acceptable if they 'only modify the DOM directly'. Direct DOM mutations during render corrupt React's internal Fiber-to-DOM mapping.",
      "Believing useEffect and render body run at the same time.",
    ],
    followUp: {
      question: 'Where should side effects be placed in a React component?',
      answer: 'Side effects should live exclusively in: 1) Event handlers (e.g. onClick, onSubmit) for user-initiated actions, or 2) useEffect / useLayoutEffect for synchronization actions tied to component lifecycle.',
    },
    interviewInsight: "Strong candidates cite four specific failure modes: 1) Memory leaks (no cleanup possible), 2) Duplicate executions in Strict Mode, 3) Orphaned side effects during concurrent aborts, and 4) SSR crashes when accessing browser globals.",
    relatedConcepts: ['Side Effect Isolation', 'Event Handlers vs Effects', 'Memory Leaks', 'Strict Mode'],
  },
  {
    id: 'int-11',
    category: 'React Architecture & Rendering Model',
    question: 'How does React batch state updates?',
    difficulty: 'Senior',
    shortAnswer: 'React groups multiple state setter calls into a single render pass using an internal update queue associated with the Fiber lane priority.',
    mentalModel: `Multiple State Updates Called in One Tick:
setCount(c => c + 1)  ──┐
setFlag(f => !f)       ──┼──► [Fiber UpdateQueue: 3 Updates]
setName('Alex')        ──┘              │
                                        ▼
                           [Scheduled Microtask Runs]
                                        │
                                        ▼
                          [SINGLE Render & SINGLE Commit]`,
    deepDive: "When setState is called, React does not immediately execute component code. Instead, it creates an Update object, appends it to the Fiber's updateQueue, marks the Fiber with the appropriate Lane priority, and schedules a microtask via ensureRootIsScheduled. When that microtask runs, all queued updates for that lane are computed together, resulting in a single render and a single DOM commit.",
    stepByStep: [
      "1. setState is invoked: React creates an Update object containing the payload or updater function.",
      "2. Queue Appending: React appends the Update object to the circular linked list on fiber.updateQueue.",
      "3. Lane Marking: The Fiber and its ancestor path to the root are tagged with the update's Lane bitmask.",
      "4. Scheduler Notification: ensureRootIsScheduled inspects all pending lanes and schedules a task on the microtask queue.",
      "5. Microtask Execution: When the JavaScript call stack clears, React processes all queued updates together in a single render pass.",
      "6. Single Commit: All resulting DOM mutations are applied in one atomic commit.",
    ],
    practicalExample: "In a shopping cart checkout button handler, `setIsSubmitting(true)`, `setCartTotal(0)`, and `setStep('confirmation')` are called sequentially. React batches all three updates, executing the checkout component's render function exactly once and updating the DOM in a single atomic reflow.",
    commonPitfalls: [
      'Expecting state variables to reflect the new value immediately on the line following setState().',
    ],
    misconceptions: [
      "Believing React creates a new render pass for every setState call in an event handler.",
      "Assuming batching requires setTimeout or manual debounce utilities.",
    ],
    followUp: {
      question: 'What is an updater function in setState (e.g. setCount(c => c + 1)) and why is it necessary with batching?',
      answer: 'When multiple state setters are batched in the same event loop tick, closures capture the same initial state value. Passing an updater function queues calculations sequentially in the Fiber updateQueue: each updater receives the intermediate return value of the previous updater, ensuring calculations are computed accurately.',
    },
    interviewInsight: "Explain the internal mechanics: React uses a circular linked list for the update queue and bitwise Lane masks for priority. This demonstrates you know how React's engine actually executes under the hood rather than just knowing how to call the API.",
    relatedConcepts: ['Automatic Batching', 'Circular Linked Lists', 'Microtask Queue', 'Updater Functions'],
    codeExample: `// All three setters are queued together -> only 1 re-render occurs
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  setName('Alex');
}`,
  },
  {
    id: 'int-12',
    category: 'React Architecture & Rendering Model',
    question: 'What changed about automatic batching in React 18?',
    difficulty: 'Senior',
    shortAnswer: 'React 18 batches state updates everywhere by default—including inside Promises, setTimeout, fetch callbacks, and native event handlers.',
    mentalModel: `React 17 Batching:
onClick handler           ──► Batched (1 render)
fetch().then(callback)    ──► NOT BATCHED! (2 renders for 2 setStates)
setTimeout(callback)      ──► NOT BATCHED! (2 renders for 2 setStates)

React 18 Automatic Batching (createRoot):
onClick handler           ──► Batched (1 render)
fetch().then(callback)    ──► BATCHED! (1 render)
setTimeout(callback)      ──► BATCHED! (1 render)
Native addEventListener   ──► BATCHED! (1 render)`,
    deepDive: 'Prior to React 18, batching only occurred within React synthetic event handlers (like onClick). Updates inside asynchronous callbacks (e.g., fetch().then(() => { setA(); setB(); })) resulted in two independent renders and two DOM commits. In React 18, createRoot enables automatic batching universally across all execution contexts. Developers can opt out using flushSync() when synchronous DOM reading is strictly required.',
    stepByStep: [
      "1. Legacy Mode (React 17): Batching relied on an internal execution flag inside synthetic event wrappers. Outside synthetic events, execution returned immediately to browser event loop.",
      "2. React 18 createRoot: Batching is architected around microtask scheduling at the FiberRoot level.",
      "3. When setState runs inside a Promise or setTimeout, React queues the updates in the lane and schedules a microtask.",
      "4. The microtask collects all synchronous calls before yielding to the render phase.",
      "5. Opt-out: If immediate synchronous DOM updates are required, developers wrap the setter in flushSync().",
    ],
    practicalExample: "A data table fetches the next page of records via `fetch().then(...)`. Upon response, it calls `setData(items)` and `setIsLoading(false)`. In React 17, the table rendered twice, showing a flicker where loading was true but data was already populated. In React 18, automatic batching combines both into a single seamless render.",
    commonPitfalls: [
      'Using ReactDOM.flushSync unnecessarily, which defeats performance optimizations and harms concurrent scheduling.',
    ],
    misconceptions: [
      "Thinking automatic batching works when using the legacy `ReactDOM.render` API. It requires upgrading the root to `ReactDOM.createRoot`.",
      "Assuming flushSync should be used whenever you want fast updates. flushSync forces de-optimization and blocks the main thread.",
    ],
    followUp: {
      question: 'When is using ReactDOM.flushSync genuinely necessary?',
      answer: 'When you must mutate state and immediately measure the resulting DOM in the very next line of code—for example, measuring the height of a newly inserted chat message to immediately adjust scroll position before the next event loop frame.',
    },
    interviewInsight: "Clarify the migration boundary: Automatic batching is an opt-in breaking change tied specifically to `createRoot()`. Mentioning `flushSync()` as the escape hatch shows you understand both the performance optimization and edge-case exceptions.",
    relatedConcepts: ['createRoot vs render', 'flushSync', 'Event Loop Microtasks', 'Async Race Conditions'],
  },
  {
    id: 'int-13',
    category: 'React Architecture & Rendering Model',
    question: 'Why can React render a component multiple times before committing it?',
    difficulty: 'Architect',
    shortAnswer: 'In concurrent rendering, React can pause or abort a low-priority render if high-priority work arrives, restarting the render from scratch later.',
    mentalModel: `[Low-Priority Transition: 5,000 Item List Render]
Fiber 1 -> Fiber 2 -> Fiber 3... (Render at 40% complete)
                               │
                [USER TYPES IN SEARCH INPUT!]
                               │
                               ▼ (High-Priority Discrete Lane Arrives)
[PAUSE & DISCARD Low-Priority WorkInProgress Tree]
                               │
                               ▼
[Execute Search Input Render & Commit Immediately! (~2ms)]
                               │
                               ▼
[RESTART 5,000 Item List Render From Scratch]
                               │
                               ▼
[Commit Final List Result to DOM]`,
    deepDive: 'Suppose React is rendering a heavy 5,000-row list wrapped in useTransition (low priority lane). If the user types a character into an input field (Default/Discrete lane), React halts the list render, prioritizes the keystroke update, renders and commits the input, and then restarts the list render. The component in the list may thus evaluate its render phase multiple times before a single commit occurs.',
    stepByStep: [
      "1. A low-priority lane starts rendering in the background (e.g. useTransition or Suspense).",
      "2. React yields every 5ms to check the browser event queue for incoming user input.",
      "3. A high-priority user interaction (keystroke, tap) queues an urgent discrete lane update.",
      "4. React's scheduler compares lane priorities: Discrete Lane > Transition Lane.",
      "5. React aborts the current work-in-progress tree, discarding partial calculations.",
      "6. React renders and commits the high-priority update synchronously.",
      "7. The scheduler resumes or restarts the low-priority render with fresh props and state.",
    ],
    practicalExample: "In an e-commerce catalog, filtering 10,000 products with `startTransition` runs in the background. If the customer rapidly clicks three different filter checkboxes, React discards the first two partially computed renders and only commits the final filter state, eliminating intermediate UI jank.",
    commonPitfalls: [
      'Assuming 1 render = 1 commit. The relationship is N renders to 0 or 1 commit.',
    ],
    misconceptions: [
      "Assuming a component re-rendering multiple times is always a performance bug. In Concurrent React, preemptive restarts are an intentional responsiveness feature.",
      "Believing discarded renders leak memory. React simply abandons the workInProgress root pointer, allowing V8 garbage collection to sweep it.",
    ],
    followUp: {
      question: 'What happens to hook states (like useState) during an aborted render?',
      answer: 'Because state changes are only committed when the entire tree finishes, an aborted render simply discards the uncommitted workInProgress Fiber. The existing current Fiber tree and its state remain completely unaltered.',
    },
    interviewInsight: "Summarize with the formula: 'The relationship between render and commit is N-to-1 or N-to-0.' Explaining how cooperative scheduling yields every 5ms demonstrates deep familiarity with the React codebase internals.",
    relatedConcepts: ['Concurrent Mode', 'useTransition', 'Lane Priority Preemption', 'Cooperative Scheduling'],
  },
  {
    id: 'int-14',
    category: 'React Architecture & Rendering Model',
    question: 'What is the relationship between component trees and Fiber trees?',
    difficulty: 'Senior',
    shortAnswer: 'A component tree is the nested conceptual hierarchy of React elements (JSX), whereas the Fiber tree is the persistent internal data structure of mutable nodes that tracks state, props, and scheduled work.',
    mentalModel: `[Component Tree: Ephemeral JSX Objects]
<App>
  └── <Sidebar>
        └── <UserBadge name="Alex" />
(Destroyed & recreated on every render call)

[Fiber Tree: Persistent Internal State Machine]
RootFiber
  └── Fiber(App)
        └── child: Fiber(Sidebar)
                     └── child: Fiber(UserBadge)
(Holds: memoizedState, pendingProps, lanes, DOM pointer, sibling/return links)`,
    deepDive: 'React elements returned by JSX are ephemeral, immutable plain objects created and garbage collected on every render. Fibers, by contrast, are long-lived internal nodes created on initial mount and reused across renders (double buffering). A Fiber holds component state (memoizedState), incoming props (pendingProps), memoized props, connections to sibling/parent/child fibers, and the work flags indicating required DOM mutations.',
    stepByStep: [
      "1. Component Tree: Consists of lightweight { $$typeof, type, props, key } objects returned by JSX calls.",
      "2. Fiber Node Creation: On initial mount, React instantiates a Fiber node for every component and host element.",
      "3. Pointer Structure: Instead of an array of children, Fibers form a singly-linked tree via 'child', 'sibling', and 'return' pointers.",
      "4. Double Buffering: React maintains two Fiber trees: 'current' (what is on screen) and 'workInProgress' (what is being rendered).",
      "5. Commit Swap: At the end of the commit phase, React points FiberRoot.current to the workInProgress tree in O(1) time.",
    ],
    practicalExample: "In high-frequency rendering animations, recreating complex internal state machines would cause severe GC pauses. Because React reuses Fiber nodes via the alternate pointer (double buffering), memory allocation is kept near zero during re-renders, preventing frame drops.",
    commonPitfalls: [
      'Thinking React recreates its entire internal state machine on every render.',
    ],
    misconceptions: [
      "Confusing React elements (JSX objects) with Fibers. React elements are recreated every render; Fibers persist across renders.",
      "Assuming Fibers use standard array child pointers like the DOM. Fibers use child/sibling/return pointers to enable pausing and resuming tree traversal.",
    ],
    followUp: {
      question: 'Why did React adopt a singly-linked list tree structure (child, sibling, return) for Fibers instead of children arrays?',
      answer: 'Because traversing a recursive tree with a call stack cannot be paused or resumed. With singly-linked child, sibling, and return pointers, React can pause traversal at any arbitrary node, return control to the browser event loop, and later resume traversal from that exact node without maintaining a deep JavaScript call stack.',
    },
    interviewInsight: "Describe the 'child, sibling, return' pointer structure and double-buffering. Comparing it to graphic card framebuffers (swapping front buffer and back buffer) instantly proves senior engineering comprehension.",
    relatedConcepts: ['Double Buffering', 'Alternate Fiber Pointer', 'Singly Linked Tree', 'GC Pressure'],
  },
  {
    id: 'int-15',
    category: 'React Architecture & Rendering Model',
    question: "Why is React's architecture designed around incremental rendering?",
    difficulty: 'Principal',
    shortAnswer: 'Incremental rendering allows React to break rendering work into small chunks and spread them over multiple animation frames to prevent the main thread from blocking user interactions.',
    mentalModel: `[Synchronous Stack Reconciler (Legacy React)]
|══════════════════════════════════════════════════| 120ms blocking JS
User clicks button ──► Browser frozen! ──► Frames dropped!

[Incremental Fiber Scheduler (Concurrent React)]
|══ 5ms ══| yield |══ 5ms ══| yield |══ 5ms ══|
              │                 │
              ▼                 ▼
     Process User Click!  Process Scroll!  (60/120 FPS Maintained!)`,
    deepDive: 'JavaScript runs on a single thread alongside layout, style recalculation, and painting. If a monolithic synchronous render takes 100ms, the browser cannot process user clicks, typing, or scrolling during that time, dropping frames and causing jank. Incremental rendering via Fiber gives React a cooperative scheduler (yielding after ~5ms intervals) so high-priority user input is processed immediately without freezing the UI.',
    stepByStep: [
      "1. Monolithic Rendering Bottleneck: In React 15 (Stack Reconciler), render was a recursive, non-cancellable JavaScript call stack.",
      "2. Fiber Virtual Call Stack: Fiber re-architects the call stack into individual heap-allocated Fiber frame objects.",
      "3. Time Slicing: React's work loop checks shouldYield() every ~5ms using performance.now().",
      "4. Yield to Host: When the 5ms budget expires, React schedules a MessageChannel task and returns control to the browser.",
      "5. Browser Processing: The browser executes pending mouse clicks, keyboard input, animations, and paint passes.",
      "6. Resume Work: React picks up the workInProgress Fiber where it left off on the next tick.",
    ],
    practicalExample: "Consider a complex spreadsheet application like Google Sheets built in React. When a formula updates 10,000 cells, incremental rendering chunks the calculation across 20 frames. If the user scrolls while the calculation is running, the scroll responds instantly without hitching.",
    commonPitfalls: [
      'Assuming incremental rendering makes rendering finish faster in total wall-clock time; it actually optimizes responsiveness and frame-rate budget, not raw computational throughput.',
    ],
    misconceptions: [
      "Believing incremental rendering improves total computation speed. Breaking work into chunks incurs slight scheduler overhead; its goal is UI responsiveness (INP/FID), not raw CPU throughput.",
      "Assuming React uses Web Workers for rendering. Incremental rendering operates on the main thread using cooperative multitasking.",
    ],
    followUp: {
      question: 'How does React know when to yield back to the browser during incremental rendering?',
      answer: 'React uses a cooperative scheduling work loop: `while (workInProgress !== null && !shouldYield())`. In modern browsers, `shouldYield()` uses a 5ms deadline computed via `performance.now()` and posts a message via `MessageChannel` to yield without the 4ms throttling penalty of `setTimeout(0)`.',
    },
    interviewInsight: "Address the trade-off honestly: Incremental rendering actually increases total wall-clock execution time slightly due to scheduling overhead, but it drastically improves Core Web Vitals (specifically INP - Interaction to Next Paint) by eliminating main-thread freezes.",
    relatedConcepts: ['Time Slicing', 'MessageChannel vs setTimeout', 'Interaction to Next Paint (INP)', 'Cooperative Multitasking'],
  },
],
  "Fiber Internals": [
  {
    id: 'int-16',
    category: 'Fiber Internals',
    question: 'What is a Fiber node?',
    difficulty: 'Senior',
    shortAnswer: 'A Fiber node is a plain JavaScript object that represents a unit of work and a component instance in React\'s internal reconciliation engine.',
    mentalModel: `┌────────────────────────────────────────────────────────┐
│ Fiber Node (Heap Object)                               │
├────────────────────────────────────────────────────────┤
│ • tag: FunctionComponent (0)                           │
│ • key: "user-card"                                     │
│ • stateNode: null (or HTMLButtonElement for Host)      │
│ • child ────► Points to first child Fiber              │
│ • sibling ──► Points to next sibling Fiber             │
│ • return ───► Points to parent Fiber (return address)  │
│ • memoizedState ──► Head of Hooks singly-linked list   │
│ • alternate ──────► Counterpart in double-buffer tree  │
│ • flags: Placement | Update (bitmask side effects)     │
└────────────────────────────────────────────────────────┘`,
    deepDive: 'Conceptually, a Fiber is an individual stack frame with its own call stack reimplemented in heap memory. Before Fiber, React used the browser call stack recursively ("Stack Reconciler"), making work impossible to interrupt or pause. A Fiber contains pointers to its child, sibling, and parent (return), alongside component state (memoizedState), props (memoizedProps / pendingProps), update queues, and effect flags.',
    stepByStep: [
      "1. React instantiates a Fiber object (createFiber) when mounting a component or element.",
      "2. The node is wired into the hierarchy using singly-linked list pointers: child, sibling, return.",
      "3. Hook calls during render create hook records stored sequentially along the Fiber's memoizedState pointer.",
      "4. The alternate pointer links this Fiber to its counterpart in the alternate tree (current <-> workInProgress).",
      "5. When state changes, lanes are assigned to the Fiber to dictate execution priority.",
    ],
    practicalExample: "When debugging an unhandled exception in React devtools or error boundaries, `_reactInternals` or `_reactFiber` exposes this exact object structure on DOM nodes, allowing tools to inspect hook states, props, and component hierarchy in memory.",
    commonPitfalls: [
      'Confusing a Fiber with a DOM node or a React element. A React element is a transient lightweight description; a Fiber is persistent mutable internal infrastructure.',
    ],
    misconceptions: [
      "Assuming Fibers are created and destroyed on every render. Fibers are persistent objects reused across renders via double-buffering.",
      "Believing React Fiber is a web worker or multi-threaded background process. It is a single-threaded cooperative scheduler.",
    ],
    followUp: {
      question: 'Why is the parent pointer in a Fiber called "return" instead of "parent"?',
      answer: 'Because a Fiber is conceptually a virtual stack frame. Just as returning from a function call returns control to the caller frame on the call stack, completing work on a Fiber returns control to its parent Fiber in the work loop.',
    },
    interviewInsight: "Call out that the `return` pointer represents the return address of a function stack frame. Interviewers love this detail because it proves you understand the historical motivation: Fiber is a virtual call stack implemented in heap memory.",
    relatedConcepts: ['Virtual Call Stack', 'Double Buffering', 'Hook Linked Lists', 'Alternate Pointer'],
  },
  {
    id: 'int-17',
    category: 'Fiber Internals',
    question: 'Why did React introduce Fiber?',
    difficulty: 'Senior',
    shortAnswer: 'To enable incremental rendering, work prioritization, concurrency, and interruptible execution by moving the call stack off the browser\'s synchronous execution stack and into heap-allocated linked lists.',
    mentalModel: `[Legacy Stack Reconciler (React 15)]
JS Call Stack: [renderA -> renderB -> renderC -> renderD]
• Cannot be paused or yielded.
• If render takes 80ms, the main thread freezes for 80ms!

[Fiber Architecture (React 16+)]
while (workInProgress !== null && !shouldYield()) {
  performUnitOfWork(workInProgress);
}
• Can pause after any Fiber!
• Can yield to process urgent user keystrokes!
• Can discard or restart incomplete work!`,
    deepDive: 'With the legacy Stack Reconciler, rendering a deep component tree monopolized the main thread until the entire tree was traversed. User clicks and keyboard input had to wait in the event loop queue, causing input latency and dropped frames. Fiber turned rendering into an explicit cooperative loop: `while (workInProgress !== null && !shouldYield()) { performUnitOfWork(workInProgress); }`.',
    stepByStep: [
      "1. Stack Reconciler Era: Tree traversal relied on JavaScript function recursion. Once started, it ran to completion synchronously.",
      "2. The Problem: On large applications, synchronous reconciliation exceeded the 16ms frame budget, causing animation stutter and unresponsive inputs.",
      "3. Fiber Solution: Break reconciliation into units of work represented by Fiber nodes.",
      "4. The Work Loop: Instead of recursive function calls, React runs an iterative loop that checks remaining time using performance.now().",
      "5. Yielding & Resuming: When the deadline is reached, React yields back to the browser event loop and resumes at the next available idle slice.",
    ],
    practicalExample: "In an interactive dashboard with continuous real-time data streaming, high-frequency chart updates used to freeze the page. With Fiber, React processes chart updates in small 5ms time slices while responding to user drag, zoom, and clicks instantly without dropped frames.",
    commonPitfalls: [
      'Saying Fiber was introduced purely to make React faster. Its primary goal is scheduling and responsiveness, not raw computation speed.',
    ],
    misconceptions: [
      "Thinking Fiber made React code run faster in raw benchmarks. Fiber added slight object allocation overhead; its purpose was scheduling responsiveness, not raw speed.",
      "Believing Fiber works by utilizing multiple CPU threads via Web Workers. It is entirely single-threaded cooperative multitasking.",
    ],
    followUp: {
      question: 'What is the difference between cooperative scheduling and preemptive scheduling, and which does React use?',
      answer: 'Preemptive scheduling forcibly interrupts running code at any CPU instruction (like an OS scheduler). JavaScript is single-threaded and non-preemptive. React uses cooperative scheduling: React voluntarily checks `shouldYield()` between Fiber work units and yields the thread back to the browser.',
    },
    interviewInsight: "Emphasize: 'Fiber was not built to make React faster; it was built to make React schedulable.' Differentiating throughput from latency/responsiveness is a classic sign of an architect-level engineer.",
    relatedConcepts: ['Cooperative Scheduling', 'Time Slicing', 'Stack Reconciler', 'Main Thread Jitter'],
  },
  {
    id: 'int-18',
    category: 'Fiber Internals',
    question: 'What information does a Fiber node conceptually contain?',
    difficulty: 'Architect',
    shortAnswer: 'Instance identity (tag, key, type), Tree topology (child, sibling, return), State & Props (pendingProps, memoizedProps, memoizedState, updateQueue), and Scheduling & Effects (flags, subtreeFlags, lanes, childLanes, alternate).',
    deepDive: 'Key fields on a Fiber object include: 1) `tag`: Determines the component type (FunctionComponent, ClassComponent, HostComponent, SuspenseComponent, etc.), 2) `key` and `elementType`: Component identification, 3) `child`, `sibling`, `return`: Pointers forming the singly-linked tree structure, 4) `memoizedState`: Hook linked list for functions or state object for classes, 5) `alternate`: Pointer to its counterpart in the other buffer (current vs workInProgress), 6) `lanes`: Bitmask representing scheduled update priority, and 7) `flags`: Bitmask of side effects (Placement, Update, Deletion).',
    commonPitfalls: [
      'Assuming Fiber stores child components in a JavaScript array. Children are stored as a singly-linked list via child and sibling pointers to allow O(1) insertions/interruptions.',
    ],
  },
  {
    id: 'int-19',
    category: 'Fiber Internals',
    question: 'Explain the child, sibling and return relationships in a Fiber tree.',
    difficulty: 'Senior',
    shortAnswer: 'Instead of storing children in arrays, each Fiber points only to its first direct child (`child`), its next immediate sibling (`sibling`), and its parent (`return`).',
    deepDive: 'This data structure is a classic LCRS (Left-Child Right-Sibling) binary tree representation. React traverses this structure in depth-first order: 1) Go down to `child` (beginWork), 2) When reaching a leaf with no children, complete the node (completeWork) and traverse to `sibling`, 3) When there are no more siblings, return to parent (`return`). The name `return` signifies that completing this node returns execution to the parent stack frame.',
    commonPitfalls: [
      'Assuming "parent" is the property name; it is named "return" because it acts like the return address of a function call.',
    ],
  },
  {
    id: 'int-20',
    category: 'Fiber Internals',
    question: 'How does React represent a component instance internally?',
    difficulty: 'Senior',
    shortAnswer: 'As a Fiber node whose `memoizedState` property holds the head of a singly-linked list of hook objects (for function components) or an instance object (for class components).',
    deepDive: 'For a function component, React does not create an ES6 class instance. The Fiber itself serves as the persistent "instance". Its `memoizedState` points to `{ memoizedState: any, next: Hook | null, queue: UpdateQueue | null }`. When the function component re-runs, React walks this hook list in lockstep with hook invocations.',
    commonPitfalls: [
      'Believing React creates a new instance object for every function component render.',
    ],
  },
  {
    id: 'int-21',
    category: 'Fiber Internals',
    question: 'What is the difference between the current Fiber tree and the work-in-progress Fiber tree?',
    difficulty: 'Senior',
    shortAnswer: 'The current tree represents the nodes currently visible on screen (mounted in DOM). The work-in-progress (WIP) tree is the scratchpad tree being constructed or updated during the render phase.',
    deepDive: 'React maintains up to two Fiber trees simultaneously using double buffering. When state changes, React clones or reuses Fibers from the current tree to build the WIP tree. The DOM is not touched while the WIP tree is constructed. Once the render phase completes successfully, React commits the WIP tree to the DOM and swaps a single pointer (`fiberRoot.current = workInProgress`), making the WIP tree the new current tree instantly.',
    commonPitfalls: [
      'Assuming every render allocates an entirely new tree of objects from scratch.',
    ],
  },
  {
    id: 'int-22',
    category: 'Fiber Internals',
    question: 'Why does React maintain current and work-in-progress trees?',
    difficulty: 'Architect',
    shortAnswer: 'To ensure atomic commits and prevent partially-rendered, broken, or interrupted UI states from ever becoming visible to the user.',
    deepDive: 'If React mutated the current tree directly during rendering and was interrupted by a high-priority event or encountered an error, the UI would be left in an inconsistent, torn state. By building changes in an isolated work-in-progress tree, React can abort, pause, or retry renders freely. Only when the entire WIP tree is complete and valid does React commit mutations and flip the root pointer.',
    commonPitfalls: [
      'Failing to connect the two trees to the concept of UI consistency and tear prevention.',
    ],
  },
  {
    id: 'int-23',
    category: 'Fiber Internals',
    question: 'Explain double buffering in the context of React Fiber.',
    difficulty: 'Senior',
    shortAnswer: 'Double buffering is a graphics technique adapted by React where a back buffer (WIP tree) is prepared offscreen and swapped with the front buffer (current tree) in a single pointer reassignment.',
    deepDive: 'In game development, double buffering prevents screen tearing by drawing the next frame in an off-screen buffer before swapping video memory. React applies this to the DOM: all tree construction, diffing, and hook evaluation occur on the `workInProgress` buffer. Once ready, `root.current = workInProgress` commits the frame atomically. Crucially, Fibers are recycled: the previous current tree becomes the next render\'s workInProgress tree, minimizing garbage collection.',
    commonPitfalls: [
      'Thinking double buffering creates infinite memory overhead; React only ever maintains two copies (current and alternate) and pools them.',
    ],
  },
  {
    id: 'int-24',
    category: 'Fiber Internals',
    question: 'What happens conceptually when React creates a work-in-progress Fiber?',
    difficulty: 'Architect',
    shortAnswer: 'React calls `createWorkInProgress(current, pendingProps)`: it either reuses the existing `current.alternate` Fiber or instantiates a new Fiber if no alternate exists, copying over state and props.',
    deepDive: 'When work begins on a Fiber, React checks `current.alternate`. If null, it instantiates a new Fiber node and wires `workInProgress.alternate = current` and `current.alternate = workInProgress`. If `current.alternate` already exists from a prior render, React resets its effect flags, copies `pendingProps`, and reuses the existing object in memory. This object pooling prevents thousands of allocations per minute in interactive apps.',
    commonPitfalls: [
      'Believing React allocates brand new Fibers on every single re-render.',
    ],
  },
  {
    id: 'int-25',
    category: 'Fiber Internals',
    question: 'How does React associate work with an existing Fiber?',
    difficulty: 'Senior',
    shortAnswer: 'Through Lane bitmasks assigned to the Fiber\'s `lanes` and `childLanes` fields, and pending updates in its `updateQueue`.',
    deepDive: 'When `setState` is called, React determines the current render priority (e.g., SyncLane, InputContinuousLane, DefaultLane, TransitionLane). It sets the bit corresponding to that lane on the Fiber\'s `lanes` property. It then traverses up the `return` chain to the root, marking each ancestor\'s `childLanes` with that same bit. During reconciliation, React inspects `childLanes`: if an ancestor has no matching lane bits, React bails out of rendering that entire subtree in O(1) time.',
    commonPitfalls: [
      'Assuming React must traverse every single node in the tree to find where state changed.',
    ],
  },
  {
    id: 'int-26',
    category: 'Fiber Internals',
    question: 'What role does alternate play in Fiber?',
    difficulty: 'Senior',
    shortAnswer: '`alternate` is the bidirectional pointer connecting a `current` Fiber to its corresponding `workInProgress` Fiber (and vice-versa).',
    deepDive: 'Every Fiber has an `alternate` property: `current.alternate === workInProgress` and `workInProgress.alternate === current`. During rendering, React reads from `current` to compare previous props and state against incoming updates, and writes new calculations to `workInProgress`. At commit, switching trees is simply: `fiberRoot.current = workInProgress`.',
    commonPitfalls: [
      'Thinking `alternate` refers to component alternates or fallbacks; it is strictly the internal double-buffering twin node.',
    ],
  },
  {
    id: 'int-27',
    category: 'Fiber Internals',
    question: 'What are Fiber flags?',
    difficulty: 'Senior',
    shortAnswer: 'Fiber flags (formerly called effectTag) are bitmasks on a Fiber that indicate what mutations or lifecycle side effects need to be executed during the commit phase.',
    deepDive: 'Flags include `Placement` (insert new DOM node), `Update` (update DOM attributes or fire componentDidUpdate/useLayoutEffect), `Deletion` (remove DOM node and unmount effects), `Passive` (fire useEffect), `Ref` (attach/detach ref), and `Hydrating`. React uses 32-bit bitwise operators (`flags |= Placement; if (flags & Update)`) for high-performance checking. Ancestor Fibers also track `subtreeFlags` so React can skip subtrees with zero pending effects.',
    commonPitfalls: [
      'Thinking React mutates the DOM immediately when diffing discovers a change. It only sets a flag during render, deferring all mutations to commit.',
    ],
  },
  {
    id: 'int-28',
    category: 'Fiber Internals',
    question: 'What are React lanes?',
    difficulty: 'Principal',
    shortAnswer: 'Lanes are 31-bit integer bitmasks used in React 18+ to represent update priorities, batching groups, and task preemption capabilities.',
    deepDive: 'Before lanes, React used a single monotonic priority level (Expiration Times). Expiration times formed a linear scale, which made it impossible to represent non-consecutive batched updates or disentangle IO-bound tasks from CPU-bound tasks. Lanes represent priority as distinct bit channels (e.g., SyncLane: bit 1, InputContinuousHydrationLane, DefaultLane, TransitionLanes: bits 6-21, IdleLane). Bitwise operations (`lanes & -lanes`, `lanes | updateLane`) enable instant multi-task intersection, masking, and priority checking.',
    commonPitfalls: [
      'Describing priority as a simple number queue (e.g. priority 1, 2, 3); lanes are bitmasks that allow grouping disjoint sets of work.',
    ],
  },
  {
    id: 'int-29',
    category: 'Fiber Internals',
    question: 'How are lanes related to update priority?',
    difficulty: 'Principal',
    shortAnswer: 'Lower-numbered bits represent higher priority lanes (e.g., SyncLane for user input), while higher-numbered bits represent lower priority lanes (e.g., TransitionLane, OffscreenLane).',
    deepDive: 'Discrete user interactions (clicks, keypresses) get `SyncLane` or `InputContinuousLane`. Standard state updates outside transitions get `DefaultLane`. Updates wrapped in `startTransition` or `useTransition` get assigned one of the 16 `TransitionLanes`. Background offscreen content gets `IdleLane` or `OffscreenLane`. React\'s scheduler always selects the highest-priority non-empty lane (`getNextLanes`) to render first.',
    commonPitfalls: [
      'Confusing CPU scheduling priorities with network latency; lanes manage when React allocates main-thread JavaScript execution time.',
    ],
  },
  {
    id: 'int-30',
    category: 'Fiber Internals',
    question: 'What does React mean by scheduling work?',
    difficulty: 'Senior',
    shortAnswer: 'Scheduling work means notifying the React Scheduler package that a root has pending lane updates, requesting a browser callback (via MessageChannel / microtask) to execute work.',
    deepDive: 'React does not call `window.requestIdleCallback` because its browser implementation is inconsistent across platforms and has too low a frequency (up to 50ms). Instead, the React Scheduler uses a `MessageChannel` polyfill to schedule a macrotask yielding roughly every 5ms. The Scheduler maintains a min-heap of tasks sorted by expiration time, requesting browser slices until the lane is drained.',
    commonPitfalls: [
      'Assuming React uses requestAnimationFrame or requestIdleCallback under the hood.',
    ],
  },
  {
    id: 'int-31',
    category: 'Fiber Internals',
    question: 'How does Fiber allow React to pause rendering?',
    difficulty: 'Architect',
    shortAnswer: 'By breaking the work loop into small iterative steps and checking a deadline (`shouldYield()`) between processing individual Fiber nodes.',
    deepDive: 'In pseudocode: `function workLoopConcurrent() { while (workInProgress !== null && !shouldYield()) { performUnitOfWork(workInProgress); } }`. Because `workInProgress` is stored as an ongoing module-level pointer, if `shouldYield()` returns true (typically after 5ms of CPU time), React exits the loop, returns control to the browser to paint or handle events, and resumes from `workInProgress` in the next scheduled frame.',
    commonPitfalls: [
      'Thinking pausing happens in the middle of executing a single component function. A component function executes synchronously to completion; yielding occurs BETWEEN fiber nodes.',
    ],
  },
  {
    id: 'int-32',
    category: 'Fiber Internals',
    question: 'Can React pause rendering work before committing it?',
    difficulty: 'Senior',
    shortAnswer: 'Yes. The render phase is specifically designed to be pauseable and resumable. The commit phase, however, can never be paused once started.',
    deepDive: 'Pausing the render phase causes no UI anomalies because nothing has been written to the DOM. React simply yields the thread. If higher priority input occurs while paused, React can either complete the high-priority update first or discard the paused render entirely. Once React enters the commit phase, it mutates the DOM synchronously to prevent visual tearing.',
    commonPitfalls: [
      'Believing that DOM updates happen progressively chunk-by-chunk across frames.',
    ],
  },
  {
    id: 'int-33',
    category: 'Fiber Internals',
    question: 'What happens to partially completed work when React abandons a render?',
    difficulty: 'Architect',
    shortAnswer: 'The work-in-progress Fiber tree is simply dereferenced and abandoned; since no DOM mutations or commit-phase side effects occurred, garbage collection reclaims it cleanly.',
    deepDive: 'Because the render phase must be pure and free of external side effects, discarding partially rendered Fibers has zero observable consequence on the application state. When React restarts the render for a new priority, it sets `workInProgress = null` and begins building a fresh WIP tree from `root.current`, ensuring state consistency.',
    commonPitfalls: [
      'Writing side effects into component render bodies (like updating a global store or sending analytics), which corrupts state if the render is abandoned.',
    ],
  },
  {
    id: 'int-34',
    category: 'Fiber Internals',
    question: 'Why is Fiber considered an implementation detail?',
    difficulty: 'Senior',
    shortAnswer: 'Because React\'s public API (components, props, state, hooks) abstracts away Fiber completely. The React team can change internal algorithms without breaking user application code.',
    deepDive: 'Application developers never interact with `fiber.memoizedState`, `fiber.child`, or `fiber.lanes` directly. React guarantees behavior through its declarative contract (`useState`, `useEffect`, `React.memo`). While understanding Fiber provides immense diagnostic insight into performance, developers should never write code that relies on private `_reactInternals` or internal fiber shapes.',
    commonPitfalls: [
      'Attempting to access `element._reactInternals` in production code, which breaks across minor React versions.',
    ],
  },
  {
    id: 'int-35',
    category: 'Fiber Internals',
    question: 'How would understanding Fiber help diagnose a difficult performance problem?',
    difficulty: 'Principal',
    shortAnswer: 'It helps identify whether bottlenecks stem from excessive render passes, deep un-memoized tree traversal (beginWork bailouts failing), long commit phases from synchronous layout effects, or priority starvation.',
    deepDive: 'When diagnosing jank with the React Profiler or Chrome Performance tab, Fiber knowledge lets you read stack traces accurately: 1) High time in `beginWork` indicates excessive JS component evaluation that needs `React.memo` or children prop lifting, 2) Long `commitRoot` or `commitMutationEffects` indicates heavy DOM reflows, expensive canvas operations, or oversized DOM trees, 3) Long synchronous blocks inside `commitLayoutEffects` pinpoint blocking `useLayoutEffect` hooks, and 4) Flapping renders pinpoint conflicting lane priorities.',
    commonPitfalls: [
      'Blindly adding useMemo everywhere without checking whether the bottleneck is in render computation, layout effects, or DOM reflows.',
    ],
  },
],
  "Reconciliation & Diffing": [
  {
    id: 'int-36',
    category: 'Reconciliation & Diffing',
    question: "Explain React's reconciliation algorithm.",
    difficulty: 'Senior',
    shortAnswer: "React uses an O(n) heuristic diffing algorithm based on two assumptions: elements with different types produce completely different trees, and elements with identical 'key' props are persistent across renders.",
    deepDive: "Reconciliation compares the old Fiber tree with the newly returned React Elements tree level by level (breadth-first in sibling groups, depth-first in traversal). 1) If element type changes (`div` -> `span` or `ComponentA` -> `ComponentB`), React destroys the old subtree, unmounts all children, cleans up effects, and mounts a brand new Fiber. 2) If element type and key are identical, React reuses the Fiber and updates props. 3) For child lists, React uses keys to match existing Fibers, computing minimal insertions, moves, and deletions.",
    commonPitfalls: [
      'Assuming React diffs components by looking inside their internal state or logic; it diffs strictly based on element type and key.',
    ],
  },
  {
    id: 'int-37',
    category: 'Reconciliation & Diffing',
    question: 'How does React compare children between renders?',
    difficulty: 'Senior',
    shortAnswer: 'For single children, React checks if the key and element type match the existing child Fiber. For lists of children, React performs a two-pass algorithm comparing by index first, then using a key-indexed Map.',
    deepDive: 'When reconciling an array of children (`reconcileChildrenArray`), React uses two passes: 1) First pass: Iterates simultaneously over old Fibers and new elements as long as keys match and order is preserved. 2) Second pass (if order changed or items were inserted/removed): Converts remaining old Fibers into a JavaScript `Map<key | index, Fiber>`. It then iterates through remaining new elements, looking them up in the Map in O(1) time. Nodes found in the Map are marked with `Placement` (move) or `Update`, and unmatched old Fibers are deleted.',
    commonPitfalls: [
      'Thinking React does a nested loop O(n^2) search through children; it uses a Map lookup in the second pass for O(n) complexity.',
    ],
  },
  {
    id: 'int-38',
    category: 'Reconciliation & Diffing',
    question: 'Why are keys important during reconciliation?',
    difficulty: 'Senior',
    shortAnswer: 'Keys provide a persistent identity to React elements across renders, enabling React to match items after insertions, deletions, or reordering rather than mutating incorrect DOM nodes.',
    deepDive: 'Without keys, React matches children strictly by their array index. If the first item of a 10-item list is removed, index 0 receives the props of previous index 1, index 1 receives index 2, and the 10th DOM node is deleted. Uncontrolled DOM state (like input text or focus) and internal component state remain stuck to the index position, causing serious UI corruption.',
    commonPitfalls: [
      'Believing keys are passed as props to the child component; `key` is reserved for React\'s internal reconciler and is never accessible on `props.key`.',
    ],
  },
  {
    id: 'int-39',
    category: 'Reconciliation & Diffing',
    question: 'What happens when a list is rendered without stable keys?',
    difficulty: 'Senior',
    shortAnswer: 'React falls back to array indices as default keys, causing unnecessary DOM re-renders, input state contamination, lost focus, and broken CSS animations upon list mutations.',
    deepDive: 'If you prepended an item to a list of `<input>` elements without stable keys, the new item takes index 0. React compares old Fiber at index 0 with new item at index 0, sees the same type, updates the props, but preserves the DOM node and its internal typed text! The user sees their typed text stay in the first row while the labels shifted down.',
    commonPitfalls: [
      'Using `key={Math.random()}`. A randomly generated key on every render guarantees that EVERY item unmounts and remounts on every render, destroying performance and state.',
    ],
  },
  {
    id: 'int-40',
    category: 'Reconciliation & Diffing',
    question: 'Why is using an array index as a key sometimes dangerous?',
    difficulty: 'Senior',
    shortAnswer: 'Because array indices change whenever items are inserted, deleted, sorted, or filtered, decoupling state from the data entity it belongs to.',
    deepDive: 'When item index shifts: 1) Components with local `useState` keep their state attached to the position rather than the data object, 2) DOM elements like uncontrolled `<input>` or `<video>` retain state in the wrong row, 3) React.memo fails because the item at index N receives new props every time the list is sorted, nullifying memoization.',
    commonPitfalls: [
      'Assuming using an index as a key is fine for static-looking lists that later get a "sort by date" or "delete item" feature.',
    ],
    codeExample: `// DANGEROUS when items can be deleted or reordered:
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))}

// SAFE and predictable:
{todos.map(todo => (
  <TodoItem key={todo.id} todo={todo} />
))}`,
  },
  {
    id: 'int-41',
    category: 'Reconciliation & Diffing',
    question: 'When is using an index as a key acceptable?',
    difficulty: 'Senior',
    shortAnswer: 'Only when three conditions are strictly met: 1) The list and items are completely static (never reordered, filtered, or mutated), 2) Items have no IDs, and 3) Items have no local state or uncontrolled DOM inputs.',
    deepDive: 'Examples include a static pagination bar with numbers 1 to 5, a breadcrumb trail that only appends, or rendering static markdown paragraphs. In these cases, index keys produce identical reconciliation results to unique IDs with zero overhead.',
    commonPitfalls: [
      'Relying on index keys for lists that fetch from an API and support infinite scrolling or pagination prepends.',
    ],
  },
  {
    id: 'int-42',
    category: 'Reconciliation & Diffing',
    question: "What happens when a component's key changes?",
    difficulty: 'Senior',
    shortAnswer: "React treats the component as an entirely different element instance: it completely unmounts the old Fiber, tears down its DOM nodes, fires all effect cleanups, and mounts a fresh Fiber with initial state.",
    deepDive: "During `reconcileSingleElement` or array diffing, if `current.key !== element.key`, React marks the old Fiber for `Deletion` and allocates a brand new Fiber with initial `memoizedState`. Any `useEffect` cleanup for the previous key runs immediately during commit, followed by the new component's mount effects.",
    commonPitfalls: [
      'Overlooking that key changes force a full remount, which can be an intentional tool or an accidental performance killer.',
    ],
  },
  {
    id: 'int-43',
    category: 'Reconciliation & Diffing',
    question: 'How can changing a key intentionally reset component state?',
    difficulty: 'Senior',
    shortAnswer: "By binding a key to an entity identifier (e.g. `<UserProfile key={userId} />`), changing the ID automatically wipes all internal form state, draft state, and effects without complex reset useEffect hooks.",
    deepDive: "A common anti-pattern is writing `useEffect(() => { setFormData(initialData); }, [userId])`, which causes a flash of old data, an extra render cycle, and race conditions. Providing `key={userId}` forces React to discard the old component and instantiate a fresh one with initial state in a single atomic render pass.",
    commonPitfalls: [
      'Writing complex synchronization `useEffect` chains to reset state when a simple `key` prop on the component would achieve it cleanly and idiomatically.',
    ],
    codeExample: `// Idiomatic state reset via key:
function ProfilePage({ user }) {
  // When user.id changes, all internal draft state in EditProfileForm resets automatically!
  return <EditProfileForm key={user.id} initialUser={user} />;
}`,
  },
  {
    id: 'int-44',
    category: 'Reconciliation & Diffing',
    question: 'Why does React preserve state between renders?',
    difficulty: 'Senior',
    shortAnswer: 'React preserves state because state belongs to the Fiber position in the UI tree, not to the ephemeral JSX element returned by render.',
    deepDive: 'If React re-initialized state every render, interactive applications would be impossible—typing a single letter into an input would destroy the cursor position and reset the string. As long as a component remains at the same position in the tree with the same element type and key, React reuses its existing Fiber and preserves `fiber.memoizedState`.',
    commonPitfalls: [
      'Thinking state is stored inside the component function itself; the function is just a render recipe.',
    ],
  },
  {
    id: 'int-45',
    category: 'Reconciliation & Diffing',
    question: 'What determines whether React preserves or resets state?',
    difficulty: 'Architect',
    shortAnswer: 'State is preserved if and only if the element rendered at the same position in the tree hierarchy has the same element type (`===`) and the same `key`.',
    deepDive: 'React evaluates: `current.elementType === element.type && current.key === element.key`. If this is true, the Fiber is retained and state is preserved. If the element type changes (e.g., from `<div>` to `<section>`, or from `<Counter>` to `<Timer>`), or if the key changes, or if the component moved to a different tree branch, the Fiber is destroyed and all state resets.',
    commonPitfalls: [
      'Defining a component inside another component: `function Parent() { function Child() { ... } return <Child />; }`. This creates a new function reference (`element.type`) on EVERY render, destroying and recreating `Child` state continuously!',
    ],
    codeExample: `// BAD: Child loses all state on every Parent render!
function Parent() {
  function Child() { const [val, setVal] = useState(''); return <input value={val} />; }
  return <Child />;
}

// GOOD: Stable component reference
function Child() { const [val, setVal] = useState(''); return <input value={val} />; }
function Parent() { return <Child />; }`,
  },
  {
    id: 'int-46',
    category: 'Reconciliation & Diffing',
    question: 'How does React reconcile two different element types?',
    difficulty: 'Senior',
    shortAnswer: 'It completely destroys the entire old subtree (unmounting all nested components, running effect cleanups, removing DOM nodes) and mounts the new subtree from scratch.',
    deepDive: 'React does not attempt to match or reuse children across different parent types. If `<div><Counter /></div>` becomes `<section><Counter /></section>`, React destroys the `div` and its child `<Counter />`. Even though `<Counter />` is identical in both, its parent type changed, resetting `<Counter />` state to initial values.',
    commonPitfalls: [
      'Expecting children to preserve their state when their parent wrapper element changes from `div` to `article` or `main`.',
    ],
  },
  {
    id: 'int-47',
    category: 'Reconciliation & Diffing',
    question: 'Why can changing a div into a section affect reconciliation?',
    difficulty: 'Senior',
    shortAnswer: 'Because changing the tag name alters `element.type`, triggering full unmounting and state destruction of all nested components within that container.',
    deepDive: 'During `reconcileSingleElement`, React checks `if (current.elementType === element.type)`. Since "div" !== "section", the equality check fails. React attaches a `Deletion` flag to the `div` Fiber (which recursively unmounts all descendant Fibers and runs their cleanups) and attaches a `Placement` flag to create a brand new `section` DOM node and fresh descendant Fibers.',
    commonPitfalls: [
      'Conditional rendering wrappers: `{isArticle ? <article><Feed /></article> : <div><Feed /></div>}` wipes out `<Feed />` scroll position and state every time `isArticle` toggles.',
    ],
  },
  {
    id: 'int-48',
    category: 'Reconciliation & Diffing',
    question: 'What happens when children move inside a list?',
    difficulty: 'Architect',
    shortAnswer: 'With keys, React reorders existing DOM nodes using `node.insertBefore()` without destroying component state. Without keys, React mutates the props of every child in-place.',
    deepDive: 'With stable keys, React finds the existing Fiber in its key Map during the second pass. It sets the `Placement` flag on Fibers whose index order relative to previous siblings changed. In the commit phase, React calls host container `insertBefore(domNode, nextSiblingDomNode)` to move the actual DOM element with zero unmounting and zero lost state.',
    commonPitfalls: [
      'Assuming moving a DOM node in React unmounts it; with stable keys, `insertBefore` physically shifts the node in the DOM tree while preserving its JS instance and state.',
    ],
  },
  {
    id: 'int-49',
    category: 'Reconciliation & Diffing',
    question: "Why doesn't React perform a perfect tree diff?",
    difficulty: 'Senior',
    shortAnswer: "A generic minimum-edit-distance tree diffing algorithm has O(n^3) computational complexity. In an application with 1,000 components, calculating a perfect diff would require 1 billion operations per frame, completely freezing the browser.",
    deepDive: "Even modern state-of-the-art algorithms (like Zhang-Shasha or RTED) remain too slow for real-time 60fps rendering. React recognized that web UIs almost never transform a header into a footer or move nodes across wildly different subtrees. By accepting the heuristic that different component types produce different trees, React achieved O(n) linear performance with near-zero practical downsides.",
    commonPitfalls: [
      'Thinking React is mathematically suboptimal because it doesn\'t do a full diff. The heuristic matches 99.9% of UI patterns while maintaining 60fps.',
    ],
  },
  {
    id: 'int-50',
    category: 'Reconciliation & Diffing',
    question: 'What are the performance trade-offs of React\'s reconciliation strategy?',
    difficulty: 'Architect',
    shortAnswer: 'The O(n) heuristic optimizes for same-level changes and common UI patterns, but incurs penalties when moving subtrees across different parents or swapping container types.',
    deepDive: 'Trade-offs include: 1) Moving a child to a different parent unmounts and remounts it with lost state, 2) Poor key choices (like index keys) cause cascading re-renders, 3) Deep virtual DOM trees still require linear traversal of thousands of objects even when nothing changed, which is why memoization (`React.memo`) and the new React Compiler are necessary to prune subtrees early.',
    commonPitfalls: [
      'Believing reconciliation is free. Walking a 10,000-node virtual tree still takes 10-20ms of pure JavaScript time, which is why virtualization and memoization exist.',
    ],
  },
],
  "State & Update Queues": [
  {
    id: 'int-51',
    category: 'State & Update Queues',
    question: 'How does useState work conceptually?',
    difficulty: 'Senior',
    shortAnswer: '`useState` is a wrapper around `useReducer`. It stores value and an update queue on a Hook node attached to the component\'s Fiber, returning the memoized state and a bound dispatch function.',
    deepDive: 'Internally, `mountState` creates a `Hook` object: `{ memoizedState: initialValue, baseState: initialValue, baseQueue: null, queue: { pending: null, dispatch: null, lastRenderedReducer: basicStateReducer, lastRenderedState: initialValue }, next: null }`. When the returned setter is called, it creates an `Update` object, adds it as a circular linked list to `queue.pending`, and schedules a render on the Fiber.',
    commonPitfalls: [
      'Thinking useState is a magical browser feature rather than a plain JavaScript function reading from a global current Fiber dispatcher.',
    ],
  },
  {
    id: 'int-52',
    category: 'State & Update Queues',
    question: 'Where does hook state conceptually live?',
    difficulty: 'Senior',
    shortAnswer: 'Hook state lives on the Fiber node in heap memory, specifically on the `fiber.memoizedState` property as a singly-linked list of Hook objects.',
    deepDive: 'The component function itself has no internal memory—it is just a function that runs and returns. When `useState` is invoked, React accesses `currentlyRenderingFiber.memoizedState`. Each hook call advances a pointer (`workInProgressHook = workInProgressHook.next`). This is why hooks cannot be called conditionally: if the order shifts, a hook reads the wrong node in the linked list.',
    commonPitfalls: [
      'Assuming state is stored inside the component closure or in a module-level dictionary keyed by component name.',
    ],
  },
  {
    id: 'int-53',
    category: 'State & Update Queues',
    question: 'Why does calling a state setter not immediately change the state value visible to the current render?',
    difficulty: 'Senior',
    shortAnswer: 'Because state variables in a component function are immutable constants captured in that specific render\'s execution scope. The setter merely requests a future render with a new value.',
    deepDive: 'When a component executes, `const [count, setCount] = useState(0)` assigns the primitive value `0` to the local constant `count`. Calling `setCount(1)` queues an update for the NEXT render. The current JavaScript function continues running with its existing constant variable `count = 0`. State does not change until React calls the component function again on the next render pass.',
    commonPitfalls: [
      'Calling `setCount(count + 1)` and immediately writing `console.log(count)` expecting to see the incremented value.',
    ],
    codeExample: `function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // Still logs 0! Not 1.
  }
  return <button onClick={handleClick}>Increment</button>;
}`,
  },
  {
    id: 'int-54',
    category: 'State & Update Queues',
    question: "Explain React's state update queue.",
    difficulty: 'Architect',
    shortAnswer: "An update queue is a circular singly-linked list of Update objects (`queue.pending`) representing state transitions waiting to be processed during the render phase.",
    deepDive: "React uses a circular linked list for `queue.pending` where the pointer points to the LAST update, and `last.next` points to the FIRST update. This enables O(1) appending of new updates and O(1) retrieval of the head when processing. During rendering, React iterates through the updates, evaluates functions or replaces values, and calculates the new `memoizedState`.",
    commonPitfalls: [
      'Assuming React stores pending updates in a standard JavaScript Array (`push`/`shift`). A circular linked list avoids array reallocation and enables priority-based slicing.',
    ],
  },
  {
    id: 'int-55',
    category: 'State & Update Queues',
    question: 'What is the difference between setCount(count + 1) and setCount(c => c + 1)?',
    difficulty: 'Senior',
    shortAnswer: '`setCount(count + 1)` evaluates the new state based on the current render\'s stale snapshot value. `setCount(c => c + 1)` queues an updater function that receives the latest pending state from the update queue when processed.',
    deepDive: 'If you call `setCount(count + 1)` three times in a row inside an event handler where `count = 0`, all three calls pass `0 + 1 = 1`. React sets state to 1. If you call `setCount(c => c + 1)` three times, React chains three updater functions into the queue: 0 -> 1 -> 2 -> 3. The final computed state is 3.',
    commonPitfalls: [
      'Using direct value updates inside asynchronous intervals, event listeners, or multiple batch calls where state references may be stale.',
    ],
  },
  {
    id: 'int-56',
    category: 'State & Update Queues',
    question: 'Why can multiple functional state updates produce different results from multiple direct updates?',
    difficulty: 'Senior',
    shortAnswer: 'Direct updates overwrite each other because they all calculate against the same static render closure. Functional updates are pipelined sequentially by React\'s update processor.',
    deepDive: 'During `updateReducer`, React processes pending updates sequentially: `let newState = baseState; do { newState = update.hasEagerState ? update.eagerState : update.action(newState); } while (...)`. Because the result of one updater function is passed as the argument to the next updater function in the queue, changes accumulate accurately.',
    commonPitfalls: [
      'Believing that React batches functional updates differently than direct updates; both are batched into a single re-render, but their mathematical accumulation differs.',
    ],
  },
  {
    id: 'int-57',
    category: 'State & Update Queues',
    question: 'What happens when multiple state updates are queued before rendering?',
    difficulty: 'Senior',
    shortAnswer: 'React batches them into the Fiber\'s update queue and processes them in a single render pass, applying transitions or skipping redundant renders if the final result equals the current state.',
    deepDive: 'When multiple setters fire within the same browser event turn or promise microtask, React marks the Fiber lane once. When the scheduler flushes the lane, the component executes just once. It loops through all updates in the queue, computes the final accumulated state, and returns the final React elements for reconciliation.',
    commonPitfalls: [
      'Assuming that calling 5 setters in a row causes the component to render 5 times.',
    ],
  },
  {
    id: 'int-58',
    category: 'State & Update Queues',
    question: 'What is an eager state update?',
    difficulty: 'Principal',
    shortAnswer: 'An eager update is an internal optimization where React pre-computes the new state immediately at the moment `setState` is called (outside the render phase) to check if rendering can be bailed out entirely.',
    deepDive: 'If a component has no other pending work on its Fiber queue, React eagerly evaluates the reducer/action right inside the `dispatchSetState` call: `const eagerState = lastRenderedReducer(currentState, action)`. If `Object.is(eagerState, currentState)` is true, React bails out immediately without scheduling any render work with the scheduler. This saves significant CPU cycles.',
    commonPitfalls: [
      'Not knowing why calling `setCount(0)` when `count` is already 0 doesn\'t even invoke the component function.',
    ],
  },
  {
    id: 'int-59',
    category: 'State & Update Queues',
    question: 'Why can React sometimes skip rendering after a state update?',
    difficulty: 'Senior',
    shortAnswer: 'If the eager state update determines that the new state is identical to the current state using `Object.is` equality, React skips scheduling a render pass entirely.',
    deepDive: 'There is a second bailout: even if an eager bailout cannot occur (e.g. other updates were queued), during the render phase React checks if `Object.is(memoizedState, nextState)`. If so, and if props and context have not changed, React bails out of rendering the component\'s children by reusing the current child Fiber.',
    commonPitfalls: [
      'Assuming that calling `setState` ALWAYS runs the component function at least once.',
    ],
  },
  {
    id: 'int-60',
    category: 'State & Update Queues',
    question: 'How does React determine whether a state update changes state?',
    difficulty: 'Senior',
    shortAnswer: 'React compares the previous state with the new state using the JavaScript `Object.is` algorithm.',
    deepDive: '`Object.is` differs from strict equality `===` in two edge cases: 1) `Object.is(+0, -0)` is `false` (whereas `+0 === -0` is `true`), and 2) `Object.is(NaN, NaN)` is `true` (whereas `NaN === NaN` is `false`). For all other primitives, it acts like `===`. For objects, arrays, and functions, it compares referential memory identity.',
    commonPitfalls: [
      'Claiming React uses deep equality or lodash `isEqual` to compare state.',
    ],
  },
  {
    id: 'int-61',
    category: 'State & Update Queues',
    question: 'What happens when a state setter receives the same primitive value?',
    difficulty: 'Senior',
    shortAnswer: 'React bails out: it does not re-render the component or its children and performs no DOM work.',
    deepDive: 'Note on one edge case: If you update state from A -> B (which renders), and during that render or immediately after, an update sets state back from B -> A, React might render the component body one extra time before bailing out of child rendering and DOM commits. But subsequent identical updates bail out completely without executing the component body.',
    commonPitfalls: [
      'Worrying about guarding primitive state updates with `if (val !== currentVal) setState(val)`; React already does this automatically via `Object.is`.',
    ],
  },
  {
    id: 'int-62',
    category: 'State & Update Queues',
    question: 'How does React compare state values?',
    difficulty: 'Senior',
    shortAnswer: 'By reference using `Object.is(previousState, nextState)`. It never inspects object properties or performs deep traversal.',
    deepDive: 'Because JavaScript objects are compared by memory reference, two distinct objects `{ name: "Alex" }` and `{ name: "Alex" }` are never equal (`Object.is` returns `false`). Conversely, mutating an object in place keeps the same memory reference, causing `Object.is` to return `true` and React to miss the update entirely.',
    commonPitfalls: [
      'Believing React compares shallow keys of state objects like it does for props in React.memo.',
    ],
  },
  {
    id: 'int-63',
    category: 'State & Update Queues',
    question: 'Why is mutating an object stored in state problematic?',
    difficulty: 'Senior',
    shortAnswer: 'Mutating an object modifies its data in-place without changing its reference. React\'s `Object.is` check sees identical references, causing it to bail out and drop UI updates.',
    deepDive: 'Furthermore, in concurrent mode, React may render multiple versions of UI simultaneously using different state snapshots. Mutating objects in-place corrupts past and concurrent snapshots, causing inconsistent UI tearing, broken time-travel debugging, and unpredictable memoization bugs.',
    commonPitfalls: [
      'Writing `user.name = "Sam"; setUser(user);` and wondering why the component does not re-render.',
    ],
  },
  {
    id: 'int-64',
    category: 'State & Update Queues',
    question: 'What happens if state is mutated and then passed back to its setter?',
    difficulty: 'Senior',
    shortAnswer: 'The setter receives the exact same object reference as the previous state. React\'s eager bailout check sees `Object.is(prev, next) === true` and completely skips re-rendering.',
    deepDive: 'The UI remains frozen on old values. Even if a re-render is later triggered by an unrelated state change, components relying on prop comparisons (`React.memo`) will still skip re-rendering because their previous and next prop references are identical, permanently corrupting child views.',
    commonPitfalls: [
      'Thinking `setUser({ ...user })` is just a stylistic convention; creating a new object reference is mathematically required for React\'s change detection to trigger.',
    ],
  },
  {
    id: 'int-65',
    category: 'State & Update Queues',
    question: 'How would you debug unexpectedly stale state?',
    difficulty: 'Architect',
    shortAnswer: 'Check for stale closures in asynchronous callbacks or event handlers, verify the useEffect dependency array, inspect whether state was mutated in-place, and switch to functional state updates.',
    deepDive: 'Structured debugging process: 1) Verify if the setter uses functional updates: replace `setItems([...items, item])` with `setItems(prev => [...prev, item])`. 2) Check if `useEffect` or `useCallback` omitted the state from its dependency array. 3) Check if an object was mutated before `setState`. 4) Use React DevTools Profiler to trace which render provided the value. 5) If using an async timer or websocket callback, store the latest value in a `useRef` that is updated on every render.',
    commonPitfalls: [
      'Silencing ESLint \'react-hooks/exhaustive-deps\' with `// eslint-disable-line` instead of addressing the closure problem.',
    ],
  },
],
  "Hooks Internals": [
  {
    id: 'int-66',
    category: 'Hooks Internals',
    question: 'How does React associate a useState call with its state?',
    difficulty: 'Senior',
    shortAnswer: 'Through execution order and a pointer that traverses a singly-linked list of Hook records on the currently rendering Fiber node.',
    deepDive: 'React maintains an internal module-level pointer (`workInProgressHook`). On the first render, each hook call allocates a new `Hook` object and appends it to `fiber.memoizedState`. On subsequent renders, each hook call advances the pointer to `workInProgressHook.next` and reads its saved `memoizedState`. There are no names, keys, or IDs involved.',
    commonPitfalls: [
      'Assuming React inspects the variable name on the left-hand side (`const [foo, setFoo]`); variable names are minified away during compilation and are completely invisible to JavaScript runtime.',
    ],
  },
  {
    id: 'int-67',
    category: 'Hooks Internals',
    question: 'Why must hooks be called in the same order?',
    difficulty: 'Senior',
    shortAnswer: 'Because React matches hook calls to their stored state in the Fiber linked list purely by their chronological call index during render.',
    deepDive: 'If render #1 executes Hook A, Hook B, Hook C, the Fiber stores a list `[A] -> [B] -> [C]`. If render #2 skips Hook B because of an `if` statement, the second hook executed is Hook C. React aligns it with node `[B]`, returning Hook B\'s data to Hook C! This corrupts state types, invokes wrong reducers, and causes crashes.',
    commonPitfalls: [
      'Believing the Rules of Hooks are an arbitrary stylistic preference rather than an absolute mathematical constraint of the linked-list storage model.',
    ],
  },
  {
    id: 'int-68',
    category: 'Hooks Internals',
    question: 'What happens if hooks are called conditionally?',
    difficulty: 'Senior',
    shortAnswer: 'The hook linked list becomes misaligned. Later hooks read the wrong state records, dispatchers trigger incorrect reducers, and React eventually throws "Rendered fewer (or more) hooks than expected".',
    deepDive: 'When conditional logic skips a hook, subsequent hooks receive the state, effects, and refs intended for preceding hooks. At the end of the render, React verifies `workInProgressHook.next === null`. If there are remaining unread hooks from the previous render, or if more hooks were called than exist in the list, React throws an invariant error.',
    commonPitfalls: [
      'Attempting to early-return before all hooks have been called: `if (!data) return null; const [count, setCount] = useState(0);`. This violates the rules because when `data` arrives, the hook count increases!',
    ],
  },
  {
    id: 'int-69',
    category: 'Hooks Internals',
    question: "Explain the concept of React's hook linked list.",
    difficulty: 'Architect',
    shortAnswer: "A component's hooks form a singly-linked list where each Hook node contains `{ memoizedState, baseState, baseQueue, queue, next }`. `next` points to the subsequent hook called in the component.",
    deepDive: "On `fiber.memoizedState`, the head of the list resides. When the component function begins, `workInProgressHook` points to head. Calling `useState` returns `workInProgressHook.memoizedState`. Calling `useEffect` pushes an effect object to the hook's `memoizedState` and schedules a passive effect. The pointer moves forward: `workInProgressHook = workInProgressHook.next`. This uniform structure handles all hooks identically.",
    commonPitfalls: [
      'Confusing `fiber.memoizedState` for a class component (which is a plain object) with that of a function component (which is the head of the Hook linked list).',
    ],
  },
  {
    id: 'int-70',
    category: 'Hooks Internals',
    question: 'How does React identify the first hook of a component?',
    difficulty: 'Senior',
    shortAnswer: 'When React calls a component function in `renderWithHooks`, it sets `currentlyRenderingFiber` and initializes `workInProgressHook = null`. The first hook call detects this null pointer and reads directly from `fiber.memoizedState`.',
    deepDive: 'In `renderWithHooks(current, workInProgress, Component, props)`: React swaps the global `ReactCurrentDispatcher.current` to either `HooksDispatcherOnMount` or `HooksDispatcherOnUpdate`. The first hook call sets `fiber.memoizedState = firstHook` (on mount) or sets `workInProgressHook = current.memoizedState` (on update).',
    commonPitfalls: [
      'Thinking hooks find their component by traversing up the call stack; React explicitly sets a module-level global variable before invoking the component function.',
    ],
  },
  {
    id: 'int-71',
    category: 'Hooks Internals',
    question: "Why can't React identify hooks using variable names?",
    difficulty: 'Senior',
    shortAnswer: "In JavaScript, variable names only exist in source code. Build tools minify variables to single letters (`a`, `b`), and runtime execution cannot reflect the variable name receiving a function's return value.",
    deepDive: "When you write `const [user, setUser] = useState()`, the function `useState()` is executed FIRST, and its return value is subsequently destructured into `user`. Inside `useState()`, JavaScript provides no mechanism to know what variable names will receive its return tuple. Furthermore, minifiers rename `user` to `e` or `t`, making string-based identification impossible.",
    commonPitfalls: [
      'Suggesting that React could inspect `arguments.callee` or AST strings at runtime without immense performance degradation.',
    ],
  },
  {
    id: 'int-72',
    category: 'Hooks Internals',
    question: "Why can't hooks be called inside loops?",
    difficulty: 'Senior',
    shortAnswer: 'Because if the loop length changes between renders (e.g. iterating over dynamic array items), the total number and order of hook calls changes, breaking the linked list alignment.',
    deepDive: 'If a loop runs 3 times on render #1, 3 hook nodes are created. If an item is added and the loop runs 4 times on render #2, the 4th hook does not exist in the linked list. If items are removed, unconsumed hook records cause React to throw "Rendered fewer hooks than expected". Instead, extract the loop item into a separate child component that calls the hook at its top level.',
    commonPitfalls: [
      'Calling `useFetch` or `useQuery` inside a `.map()` callback instead of extracting an `<ItemView>` component.',
    ],
  },
  {
    id: 'int-73',
    category: 'Hooks Internals',
    question: "Why can't hooks be called inside nested functions?",
    difficulty: 'Senior',
    shortAnswer: "Nested functions (event handlers, callbacks, setTimeout) run after the component's render phase has finished, when `currentlyRenderingFiber` is null and the dispatcher is inactive.",
    deepDive: "Hooks can only be evaluated synchronously while the component function itself is running. When an event handler or timer fires later, the component is not rendering. Calling a hook there invokes the `ContextOnlyDispatcher`, which throws: 'Invalid hook call. Hooks can only be called inside the body of a function component.'",
    commonPitfalls: [
      'Calling `useState` or `useNavigate` inside an `onClick` handler or utility function.',
    ],
  },
  {
    id: 'int-74',
    category: 'Hooks Internals',
    question: 'How does React distinguish mounting from updating a hook?',
    difficulty: 'Architect',
    shortAnswer: 'React swaps the global `ReactCurrentDispatcher.current` object between `HooksDispatcherOnMount` and `HooksDispatcherOnUpdate` based on whether `current === null` on the Fiber.',
    deepDive: 'React implements hooks via the Strategy Pattern. During mount (`current === null || current.memoizedState === null`), `ReactCurrentDispatcher.current = HooksDispatcherOnMount`. Here, `useState` calls `mountState`. During re-renders, `ReactCurrentDispatcher.current = HooksDispatcherOnUpdate`, where `useState` points to `updateState`. Outside rendering, it points to `ContextOnlyDispatcher` which throws errors.',
    commonPitfalls: [
      'Assuming `useState` contains an internal `if (isMounted)` check on every call. It delegates directly to different function implementations entirely.',
    ],
  },
  {
    id: 'int-75',
    category: 'Hooks Internals',
    question: 'What happens conceptually when useState is called for the first time?',
    difficulty: 'Senior',
    shortAnswer: '`mountState` executes: it resolves the initial value (invoking function initializers if passed), allocates a new Hook record, initializes an empty update queue, and creates a bound dispatch function.',
    deepDive: 'The dispatch function is created with `dispatchSetState.bind(null, currentlyRenderingFiber, queue)`. This binding permanently associates the setter with that specific Fiber and queue, which is why setters retain stable referential identity across the lifetime of the component.',
    commonPitfalls: [
      'Not knowing that functional initializers (`useState(() => expensiveCalculation())`) only execute during `mountState` and are completely ignored during updates.',
    ],
  },
  {
    id: 'int-76',
    category: 'Hooks Internals',
    question: 'What happens when the same useState call executes during a later render?',
    difficulty: 'Senior',
    shortAnswer: '`updateState` -> `updateReducer` runs: it retrieves the existing Hook node from the current Fiber, processes any pending actions in `queue.pending`, calculates the new state, and returns it.',
    deepDive: '`updateWorkInProgressHook` clones the current hook node to the workInProgress Fiber. If `queue.pending` contains updates, React loops through them, applying actions to `baseState`. It updates `hook.memoizedState` to the computed value and returns `[hook.memoizedState, dispatch]`. The `dispatch` reference returned is identical to the one created on mount.',
    commonPitfalls: [
      'Assuming React re-evaluates the initial value passed to `useState(initialVal)` on subsequent renders; the argument is completely ignored after mount.',
    ],
  },
  {
    id: 'int-77',
    category: 'Hooks Internals',
    question: 'How does useReducer differ conceptually from useState?',
    difficulty: 'Senior',
    shortAnswer: 'In React\'s implementation, `useState` is literally implemented using `useReducer`. `useState` simply uses a built-in basic state reducer: `(state, action) => typeof action === "function" ? action(state) : action`.',
    deepDive: '`mountState` calls `mountReducer(basicStateReducer, initialState)`. `useReducer` gives you explicit control over the reducer function, which is cleaner for complex state machines, interrelated fields, or when passing `dispatch` down instead of numerous callbacks. Structurally inside Fiber, both produce identical `Hook` records.',
    commonPitfalls: [
      'Thinking `useReducer` has higher overhead or different Fiber mechanics than `useState`; they share the exact same underlying queue implementation.',
    ],
  },
  {
    id: 'int-78',
    category: 'Hooks Internals',
    question: 'Why are custom hooks possible without special runtime syntax?',
    difficulty: 'Senior',
    shortAnswer: 'Because custom hooks are simply plain JavaScript functions that call built-in React hooks. They execute within the caller\'s active component render context.',
    deepDive: 'When a component calls `useCustomHook()`, the JavaScript engine jumps into that function\'s body. Any `useState` or `useEffect` calls inside it execute while `currentlyRenderingFiber` is set to the calling component. The hooks are appended directly to the calling component\'s Fiber hook list. No compiler magic or runtime registration is needed.',
    commonPitfalls: [
      'Thinking custom hooks have their own separate Fiber nodes or independent component lifecycles; they share the host component\'s Fiber.',
    ],
  },
  {
    id: 'int-79',
    category: 'Hooks Internals',
    question: 'How does a custom hook share logic without sharing state?',
    difficulty: 'Senior',
    shortAnswer: 'Each component that calls a custom hook executes its own separate hook calls, allocating distinct Hook records on its own independent Fiber.',
    deepDive: 'If Component A and Component B both call `useWindowSize()`, Component A\'s Fiber allocates state on its own `fiber.memoizedState`, and Component B allocates on its separate `fiber.memoizedState`. They share the algorithm and behavioral recipe, but their state allocations and closures are completely isolated.',
    commonPitfalls: [
      'Confusing custom hooks with global state singletons like React Context or Zustand; custom hooks create private instance state by default.',
    ],
  },
  {
    id: 'int-80',
    category: 'Hooks Internals',
    question: 'What do the Rules of Hooks protect React from?',
    difficulty: 'Architect',
    shortAnswer: 'They guarantee that hook linked lists remain deterministic across renders, preventing state corruption, mismatched refs, missed effect cleanups, and memory leaks.',
    deepDive: 'The Rules (call at top level only, call from React functions only) ensure: 1) Deterministic 1-to-1 correspondence between hook call order and Fiber linked list nodes, 2) Safe execution within an active render phase where `currentlyRenderingFiber` is defined, and 3) Compliance with concurrent rendering guarantees where renders can pause and restart safely.',
    commonPitfalls: [
      'Thinking ESLint plugin `eslint-plugin-react-hooks` is optional; it is the vital static analysis tool protecting the application from runtime Fiber corruption.',
    ],
  },
],
  "Closures & Stale State": [
  {
    id: 'int-81',
    category: 'Closures & Stale State',
    question: 'Explain why React developers encounter stale closures.',
    difficulty: 'Senior',
    shortAnswer: 'Because JavaScript functions retain lexical references to variable bindings created during the specific render pass in which the function was instantiated.',
    deepDive: 'In React, every render is a separate invocation of a function component with its own local `const` variables (props, state). When an asynchronous callback, timer, or unmemoized effect is created during render #1, it closes over render #1\'s snapshot variables. If subsequent renders change those variables, the old callback continues pointing to the original lexical scope in memory until re-instantiated.',
    commonPitfalls: [
      'Believing variables in React are mutable references that update in place; React state variables are constant values unique to each render snapshot.',
    ],
  },
  {
    id: 'int-82',
    category: 'Closures & Stale State',
    question: 'Why does a callback capture state from a particular render?',
    difficulty: 'Senior',
    shortAnswer: 'JavaScript functions capture their enclosing lexical environment at declaration time. Since state variables are scoped to a specific component function invocation, the callback closes over that invocation\'s snapshot.',
    deepDive: 'When `Counter` renders, `const count = 0;` is declared. A function `() => console.log(count)` created inside that execution context holds a closure pointer to that specific scope environment. When `setCount(1)` causes a re-render, a totally new execution context is created where `const count = 1;`. The original callback was never rebound and still references the first environment.',
    commonPitfalls: [
      'Assuming JavaScript has dynamic scope; closures in JS are strictly lexical and permanent.',
    ],
  },
  {
    id: 'int-83',
    category: 'Closures & Stale State',
    question: 'If an interval is created during render A, which state does its callback see?',
    difficulty: 'Senior',
    shortAnswer: "It sees render A's state forever, as long as the interval was not cleared and recreated on subsequent renders.",
    deepDive: 'If `useEffect(() => { const id = setInterval(() => { console.log(count); }, 1000); return () => clearInterval(id); }, [])` is mounted with `count = 0`, the interval callback executes every second logging `0`, even if `count` in the UI reaches 100. The callback was created in the scope of render A and never recreated.',
    commonPitfalls: [
      'Omitting `count` from the dependency array and wondering why the interval counter stays at 0.',
    ],
  },
  {
    id: 'int-84',
    category: 'Closures & Stale State',
    question: 'Why can setTimeout(() => console.log(count), 1000) log an old value?',
    difficulty: 'Senior',
    shortAnswer: 'Because the timer callback closes over the value of `count` from the render pass in which `setTimeout` was called, ignoring subsequent state updates during the 1000ms delay.',
    deepDive: 'Even if the user clicks a button three times during that 1000ms (triggering three new renders where count becomes 1, 2, 3), the timer callback scheduled in the initial click handler retains its closure over `count = 0`. When the timer fires from the macrotask queue, it logs `0`.',
    commonPitfalls: [
      'Expecting asynchronous timers to automatically reflect synchronous React state changes made after the timer was queued.',
    ],
  },
  {
    id: 'int-85',
    category: 'Closures & Stale State',
    question: 'How does the dependency array of useEffect relate to closures?',
    difficulty: 'Senior',
    shortAnswer: 'The dependency array tells React when to discard the old effect closure, execute its cleanup, and create a fresh effect closure capturing the latest render\'s values.',
    deepDive: 'When a value listed in the dependency array changes (via `Object.is`), React schedules the effect to re-run. During the commit phase, it calls the previous effect\'s cleanup function, then invokes the new effect callback. This new callback closes over the newly rendered state and props, eliminating stale closures for all declared dependencies.',
    commonPitfalls: [
      'Treating the dependency array as a trigger mechanism rather than an honest declaration of closed-over reactive values.',
    ],
  },
  {
    id: 'int-86',
    category: 'Closures & Stale State',
    question: 'Why can omitting dependencies produce stale data?',
    difficulty: 'Senior',
    shortAnswer: 'Because React will skip recreating the effect or callback, forcing it to keep executing the old function closure holding outdated state and props.',
    deepDive: 'If an effect uses `userId` and `filter` but declares `[]`, React only creates the closure once during mount. When the user selects a new `userId`, the effect does not re-run, or if an ongoing subscription inside it receives an event, it will process that event using the stale `userId` from mount.',
    commonPitfalls: [
      'Lying to the dependency array to prevent infinite loops instead of stabilizing dependencies with `useCallback` or `useMemo`.',
    ],
  },
  {
    id: 'int-87',
    category: 'Closures & Stale State',
    question: "Why doesn't React automatically update closures?",
    difficulty: 'Architect',
    shortAnswer: 'JavaScript language semantics do not allow external engines to re-bind or mutate closed-over lexical variables of an existing function instance.',
    deepDive: 'Once a JavaScript function is created, its lexical environment record is sealed by the JS engine spec. React cannot reach into a function object and mutate what `count` points to. The only way in JavaScript to provide fresh values to a function is to instantiate a new function or have the function read from a mutable container object (like `ref.current`).',
    commonPitfalls: [
      'Thinking React has compiler control over the JavaScript runtime\'s lexical closure mechanics.',
    ],
  },
  {
    id: 'int-88',
    category: 'Closures & Stale State',
    question: 'Compare useRef and state for solving stale-value problems.',
    difficulty: 'Senior',
    shortAnswer: '`useRef` provides a stable object container whose `.current` property can be mutated without causing re-renders, allowing old closures to read the latest value.',
    deepDive: 'A closure over a primitive `const count = 0` is locked to `0`. A closure over a ref `const countRef = useRef(0)` captures the `countRef` object reference, which never changes. When the callback runs later, reading `countRef.current` dereferences the object at that exact moment in time, returning the latest mutated value. Use `useRef` when callbacks must access latest state without triggering re-renders or effect re-subscriptions.',
    commonPitfalls: [
      'Using `useRef` for values that need to be displayed in JSX; mutating `ref.current` does not notify React or trigger a render.',
    ],
    codeExample: `function ChatRoom() {
  const [text, setText] = useState('');
  const textRef = useRef(text);

  // Keep ref synchronized on every render
  useEffect(() => {
    textRef.current = text;
  });

  useEffect(() => {
    const socket = connect();
    socket.on('message', () => {
      // Always reads latest text even with empty dependency array!
      sendDraft(textRef.current);
    });
    return () => socket.disconnect();
  }, []); // Stable connection
}`,
  },
  {
    id: 'int-89',
    category: 'Closures & Stale State',
    question: 'When is a functional state updater preferable to adding a dependency?',
    difficulty: 'Senior',
    shortAnswer: 'Whenever the effect or callback only needs to compute the next state from the previous state, avoiding unnecessary effect re-runs or callback invalidations.',
    deepDive: 'Example: an interval that increments `count`. If you write `setCount(count + 1)`, you must add `count` to the dependency array, which tears down and recreates the `setInterval` timer every single second. If you write `setCount(prev => prev + 1)`, the callback has zero dependencies on `count`, allowing the interval to remain stable and alive across renders.',
    commonPitfalls: [
      'Re-subscribing to expensive websockets or event listeners on every state change because of direct state setter calls.',
    ],
  },
  {
    id: 'int-90',
    category: 'Closures & Stale State',
    question: 'Why can adding a function to an effect dependency array cause repeated effects?',
    difficulty: 'Senior',
    shortAnswer: 'Because unmemoized functions declared inside a component body are instantiated as brand new object references on every single render.',
    deepDive: 'Even if the function body is identical, `() => {} !== () => {}` in JavaScript. React compares dependencies using `Object.is`. Since the function reference changes on every render, the effect cleanup and effect run on every render. If the effect updates state, this creates an immediate infinite render loop.',
    commonPitfalls: [
      'Declaring helper functions inside the component body without `useCallback` and passing them into `useEffect` dependencies.',
    ],
  },
  {
    id: 'int-91',
    category: 'Closures & Stale State',
    question: 'How does useCallback interact with stale closures?',
    difficulty: 'Senior',
    shortAnswer: '`useCallback` caches a function instance across renders. If its dependency array is incomplete, it locks in a stale closure permanently.',
    deepDive: '`useCallback(fn, deps)` does NOT magically keep the function up to date. If `deps` do not change, `useCallback` returns the exact same cached function reference from previous renders. If that cached function accessed a state variable not listed in `deps`, it executes with that stale value forever.',
    commonPitfalls: [
      'Assuming `useCallback` automatically refreshes its closure without updating its dependencies.',
    ],
  },
  {
    id: 'int-92',
    category: 'Closures & Stale State',
    question: 'Can useCallback prevent stale closures?',
    difficulty: 'Senior',
    shortAnswer: 'No. `useCallback` is an optimization tool to preserve referential identity, not a mechanism to prevent stale closures. In fact, misuse of `useCallback` is one of the most common causes of stale closures.',
    deepDive: 'To prevent stale closures with `useCallback`, you MUST honestly include all reactive values in its dependency array. But doing so creates a new function reference whenever dependencies change, defeating the optimization for downstream children unless combined with functional state updaters or refs.',
    commonPitfalls: [
      'Wrapping every function in `useCallback(fn, [])` thinking it prevents re-renders; it creates severe stale closure bugs.',
    ],
  },
  {
    id: 'int-93',
    category: 'Closures & Stale State',
    question: 'How can an event handler access the latest state without becoming stale?',
    difficulty: 'Senior',
    shortAnswer: 'Standard inline event handlers in JSX (`onClick={handleClick}`) are automatically recreated on each render and always capture the latest state. For un-recreated handlers (e.g. event bus, timers), use a `useRef` mirror.',
    deepDive: 'When passed directly to a JSX element `<button onClick={() => alert(count)}>`, the button gets a fresh handler whenever `count` changes. The only time event handlers become stale is when they are passed to memoized children with empty `useCallback`, attached to `window.addEventListener` in an effect with `[]`, or passed into long-lived third-party libraries.',
    commonPitfalls: [
      'Over-optimizing event handlers with `useCallback` when the child is an unmemoized native HTML element like `<button>`.',
    ],
  },
  {
    id: 'int-94',
    category: 'Closures & Stale State',
    question: 'What problem are Effect Events designed to address?',
    difficulty: 'Principal',
    shortAnswer: 'Effect Events (via experimental `useEffectEvent`) decouple non-reactive logic from reactive effect synchronization, allowing effects to read latest state without re-running when that state changes.',
    deepDive: 'A classic dilemma: An effect should re-synchronize when `roomId` changes, but also wants to log the user\'s current `theme` to analytics. If `theme` is in `deps`, changing the theme reconnects the chat socket (bad!). If `theme` is omitted, the log has a stale closure (bad!). `useEffectEvent` creates a non-reactive function that always sees latest props/state but does NOT trigger effect re-execution when called inside an effect.',
    commonPitfalls: [
      'Calling an Effect Event during render; Effect Events can only be called inside `useEffect`.',
    ],
    codeExample: `// Using useEffectEvent pattern:
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme); // Always reads latest theme
  });

  useEffect(() => {
    const socket = createConnection(roomId);
    socket.on('connect', () => onConnected());
    return () => socket.disconnect();
  }, [roomId]); // Only reconnects when roomId changes!
}`,
  },
  {
    id: 'int-95',
    category: 'Closures & Stale State',
    question: 'Diagnose a production bug caused by a stale closure in an asynchronous callback.',
    difficulty: 'Architect',
    shortAnswer: 'A modal form submits data after an asynchronous validation or network delay, but submits the form values from when the submit button was clicked rather than what the user subsequently edited.',
    deepDive: 'Scenario: `const handleSubmit = async () => { const valid = await validateAsync(); if (valid) await postAPI({ name, age }); }`. If the user types into the inputs during the `validateAsync()` pause, `name` and `age` are locked to the snapshot at handler invocation. Fixes: 1) Disable inputs while submitting, 2) Use a ref to store current form values, or 3) Use form actions / FormData which read the live DOM state directly.',
    commonPitfalls: [
      'Not disabling UI inputs during in-flight async operations that rely on component closure snapshots.',
    ],
  },
],
  "Effects & Synchronization": [
  {
    id: 'int-96',
    category: 'Effects & Synchronization',
    question: 'What is the purpose of useEffect?',
    difficulty: 'Senior',
    shortAnswer: '`useEffect` synchronizes a React component with an external system outside of React\'s rendering paradigm (e.g., browser DOM APIs, websockets, network requests, third-party widgets).',
    deepDive: 'Effects are an escape hatch from the pure, declarative world of React to the imperative world of external APIs. They execute asynchronously after the browser paints, ensuring they do not block user interface updates or frame rendering.',
    commonPitfalls: [
      'Using `useEffect` as a lifecycle event listener (like `componentDidMount` or `componentDidUpdate`) instead of thinking in terms of continuous synchronization.',
    ],
  },
  {
    id: 'int-97',
    category: 'Effects & Synchronization',
    question: 'Why should effects synchronize React with external systems?',
    difficulty: 'Senior',
    shortAnswer: 'Because React internally handles data-to-UI rendering declaratively. Using effects to manage React\'s own internal data flow causes redundant renders, laggy UI updates, and race conditions.',
    deepDive: 'When state changes, React computes the new UI during render. If you use an effect to update another piece of state in response, you trigger an entire secondary render pass, an extra DOM update cycle, and a potential flash of intermediate content. External systems (timers, sockets, window listeners, analytical beacons) are what cannot be managed during pure rendering.',
    commonPitfalls: [
      'Using `useEffect` to copy props into state or synchronize two pieces of state that could be derived directly during render.',
    ],
  },
  {
    id: 'int-98',
    category: 'Effects & Synchronization',
    question: 'What should NOT normally be implemented using useEffect?',
    difficulty: 'Senior',
    shortAnswer: '1) Transforming data for rendering (use derived state/useMemo), 2) Handling user interactions (use event handlers), 3) Resetting state on prop change (use key), 4) Chains of state updates.',
    deepDive: 'Anti-patterns: 1) `useEffect(() => setFullName(first + " " + last), [first, last])`: calculate `const fullName = first + " " + last;` during render! 2) `useEffect(() => { if (submitted) sendAnalytics(); }, [submitted])`: send the analytic event in the `onSubmit` handler directly. 3) `useEffect(() => { setSelection(null); }, [items])`: derive selection or use key.',
    commonPitfalls: [
      'Treating `useEffect` as a reactive watch statement (like Vue `watch` or MobX `reaction`).',
    ],
  },
  {
    id: 'int-99',
    category: 'Effects & Synchronization',
    question: 'Why is derived state implemented through effects often an anti-pattern?',
    difficulty: 'Senior',
    shortAnswer: 'It causes cascading re-renders, flashes of stale UI content, unnecessary complexity, and subtle desynchronization bugs.',
    deepDive: 'If you calculate derived state in an effect: 1) Component renders with stale derived state, 2) DOM commits, 3) Effect runs and calls `setDerivedState`, 4) Component re-renders a second time with the updated value. Calculating derived values inline during render executes in microseconds during the first pass with zero extra renders and zero intermediate flashes.',
    commonPitfalls: [
      'Thinking `useState` + `useEffect` is required to compute filtered arrays or formatted labels.',
    ],
    codeExample: `// ANTI-PATTERN:
const [filtered, setFiltered] = useState([]);
useEffect(() => {
  setFiltered(items.filter(i => i.active));
}, [items]); // Extra render cycle + flash

// IDIOMATIC & PERFORMANT:
const filtered = useMemo(() => items.filter(i => i.active), [items]);`,
  },
  {
    id: 'int-100',
    category: 'Effects & Synchronization',
    question: 'Explain the lifecycle of an effect.',
    difficulty: 'Senior',
    shortAnswer: 'Mount: component renders -> DOM commits -> browser paints -> effect runs. Update: component re-renders -> DOM commits -> browser paints -> cleanup of previous effect runs -> new effect runs. Unmount: cleanup runs.',
    deepDive: 'Crucially, cleanup runs BEFORE the next effect execution, not just on unmount. If an effect runs on render #1 with `id = 1` and on render #2 with `id = 2`, the execution order is: 1) Render #1 -> Paint -> Effect(1), 2) Render #2 -> Paint -> Cleanup(1) -> Effect(2), 3) Unmount -> Cleanup(2). This guarantees symmetry.',
    commonPitfalls: [
      'Assuming cleanup only runs when the component leaves the screen (unmounts).',
    ],
  },
  {
    id: 'int-101',
    category: 'Effects & Synchronization',
    question: 'When does React run effect cleanup?',
    difficulty: 'Senior',
    shortAnswer: '1) Prior to re-running the effect on a subsequent render when dependencies change, and 2) When the component unmounts from the DOM.',
    deepDive: 'In React Fiber, during the commit phase of a re-render, React traverses the passive effect list. It first fires `destroy()` (the cleanup return function) of the previous Fiber\'s effect using the previous render\'s closure. Afterward, it invokes `create()` (the effect callback) for the new Fiber.',
    commonPitfalls: [
      'Not returning a cleanup function for intervals or event listeners, leading to duplicated subscriptions every time a dependency updates.',
    ],
  },
  {
    id: 'int-102',
    category: 'Effects & Synchronization',
    question: 'Why does cleanup run before the next effect?',
    difficulty: 'Senior',
    shortAnswer: 'To stop and clean up the previous synchronization with the old parameters before starting a new synchronization with new parameters, preventing resource leaks and race conditions.',
    deepDive: 'Consider a chat connection: if you switch from `roomId = "general"` to `roomId = "random"`, running cleanup first ensures you disconnect from "general" before opening a connection to "random". If cleanup only ran at unmount, you would have simultaneous overlapping connections to both rooms.',
    commonPitfalls: [
      'Expecting the new effect to execute before the old effect cleans up.',
    ],
  },
  {
    id: 'int-103',
    category: 'Effects & Synchronization',
    question: 'Why can effects appear to run twice in development?',
    difficulty: 'Senior',
    shortAnswer: 'React Strict Mode in development automatically mounts, unmounts, and re-mounts every component to verify that effect cleanups are properly symmetrical and resilient to remounting.',
    deepDive: 'In React 18+, features like fast Back/Forward cache navigation and offscreen component caching (e.g. keeping tab state preserved when hidden) require components to safely remount with existing state. Strict Mode runs: Setup -> Cleanup -> Setup immediately on mount. If your cleanup correctly undoes setup, the UI looks identical. If your effect leaks, duplicate listeners or API calls expose the bug immediately.',
    commonPitfalls: [
      'Using a `useRef(false)` flag to prevent the second effect from running in development, which defeats the entire purpose of Strict Mode validation.',
    ],
  },
  {
    id: 'int-104',
    category: 'Effects & Synchronization',
    question: 'What does Strict Mode intentionally expose?',
    difficulty: 'Senior',
    shortAnswer: '1) Missing effect cleanups (e.g. unclosed websockets, unremoved event listeners), 2) Impure render functions that mutate external state, and 3) Deprecated API usages.',
    deepDive: 'Strict Mode intentionally double-invokes: component render functions, `useState`/`useReducer` initializer functions, and effect setup/cleanup cycles. In production, double-invoking does NOT occur. It exists strictly in local development as a stress test for concurrent features.',
    commonPitfalls: [
      'Treating Strict Mode double invocation as a production bug.',
    ],
  },
  {
    id: 'int-105',
    category: 'Effects & Synchronization',
    question: "Why shouldn't developers \"fix\" Strict Mode using flags?",
    difficulty: 'Architect',
    shortAnswer: 'Adding flags like `const didRun = useRef(false); if (didRun.current) return;` disables cleanup validation, guaranteeing that your application will leak memory or break when features like Offscreen or React Navigation remount the component.',
    deepDive: 'When a user navigates between tabs in modern React or when future Offscreen components are revealed, React remounts without discarding component state. If you used a `didRun` flag, the component will NOT initialize its subscriptions on remount, leaving a dead UI. The correct fix is always to implement the symmetrical cleanup (e.g., `controller.abort()`, `socket.disconnect()`, `clearInterval()`).',
    commonPitfalls: [
      'Using `hasFetched.current` to suppress duplicate API requests in development instead of using AbortController or React Query.',
    ],
  },
  {
    id: 'int-106',
    category: 'Effects & Synchronization',
    question: 'What is the difference between useEffect and useLayoutEffect?',
    difficulty: 'Senior',
    shortAnswer: '`useEffect` runs asynchronously AFTER the browser has painted pixels to the screen. `useLayoutEffect` runs synchronously AFTER DOM mutations but BEFORE the browser paints.',
    deepDive: '`useLayoutEffect` blocks the browser from painting until its callback completes. This allows developers to measure DOM layout (`getBoundingClientRect()`, `scrollHeight`) and synchronously mutate the DOM or state before the user ever sees the frame, preventing visual layout flicker. `useEffect` is non-blocking and preferred for 95% of tasks.',
    commonPitfalls: [
      'Using `useLayoutEffect` for data fetching or analytics, which freezes main-thread browser rendering.',
    ],
  },
  {
    id: 'int-107',
    category: 'Effects & Synchronization',
    question: 'When would useLayoutEffect actually be necessary?',
    difficulty: 'Senior',
    shortAnswer: 'When computing DOM measurements to adjust styles, positioning tooltips/popovers relative to anchor elements, or synchronous scroll position restoration before the paint.',
    deepDive: 'If you position a tooltip using `useEffect`: 1) Tooltip renders at (0, 0), 2) Browser paints tooltip at top-left, 3) `useEffect` measures anchor and updates state to (250px, 120px), 4) Browser paints again. The user sees a visible flicker. With `useLayoutEffect`, the measurement and re-positioning occur before the first paint, rendering the tooltip in the correct position instantly.',
    commonPitfalls: [
      'Thinking `useLayoutEffect` works on the server during SSR. It throws a warning because the server has no DOM layout engine; use `useEffect` or guard with browser checks.',
    ],
  },
  {
    id: 'int-108',
    category: 'Effects & Synchronization',
    question: 'What are the risks of excessive useLayoutEffect usage?',
    difficulty: 'Senior',
    shortAnswer: 'It blocks the browser main thread, delays visual painting, degrades First Contentful Paint (FCP) and Interaction to Next Paint (INP), and creates noticeable UI stutter.',
    deepDive: 'Because JavaScript execution in `useLayoutEffect` blocks the browser Compositor and Layout passes, any long-running code, heavy loops, or cascading state updates directly block user frame updates. If a layout effect takes 50ms, the browser is completely frozen for 3 full frame intervals.',
    commonPitfalls: [
      'Defaulting to `useLayoutEffect` "just in case" to mimic `componentDidMount` timing.',
    ],
  },
  {
    id: 'int-109',
    category: 'Effects & Synchronization',
    question: 'What happens if an effect updates state on every render?',
    difficulty: 'Senior',
    shortAnswer: 'It triggers an infinite render loop. React will detect this runaway loop and crash with "Too many re-renders. React limits the number of renders to prevent an infinite loop."',
    deepDive: 'Render -> Commit -> Effect -> setState -> Render -> Commit -> Effect -> setState. React Fiber maintains a nested update counter (`RE_RENDER_LIMIT = 25` in dev/prod). If 25 cascading renders are queued synchronously without reaching steady state, React throws an invariant violation to protect the browser tab from freezing permanently.',
    commonPitfalls: [
      'Passing an unmemoized object or array into the dependency array while updating state inside the effect.',
    ],
  },
  {
    id: 'int-110',
    category: 'Effects & Synchronization',
    question: 'How do dependency arrays work?',
    difficulty: 'Senior',
    shortAnswer: 'On every render, React compares each element in the dependency array with its counterpart from the previous render using `Object.is`. If any element differs, the effect is marked for execution.',
    deepDive: 'If no dependency array is passed (`undefined`), the effect runs after every single render. If an empty array `[]` is passed, the effect runs once after initial mount. If an array with elements `[a, b]` is passed, React checks `Object.is(prevA, nextA) && Object.is(prevB, nextB)`. If any check returns false, the effect schedule flag is set.',
    commonPitfalls: [
      'Passing functions or objects declared in render into the array without realizing they fail `Object.is` on every single render.',
    ],
  },
  {
    id: 'int-111',
    category: 'Effects & Synchronization',
    question: 'Are dependency arrays optimization hints or correctness requirements?',
    difficulty: 'Principal',
    shortAnswer: 'They are strict correctness requirements. Treating them as optimization hints causes stale closures, missed subscriptions, and broken concurrency.',
    deepDive: 'React\'s programming model requires that if an effect references a reactive value (prop, state, or derived variable), that value MUST be listed in dependencies. When you omit a dependency, you break the synchronization guarantee. The React Compiler explicitly assumes dependencies represent absolute semantic correctness, generating memoization boundaries based on this invariant.',
    commonPitfalls: [
      'Thinking "I only want this effect to run on mount so I will omit props.id". That is an imperative mental model; if `props.id` changes, your component is desynchronized.',
    ],
  },
  {
    id: 'int-112',
    category: 'Effects & Synchronization',
    question: 'Why does React compare dependencies using Object.is?',
    difficulty: 'Senior',
    shortAnswer: '`Object.is` is fast (O(1)), handles `NaN` and `+0/-0` correctly, and avoids the catastrophic performance cost of deep-object traversal on every frame.',
    deepDive: 'Deep equality checking (`lodash.isEqual`) requires recursively traversing object graphs, which can easily take 10-50ms on complex domain objects or cause stack overflows on circular references. `Object.is` performs a single memory pointer comparison in sub-nanosecond time.',
    commonPitfalls: [
      'Expecting React to compare the contents of an array or object in dependency arrays.',
    ],
  },
  {
    id: 'int-113',
    category: 'Effects & Synchronization',
    question: 'Why does an object dependency frequently cause effects to re-run?',
    difficulty: 'Senior',
    shortAnswer: 'Because object literals or object transformations created during render produce brand new memory references on every render pass, failing `Object.is` equality every time.',
    deepDive: '`{ filter: "active" } !== { filter: "active" }`. To resolve this: 1) Deconstruct primitive properties: `[options.filter]` instead of `[options]`, 2) Memoize the object with `useMemo`, or 3) Move the object definition outside the component if it is static.',
    commonPitfalls: [
      'Passing options objects like `style={{ color: "red" }}` or `{ headers: { ... } }` into custom hooks or effects.',
    ],
  },
  {
    id: 'int-114',
    category: 'Effects & Synchronization',
    question: 'How should asynchronous work be cancelled when a component unmounts?',
    difficulty: 'Senior',
    shortAnswer: 'By utilizing the standard `AbortController` API inside the effect, aborting the signal in the cleanup function, or using a boolean cancellation flag.',
    deepDive: '`AbortController` cancels the actual network request at the browser HTTP stack level, saving bandwidth and preventing wasteful server processing. When the request rejects with `AbortError`, catch and ignore it. Alternatively, an `ignore = true` boolean in cleanup prevents state setters from running after unmount.',
    commonPitfalls: [
      'Calling `setState` on unmounted components; while React 18 no longer warns about this memory leak, setting state on discarded components is still wasteful work.',
    ],
    codeExample: `useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });

  return () => controller.abort(); // Cancels HTTP request!
}, [query]);`,
  },
  {
    id: 'int-115',
    category: 'Effects & Synchronization',
    question: 'Design a robust effect for fetching data when a query changes.',
    difficulty: 'Architect',
    shortAnswer: 'A robust data fetching effect must handle: 1) Race conditions, 2) Network cancellation via AbortController, 3) Loading and error states, and 4) Cleanup on unmount/re-query.',
    deepDive: 'Race condition scenario: User searches "cat" (slow query, returns in 500ms), then quickly types "dog" (fast query, returns in 100ms). Without cancellation, "dog" arrives first and updates the UI, followed by "cat" arriving second and overwriting the UI with the wrong results! AbortController aborts "cat" immediately when "dog" is queried.',
    commonPitfalls: [
      'Failing to handle race conditions in search inputs where older network responses overwrite newer responses.',
    ],
  },
],
  "Referential Equality & Memoization": [
  {
    id: 'int-116',
    category: 'Referential Equality & Memoization',
    question: 'What does referential equality mean in JavaScript?',
    difficulty: 'Senior',
    shortAnswer: 'Referential equality means comparing whether two variables point to the exact same location in computer memory, rather than whether their contents look identical.',
    deepDive: 'For primitive types (number, string, boolean, null, undefined, symbol), equality compares value directly (`5 === 5`). For reference types (objects, arrays, functions), equality compares memory addresses (`{} === {}` is `false`). Two distinct object literals are stored in different heap memory allocations, so `===` always evaluates to `false`.',
    commonPitfalls: [
      'Assuming two objects with identical keys and values evaluate to `true` with `===`.',
    ],
  },
  {
    id: 'int-117',
    category: 'Referential Equality & Memoization',
    question: 'Why does referential equality matter in React?',
    difficulty: 'Senior',
    shortAnswer: 'Because React relies on referential equality (`Object.is`) across its entire architecture: for state bailout, dependency checking in `useEffect`/`useMemo`/`useCallback`, and prop checking in `React.memo`.',
    deepDive: 'If a parent component re-renders, any object, array, or function created inside its body receives a brand new memory reference. If passed down as props to a `React.memo` child, the child\'s shallow prop comparison fails, defeating memoization and forcing the child to re-render. Referential equality is the gatekeeper of React\'s rendering optimizations.',
    commonPitfalls: [
      'Focusing only on primitive values when debugging why a memoized child component continues to re-render.',
    ],
  },
  {
    id: 'int-118',
    category: 'Referential Equality & Memoization',
    question: 'How does React.memo determine whether props changed?',
    difficulty: 'Senior',
    shortAnswer: '`React.memo` performs a shallow comparison of the previous props object and the next props object using `Object.is` across each key.',
    deepDive: 'In `shallowEqual(prevProps, nextProps)`: 1) It checks `Object.is(prevProps, nextProps)` (returns true if identical reference), 2) Verifies both are non-null objects, 3) Verifies `Object.keys(prevProps).length === Object.keys(nextProps).length`, 4) Loops through keys checking `Object.is(prevProps[key], nextProps[key])`. If any key fails, the component re-renders.',
    commonPitfalls: [
      'Believing `React.memo` performs a deep comparison of nested object properties.',
    ],
  },
  {
    id: 'int-119',
    category: 'Referential Equality & Memoization',
    question: 'What comparison does React.memo use by default?',
    difficulty: 'Senior',
    shortAnswer: 'Shallow equality (`shallowEqual`), which compares each top-level key using `Object.is`. You can override this by passing a custom `arePropsEqual(prevProps, nextProps)` comparator.',
    deepDive: 'A custom comparator `React.memo(Component, arePropsEqual)` must return `true` if props are equal (to skip rendering) and `false` if props are different (to render). Note that this is the INVERSE of `shouldComponentUpdate`, which returns `true` to render and `false` to skip.',
    commonPitfalls: [
      'Confusing the return boolean of `arePropsEqual` with `shouldComponentUpdate`.',
    ],
  },
  {
    id: 'int-120',
    category: 'Referential Equality & Memoization',
    question: 'When does React.memo provide no meaningful benefit?',
    difficulty: 'Senior',
    shortAnswer: '1) When the component receives unstable object/function props that change every render anyway, 2) When the component is lightweight and its render cost is less than the cost of shallow prop diffing, 3) When the component re-renders because its own internal state or consumed Context changes.',
    deepDive: '`React.memo` has a computational cost: on every parent render, it iterates through all props to check equality. For a simple component like `<span>{label}</span>`, prop comparison takes longer than simply rendering the VDOM element. Furthermore, `React.memo` only guards against parent re-renders; it does not stop renders triggered by the component\'s own `useState` or consumed `useContext`.',
    commonPitfalls: [
      'Wrapping every component in `React.memo` by default ("premature memoization").',
    ],
  },
  {
    id: 'int-121',
    category: 'Referential Equality & Memoization',
    question: 'Why can passing an inline object defeat memoization?',
    difficulty: 'Senior',
    shortAnswer: 'Passing `<MemoChild config={{ theme: "dark" }} />` creates a new object instance in memory on every parent render pass, guaranteeing that `prevProps.config !== nextProps.config`.',
    deepDive: 'Even if the contents `{ theme: "dark" }` are identical, the memory reference is new every single time the parent executes. `React.memo`\'s shallow comparison immediately returns `false` and renders the child. To fix this, stabilize the object with `useMemo` or move it outside the component.',
    commonPitfalls: [
      'Passing inline style objects `style={{ marginTop: 8 }}` to memoized children.',
    ],
  },
  {
    id: 'int-122',
    category: 'Referential Equality & Memoization',
    question: 'Why can passing an inline function defeat memoization?',
    difficulty: 'Senior',
    shortAnswer: 'Because `<MemoChild onClick={() => doSomething()} />` allocates a new function object reference on every parent render, causing `shallowEqual` to fail every time.',
    deepDive: 'Functions in JavaScript are first-class objects compared by memory identity. Every time the parent component executes its body, a new function instance is allocated in the JS engine. To preserve memoization, the handler must be wrapped in `useCallback` with stable dependencies, or passed via a context dispatch pattern.',
    commonPitfalls: [
      'Wrapping a child in `React.memo` but continuing to pass inline arrow functions as callbacks.',
    ],
  },
  {
    id: 'int-123',
    category: 'Referential Equality & Memoization',
    question: 'Explain useMemo.',
    difficulty: 'Senior',
    shortAnswer: '`useMemo` caches the result of a calculation between renders, only recomputing the value when one of its specified dependencies changes reference.',
    deepDive: 'On initial render, `mountMemo` runs the calculation function and stores `[result, dependencies]` on the Hook\'s `memoizedState`. On subsequent renders, `updateMemo` compares current dependencies with stored dependencies using `Object.is`. If all match, it returns the cached result without running the calculation function; if any differ, it re-runs the calculation and caches the new result.',
    commonPitfalls: [
      'Using `useMemo` for cheap operations like filtering a 5-item array; the overhead of allocating the closure, dependency array, and comparison checks exceeds the calculation cost.',
    ],
  },
  {
    id: 'int-124',
    category: 'Referential Equality & Memoization',
    question: 'Explain useCallback.',
    difficulty: 'Senior',
    shortAnswer: '`useCallback` caches a function definition across renders, preserving its referential memory identity until its specified dependencies change.',
    deepDive: '`useCallback` does not execute the function. It stores the function instance itself on `hook.memoizedState`. Its primary purpose is to provide stable function references to memoized children (`React.memo`) or to dependency arrays of `useEffect` hooks.',
    commonPitfalls: [
      'Believing `useCallback` makes the function run faster when called. It only stabilizes the function\'s reference identity between renders.',
    ],
  },
  {
    id: 'int-125',
    category: 'Referential Equality & Memoization',
    question: 'What is the actual difference between useMemo and useCallback?',
    difficulty: 'Senior',
    shortAnswer: '`useMemo` calls the passed function and caches its RETURN VALUE. `useCallback` does NOT call the function; it caches the FUNCTION INSTANCE itself.',
    deepDive: 'Internally in React source code (`react-reconciler`), `useCallback(fn, deps)` is literally implemented as: `return useMemo(() => fn, deps);`. They share the same underlying Hook structure, differing only in whether the factory is invoked.',
    commonPitfalls: [
      'Writing `const fn = useMemo(() => handleClick, [deps])` instead of `useCallback(handleClick, [deps])`.',
    ],
  },
  {
    id: 'int-126',
    category: 'Referential Equality & Memoization',
    question: 'Is useCallback(fn, deps) conceptually similar to useMemo(() => fn, deps)?',
    difficulty: 'Senior',
    shortAnswer: 'Yes, they are semantically and functionally identical. In React\'s internal source code, `mountCallback` and `updateCallback` store the function directly, which is equivalent to `useMemo(() => fn, deps)`.',
    deepDive: 'Both store `[value, deps]` in `hook.memoizedState`. `useCallback` exists as a specialized API solely because caching function references is such a frequent requirement in React that writing an extra arrow function wrapper `() => fn` was unnecessarily verbose.',
    commonPitfalls: [
      'Thinking `useCallback` uses a different caching algorithm or thread model than `useMemo`.',
    ],
  },
  {
    id: 'int-127',
    category: 'Referential Equality & Memoization',
    question: 'When should you avoid useMemo?',
    difficulty: 'Senior',
    shortAnswer: '1) When calculations are cheap (e.g. basic string manipulation, small array operations), 2) When dependencies change on almost every render, 3) When the result is not passed to a memoized child or effect dependency.',
    deepDive: 'Memory and CPU benchmarking shows that modern JS engines can execute tens of thousands of basic operations in under 0.1ms. `useMemo` itself incurs overhead: allocating a wrapper closure, creating the dependency array on every render, and running an array loop of `Object.is` comparisons. If the computation is trivial, `useMemo` is strictly slower.',
    commonPitfalls: [
      'Wrapping every variable assignment in `useMemo` (e.g. `const full = useMemo(() => first + last, [first, last])`).',
    ],
  },
  {
    id: 'int-128',
    category: 'Referential Equality & Memoization',
    question: 'When should you avoid useCallback?',
    difficulty: 'Senior',
    shortAnswer: 'When passing callbacks to native HTML elements (`<button onClick={...}>`), unmemoized children, or when the callback\'s dependencies change on every render anyway.',
    deepDive: 'Native DOM elements do not have a `React.memo` check. Passing an unmemoized function to `<button onClick={onClick}>` has virtually zero cost—React simply overwrites the internal event listener property. Adding `useCallback` here introduces Hook allocation overhead with zero performance savings.',
    commonPitfalls: [
      'Wrapping event handlers in `useCallback` when passed to standard HTML elements like `<input>` or `<button>`.',
    ],
  },
  {
    id: 'int-129',
    category: 'Referential Equality & Memoization',
    question: 'Can excessive memoization make an application slower?',
    difficulty: 'Architect',
    shortAnswer: 'Yes. Every memoization hook allocates memory for dependency arrays, retains closures in heap memory (hindering garbage collection), and adds comparison loop overhead to every render pass.',
    deepDive: 'When thousands of components excessively memoize trivial values, the cumulative overhead of dependency checking and memory pressure can exceed the time saved from skipped renders. Furthermore, if a dependency was unstable, you pay both the cost of memoization overhead AND the full cost of re-rendering.',
    commonPitfalls: [
      'Assuming memoization is free; it is a trade-off trading memory and comparison time to save computation time.',
    ],
  },
  {
    id: 'int-130',
    category: 'Referential Equality & Memoization',
    question: 'Does useMemo guarantee that a value will never be recalculated?',
    difficulty: 'Senior',
    shortAnswer: 'No. React\'s official documentation states that `useMemo` is a performance optimization, not a semantic guarantee. In future versions or under memory pressure, React may "forget" memoized values.',
    deepDive: 'React reserves the right to release cached values if device memory is constrained and recalculate them on the next render. Therefore, code should always function correctly if `useMemo` is replaced by a direct function call, with `useMemo` used only to tune frame performance.',
    commonPitfalls: [
      'Relying on `useMemo` for side effects or application correctness (e.g. generating unique IDs or single-use tokens).',
    ],
  },
  {
    id: 'int-131',
    category: 'Referential Equality & Memoization',
    question: 'Should application correctness depend on useMemo?',
    difficulty: 'Senior',
    shortAnswer: 'Never. Application correctness must be preserved if `useMemo` were completely stripped out. If deleting `useMemo` breaks functionality, the architecture is flawed.',
    deepDive: 'If you rely on `useMemo` to prevent an infinite loop, or to ensure an operation runs exactly once, you are abusing a performance hook as a state-machine or lifecycle tool. Use `useRef` for persistent mutable values and `useEffect` for synchronization.',
    commonPitfalls: [
      'Using `useMemo` to instantiate non-idempotent instances (like an active websocket client or analytics session).',
    ],
  },
  {
    id: 'int-132',
    category: 'Referential Equality & Memoization',
    question: 'How does React Compiler change the memoization discussion?',
    difficulty: 'Principal',
    shortAnswer: 'React Compiler (React Forget) automatically analyzes JavaScript data flow at build time and injects fine-grained memoization instructions, eliminating the need for manual `useMemo`, `useCallback`, and `React.memo`.',
    deepDive: 'The compiler uses Static Single Assignment (SSA) form and effect analysis to understand reactive dependencies. It generates a memoization cache array (`useMemoCache`) that caches individual expressions, JSX elements, and function blocks automatically. Developers can write idiomatic, clean JavaScript without polluting components with dependency arrays and memoization boilerplate.',
    commonPitfalls: [
      'Assuming the compiler makes understanding referential equality obsolete; code must still follow the Rules of React and avoid side effects in render for the compiler to optimize safely.',
    ],
  },
  {
    id: 'int-133',
    category: 'Referential Equality & Memoization',
    question: 'How would you identify unnecessary memoization in a large codebase?',
    difficulty: 'Architect',
    shortAnswer: 'Use the React Profiler to look for components that re-render anyway despite memoization, profile memory allocation with Chrome DevTools heap snapshots, and search for memoized primitive calculations or unstable dependencies.',
    deepDive: 'Heuristics to audit: 1) Check `useMemo` where the calculation is a primitive operation or array with < 100 items, 2) Look for `useCallback` passed only to native HTML elements, 3) Look for `React.memo` components whose props include unmemoized objects (use ESLint rules or `why-did-you-render`), 4) Identify dependency arrays with 10+ items that invalidate on every click.',
    commonPitfalls: [
      'Auditing memoization by gut feeling rather than measuring with the React DevTools Profiler.',
    ],
  },
  {
    id: 'int-134',
    category: 'Referential Equality & Memoization',
    question: 'Explain a case where React.memo could make performance worse.',
    difficulty: 'Architect',
    shortAnswer: 'When a component\'s props change on 100% of renders (e.g. it receives a timestamp or active cursor position). The component ALWAYS re-renders, so the shallow prop comparison is pure wasted CPU overhead on every frame.',
    deepDive: 'If a component re-renders 60 times a second and has 15 props that frequently update, `React.memo` runs 15 `Object.is` checks before rendering every single time. It never successfully bails out. You pay the full cost of rendering PLUS the full cost of shallow comparison on every single frame.',
    commonPitfalls: [
      'Adding `React.memo` to high-frequency animated or real-time streaming components without checking bailout rates.',
    ],
  },
  {
    id: 'int-135',
    category: 'Referential Equality & Memoization',
    question: 'Design a memoization strategy for a large data-grid application.',
    difficulty: 'Principal',
    shortAnswer: '1) Virtualize rows so only visible cells exist in DOM, 2) Wrap Row/Cell components in `React.memo` with custom comparators, 3) Stabilize cell event handlers via row/col indices rather than inline closures, 4) Separate grid data from selection state using multiple context slices.',
    deepDive: 'In a 10,000-cell grid: If cell selection updates, you must not re-render all 10,000 cells. 1) Row components are memoized and receive row data slices. 2) Cell click handlers: instead of `onClick={() => onSelect(rowId, colId)}`, pass a single stable dispatch handler to the grid container and use event delegation, or pass stable callbacks via context. 3) Selection state is kept in a separate store accessed via selectors (`useSyncExternalStore`) so only the previously selected cell and newly selected cell re-render.',
    commonPitfalls: [
      'Passing the entire grid state object to every row/cell, which breaks all memoization boundaries on every keystroke.',
    ],
  },
],
  "Concurrent Rendering": [
  {
    id: 'int-136',
    category: 'Concurrent Rendering',
    question: 'What does concurrent rendering mean in React?',
    difficulty: 'Senior',
    shortAnswer: 'Concurrent rendering means React can work on multiple versions of the UI at the same time, pausing, resuming, or abandoning render passes to keep the main thread responsive to user interactions.',
    deepDive: 'Before React 18, rendering was synchronous and blocking: once started, React could not stop until the entire tree finished. Concurrent rendering allows React to interrupt a long-running render pass (like rendering a complex chart or filtering 20,000 items) to immediately process an urgent user interaction (like typing in an input or clicking a tab).',
    commonPitfalls: [
      'Assuming concurrent rendering runs on background web workers or multiple CPU threads; it runs cooperatively on the single main JavaScript thread.',
    ],
  },
  {
    id: 'int-137',
    category: 'Concurrent Rendering',
    question: 'Does concurrent React mean JavaScript executes on multiple threads?',
    difficulty: 'Senior',
    shortAnswer: 'No. JavaScript in the browser remains strictly single-threaded. Concurrent React achieves concurrency cooperatively using time-slicing and prioritized scheduling on the single main thread.',
    deepDive: 'React yields the thread back to the browser event loop using a `MessageChannel` callback when its ~5ms time-slice expires. This allows the browser to process native events (mouse movements, keyboard input, painting) before React picks up where it left off on the work-in-progress tree.',
    commonPitfalls: [
      'Confusing concurrent scheduling with parallel multithreading (Web Workers).',
    ],
  },
  {
    id: 'int-138',
    category: 'Concurrent Rendering',
    question: 'What problem does concurrent rendering solve?',
    difficulty: 'Senior',
    shortAnswer: 'It solves the problem of UI responsiveness degradation caused by CPU-bound rendering blocking high-priority user interactions.',
    deepDive: 'In synchronous React, when a user typed into an input that triggered a heavy recalculation or massive re-render, keystrokes would lag because the main thread was frozen evaluating components. Concurrent rendering decouples urgent UI updates (typing) from non-urgent secondary updates (chart/list re-renders), ensuring typing remains immediate (sub-16ms) regardless of tree size.',
    commonPitfalls: [
      'Thinking concurrent rendering speeds up network requests; it manages CPU scheduling and thread responsiveness.',
    ],
  },
  {
    id: 'int-139',
    category: 'Concurrent Rendering',
    question: 'Explain interruptible rendering.',
    difficulty: 'Architect',
    shortAnswer: 'Interruptible rendering is React\'s ability to pause an ongoing low-priority render phase in the middle of traversing the Fiber tree when higher-priority work is scheduled, discarding or resuming it later.',
    deepDive: 'In `workLoopConcurrent`, after each Fiber completes, React checks `shouldYield()`. If true, or if an urgent lane update was registered by an event, React exits the work loop. If the new update has higher priority, React switches to processing the new update. The partially rendered WIP tree from the lower-priority work can be completely thrown away without side effects because no DOM mutations ever occurred.',
    commonPitfalls: [
      'Believing DOM mutations can be interrupted; once React starts committing to the real DOM, it runs synchronously to completion.',
    ],
  },
  {
    id: 'int-140',
    category: 'Concurrent Rendering',
    question: 'What is a transition?',
    difficulty: 'Senior',
    shortAnswer: 'A transition is a state update explicitly categorized as non-urgent, allowing React to interrupt its render pass if more urgent interactions (typing, clicking) occur.',
    deepDive: 'React divides updates into two categories: 1) Urgent updates: direct physical interactions like typing, clicking, pressing buttons, or dragging. Users expect instant physical response. 2) Transition updates: transitioning the view from one state to another (e.g. search results, page change, chart re-aggregation). Users anticipate a slight delay and prefer responsive input over frozen screens.',
    commonPitfalls: [
      'Wrapping direct text input updates in `startTransition`; typing should always remain urgent.',
    ],
  },
  {
    id: 'int-141',
    category: 'Concurrent Rendering',
    question: 'Explain startTransition.',
    difficulty: 'Senior',
    shortAnswer: '`startTransition` is a standalone function that marks any state update inside its callback as a low-priority, interruptible transition.',
    deepDive: 'Use `startTransition` when you do not need the `isPending` boolean flag (for example, inside utility functions, custom stores, or when an external hook handles the pending state). React runs the callback synchronously, marks the assigned lanes as `TransitionLane`, and schedules the render with low priority.',
    commonPitfalls: [
      'Passing async code directly into the callback: `startTransition(async () => { await fetch(); setState(); })`. The state setter must be called synchronously inside `startTransition`.',
    ],
  },
  {
    id: 'int-142',
    category: 'Concurrent Rendering',
    question: 'Explain useTransition.',
    difficulty: 'Senior',
    shortAnswer: '`useTransition` is a React Hook that returns a tuple `[isPending, startTransition]`, providing both the transition scheduler and a reactive boolean state indicating when the transition is active.',
    deepDive: 'While the background transition is rendering, `isPending` is `true`. This lets you display subtle, non-intrusive loading indicators (like a spinning icon or dimmed results list) while keeping the existing UI completely interactive. Unlike Suspense fallbacks, `useTransition` does NOT hide or replace already visible UI with a blank spinner.',
    commonPitfalls: [
      'Using `isPending` to replace the entire UI with a full-page loading spinner, which defeats the purpose of keeping existing content visible.',
    ],
    codeExample: `function SearchFeature() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e) {
    setQuery(e.target.value); // Urgent: input updates immediately!
    startTransition(() => {
      setResults(filterHeavyData(e.target.value)); // Non-urgent: interruptible!
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner size="sm" />}
      <ResultsList results={results} />
    </div>
  );
}`,
  },
  {
    id: 'int-143',
    category: 'Concurrent Rendering',
    question: 'What makes an update urgent versus non-urgent?',
    difficulty: 'Senior',
    shortAnswer: 'Urgent updates correspond to direct physical manipulation expectations (typing, toggling a checkbox, dragging a slider). Non-urgent updates correspond to secondary view transitions and data visualizations.',
    deepDive: 'If a user presses a key on their keyboard and the letter does not appear on screen within 16-50ms, it feels broken and laggy. However, if the filtered list below the input takes 150ms to re-render, the human brain perceives this as a natural computation delay, provided typing remains buttery smooth.',
    commonPitfalls: [
      'Treating all state updates as having identical priority.',
    ],
  },
  {
    id: 'int-144',
    category: 'Concurrent Rendering',
    question: 'Why should text input updates generally remain urgent?',
    difficulty: 'Senior',
    shortAnswer: 'Because delayed input feedback destroys typing rhythm, causes double-typing errors, desynchronizes virtual keyboards on mobile devices, and severely degrades Interaction to Next Paint (INP).',
    deepDive: 'Operating system text engines and browser inputs have synchronous expectations. If you wrap an `<input value={text} onChange={e => startTransition(() => setText(e.target.value))}>`, React treats the input update as low priority. Fast typists will experience dropped letters, jumping cursors, and mobile autocorrect glitches.',
    commonPitfalls: [
      'Wrapping `setInputValue` in a transition instead of keeping the input urgent and transitioning the search result state.',
    ],
  },
  {
    id: 'int-145',
    category: 'Concurrent Rendering',
    question: 'Why might filtering a huge list be implemented as a transition?',
    difficulty: 'Senior',
    shortAnswer: 'Because calculating and rendering thousands of list elements takes significant CPU time; wrapping it in a transition allows the user to keep typing in the search box without input stutter.',
    deepDive: 'If filtering takes 100ms, and the user types 5 letters rapidly, synchronous React attempts to render the 100ms list 5 times (freezing the browser for 500ms). With `startTransition`, as each new character is typed, React immediately aborts the unfinished list render and starts filtering for the new character, keeping the typing thread at 60fps.',
    commonPitfalls: [
      'Thinking transitions replace virtualization; transitions handle interruption, but virtualization (`react-window`) is still needed to avoid creating 50,000 DOM nodes.',
    ],
  },
  {
    id: 'int-146',
    category: 'Concurrent Rendering',
    question: 'What happens if a transition is interrupted?',
    difficulty: 'Architect',
    shortAnswer: 'React halts the current render pass, discards the unfinished work-in-progress Fiber tree, processes the higher-priority urgent update to completion, and then restarts the transition from scratch.',
    deepDive: 'Because no DOM mutations or side effects occurred during the interrupted render phase, discarding the tree is completely safe. When the urgent update commits, React evaluates the lane queue and begins a new transition render pass using the latest accumulated state as the baseline.',
    commonPitfalls: [
      'Assuming React resumes from the exact node where it was interrupted; if state changed, it must restart from the root of that transition.',
    ],
  },
  {
    id: 'int-147',
    category: 'Concurrent Rendering',
    question: 'Can multiple transitions overlap?',
    difficulty: 'Architect',
    shortAnswer: 'Yes. React manages up to 16 distinct Transition Lanes, allowing multiple independent transitions to be scheduled, batched, or supersede each other cleanly.',
    deepDive: 'If Transition A is in progress and Transition B is triggered, React merges their lanes if they are related or can evaluate them concurrently. `isPending` remains `true` until ALL concurrent transitions have committed to the screen.',
    commonPitfalls: [
      'Expecting `isPending` to toggle false after the first transition finishes if a second transition is still rendering.',
    ],
  },
  {
    id: 'int-148',
    category: 'Concurrent Rendering',
    question: 'How does React prioritize updates?',
    difficulty: 'Principal',
    shortAnswer: 'Using a multi-lane scheduling system where each user action maps to a Lane bitmask; React\'s scheduler always selects the lowest numerical bit (highest priority lane) to work on first.',
    deepDive: 'Priority hierarchy: 1) SyncLane (discrete user actions: click, keydown, flushSync), 2) InputContinuousLane (continuous events: mousemove, scroll, wheel), 3) DefaultLane (normal setState inside effects or promises), 4) TransitionLanes (16 lanes for startTransition), 5) IdleLane / OffscreenLane. If a lower lane waits too long without being processed, React\'s scheduler applies starvation mitigation, upgrading its priority to avoid starvation.',
    commonPitfalls: [
      'Assuming low-priority updates can remain starved indefinitely; React has an expiration mechanism that eventually forces transitions to render synchronously.',
    ],
  },
  {
    id: 'int-149',
    category: 'Concurrent Rendering',
    question: 'Explain React lanes conceptually.',
    difficulty: 'Principal',
    shortAnswer: 'Lanes are a 31-bit representation of task categories that allow React to express multiple non-consecutive priorities, task batching, and entitlement without sorting linear queues.',
    deepDive: 'Think of a multi-lane highway: vehicles (tasks) in the fast lane (SyncLane) can overtake vehicles in the slow lane (TransitionLane). Using bitwise math (`lanes & -lanes`), React can determine the highest priority lane in a single CPU instruction, or combine lanes (`lanes |= newLane`) with maximum efficiency.',
    commonPitfalls: [
      'Describing lanes as an array of numbers; they are bitwise bitmasks.',
    ],
  },
  {
    id: 'int-150',
    category: 'Concurrent Rendering',
    question: 'Why are lanes more useful than a simple priority queue?',
    difficulty: 'Principal',
    shortAnswer: 'A linear priority queue only allows single-task comparison. Lanes allow grouping, disentangling IO-bound tasks from CPU-bound tasks, and representing overlapping disjoint subsets of work.',
    deepDive: 'With linear priorities (like the old ExpirationTime model), task priorities were a single number. You could not express "batch update X and update Z together, but do not include update Y which was queued between them". With lanes, each update has a bit, allowing arbitrary subsets of work to be scheduled, suspended, or resumed independently.',
    commonPitfalls: [
      'Underestimating the complexity of concurrent data fetching and Suspense coordination.',
    ],
  },
  {
    id: 'int-151',
    category: 'Concurrent Rendering',
    question: 'What does useDeferredValue do?',
    difficulty: 'Senior',
    shortAnswer: '`useDeferredValue` accepts a value and returns a deferred version of that value that "lags behind" during high-priority updates, updating in the background as a transition.',
    deepDive: 'When `query` changes from "a" to "ab": on the urgent render, `deferredQuery` still holds "a", allowing the component to render the urgent input update immediately. In the background, React schedules a non-urgent render pass where `deferredQuery` is "ab". It is the value-based equivalent of `useTransition`.',
    commonPitfalls: [
      'Confusing `useDeferredValue` with debouncing (`setTimeout`). Debouncing delays the update by a fixed millisecond duration; `useDeferredValue` starts rendering immediately and only yields if the thread is needed.',
    ],
  },
  {
    id: 'int-152',
    category: 'Concurrent Rendering',
    question: 'What is the difference between startTransition and useDeferredValue?',
    difficulty: 'Senior',
    shortAnswer: '`startTransition` wraps the state-updating function (`setState`). `useDeferredValue` wraps the resulting value itself, and is used when you do not control the state setter (e.g. receiving a prop from a parent).',
    deepDive: 'If you have access to the event handler and state setter, `useTransition` is preferred because it also gives you `isPending`. If you are writing a child component that receives `searchTerm` as a prop from above, you cannot wrap the parent\'s setter in a transition; here, `useDeferredValue(searchTerm)` is the correct architectural choice.',
    commonPitfalls: [
      'Using both `useTransition` AND `useDeferredValue` on the same piece of state, creating redundant rendering passes.',
    ],
  },
  {
    id: 'int-153',
    category: 'Concurrent Rendering',
    question: 'When would you choose useDeferredValue over startTransition?',
    difficulty: 'Senior',
    shortAnswer: '1) When the value comes from a prop or third-party library where you do not own the state setter, 2) When consuming values from external stores, 3) When building reusable presentational widgets.',
    deepDive: 'Example: You build a `<DataChart data={data} />` component. The parent passes `data` directly. The chart component cannot dictate how the parent calls `setData`. By writing `const deferredData = useDeferredValue(data)`, the chart component self-manages its own background transition rendering independently of parent implementation.',
    commonPitfalls: [
      'Assuming `useDeferredValue` only works with strings; it works with any JavaScript value including arrays, objects, and numbers.',
    ],
  },
  {
    id: 'int-154',
    category: 'Concurrent Rendering',
    question: 'Can transitions prevent expensive JavaScript from blocking the browser?',
    difficulty: 'Architect',
    shortAnswer: 'No. Transitions allow React to interrupt rendering BETWEEN Fiber units of work, but a single synchronous JavaScript function (like an expensive sorting loop) still blocks the main thread while executing.',
    deepDive: 'If a component has `while (performance.now() < start + 200) {}`, React cannot interrupt that function until it returns. Transitions optimize React\'s traversal of the component tree, not raw JavaScript execution within a single function. True CPU-heavy algorithms (cryptography, large file parsing, 3D math) must be moved to Web Workers.',
    commonPitfalls: [
      'Believing wrapping an expensive sync calculation inside a component render in `startTransition` prevents it from taking CPU time.',
    ],
  },
  {
    id: 'int-155',
    category: 'Concurrent Rendering',
    question: "How would you debug a transition that doesn't improve responsiveness?",
    difficulty: 'Principal',
    shortAnswer: 'Profile with React DevTools and Chrome Performance tab to verify: 1) Is the slow work inside React rendering or outside in an un-yielded JavaScript function? 2) Are state updates accidentally queued in an urgent lane? 3) Is the expensive child memoized?',
    deepDive: 'A common bug: If the child receiving the deferred value is not memoized (`React.memo`), the parent re-renders and forces the child to re-render immediately during the urgent phase anyway! To make `useDeferredValue` work effectively, the heavy child component MUST be wrapped in `React.memo` so it skips rendering during the first pass when the deferred value has not yet updated.',
    commonPitfalls: [
      'Using `useDeferredValue` without wrapping the child in `React.memo` or `useMemo`. Without memoization, the child re-renders on both passes, doubling render cost!',
    ],
    codeExample: `function Parent({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      {/* HeavyList MUST be memoized for useDeferredValue to work! */}
      <MemoizedHeavyList query={deferredQuery} />
    </div>
  );
}`,
  },
],
  "Suspense & Async Rendering": [
  {
    id: 'int-156',
    category: 'Suspense & Async Rendering',
    question: 'What problem does Suspense solve?',
    difficulty: 'Senior',
    shortAnswer: 'Suspense coordinates asynchronous dependencies (code-splitting, data fetching, asset loading) declaratively, eliminating fragmented loading spinners and race conditions.',
    deepDive: 'Before Suspense, every component implemented its own `if (loading) return <Spinner />` logic. In nested component hierarchies, this caused "waterfall spinners" where a parent spinner was replaced by a child spinner, which was replaced by a grandchild spinner, resulting in jarring layout shifts. Suspense lifts loading state coordination into declarative tree boundaries.',
    commonPitfalls: [
      'Thinking Suspense is just for `React.lazy`. In modern React (and frameworks like Next.js), Suspense orchestrates streaming SSR, data fetching, and asset preloading.',
    ],
  },
  {
    id: 'int-157',
    category: 'Suspense & Async Rendering',
    question: 'What does it mean for a component to suspend?',
    difficulty: 'Senior',
    shortAnswer: 'A component suspends when it signals to React during render that it is not yet ready to produce UI because an asynchronous resource (Promise) is still in-flight.',
    deepDive: 'Under the hood, when a component or hook (such as `use(promise)`) cannot resolve its data, it throws a Promise (or uses internal Fiber suspension mechanisms). React catches this thrown promise at the nearest ancestor `<Suspense>` boundary, pauses rendering of that branch, and attaches a `.then()` listener to the promise to restart rendering when resolved.',
    commonPitfalls: [
      'Confusing throwing a Promise with a standard JavaScript runtime error; throwing a promise is a protocol mechanism, not an unhandled exception.',
    ],
  },
  {
    id: 'int-158',
    category: 'Suspense & Async Rendering',
    question: 'How does Suspense know what fallback to display?',
    difficulty: 'Senior',
    shortAnswer: 'React traverses up the Fiber tree from the suspended component along the `return` pointers until it finds the closest ancestor Fiber with `tag === SuspenseComponent`, rendering its `fallback` prop.',
    deepDive: 'Similar to how JavaScript `try...catch` catches exceptions at the nearest enclosing block, Suspense boundaries catch pending promises. The boundary hides the incomplete child subtree and mounts the React elements provided in its `fallback={<LoadingSkeleton />}` prop.',
    commonPitfalls: [
      'Assuming Suspense fallbacks must be simple spinners; skeleton loaders that match the layout geometry provide far better perceived performance.',
    ],
  },
  {
    id: 'int-159',
    category: 'Suspense & Async Rendering',
    question: 'What happens when a component suspends during rendering?',
    difficulty: 'Architect',
    shortAnswer: 'React halts rendering that subtree, preserves the offscreen Fiber state, renders the fallback UI on screen, and subscribes to the thrown Promise to retry rendering when resolved.',
    deepDive: 'In Fiber internals: the suspended Fiber is marked with the `DidCapture` flag on its nearest Suspense parent. If this is an initial mount, React commits the fallback to the DOM. React attaches a resolution handler: `promise.then(retry, retry)`. When the promise settles, React schedules a new render pass on the suspended Fiber with the cached data now available.',
    commonPitfalls: [
      'Assuming the component restarts execution from the line after the promise; React re-executes the entire component function from line 1.',
    ],
  },
  {
    id: 'int-160',
    category: 'Suspense & Async Rendering',
    question: 'How does Suspense interact with concurrent rendering?',
    difficulty: 'Principal',
    shortAnswer: 'Concurrent rendering allows React to prepare the suspended component\'s next state in an off-screen background tree while keeping the current on-screen UI fully interactive.',
    deepDive: 'In concurrent mode, when combined with `startTransition`, a component suspending does NOT immediately unmount the current UI to display a fallback. Instead, React waits in the background (up to a timeout budget) while keeping the current view interactive. If the promise resolves quickly, the user transitions seamlessly from old content to new content with zero spinner flicker.',
    commonPitfalls: [
      'Viewing Suspense as purely a fallback renderer; its superpower is coordinating seamless transitions between screens.',
    ],
  },
  {
    id: 'int-161',
    category: 'Suspense & Async Rendering',
    question: 'Why is Suspense different from manually rendering loading state?',
    difficulty: 'Senior',
    shortAnswer: 'Manual loading states leak implementation details into children, force waterfall renders, cause layout shifts, and cannot coordinate with transitions or streaming SSR.',
    deepDive: 'With manual loading (`if (isLoading) return <Spinner />`), the component must mount, commit DOM, fire an effect, and re-render. A child component nested inside cannot even start fetching until the parent finishes, creating sequential network waterfalls. Suspense decouples the presentation of loading states from the data requirements of components.',
    commonPitfalls: [
      'Scattering `isLoading` flags across 30 different components instead of colocating data fetching with Suspense boundaries.',
    ],
  },
  {
    id: 'int-162',
    category: 'Suspense & Async Rendering',
    question: 'What is a Suspense boundary?',
    difficulty: 'Senior',
    shortAnswer: 'A `<Suspense fallback={...}>` element that demarcates a subtree whose loading states are isolated and coalesced together into a single unified fallback.',
    deepDive: 'All children nested inside a single Suspense boundary wait for each other. If Component A takes 100ms and Component B takes 300ms, the boundary shows its fallback until BOTH components have resolved, preventing independent pop-in of UI elements.',
    commonPitfalls: [
      'Putting a single Suspense boundary around the entire app, causing one slow widget to hide the entire application.',
    ],
  },
  {
    id: 'int-163',
    category: 'Suspense & Async Rendering',
    question: 'How should Suspense boundaries be placed in a large application?',
    difficulty: 'Architect',
    shortAnswer: 'Hierarchically: one high-level boundary for page navigation/layout skeletons, and independent fine-grained boundaries around isolated, non-critical dynamic widgets (sidebar, comments, analytics).',
    deepDive: 'Boundary placement strategy: 1) Core Layout (Navbar, Page Shell): Rendered immediately without suspending. 2) Primary Content: Wrapped in a route-level Suspense boundary with a skeleton matching content geometry. 3) Secondary / Heavy Widgets (e.g. Recommendations, Comments): Wrapped in independent nested boundaries so their slower data fetching does not block the primary view.',
    commonPitfalls: [
      'Creating either too many boundaries (UI pop-in chaos) or too few boundaries (slowest component blocks the whole page).',
    ],
  },
  {
    id: 'int-164',
    category: 'Suspense & Async Rendering',
    question: 'What happens when a previously visible component suspends?',
    difficulty: 'Architect',
    shortAnswer: 'Unless wrapped in a transition, React will immediately unmount or hide the visible component and replace it with the nearest Suspense fallback, causing jarring UI regressions.',
    deepDive: 'If a user is viewing a user profile and clicks a tab that causes the component to suspend, showing a full-screen spinner replaces the content the user was just reading. This "bad fallback" UX is why React introduced transitions (`useTransition` / `startTransition`) to keep existing content visible while loading new content.',
    commonPitfalls: [
      'Triggering navigation updates as urgent updates instead of transitions, resulting in flash-of-spinner regressions on every click.',
    ],
  },
  {
    id: 'int-165',
    category: 'Suspense & Async Rendering',
    question: "Explain Suspense's relationship with transitions.",
    difficulty: 'Architect',
    shortAnswer: 'Transitions prevent already-visible UI from being replaced by a Suspense fallback. React holds the existing screen in place while preparing the suspended screen in the background.',
    deepDive: 'When a state update is wrapped in `startTransition`, React knows that suspending is undesirable. Instead of hiding the current tree and mounting the fallback, React keeps the current tree visible and active (setting `isPending = true` on `useTransition`). Once all suspended promises in the new view resolve, React swaps the new view into place seamlessly.',
    commonPitfalls: [
      'Thinking transitions only work with CPU computations; their most powerful feature is delaying Suspense fallbacks for network operations.',
    ],
  },
  {
    id: 'int-166',
    category: 'Suspense & Async Rendering',
    question: 'Why can a transition prevent already-visible UI from immediately being replaced by a fallback?',
    difficulty: 'Senior',
    shortAnswer: 'Because React assigns the update to a Transition Lane, which instructs the reconciler: "If this render suspends, do not commit the fallback to the DOM; hold the current commit until data is ready."',
    deepDive: 'In `updateSuspenseComponent`, React inspects the render lanes. If rendering in an urgent lane, it must commit the fallback immediately. If rendering in a transition lane, React defers committing until either the data resolves or a configurable timeout is exceeded, keeping the previous DOM tree interactive.',
    commonPitfalls: [
      'Believing transitions eliminate loading states; they transform jarring full-page fallbacks into inline pending indicators.',
    ],
  },
  {
    id: 'int-167',
    category: 'Suspense & Async Rendering',
    question: 'How can poor Suspense boundary placement hurt UX?',
    difficulty: 'Senior',
    shortAnswer: 'Too coarse boundaries cause the entire page to disappear for a single slow API call; too granular boundaries cause jarring visual pop-in where independent elements jump and shift layout.',
    deepDive: 'Cumulative Layout Shift (CLS) is heavily impacted by poor Suspense design. If 10 cards each have their own Suspense boundary with different network latencies, the user experiences 10 consecutive layout reflows as cards pop in one by one. Grouping cards into a single boundary with a stable skeleton layout stabilizes the page geometry.',
    commonPitfalls: [
      'Neglecting to match the height and width of fallback skeletons to the loaded content, resulting in high CLS scores.',
    ],
  },
  {
    id: 'int-168',
    category: 'Suspense & Async Rendering',
    question: 'How would you design Suspense boundaries for a dashboard?',
    difficulty: 'Principal',
    shortAnswer: 'Create an immediate static Shell, a primary boundary for core summary metrics, and independent parallel boundaries for secondary analytical widgets.',
    deepDive: 'Architecture: 1) Navigation, header, and filter controls render immediately without Suspense. 2) Key KPI summary metrics share a boundary with an aligned 4-card skeleton. 3) The heavy Interactive Chart has its own boundary (shows chart skeleton). 4) Recent Activity Feed has an independent boundary. Fast APIs reveal their widgets immediately without waiting for slow analytical aggregations.',
    commonPitfalls: [
      'Coupling all dashboard widgets to a single monolithic `Promise.all()` fetch.',
    ],
  },
  {
    id: 'int-169',
    category: 'Suspense & Async Rendering',
    question: 'What is the relationship between Suspense and streaming SSR?',
    difficulty: 'Principal',
    shortAnswer: 'Suspense boundaries define the chunking points for HTML streaming. The server streams the initial HTML shell with fallback skeletons immediately, and streams in-progress content chunks over the same HTTP connection as promises resolve.',
    deepDive: 'Using `renderToPipeableStream` in Node.js: React flushes the HTML for components outside Suspense boundaries immediately. When a component inside `<Suspense>` suspends, React outputs the fallback HTML. When the server data finishes, React streams an inline `<template>` containing the resolved HTML alongside a tiny JS snippet that replaces the fallback DOM node in-place—all before hydration even begins!',
    commonPitfalls: [
      'Thinking streaming SSR requires WebSocket connections; it runs over standard HTTP/1.1 chunked transfer encoding or HTTP/2 streams.',
    ],
  },
  {
    id: 'int-170',
    category: 'Suspense & Async Rendering',
    question: 'How can Suspense improve perceived performance?',
    difficulty: 'Senior',
    shortAnswer: 'By displaying structured skeletons that reserve layout geometry instantly, streaming critical content first, and eliminating jarring multi-stage loading shifts.',
    deepDive: 'Perceived performance is determined by how quickly a user sees meaningful UI and understands that progress is occurring. Suspense combined with geometric skeletons satisfies First Contentful Paint (FCP) and Largest Contentful Paint (LCP) early, while transitions allow subsequent navigation to feel instant.',
    commonPitfalls: [
      'Using a generic centered spinner instead of a content-shaped skeleton in the Suspense fallback.',
    ],
  },
],
  "SSR / Hydration / Server Components": [
  {
    id: 'int-171',
    category: 'SSR / Hydration / Server Components',
    question: 'What is server-side rendering?',
    difficulty: 'Senior',
    shortAnswer: 'Server-side rendering (SSR) is the process of generating static HTML from React components on the server for each request, sending full HTML to the browser for instant first paint.',
    deepDive: 'The server executes component functions, produces a virtual tree, and serializes it into an HTML string via `renderToString` or `renderToPipeableStream`. When the browser loads this HTML, users see content immediately (fast FCP), search engines index the page easily, and subsequent JavaScript downloads hydrate the page into an interactive React app.',
    commonPitfalls: [
      'Assuming SSR eliminates the need for JavaScript on the client; SSR still downloads the full client bundle for hydration.',
    ],
  },
  {
    id: 'int-172',
    category: 'SSR / Hydration / Server Components',
    question: 'How is SSR different from client-side rendering?',
    difficulty: 'Senior',
    shortAnswer: 'In CSR, the server sends an empty `<div id="root"></div>` and the browser downloads and runs JS before any UI appears. In SSR, the server sends pre-rendered HTML that displays immediately while JS downloads.',
    deepDive: 'CSR has poor initial load metrics (LCP, FCP) on slow devices or low-bandwidth networks because the user stares at a blank screen until the multi-megabyte bundle downloads, parses, and renders. SSR delivers visual HTML upfront, but introduces a "temporal dead zone" where the page looks clickable before JavaScript has finished hydrating.',
    commonPitfalls: [
      'Believing SSR is always faster in every metric; SSR increases server CPU load and Time to First Byte (TTFB) compared to serving a static CSR bundle from a CDN.',
    ],
  },
  {
    id: 'int-173',
    category: 'SSR / Hydration / Server Components',
    question: 'What is hydration?',
    difficulty: 'Senior',
    shortAnswer: 'Hydration is the client-side process where React walks the existing server-rendered DOM, recreates internal Fiber nodes, attaches event listeners, and initializes state without destroying the DOM.',
    deepDive: 'Instead of creating new DOM elements with `document.createElement()`, React\'s hydration reconciler matches incoming React element descriptors to existing server DOM nodes. It adopts the existing nodes, associates them with the newly created Fibers, binds event handlers (`onClick`), and kicks off passive effects (`useEffect`).',
    commonPitfalls: [
      'Assuming hydration re-renders the DOM; hydration simply attaches React\'s event engine and internal state machine to existing markup.',
    ],
  },
  {
    id: 'int-174',
    category: 'SSR / Hydration / Server Components',
    question: 'Why must server and client output be consistent?',
    difficulty: 'Senior',
    shortAnswer: 'Because React expects the client\'s initial render tree to match the server-generated DOM 1-to-1; mismatches cause React to discard markup, re-render DOM nodes, or display corrupted UI.',
    deepDive: 'During hydration, React walks the DOM in lockstep with the virtual element tree. If the server rendered `<p>Server</p>` and the client evaluates `<p>Client</p>`, the hydration pass detects an attribute or text mismatch. In development, it logs a prominent warning. In production, React is forced to tear down the mismatched DOM node and recreate it, destroying performance and causing layout shift.',
    commonPitfalls: [
      'Rendering different markup on client vs server based on `typeof window !== "undefined"` without waiting for mount.',
    ],
  },
  {
    id: 'int-175',
    category: 'SSR / Hydration / Server Components',
    question: 'What causes hydration mismatches?',
    difficulty: 'Senior',
    shortAnswer: '1) Browser-only globals (`window`, `localStorage`), 2) Non-deterministic APIs (`Date.now()`, `Math.random()`), 3) Invalid HTML nesting (e.g. `<p>` inside `<p>`, `<tr>` outside `<tbody>`), 4) Different client/server timezones.',
    deepDive: 'Example: `<span>{new Date().toLocaleTimeString()}</span>`. The server renders UTC time at build/request time, while the client hydrates in the user\'s local timezone 2 seconds later. Because the strings differ, hydration fails. The solution is to render a stable timestamp or defer client-specific values until after mount using `useEffect`.',
    commonPitfalls: [
      'Writing `<div>{localStorage.getItem("token") ? <User /> : <Guest />}</div>` directly in render; `localStorage` does not exist on the server, guaranteeing a mismatch.',
    ],
  },
  {
    id: 'int-176',
    category: 'SSR / Hydration / Server Components',
    question: 'How would you debug a hydration mismatch?',
    difficulty: 'Architect',
    shortAnswer: 'Inspect the React 18+ component diff log in the browser console, check for illegal HTML nesting in browser DevTools, and audit for client-only state accessed during initial render.',
    deepDive: 'React 18+ prints a side-by-side textual diff of the server HTML vs the client virtual DOM at the exact mismatch point. Steps to fix: 1) Verify HTML nesting (browsers auto-correct invalid HTML like `<div>` inside `<p>`, which breaks React\'s node alignment), 2) Identify dynamic client state and isolate it behind a `useEffect` or `useSyncExternalStore` check, 3) If intentional (like third-party browser extensions injecting DOM), use `suppressHydrationWarning`.',
    commonPitfalls: [
      'Silencing hydration warnings with `suppressHydrationWarning` without understanding the root cause.',
    ],
  },
  {
    id: 'int-177',
    category: 'SSR / Hydration / Server Components',
    question: 'What are React Server Components?',
    difficulty: 'Architect',
    shortAnswer: 'React Server Components (RSC) are components that execute exclusively on the server, never download their JavaScript to the client, and serialize directly into a specialized virtual UI stream.',
    deepDive: 'Unlike traditional SSR (where every component executes on the server AND also downloads to the client to hydrate), Server Components NEVER send their component code or dependencies to the browser bundle. A 500kb markdown parser or heavy database client used inside a Server Component adds ZERO bytes to the client JavaScript bundle.',
    commonPitfalls: [
      'Equating Server Components with traditional SSR; they are two completely different paradigms that can be used together or independently.',
    ],
  },
  {
    id: 'int-178',
    category: 'SSR / Hydration / Server Components',
    question: 'What problem do Server Components solve?',
    difficulty: 'Architect',
    shortAnswer: 'They solve client bundle bloat, eliminate client-side data fetching waterfalls, provide secure direct access to backend resources, and maintain client interactivity without full-page reloads.',
    deepDive: 'In CSR and traditional SSR, client bundles grow proportionally to application features. RSC moves non-interactive logic, data fetching, and heavy libraries entirely to the server. Furthermore, Server Components can directly query databases or internal microservices with zero network latency, streaming results to the client as compact JSON-like UI descriptions.',
    commonPitfalls: [
      'Thinking Server Components cannot contain interactive elements; Server Components seamlessly interleave and pass props to interactive Client Components.',
    ],
  },
  {
    id: 'int-179',
    category: 'SSR / Hydration / Server Components',
    question: 'How are Server Components different from SSR?',
    difficulty: 'Architect',
    shortAnswer: 'SSR renders HTML on the server and still requires client hydration of all components. RSC executes components on the server, outputs a JSON-like stream, and never ships their JS or hydrates them on the client.',
    deepDive: 'Comparison: 1) Bundle size: SSR ships 100% of component code to client; RSC ships 0% of Server Component code. 2) State preservation: Re-fetching an SSR page causes a full page reload or loss of client state; re-rendering an RSC tree merges fresh server data into existing client state seamlessly without losing input focus or scroll position. 3) Output: SSR outputs raw HTML strings; RSC outputs an interactive virtual element wire format.',
    commonPitfalls: [
      'Confusing `"use client"` with "this component only runs in the browser". `"use client"` components STILL pre-render on the server during SSR!',
    ],
  },
  {
    id: 'int-180',
    category: 'SSR / Hydration / Server Components',
    question: 'Can Server Components use useState?',
    difficulty: 'Senior',
    shortAnswer: 'No. Server Components execute once per request on the server to produce a virtual UI description; they have no persistent client runtime, event listeners, or client-side lifecycle.',
    deepDive: 'Hooks like `useState`, `useReducer`, and `useEffect` are exclusively client-side interactive constructs. If you attempt to call `useState` in a Server Component, React throws an error reminding you to add the `"use client"` directive at the top of the file to declare it as a Client Component.',
    commonPitfalls: [
      'Attempting to handle button clicks (`onClick`) or local state in a Server Component.',
    ],
  },
  {
    id: 'int-181',
    category: 'SSR / Hydration / Server Components',
    question: "Why can't Server Components directly use client-only APIs?",
    difficulty: 'Senior',
    shortAnswer: 'Because Server Components execute in a Node.js or edge worker server runtime where browser environment objects (`window`, `document`, `navigator`, `localStorage`) do not exist.',
    deepDive: 'Attempting to access `window.location` or `document.cookie` during Server Component execution throws a `ReferenceError: window is not defined`. Client-only APIs must be encapsulated within components marked with `"use client"`, where they can be executed safely inside `useEffect` or event handlers.',
    commonPitfalls: [
      'Using window-dependent third-party charting or slider libraries directly in Server Components.',
    ],
  },
  {
    id: 'int-182',
    category: 'SSR / Hydration / Server Components',
    question: 'What does a "use client" boundary conceptually represent?',
    difficulty: 'Architect',
    shortAnswer: '`"use client"` is an architectural directive that marks the boundary between the server-only execution graph and the client-hydrated interactive module graph.',
    deepDive: 'It tells the bundler (Webpack, Turbopack, Vite): "Do not execute this module only on the server; package this file and all its imported dependencies into the client JavaScript bundle, and serialize a placeholder reference in the RSC stream." Everything imported by a `"use client"` file becomes part of the client bundle.',
    commonPitfalls: [
      'Believing `"use client"` means the component is NOT rendered on the server. Client components ARE pre-rendered to HTML on the server during SSR!',
    ],
  },
  {
    id: 'int-183',
    category: 'SSR / Hydration / Server Components',
    question: 'Explain the client/server component boundary.',
    difficulty: 'Principal',
    shortAnswer: 'The boundary is defined by props passed from Server Components to Client Components, where all props must be serializable across the network (JSON-compatible).',
    deepDive: 'Server Components can import and render Client Components directly. However, Client Components CANNOT directly import Server Components (because that would pull server-only code into the client bundle). To nest Server Components inside Client Components, use the children composition pattern: `<ClientWrapper><ServerComponent /></ClientWrapper>`. All props crossing the boundary must be serializable (no raw functions, class instances, or symbols).',
    commonPitfalls: [
      'Attempting to pass an event handler or callback function from a Server Component to a Client Component prop across the network boundary.',
    ],
    codeExample: `// SERVER COMPONENT (page.tsx)
import ClientLayout from './ClientLayout';
import HeavyServerContent from './HeavyServerContent';

export default async function Page() {
  const data = await db.query();
  return (
    <ClientLayout>
      {/* Passing Server Component as children works seamlessly! */}
      <HeavyServerContent data={data} />
    </ClientLayout>
  );
}`,
  },
  {
    id: 'int-184',
    category: 'SSR / Hydration / Server Components',
    question: 'What are the performance benefits of Server Components?',
    difficulty: 'Architect',
    shortAnswer: '1) Zero client bundle impact for server dependencies, 2) Direct database access with low network latency, 3) Automated code splitting, 4) Reduced client CPU memory and parse/compile time.',
    deepDive: 'In a typical React app, 60-80% of client JavaScript consists of libraries (date-fns, lodash, markdown parsers, syntax highlighters) used solely to transform and present data. By keeping those libraries on the server in Server Components, users download dramatically less JavaScript, drastically improving Time to Interactive (TTI) and memory footprint on low-end mobile devices.',
    commonPitfalls: [
      'Importing heavy utility libraries into `"use client"` components instead of running them in parent Server Components and passing plain strings down.',
    ],
  },
  {
    id: 'int-185',
    category: 'SSR / Hydration / Server Components',
    question: 'What are the trade-offs of Server Components?',
    difficulty: 'Principal',
    shortAnswer: 'Increased server computation costs, architectural mental model complexity (client vs server boundaries), serialization constraints on props, and dependency on specialized framework bundlers.',
    deepDive: 'Trade-offs: 1) Developer cognitive overhead: developers must constantly navigate which code runs where. 2) Serialization overhead: passing massive datasets as props across the boundary creates large JSON payloads in the RSC stream. 3) Server scalability: serverless/edge computing costs scale with request count compared to serving purely static cached assets from a CDN.',
    commonPitfalls: [
      'Passing huge 10MB raw database objects across the boundary into a Client Component instead of filtering down to the 5 fields needed.',
    ],
  },
  {
    id: 'int-186',
    category: 'SSR / Hydration / Server Components',
    question: 'How does data fetching differ between Server and Client Components?',
    difficulty: 'Senior',
    shortAnswer: 'Server Components can be async functions (`async function Component()`) that directly `await` database queries or internal APIs without `useEffect` or state. Client Components must fetch via hooks or libraries over HTTP.',
    deepDive: 'In a Server Component: `export default async function Product({ id }) { const product = await db.products.findById(id); return <h1>{product.title}</h1>; }`. No `useEffect`, no `isLoading`, no `useState`, no network waterfall. In Client Components, data fetching requires client network roundtrips, state management (TanStack Query), and handling loading/error lifecycles.',
    commonPitfalls: [
      'Creating an internal API route (`/api/product`) just so a Server Component can `fetch` from itself, instead of querying the database directly.',
    ],
  },
  {
    id: 'int-187',
    category: 'SSR / Hydration / Server Components',
    question: 'Explain streaming rendering.',
    difficulty: 'Architect',
    shortAnswer: 'Streaming rendering breaks the HTML response into chunks, sending the page shell immediately and progressively streaming in remaining sections as their data resolves over a single open HTTP connection.',
    deepDive: 'Traditional SSR had an "all-or-nothing" bottleneck: if one component on the page had a slow 2-second database query, the server could not send a single byte of HTML to the browser for 2 full seconds (hurting TTFB). Streaming with `renderToPipeableStream` sends the header, layout, and loading skeletons in 20ms, streaming in the slow component when ready.',
    commonPitfalls: [
      'Assuming streaming requires WebSockets; streaming utilizes native HTTP chunked transfer encoding (`Transfer-Encoding: chunked`).',
    ],
  },
  {
    id: 'int-188',
    category: 'SSR / Hydration / Server Components',
    question: 'How does Suspense enable streaming SSR?',
    difficulty: 'Architect',
    shortAnswer: 'Suspense boundaries mark the exact boundaries where HTML streaming can pause and yield on the server, streaming fallbacks first and inlining resolved content chunks later.',
    deepDive: 'When the server renderer encounters a `<Suspense>` component whose child is awaiting a Promise: 1) The server outputs the fallback HTML in the initial stream, 2) Continues rendering the rest of the page, 3) When the promise resolves, it flushes an HTML chunk containing the rendered child wrapped in a hidden `<template>`, plus a tiny inline script that swaps it into the placeholder in the client DOM.',
    commonPitfalls: [
      'Failing to place Suspense boundaries around slow data-fetching components, which forces the entire stream to wait.',
    ],
  },
  {
    id: 'int-189',
    category: 'SSR / Hydration / Server Components',
    question: 'What happens when hydration is delayed?',
    difficulty: 'Senior',
    shortAnswer: 'The page displays interactive-looking UI elements (buttons, inputs) that do not respond to user clicks, creating an unresponsive "uncanny valley" until client JavaScript executes.',
    deepDive: 'If hydration takes 3 seconds, a user clicking "Add to Cart" will see nothing happen because event listeners have not been attached yet. React 18 fixes this with **Selective Hydration**: it hydrates components wrapped in Suspense boundaries independently, and if a user clicks an unhydrated component, React prioritizes hydrating that specific component immediately before handling the click event!',
    commonPitfalls: [
      'Assuming users won\'t attempt to click buttons during the first 2 seconds after First Contentful Paint.',
    ],
  },
  {
    id: 'int-190',
    category: 'SSR / Hydration / Server Components',
    question: 'Design an architecture combining SSR, Server Components, Suspense and client interactivity.',
    difficulty: 'Principal',
    shortAnswer: 'Root layout and page views are Server Components fetching data directly from DB. Interactive widgets are leaf Client Components. Suspense boundaries isolate independent async streams, enabling progressive streaming SSR and selective hydration.',
    deepDive: 'Architecture blueprint: 1) `app/layout.tsx` (Server): renders header, footer, static navigation with 0kb client JS. 2) `app/feed/page.tsx` (Server): fetches user posts directly. 3) `<Suspense fallback={<FeedSkeleton />}>` wraps dynamic feed so the page streams immediately. 4) `<LikeButton id={post.id} />` is a leaf `"use client"` component containing interactive state. 5) When rendered, the client downloads only the tiny JS needed for `LikeButton`, while the heavy post markup is streamed server HTML.',
    commonPitfalls: [
      'Placing `"use client"` at the top of the route file, accidentally converting the entire page and all its subcomponents into Client Components.',
    ],
  },
],
  "Context & State Architecture": [
  {
    id: 'int-191',
    category: 'Context & State Architecture',
    question: 'How does React Context work?',
    difficulty: 'Senior',
    shortAnswer: 'React Context provides a dependency-injection mechanism that passes values through the component tree without prop drilling, notifying all consumer Fibers when the provider value changes reference.',
    deepDive: 'A `<Context.Provider value={val}>` stores the current value on its Fiber. When a child calls `useContext(Context)`, React registers a dependency on that Fiber. During reconciliation, if the provider\'s `value` prop changed according to `Object.is`, React traverses down the provider\'s subtree and marks every consumer Fiber with an update flag, bypassing any intermediate `React.memo` or `shouldComponentUpdate` bailouts.',
    commonPitfalls: [
      'Assuming `React.memo` on an intermediate component can block context updates from reaching nested consumers; context deliberately cuts straight through memoization boundaries.',
    ],
  },
  {
    id: 'int-192',
    category: 'Context & State Architecture',
    question: 'Why can Context cause unnecessary re-renders?',
    difficulty: 'Senior',
    shortAnswer: 'Because React Context does NOT support partial subscriptions or selectors. If ANY property on a context value object changes, EVERY component consuming that context re-renders.',
    deepDive: 'If a context value is `{ user, theme, cart }`, and only `cart` updates, a component that only reads `theme` via `const { theme } = useContext(AppContext)` will STILL re-render. React only checks whether the context object reference changed, not which properties the consumer destructured.',
    commonPitfalls: [
      'Putting state that updates at high frequency (like mouse coordinates or input typing) into a shared context consumed by many components.',
    ],
  },
  {
    id: 'int-193',
    category: 'Context & State Architecture',
    question: "What happens when a Context provider's value changes?",
    difficulty: 'Senior',
    shortAnswer: 'React compares previous and next `value` props using `Object.is`. If different, it marks all downstream consumer components in the tree to re-render in the current pass.',
    deepDive: 'In `propagateContextChange`, React walks down the Fiber tree starting from the provider. For every Fiber that has a matching context dependency in its `dependencies` linked list, React schedules an update at the current lane. It ensures consumers update even if parent components bail out via `React.memo`.',
    commonPitfalls: [
      'Failing to realize that context propagation is a top-down tree traversal that can become expensive in massive component trees.',
    ],
  },
  {
    id: 'int-194',
    category: 'Context & State Architecture',
    question: 'Why can creating { user, setUser } inline cause performance problems?',
    difficulty: 'Senior',
    shortAnswer: '`<Provider value={{ user, setUser }}>` creates a brand new object literal on every render of the provider component, forcing every single consumer in the entire app to re-render on every frame.',
    deepDive: 'Even if `user` and `setUser` are completely unchanged, `{} !== {}` in JavaScript. `Object.is(prevVal, nextVal)` returns `false` on every render pass of the parent, completely defeating any memoization in consumers. The value object MUST be stabilized using `useMemo`.',
    commonPitfalls: [
      'Passing inline object literals directly into the `value` prop of a top-level Context Provider.',
    ],
    codeExample: `// ANTI-PATTERN: Re-renders all consumers on EVERY parent update!
<UserContext.Provider value={{ user, setUser }}>

// CORRECT: Stable reference
const value = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={value}>`,
  },
  {
    id: 'int-195',
    category: 'Context & State Architecture',
    question: 'How can Context value identity be stabilized?',
    difficulty: 'Senior',
    shortAnswer: 'Wrap the context value object in `useMemo`, and split frequently changing state from stable dispatch functions into separate contexts.',
    deepDive: 'Best practice: Split into two contexts: 1) `StateContext` (contains the data, updates when data changes), and 2) `DispatchContext` (contains the dispatch function or stable callbacks, NEVER updates after mount). Components that only dispatch actions consume `DispatchContext` and NEVER re-render when state changes!',
    commonPitfalls: [
      'Combining dispatch functions and state into a single context object without splitting or memoizing.',
    ],
  },
  {
    id: 'int-196',
    category: 'Context & State Architecture',
    question: 'When should Context be avoided?',
    difficulty: 'Senior',
    shortAnswer: '1) High-frequency updates (keystrokes, mouse position, animations), 2) Massive datasets where components need fine-grained slice subscriptions, 3) Simple prop drilling across only 1-2 component levels.',
    deepDive: 'Context is designed for low-frequency, global-ish data: current user session, localization/language, theme, UI configuration flags. Using Context as a high-frequency real-time stock ticker or canvas coordinate store will cripple performance because every tick forces broad subtree re-renders without selector filtering.',
    commonPitfalls: [
      'Using Context as a replacement for state managers in high-throughput applications.',
    ],
  },
  {
    id: 'int-197',
    category: 'Context & State Architecture',
    question: 'Context vs Redux: when would you choose each?',
    difficulty: 'Senior',
    shortAnswer: 'Context is built-in dependency injection for low-frequency global settings. Redux (via Redux Toolkit) is a full state architecture providing selector-based subscriptions, middleware, and DevTools for complex transactional state.',
    deepDive: 'Key differences: 1) Performance: Redux uses selector subscriptions (`useSelector(state => state.items)`) so components only re-render when their selected slice changes; Context re-renders on ANY change to the value. 2) Debugging: Redux provides time-travel debugging and strict action logging. 3) Boilerplate: Context has zero external dependencies; Redux requires store setup.',
    commonPitfalls: [
      'Claiming Redux is obsolete because Context exists; Context is a transport mechanism, not a state-management engine with fine-grained subscriptions.',
    ],
  },
  {
    id: 'int-198',
    category: 'Context & State Architecture',
    question: 'Context vs an external store such as Zustand: when would you choose each?',
    difficulty: 'Senior',
    shortAnswer: 'Choose Context for dependency injection and scoped subtrees (e.g. multiple isolated form instances). Choose Zustand for global application state requiring fine-grained selectors, outside-React access, and minimal boilerplate.',
    deepDive: 'Zustand stores live in pure JavaScript closures outside React and use `useSyncExternalStore` for subscriptions. When state updates, Zustand only notifies components whose selector returns a new value. Context requires providers wrapping the JSX tree, making it ideal when you need multiple independent instances of a store in different parts of the DOM.',
    commonPitfalls: [
      'Assuming Zustand stores cannot be scoped; you can easily pass a Zustand store instance through Context to get both scoping and selector performance.',
    ],
  },
  {
    id: 'int-199',
    category: 'Context & State Architecture',
    question: "Why isn't Context a complete state-management solution?",
    difficulty: 'Senior',
    shortAnswer: 'Because Context does not manage state itself—it only transports values. It lacks built-in mechanisms for fine-grained selectors, side-effect management, middleware, and devtools.',
    deepDive: 'Context is literally a pipe. You still need `useState` or `useReducer` to actually hold and mutate the data. Because the pipe broadcasts the entire value to every subscriber without subscription filtering, building enterprise state management purely with Context results in provider hell and render cascades.',
    commonPitfalls: [
      'Confusing a data transport mechanism (Context) with a state management system (Zustand, Redux, MobX).',
    ],
  },
  {
    id: 'int-200',
    category: 'Context & State Architecture',
    question: 'How would you design global state for a large enterprise React application?',
    difficulty: 'Principal',
    shortAnswer: 'Separate state by its lifecycle and ownership into three tiers: 1) Server State (TanStack Query), 2) Client App State (Zustand / Redux with selectors), 3) URL / Navigation State (router parameters), 4) Local Component State (useState).',
    deepDive: 'Enterprise mistake #1 is putting server data into a global client store. Server data is not state; it is a remote cache requiring invalidation, background refetching, and deduping (handled by TanStack Query). Client state (sidebar open, draft edits) lives in a lightweight selector store (Zustand). Search filters and tabs live in URL search params for shareability.',
    commonPitfalls: [
      'Writing manual Redux reducers and thunks to fetch, store, and cache REST API data instead of using a dedicated server-state library.',
    ],
  },
  {
    id: 'int-201',
    category: 'Context & State Architecture',
    question: 'How would you split Context providers?',
    difficulty: 'Senior',
    shortAnswer: 'Split by update frequency and domain responsibility: separate data from actions (`AuthDataContext` vs `AuthDispatchContext`), and isolate independent domains (Theme, User, Notifications) into separate providers.',
    deepDive: 'Instead of one monolithic `<AppProvider value={{ user, theme, cart, dispatch }}>`, split into: `<ThemeProvider>`, `<AuthProvider>`, `<CartProvider>`. Furthermore, inside `<CartProvider>`, expose `<CartItemsContext>` and `<CartActionsContext>`. Components adding items only subscribe to actions and never re-render when cart items change.',
    commonPitfalls: [
      'Creating a single root context object with 50 properties that updates on every user action.',
    ],
  },
  {
    id: 'int-202',
    category: 'Context & State Architecture',
    question: 'How can selector-based state access improve performance?',
    difficulty: 'Senior',
    shortAnswer: 'Selectors allow components to subscribe exclusively to the specific slice of state they consume, skipping re-renders when other unrelated parts of the store update.',
    deepDive: 'In `const count = useStore(state => state.count)`, the store compares the selector result (`Object.is(prevSelected, nextSelected)`). If `state.user` or `state.cart` changes, the selector still returns the same `count` reference. React does not re-render the component at all, reducing render count across the app by 90%+.',
    commonPitfalls: [
      'Returning a brand new object in a selector (`state => ({ a: state.a, b: state.b })`) without a shallow equality comparator, which defeats the selector optimization.',
    ],
  },
  {
    id: 'int-203',
    category: 'Context & State Architecture',
    question: 'Explain the concept behind useSyncExternalStore.',
    difficulty: 'Principal',
    shortAnswer: '`useSyncExternalStore` is React 18\'s official hook for subscribing to stores outside of React (Redux, Zustand, browser APIs) without visual tearing during concurrent rendering.',
    deepDive: 'In Concurrent React, a render can pause, yield to an external event that mutates an outside store, and resume. If two components read from the store at different times within the same frame, they could render conflicting data (called "tearing"). `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` forces synchronous snapshot checks, detecting tearing and de-optimizing to a synchronous render pass if the store mutated concurrently.',
    commonPitfalls: [
      'Returning a new object reference from `getSnapshot()` on every call, which causes infinite render loops.',
    ],
    codeExample: `// Custom hook subscribing to browser online status via useSyncExternalStore:
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine, // Client snapshot
    () => true              // Server snapshot
  );
}`,
  },
  {
    id: 'int-204',
    category: 'Context & State Architecture',
    question: 'Why does React need a standard API for external stores?',
    difficulty: 'Principal',
    shortAnswer: 'Because ad-hoc `useEffect` + `useState` store subscriptions suffer from tearing in concurrent mode, miss updates during hydration, and break time-slicing invariants.',
    deepDive: 'Legacy subscriptions in `useEffect` run AFTER the browser paint. If an external store updates between the render phase and the effect phase, the UI displays inconsistent data. `useSyncExternalStore` is deeply integrated with the React reconciler and scheduler, guaranteeing consistency across concurrent time-slicing and SSR hydration.',
    commonPitfalls: [
      'Writing custom store subscriptions with `useState` and `useEffect` in React 18+ instead of using `useSyncExternalStore`.',
    ],
  },
  {
    id: 'int-205',
    category: 'Context & State Architecture',
    question: 'Design an architecture for server state, client state and URL state.',
    difficulty: 'Principal',
    shortAnswer: '1) URL State (nuqs / searchParams): Single source of truth for pagination, sorting, active tabs, filters. 2) Server State (TanStack Query / SWR): Manages async API caching, mutations, optimistic updates. 3) Client State (Zustand): Ephemeral UI state (modals, drafts).',
    deepDive: 'Benefits: Storing filters in the URL makes pages bookmarkable and shareable with zero sync code. Using TanStack Query eliminates manual loading flags, cache management, and polling logic. Keeping client state minimal and separated prevents memory leaks and guarantees clear boundaries of data ownership.',
    commonPitfalls: [
      'Duplicating URL parameters into Redux/Context state and trying to keep them synchronized via two-way `useEffect` listeners.',
    ],
  },
],
  "Performance & Profiling": [
  {
    id: 'int-206',
    category: 'Performance & Profiling',
    question: 'A React application feels slow. How do you investigate it?',
    difficulty: 'Senior',
    shortAnswer: 'Measure before guessing: 1) Record user interaction in Chrome Performance tab to find long tasks (>50ms), 2) Profile with React DevTools Profiler to identify which components rendered and why, 3) Classify the issue as JS execution, excessive re-renders, DOM layout thrashing, or network latency.',
    deepDive: 'Systematic approach: Check Core Web Vitals (INP, LCP, CLS). In React Profiler: enable "Record why each component rendered". Look for flamegraphs with tall render stacks or wide commit durations. If commit time is huge, investigate layout effects or oversized DOM trees. If render duration is high, investigate expensive synchronous calculations in component bodies. If hundreds of components render on each keystroke, inspect Context or missing memoization boundaries.',
    commonPitfalls: [
      'Immediately slapping `useMemo` and `useCallback` on random components without measuring the root cause first.',
    ],
  },
  {
    id: 'int-207',
    category: 'Performance & Profiling',
    question: 'What is the React Profiler?',
    difficulty: 'Senior',
    shortAnswer: 'The React Profiler is a diagnostic tool in React DevTools (and `<Profiler>` API) that records commit timelines, flamegraphs, component render durations, and the exact props/hooks that caused each render.',
    deepDive: 'The Profiler visualizes work grouped by commits. It displays: 1) Flamegraph Chart (tree hierarchy where color represents render duration), 2) Ranked Chart (sorted by slowest components in a commit), 3) "Why did this render?" badge (shows whether props changed, hooks changed, or parent rendered). It helps developers distinguish necessary renders from wasted renders.',
    commonPitfalls: [
      'Profiling in Development mode; development React includes extensive validation and debug overhead that distorts timings. Always profile using Production builds with profiling enabled (`react-dom/profiling`).',
    ],
  },
  {
    id: 'int-208',
    category: 'Performance & Profiling',
    question: 'What does render duration tell you?',
    difficulty: 'Senior',
    shortAnswer: 'Render duration measures the time React spent calculating the virtual elements, executing hooks, and diffing that specific component during the render phase.',
    deepDive: 'In the Profiler: "Base duration" is an estimate of how long the component would take to render from scratch without any memoization. "Actual duration" is how long the component actually took to render in that specific commit. If actual duration is close to base duration, memoization is failing or the component is doing heavy work on every render.',
    commonPitfalls: [
      'Confusing actual duration with commit duration (which measures DOM insertion and layout effects).',
    ],
  },
  {
    id: 'int-209',
    category: 'Performance & Profiling',
    question: 'What is the difference between render time and commit time?',
    difficulty: 'Senior',
    shortAnswer: 'Render time is CPU time spent running component functions and diffing Fibers. Commit time is time spent physically mutating the DOM, attaching refs, and running synchronous useLayoutEffect callbacks.',
    deepDive: 'If render time is high: optimize JavaScript code, add `React.memo`, move calculations to workers. If commit time is high: the DOM tree is too large, too many elements are being inserted at once (needs virtualization), or `useLayoutEffect` is running heavy DOM measurements and triggering layout thrashing.',
    commonPitfalls: [
      'Optimizing render calculations with `useMemo` when the actual bottleneck is a massive commit phase inserting 5,000 DOM nodes.',
    ],
  },
  {
    id: 'int-210',
    category: 'Performance & Profiling',
    question: 'How can unnecessary parent renders affect children?',
    difficulty: 'Senior',
    shortAnswer: 'By default, when a parent renders, all of its descendant children re-render recursively, regardless of whether their props changed, multiplying render cost across the entire subtree.',
    deepDive: 'In a tree with 500 components, an unconstrained state update at the root will traverse all 500 components. Even if the DOM does not change, running 500 JavaScript functions, instantiating new JSX objects, and checking diffs can easily take 20-50ms, dropping frame rates below 60fps.',
    commonPitfalls: [
      'Assuming React automatically skips child rendering if props didn\'t change; you must explicitly use `React.memo` or children prop lifting.',
    ],
  },
  {
    id: 'int-211',
    category: 'Performance & Profiling',
    question: 'How would you optimize a component rendering 10,000 rows?',
    difficulty: 'Senior',
    shortAnswer: 'Virtualize the list using windowing libraries (e.g. `@tanstack/react-virtual` or `react-window`), rendering only the ~20-30 rows currently visible inside the scroll viewport.',
    deepDive: 'Rendering 10,000 DOM elements creates massive memory pressure, slow reconciliation passes, and browser layout reflow penalties. Virtualization calculates the user\'s scroll position and dynamically mounts only the visible items plus a small buffer, positioning them with absolute offsets. The DOM maintains ~30 nodes regardless of whether the dataset has 100 or 1,000,000 items.',
    commonPitfalls: [
      'Attempting to solve a 10,000-row performance problem with `React.memo` or pagination alone instead of virtualization.',
    ],
  },
  {
    id: 'int-212',
    category: 'Performance & Profiling',
    question: 'When should virtualization be used?',
    difficulty: 'Senior',
    shortAnswer: 'When lists or tables contain more than 100-200 items, when rows contain complex nested DOM/media, or when infinite scrolling feeds grow unbounded over time.',
    deepDive: 'Virtualization has trade-offs: it complicates native in-page browser search (`Ctrl+F`), keyboard navigation accessibility, and dynamic row height calculation. Do not virtualize small lists of 20 items. Apply virtualization when DOM node count threatens frame rates and memory limits.',
    commonPitfalls: [
      'Virtualizing short lists where the overhead of scroll event tracking exceeds the benefit.',
    ],
  },
  {
    id: 'int-213',
    category: 'Performance & Profiling',
    question: 'Why can memoization fail to solve a performance problem?',
    difficulty: 'Senior',
    shortAnswer: '1) Props fail referential equality checks (inline objects/functions), 2) The component renders due to internal state or Context rather than parent props, 3) The bottleneck is DOM reflows or network rather than JS rendering.',
    deepDive: 'If a component consumes a Context that changes reference, `React.memo` is completely bypassed. If a parent passes `onClick={() => {}}`, the memoization fails every render. If the component only renders 1 `<div>`, adding `React.memo` adds comparison overhead without saving any real computation.',
    commonPitfalls: [
      'Assuming `React.memo` stops re-renders triggered by `useContext`.',
    ],
  },
  {
    id: 'int-214',
    category: 'Performance & Profiling',
    question: 'How would you identify the actual bottleneck before optimizing?',
    difficulty: 'Architect',
    shortAnswer: 'Run Chrome DevTools Performance recording with CPU throttling (4x/6x slowdown): inspect the flame chart for Long Tasks, analyze Main thread breakdown (Scripting vs Rendering vs Painting), and verify in React Profiler.',
    deepDive: 'Bottleneck categorization: 1) High Scripting time (yellow in Chrome DevTools): React render phase or heavy algorithms. 2) High Rendering/Painting time (purple/green): CSS recalculations, expensive box shadows, large DOM mutations, layout thrashing. 3) High Idle/Wait time: Network waterfall delays. Only optimize the specific category identified.',
    commonPitfalls: [
      'Optimizing JavaScript components when the actual bottleneck is an un-optimized CSS transition triggering layout reflow on 2,000 elements.',
    ],
  },
  {
    id: 'int-215',
    category: 'Performance & Profiling',
    question: 'How can expensive calculations affect concurrent rendering?',
    difficulty: 'Principal',
    shortAnswer: 'An expensive synchronous calculation inside a component function cannot be interrupted by React mid-execution, freezing the main thread for that duration despite concurrent time-slicing.',
    deepDive: 'React yields between Fiber nodes, not in the middle of JavaScript functions. If one component contains `crypto.subtle` or a synchronous loop taking 80ms, the browser cannot process user keystrokes during those 80ms. Solutions: 1) Cache with `useMemo`, 2) Offload calculation to a Web Worker via `comlink`, 3) Split work across requestIdleCallback chunks.',
    commonPitfalls: [
      'Believing concurrent rendering magically breaks up monolithic synchronous JavaScript functions.',
    ],
  },
  {
    id: 'int-216',
    category: 'Performance & Profiling',
    question: 'How do browser painting and React rendering interact?',
    difficulty: 'Architect',
    shortAnswer: 'React render phase executes pure JS; commit phase updates DOM; layout effects run synchronously; browser performs Layout/Style Recalculation; browser Compositor paints pixels; React passive effects (useEffect) run asynchronously.',
    deepDive: 'Understanding the pipeline: JavaScript -> Style -> Layout -> Composite -> Paint. When React commits DOM changes, it marks elements dirty. If code reads a layout property (`element.offsetHeight`) immediately after mutating the DOM in `useLayoutEffect`, it triggers "Forced Synchronous Layout" (layout thrashing), forcing the browser to recalculate styles synchronously before painting.',
    commonPitfalls: [
      'Reading and writing DOM layout properties in an alternating loop inside `useLayoutEffect`.',
    ],
  },
  {
    id: 'int-217',
    category: 'Performance & Profiling',
    question: 'How would you optimize a dashboard containing many independent widgets?',
    difficulty: 'Principal',
    shortAnswer: '1) Isolate widget state to prevent cross-widget re-renders, 2) Use independent Suspense boundaries with skeleton fallbacks, 3) Defer off-screen widgets with IntersectionObserver or Content-Visibility, 4) Use fine-grained selector stores.',
    deepDive: 'If each widget is self-contained: wrapping each in `React.memo` and giving each widget its own data query hook ensures that a metric update in Widget A does not re-render Widget B, C, or D. Off-screen widgets below the fold can be lazy-loaded or use CSS `content-visibility: auto` to skip rendering until scrolled into view.',
    commonPitfalls: [
      'Managing all dashboard data in a single top-level parent object, causing all 20 widgets to re-render whenever any single widget updates.',
    ],
  },
  {
    id: 'int-218',
    category: 'Performance & Profiling',
    question: 'How would you prevent a global state update from re-rendering the entire application?',
    difficulty: 'Architect',
    shortAnswer: 'Use selector-based external stores (`useSyncExternalStore` / Zustand / Redux) so components subscribe only to minimal state slices, split Context providers, and leverage component composition.',
    deepDive: 'If an app has 10,000 components, an update to `user.unreadCount` should only re-render the `<Badge />` icon in the navbar. By using a selector `const count = useStore(s => s.user.unreadCount)`, only the `<Badge />` component subscribes to that slice. All other components in the tree bail out completely with 0 wasted renders.',
    commonPitfalls: [
      'Passing global state objects down from the root component via props.',
    ],
  },
  {
    id: 'int-219',
    category: 'Performance & Profiling',
    question: 'What performance problems can excessive Context usage create?',
    difficulty: 'Senior',
    shortAnswer: 'Uncontrolled cascading re-renders across all consumer subtrees, high memory overhead, and deep component tree wrapping ("provider hell") that complicates profiling and debugging.',
    deepDive: 'Because Context propagates changes to all consumers unconditionally, having 50 components spread across the app listening to a Context that updates every 100ms causes 50 components to execute on every tick. The React Profiler will show wide, constant flamegraphs even when the app appears idle.',
    commonPitfalls: [
      'Creating a new Context provider for every minor feature instead of using local state or compound components.',
    ],
  },
  {
    id: 'int-220',
    category: 'Performance & Profiling',
    question: 'Explain how you would establish performance budgets for a React application.',
    difficulty: 'Principal',
    shortAnswer: 'Establish quantitative metrics across Core Web Vitals (INP < 200ms, LCP < 2.5s, CLS < 0.1), JavaScript bundle size (< 150kb initial gzipped), component render budgets (< 16ms per interaction), and enforce via CI/CD gates.',
    deepDive: 'Implementation strategy: 1) Bundle Budget: Enforce with Webpack bundle analyzer or `@next/bundle-analyzer` in CI; block PRs that increase main bundle size by > 5%. 2) Real User Monitoring (RUM): Use `web-vitals` library to send p75 and p95 INP/LCP metrics to Datadog/Sentry. 3) Synthetic Performance Tests: Run Lighthouse CI on staging environments to catch regressions before production deployment.',
    commonPitfalls: [
      'Defining vague qualitative goals ("make the app fast") instead of hard, enforceable thresholds (e.g. "p75 INP must remain under 150ms").',
    ],
  },
],
};

export const INTERVIEW_CATEGORIES: string[] = [
  'All',
  ...Object.keys(INTERVIEW_QUESTIONS_BY_CATEGORY),
];

export const INTERVIEW_QUESTIONS_LIST: InterviewQuestionItem[] = Object.values(
  INTERVIEW_QUESTIONS_BY_CATEGORY
).flat();
