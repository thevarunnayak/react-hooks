import { HookLessonData } from '../../types/hook';

export const useReducerData: HookLessonData = {
  id: 'useReducer',
  name: 'useReducer',
  tagline: 'Manage complex state transitions with an action-based state machine.',
  category: 'State',
  difficulty: 'Intermediate',
  reactVersion: '16.8+',
  labId: 'useReducerLab',

  whatIsIt: 'useReducer is a React Hook that lets you manage state using a reducer function. It decouples the "what happened" (actions) from "how state updates" (pure reducer logic).',

  whyExists: 'When components have multiple interrelated state variables, complex event transitions, or when the next state depends heavily on the previous state, useState leads to scattered and buggy setter calls.',

  simpleExplanation: 'Instead of directly telling React what the new state should be, you dispatch an action describing an event (e.g. { type: "ADD_TODO", text: "Buy milk" }). Your pure reducer function receives the current state and action, and returns the new state.',

  analogy: {
    metaphor: 'The Bank Account Teller',
    description: 'You do not walk into a bank vault and change your balance manually (useState). Instead, you hand the bank teller a deposit or withdrawal slip (action). The teller follows strict bank rules (reducer) to verify and compute your new account balance (new state).',
  },

  syntax: `const [state, dispatch] = useReducer(reducer, initialArg, init?);`,

  arguments: [
    {
      name: 'reducer',
      type: '(state: State, action: Action) => State',
      required: true,
      description: 'A pure function taking current state and an action, returning the next state.',
    },
    {
      name: 'initialArg',
      type: 'any',
      required: true,
      description: 'The value from which initial state is calculated.',
    },
  ],

  returnValue: {
    type: '[State, React.Dispatch<Action>]',
    description: 'An array with two elements: [currentState, dispatchFunction]. dispatch maintains a stable identity across renders.',
  },

  mentalModel: {
    summary: 'UI Event -> dispatch(action) -> Pure Reducer -> Deterministic New State -> Render',
    diagramSteps: [
      'User clicks button in UI.',
      'Handler calls dispatch({ type: "INCREMENT" }).',
      'React invokes reducer(currentState, action).',
      'Reducer returns nextState.',
      'React schedules render with new state.',
    ],
    details: 'The reducer function must be completely pure without mutations, asynchronous requests, or side effects.',
  },

  visualExplanation: {
    title: 'State Machine Flow',
    description: 'Predictable and testable state transitions:',
    phases: [
      { phase: 'Dispatch Action', description: 'dispatch({ type: "DELETE", id: 42 })' },
      { phase: 'Pure Reducer', description: 'state.items.filter(i => i.id !== action.id)' },
      { phase: 'New State Committed', description: 'Component re-renders with updated list.' },
    ],
  },

  primaryExample: {
    title: 'Shopping Cart State Machine',
    code: `import React, { useReducer } from 'react';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, items: [...state.items, action.item] };
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function Cart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  return (
    <div>
      <button onClick={() => dispatch({ type: 'ADD', item: { id: 1, name: 'Book' } })}>
        Add Book
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR' })}>Clear</button>
      <p>Cart Items: {state.items.length}</p>
    </div>
  );
}`,
    description: 'Deterministic action dispatching ensures all cart modifications follow strict reducer rules.',
  },

  tryItYourselfPrompt: 'Try adding items and applying discount codes in the State Machine Lab below. Notice how the dispatch stream records every transition!',

  internalMechanism: 'useReducer and useState share the exact same underlying Fiber queue architecture. In fact, useState is implemented internally in React using a basic reducer: (state, action) => typeof action === "function" ? action(state) : action.',

  commonMistakes: [
    {
      title: 'Mutating State Inside the Reducer',
      badCode: `case 'ADD':\n  state.items.push(action.item);\n  return state;`,
      goodCode: `case 'ADD':\n  return { ...state, items: [...state.items, action.item] };`,
      explanation: 'Reducers must be pure. Mutating the state object in-place causes Object.is to see identical references and cancel the re-render!',
      dangerLevel: 'critical',
    },
  ],

  performanceTips: [
    'The dispatch function returned by useReducer is guaranteed to have a stable identity. You do not need to wrap it in useCallback or add it to dependency arrays.',
    'You can pass dispatch down through context to allow deep children to trigger state changes without passing callback props.',
  ],

  whenNotToUse: [
    'For simple, isolated primitive states (like a toggle or input string): useState is simpler and has less boilerplate.',
  ],

  alternatives: [
    { name: 'useState', reason: 'Best for simple, independent values.' },
  ],

  interviewQuestions: [
    {
      question: 'How is useState related to useReducer under the hood?',
      answer: 'useState is built directly on top of useReducer in React Fiber. useState is essentially useReducer with a built-in basic reducer that replaces the previous value with the new value.',
      deepDive: 'The core Fiber hook primitive is updateReducer. Calling useState simply delegates to this reducer implementation.',
      difficulty: 'Senior',
    },
  ],

  relatedHooks: ['useState', 'useContext'],
  keyTakeaway: 'useReducer gives you predictable, deterministic state management for complex logic. Always keep reducers pure and pass dispatch down cleanly.',
};
