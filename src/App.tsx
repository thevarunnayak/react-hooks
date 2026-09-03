import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { HookLessonPage } from './pages/HookLessonPage';
import { HookMapPage } from './pages/HookMapPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { CustomHooksPage } from './pages/CustomHooksPage';
import { CustomHookDetailPage } from './pages/CustomHookDetailPage';
import { HookBuilderPage } from './pages/HookBuilderPage';
import { TutorialsPage } from './pages/TutorialsPage';
import { ExamplesPage } from './pages/ExamplesPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { InterviewPage } from './pages/InterviewPage';
import { HOOKS_BY_ID, HOOKS_CATALOG } from './data/hooks';
import { CUSTOM_HOOKS_CATALOG } from './data/custom-hooks/catalog';
import { useLocalStorage } from './hooks/useLocalStorage';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);

  // Local-First Progress & Bookmarks (No backend required)
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('react_hooks_bookmarks', []);
  const [completedLessons, setCompletedLessons] = useLocalStorage<string[]>('react_hooks_completed', []);

  // Sync with browser URL hash for clean navigation & deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [route, param] = hash.split('/');
        setCurrentRoute(route || 'home');
        setCurrentParam(param);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string, param?: string) => {
    setCurrentRoute(route);
    setCurrentParam(param);
    window.location.hash = param ? `${route}/${param}` : route;
  };

  const toggleBookmark = (hookId: string) => {
    setBookmarks((prev) =>
      prev.includes(hookId) ? prev.filter((id) => id !== hookId) : [...prev, hookId]
    );
  };

  const toggleComplete = (hookId: string) => {
    setCompletedLessons((prev) =>
      prev.includes(hookId) ? prev.filter((id) => id !== hookId) : [...prev, hookId]
    );
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <HomePage
            onNavigate={navigate}
            completedLessons={completedLessons}
          />
        );

      case 'hook': {
        const lesson = HOOKS_BY_ID.get(currentParam || 'useState') || HOOKS_CATALOG[0];
        return (
          <HookLessonPage
            lesson={lesson}
            isBookmarked={bookmarks.includes(lesson.id)}
            isCompleted={completedLessons.includes(lesson.id)}
            onToggleBookmark={toggleBookmark}
            onToggleComplete={toggleComplete}
            onNavigateHook={(id) => navigate('hook', id)}
            onOpenInPlayground={() => navigate('playground')}
          />
        );
      }

      case 'playground':
        return <PlaygroundPage key={currentParam || 'counter'} initialTutorialId={currentParam || 'counter'} />;

      case 'hook-map':
        return <HookMapPage onNavigateHook={(id) => navigate('hook', id)} />;

      case 'custom-hooks':
        return (
          <CustomHooksPage
            onSelectHook={(id) => navigate('custom-hook-detail', id)}
            onOpenBuilder={() => navigate('hook-builder')}
          />
        );

      case 'custom-hook-detail': {
        const hookItem =
          CUSTOM_HOOKS_CATALOG.find((c) => c.id === currentParam) || CUSTOM_HOOKS_CATALOG[0];
        return (
          <CustomHookDetailPage
            hook={hookItem}
            onBack={() => navigate('custom-hooks')}
            onOpenInPlayground={() => navigate('playground')}
          />
        );
      }

      case 'hook-builder':
        return <HookBuilderPage />;

      case 'tutorials':
        return (
          <TutorialsPage
            onLoadInPlayground={(tutKey) => navigate('playground', tutKey)}
          />
        );

      case 'examples':
        return (
          <ExamplesPage
            onLoadInPlayground={(tutKey) => navigate('playground', tutKey)}
          />
        );

      case 'challenges':
        return <ChallengesPage />;

      case 'interview':
        return <InterviewPage />;

      default:
        return (
          <HomePage
            onNavigate={navigate}
            completedLessons={completedLessons}
          />
        );
    }
  };

  return (
    <AppShell
      currentRoute={currentRoute}
      currentHookId={currentParam}
      onNavigate={navigate}
      bookmarks={bookmarks}
      completedLessons={completedLessons}
    >
      {renderCurrentView()}
    </AppShell>
  );
}

export default App;
