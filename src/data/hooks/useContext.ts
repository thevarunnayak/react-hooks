import { HookLessonData } from '../../types/hook';

export const useContextData: HookLessonData = {
  id: 'useContext',
  name: 'useContext',
  tagline: 'Read and subscribe to context from your component without prop drilling.',
  category: 'Context',
  difficulty: 'Beginner',
  reactVersion: '16.8+',
  labId: 'useContextLab',

  whatIsIt: 'useContext is a React Hook that lets you read and subscribe to context from your component, eliminating the need to pass props through intermediate components (prop drilling).',

  whyExists: 'Passing global information (current authenticated user, active UI theme, routing state, localization) through dozens of intermediate components that do not need it clutters code and degrades maintainability.',

  simpleExplanation: 'Create a Context outside your components. Wrap a parent tree with <ThemeContext.Provider value={theme}>. Inside any descendant component at any depth, call useContext(ThemeContext) to read that value directly.',

  analogy: {
    metaphor: 'The Radio Broadcast Tower',
    description: 'Instead of handing a physical newspaper from house to house down the street (prop drilling), a radio tower broadcasts a frequency across the city (Context.Provider). Any house with a radio tuned to that station (useContext) hears the broadcast directly, while other houses are not bothered.',
  },

  syntax: `const value = useContext(SomeContext);`,

  arguments: [
    {
      name: 'SomeContext',
      type: 'React.Context<T>',
      required: true,
      description: 'The context object created with createContext.',
    },
  ],

  returnValue: {
    type: 'T',
    description: 'The context value for the calling component. It is determined as the value passed to the closest SomeContext.Provider above the calling component in the tree.',
  },

  mentalModel: {
    summary: 'Provider Value Change -> Subscribed Consumer Re-render Waves',
    diagramSteps: [
      'Parent component updates value prop on <Context.Provider value={nextVal} />.',
      'React walks the descendant Fiber tree.',
      'Any component calling useContext(Context) is marked as dirty.',
      'Consumers re-render with the fresh context value.',
    ],
    details: 'React searches up the component tree to find the nearest Provider for that context. If no provider exists, it returns the defaultValue passed to createContext(defaultValue).',
  },

  visualExplanation: {
    title: 'Context Propagation Waves',
    description: 'How updates flow to consumers and non-consumers:',
    phases: [
      { phase: 'Provider Update', description: 'Context value changes from light to dark.' },
      { phase: 'Consumers Re-render', description: 'Every component calling useContext(ThemeContext) re-renders.' },
      { phase: 'Non-Consumers', description: 'Intermediate components re-render by default unless wrapped in React.memo.' },
    ],
  },

  primaryExample: {
    title: 'Theme Context Provider and Consumer',
    code: `import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('light');

export function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <ThemedButton />; // Notice no prop drilling here!
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Theme is {theme}</button>;
}`,
    description: 'ThemedButton reads the theme directly without Toolbar having to pass it down as a prop.',
  },

  tryItYourselfPrompt: 'Open the Component Tree Lab. Change the provider color and watch which child components re-render when React.memo is enabled on the non-consumer child!',

  internalMechanism: 'Context uses a linked list of dependencies on the Fiber node (fiber.dependencies). When a Provider value changes (tested with Object.is), React traverses down the subtree and schedules updates on all consumer fibers.',

  commonMistakes: [
    {
      title: 'Passing a Brand-New Object Every Render',
      badCode: `<AuthContext.Provider value={{ user, login }}>`,
      goodCode: `const value = useMemo(() => ({ user, login }), [user, login]);\n<AuthContext.Provider value={value}>`,
      explanation: 'Passing an inline object to value causes every single consumer component to re-render on every parent render, even if user and login did not change!',
      dangerLevel: 'critical',
    },
  ],

  performanceTips: [
    'Memoize the context value with useMemo to prevent accidental re-renders across all consumers.',
    'Split unrelated contexts (e.g. UserContext and ThemeContext) so components consuming Theme do not re-render when User changes.',
  ],

  whenNotToUse: [
    'For local component state: Just use useState.',
    'To avoid passing props just 1 or 2 levels down: Plain props are simpler and more explicit.',
  ],

  alternatives: [
    { name: 'Component Composition (<Layout userProfile={<Profile />} />)', reason: 'Often eliminates prop drilling without needing global context.' },
  ],

  interviewQuestions: [
    {
      question: 'How do you prevent unnecessary re-renders in context consumers?',
      answer: '1) Wrap the provider value in useMemo, 2) Split large context objects into smaller separate contexts, 3) Wrap intermediate non-consumer components in React.memo.',
      deepDive: 'In React 19, the use(Context) hook can also be used inside conditionals and loops, expanding context ergonomics.',
      difficulty: 'Senior',
    },
  ],

  relatedHooks: ['useState', 'useReducer', 'use'],
  keyTakeaway: 'useContext provides clean dependency injection across component subtrees. Always memoize provider values and split unrelated contexts to avoid performance bottlenecks.',
};
