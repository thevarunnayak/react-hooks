import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/ui/SplashScreen';
import { HomePage } from './pages/HomePage';
import { HookLessonPage } from './pages/HookLessonPage';
import { HookMapPage } from './pages/HookMapPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { CustomHooksPage } from './pages/CustomHooksPage';
import { CustomHookDetailPage } from './pages/CustomHookDetailPage';
import { HookBuilderPage } from './pages/HookBuilderPage';
import { ExamplesPage } from './pages/ExamplesPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ChallengeSessionPage } from './pages/ChallengeSessionPage';
import { InterviewPage } from './pages/InterviewPage';
import { MachineCodingPage } from './pages/MachineCodingPage';
import { AboutPage } from './pages/AboutPage';
import { HOOKS_BY_ID, HOOKS_CATALOG } from './data/hooks';
import { CUSTOM_HOOKS_CATALOG } from './data/custom-hooks/catalog';
import { MACHINE_CODING_PROBLEMS_BY_ID } from './data/machineCoding/problems';
import { useLocalStorage } from './hooks/useLocalStorage';
import { trackEvent } from './utils/analytics';
import { getTutorialForHook, getTutorialForCustomHook } from './constants/tutorialMapping';

const EMPTY_STRING_ARRAY: string[] = [];

export function App() {
  // Brand Splash Screen (shows on initial session launch)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('nosplash')) {
        return false;
      }
      return !sessionStorage.getItem('reactlabz_splash_shown');
    } catch {
      return true;
    }
  });

  const handleSplashFinish = useCallback(() => {
    try {
      sessionStorage.setItem('reactlabz_splash_shown', 'true');
    } catch {}
    setShowSplash(false);
  }, []);

  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);
  const [currentSubParam, setCurrentSubParam] = useState<string | undefined>(undefined);

  // Local-First Progress & Bookmarks (No backend required)
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('react_hooks_bookmarks', EMPTY_STRING_ARRAY);
  const [completedLessons, setCompletedLessons] = useLocalStorage<string[]>('react_hooks_completed', EMPTY_STRING_ARRAY);

  // Sync with browser URL hash for clean navigation & deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [route, param, subParam] = hash.split('/');
        setCurrentRoute(route || 'home');
        setCurrentParam(param);
        setCurrentSubParam(subParam);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Track route views in Vercel Analytics
  useEffect(() => {
    trackEvent('page_view', { route: currentRoute, param: currentParam || 'none' });
  }, [currentRoute, currentParam]);

  const navigate = (route: string, param?: string, subParam?: string) => {
    setCurrentRoute(route);
    setCurrentParam(param);
    setCurrentSubParam(subParam);
    const hashParts = [route, param, subParam].filter(Boolean);
    window.location.hash = hashParts.join('/');
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
            onOpenInPlayground={(hookId) => {
              const targetTutorial = getTutorialForHook(hookId || lesson.id);
              navigate('playground', targetTutorial);
            }}
          />
        );
      }

      case 'playground':
        return (
          <PlaygroundPage
            key={`${currentParam || 'counter'}-${currentSubParam || 'builder'}`}
            initialTutorialId={currentParam || 'counter'}
            initialView={currentSubParam === 'preview' ? 'preview' : currentSubParam === 'layout' ? 'layout' : 'builder'}
          />
        );

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
            onOpenInPlayground={(id) => {
              const targetTutorial = getTutorialForCustomHook(id || hookItem.id);
              navigate('playground', targetTutorial);
            }}
          />
        );
      }

      case 'hook-builder':
        return <HookBuilderPage />;

      case 'examples':
        return (
          <ExamplesPage
            onLoadInPlayground={(tutKey, view) => navigate('playground', tutKey, view)}
          />
        );

      case 'challenges':
        return <ChallengesPage onNavigate={navigate} />;

      case 'challenge-session':
      case 'challenge-mode':
        return <ChallengeSessionPage onNavigate={navigate} />;

      case 'machine-coding':
        return (
          <MachineCodingPage
            onNavigate={navigate}
            initialProblemId={currentParam}
          />
        );

      case 'interview':
        return <InterviewPage />;

      case 'about':
        return <AboutPage onNavigate={navigate} />;

      default: {
        // Direct route support if URL hash is e.g. #/todo-task-manager or #/debounced-search
        if (MACHINE_CODING_PROBLEMS_BY_ID.has(currentRoute)) {
          return (
            <MachineCodingPage
              onNavigate={navigate}
              initialProblemId={currentRoute}
            />
          );
        }

        return (
          <HomePage
            onNavigate={navigate}
            completedLessons={completedLessons}
          />
        );
      }
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <AppShell
        currentRoute={currentRoute}
        currentHookId={currentParam}
        onNavigate={navigate}
        bookmarks={bookmarks}
        completedLessons={completedLessons}
      >
        {renderCurrentView()}
      </AppShell>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
