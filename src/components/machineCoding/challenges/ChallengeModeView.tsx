import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MachineCodingChallenge,
  ChallengeSessionConfig,
  ChallengeLayoutPreferences,
} from '../../../types/machineCodingChallenge';
import { useChallengeSession } from '../../../hooks/useChallengeSession';
import { runChallengeTests } from '../../../services/challengeSandbox/testRunner';
import { ChallengeModeLanding } from './ChallengeModeLanding';
import { ChallengeHeader } from './ChallengeHeader';
import { ChallengeProblemPanel } from './ChallengeProblemPanel';
import { ChallengeEditor } from './ChallengeEditor';
import { ChallengePreviewPanel } from './ChallengePreviewPanel';
import { ChallengeTestResultsPanel } from './ChallengeTestResultsPanel';
import { ChallengeCompletionModal } from './ChallengeCompletionModal';
import { ChallengeSolutionModal } from './ChallengeSolutionModal';
import { TimeUpModal } from './TimeUpModal';
import { ResizableSplitPane } from '../../ui/ResizableSplitPane';
import { getChallengeById } from '../../../data/machineCodingChallenges';
import { PanelLeftClose, PanelLeft, Terminal } from 'lucide-react';

export interface ChallengeModeViewProps {
  initialChallengeId?: string;
  onNavigateChallenge?: (challengeId?: string) => void;
  onExitToLabs: () => void;
}

const LAYOUT_PREFS_KEY = 'reactlabz_challenge_layout_prefs';

export const ChallengeModeView: React.FC<ChallengeModeViewProps> = ({
  initialChallengeId,
  onNavigateChallenge,
  onExitToLabs,
}) => {
  // Session Configuration State
  const [activeSession, setActiveSession] = useState<{
    challenges: MachineCodingChallenge[];
    config: ChallengeSessionConfig;
  } | null>(() => {
    if (initialChallengeId) {
      const ch = getChallengeById(initialChallengeId);
      if (ch) {
        return {
          challenges: [ch],
          config: {
            type: 'single',
            mode: 'practice',
            isTimed: true,
            durationMinutes: 30,
            difficulty: ch.difficulty,
            allowPause: true,
          },
        };
      }
    }
    return null;
  });

  // Sync session if route/initialChallengeId changes (e.g. browser back/forward or direct URL)
  useEffect(() => {
    if (initialChallengeId) {
      const ch = getChallengeById(initialChallengeId);
      if (ch) {
        setActiveSession((prev) => {
          if (prev?.challenges.length === 1 && prev.challenges[0].id === ch.id) {
            return prev;
          }
          return {
            challenges: [ch],
            config: {
              type: 'single',
              mode: 'practice',
              isTimed: true,
              durationMinutes: 30,
              difficulty: ch.difficulty,
              allowPause: true,
            },
          };
        });
      }
    } else {
      setActiveSession(null);
    }
  }, [initialChallengeId]);

  const handleStartSession = (
    challenges: MachineCodingChallenge[],
    config: ChallengeSessionConfig
  ) => {
    setActiveSession({ challenges, config });
    if (challenges.length > 0 && onNavigateChallenge) {
      onNavigateChallenge(challenges[0].id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitSession = () => {
    setActiveSession(null);
    onNavigateChallenge?.(undefined);
  };

  // If no session active, show Landing Page
  if (!activeSession) {
    return (
      <ChallengeModeLanding
        completedRecords={{}}
        onStartSession={handleStartSession}
        onBackToLabs={onExitToLabs}
      />
    );
  }

  return (
    <ActiveChallengeEnvironment
      challenges={activeSession.challenges}
      config={activeSession.config}
      onNavigateChallenge={onNavigateChallenge}
      onExit={handleExitSession}
    />
  );
};

interface ActiveChallengeEnvironmentProps {
  challenges: MachineCodingChallenge[];
  config: ChallengeSessionConfig;
  onNavigateChallenge?: (challengeId: string) => void;
  onExit: () => void;
}

const ActiveChallengeEnvironment: React.FC<ActiveChallengeEnvironmentProps> = ({
  challenges,
  config,
  onNavigateChallenge,
  onExit,
}) => {
  const session = useChallengeSession(challenges, config);

  // Sync route when question changes
  useEffect(() => {
    if (session.currentChallenge?.id && onNavigateChallenge) {
      onNavigateChallenge(session.currentChallenge.id);
    }
  }, [session.currentChallenge?.id, onNavigateChallenge]);

  // View mode: 'code' | 'preview' | 'split'
  const isBackend = session.currentChallenge.track === 'backend';
  const [activeView, setActiveView] = useState<'code' | 'preview' | 'split'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 'code';
    return isBackend ? 'code' : 'split';
  });

  // Switch to code view if switching to a backend challenge
  useEffect(() => {
    if (isBackend && activeView === 'preview') {
      setActiveView('code');
    }
  }, [isBackend, activeView]);

  // Layout preferences & split states
  const [layoutPrefs, setLayoutPrefs] = useState<ChallengeLayoutPreferences>(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_PREFS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      problemPanelWidth: 380,
      testPanelHeight: 230,
      previewPanelWidth: 450,
      isProblemCollapsed: false,
      isTestCollapsed: false,
      isEditorMaximized: false,
    };
  });

  // Save layout preferences to localStorage
  const updateLayoutPrefs = useCallback((updates: Partial<ChallengeLayoutPreferences>) => {
    setLayoutPrefs((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(LAYOUT_PREFS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Execution states
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [timeUpDismissed, setTimeUpDismissed] = useState(false);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024 && activeView === 'split') {
        setActiveView('code');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeView]);

  // Global Keyboard Shortcuts (⌘B, ⌘J, ⌘M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta) return;

      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        updateLayoutPrefs({ isProblemCollapsed: !layoutPrefs.isProblemCollapsed });
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        updateLayoutPrefs({ isTestCollapsed: !layoutPrefs.isTestCollapsed });
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        updateLayoutPrefs({ isEditorMaximized: !layoutPrefs.isEditorMaximized });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutPrefs, updateLayoutPrefs]);

  // Compile line errors for Monaco editor markers
  const errorMarkers = useMemo(() => {
    if (!session.testResults?.compileError) return [];
    const err = session.testResults.compileError;
    const match = err.match(/(\d+):(\d+)/) || err.match(/line (\d+)/i);
    const line = match ? parseInt(match[1], 10) : 1;
    return [{ line, message: err, severity: 'error' as const }];
  }, [session.testResults?.compileError]);

  // Run Public Tests (Cmd + Enter)
  const handleRunTests = useCallback(async () => {
    if (isRunningTests || isSubmitting) return;
    setIsRunningTests(true);

    // Auto expand test panel if collapsed
    if (layoutPrefs.isTestCollapsed) {
      updateLayoutPrefs({ isTestCollapsed: false });
    }

    try {
      const results = await runChallengeTests(session.currentChallenge, session.userCode, false);
      session.setTestResults(results);
    } catch (err) {
      console.error('Test run failed:', err);
    } finally {
      setIsRunningTests(false);
    }
  }, [isRunningTests, isSubmitting, session, layoutPrefs.isTestCollapsed, updateLayoutPrefs]);

  // Submit Challenge (Runs Public + Hidden tests) (Cmd + Shift + Enter)
  const handleSubmit = useCallback(async () => {
    if (isRunningTests || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const results = await runChallengeTests(session.currentChallenge, session.userCode, true);
      session.setTestResults(results);

      const passedAll = results.passed === results.total && results.total > 0;
      if (passedAll) {
        session.recordSuccess(100);
      }
      setShowCompletionModal(true);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isRunningTests, isSubmitting, session]);

  // Time's Up Handling
  const handleTimeUpSubmit = () => {
    setTimeUpDismissed(true);
    handleSubmit();
  };

  const handleTimeUpContinue = () => {
    setTimeUpDismissed(true);
    if (session.isPaused) {
      session.togglePause();
    }
  };

  const handleTimeUpRestart = () => {
    setTimeUpDismissed(true);
    session.resetCode();
  };

  // Next Question
  const handleNextQuestion = () => {
    setShowCompletionModal(false);
    session.nextQuestion();
  };

  const hasNext = session.currentIndex < challenges.length - 1;

  // Render Editor + Preview inside top pane
  const renderEditorArea = () => {
    const fileName = isBackend ? 'solution.ts' : 'App.tsx';
    const editor = (
      <ChallengeEditor
        code={session.userCode}
        isDirty={session.isDirty}
        onChange={session.updateCode}
        onReset={session.resetCode}
        onRunTests={handleRunTests}
        onSubmit={handleSubmit}
        fileName={fileName}
        language="typescript"
        isMaximized={layoutPrefs.isEditorMaximized}
        onToggleMaximize={() =>
          updateLayoutPrefs({ isEditorMaximized: !layoutPrefs.isEditorMaximized })
        }
        errorMarkers={errorMarkers}
      />
    );

    if (activeView === 'code' || layoutPrefs.isEditorMaximized) {
      return editor;
    }

    if (activeView === 'preview') {
      return <ChallengePreviewPanel userCode={session.userCode} />;
    }

    // Split view: Editor & Live Preview side by side with resizable splitter
    return (
      <ResizableSplitPane
        direction="horizontal"
        defaultSize={layoutPrefs.previewPanelWidth ?? 450}
        minSize={280}
        maxSize={windowWidth - 400}
        isPixelSize={true}
        onResizeEnd={(size) => updateLayoutPrefs({ previewPanelWidth: size })}
        pane1={editor}
        pane2={<ChallengePreviewPanel userCode={session.userCode} />}
      />
    );
  };

  // Right column: Workbench with Top Editor/Preview and Bottom Test Results
  const renderWorkbench = () => {
    if (layoutPrefs.isEditorMaximized) {
      return (
        <div style={{ width: '100%', height: '100%', padding: '6px' }}>
          {renderEditorArea()}
        </div>
      );
    }

    if (layoutPrefs.isTestCollapsed) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '6px', gap: 6 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            {renderEditorArea()}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Terminal size={13} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Test Results & Console</span>
              {session.testResults && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor:
                      session.testResults.passed === session.testResults.total
                        ? 'var(--accent-success-subtle)'
                        : 'var(--accent-danger-subtle)',
                    color:
                      session.testResults.passed === session.testResults.total
                        ? 'var(--accent-success-text)'
                        : 'var(--accent-danger-text)',
                  }}
                >
                  {session.testResults.passed}/{session.testResults.total} passed
                </span>
              )}
            </div>
            <button
              onClick={() => updateLayoutPrefs({ isTestCollapsed: false })}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Expand Test Panel (⌘J)"
            >
              <span>Expand Panel (⌘J)</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ height: '100%', padding: '6px', minHeight: 0 }}>
        <ResizableSplitPane
          direction="vertical"
          defaultSize={layoutPrefs.testPanelHeight}
          minSize={120}
          maxSize={450}
          isPixelSize={true}
          onResizeEnd={(size) => updateLayoutPrefs({ testPanelHeight: size })}
          pane1={<div style={{ height: '100%', minHeight: 0 }}>{renderEditorArea()}</div>}
          pane2={
            <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ChallengeTestResultsPanel
                results={session.testResults}
                isRunning={isRunningTests || isSubmitting}
                onCollapse={() => updateLayoutPrefs({ isTestCollapsed: true })}
              />
            </div>
          }
        />
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 58px)',
        backgroundColor: 'var(--bg-app)',
        overflow: 'hidden',
      }}
      className="active-challenge-container"
    >
      {/* Top Header Bar */}
      <ChallengeHeader
        challenge={session.currentChallenge}
        sessionChallenges={session.sessionChallenges}
        currentIndex={session.currentIndex}
        config={config}
        timeRemaining={session.timeRemaining}
        elapsedSeconds={session.elapsedSeconds}
        isPaused={session.isPaused}
        isTimed={session.isTimed}
        isRunningTests={isRunningTests}
        isSubmitting={isSubmitting}
        activeView={activeView}
        testResults={session.testResults}
        onRunTests={handleRunTests}
        onSubmit={handleSubmit}
        onResetCode={session.resetCode}
        onTogglePause={session.togglePause}
        onChangeView={setActiveView}
        onSelectQuestion={session.goToQuestion}
        onExit={onExit}
      />

      {/* Main Coding Workbench Split */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {isMobile ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <ChallengeProblemPanel
                challenge={session.currentChallenge}
                hintsRevealed={session.hintsRevealed}
                onRevealHint={session.revealNextHint}
                isInterviewMode={config.mode === 'interview'}
              />
            </div>
            <div style={{ flex: 1, minHeight: 400, padding: '8px' }}>
              {renderWorkbench()}
            </div>
          </div>
        ) : layoutPrefs.isEditorMaximized ? (
          <div style={{ flex: 1, height: '100%', minHeight: 0 }}>
            {renderWorkbench()}
          </div>
        ) : layoutPrefs.isProblemCollapsed ? (
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div
              style={{
                width: 38,
                height: '100%',
                backgroundColor: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 12,
                gap: 12,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => updateLayoutPrefs({ isProblemCollapsed: false })}
                title="Expand Problem Statement (⌘B)"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PanelLeft size={16} />
              </button>
              <span
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                }}
                onClick={() => updateLayoutPrefs({ isProblemCollapsed: false })}
              >
                Problem Description
              </span>
            </div>
            <div style={{ flex: 1, height: '100%', minHeight: 0 }}>
              {renderWorkbench()}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', minHeight: 0 }}>
            <ResizableSplitPane
              direction="horizontal"
              defaultSize={layoutPrefs.problemPanelWidth}
              minSize={260}
              maxSize={650}
              isPixelSize={true}
              onResizeEnd={(size) => updateLayoutPrefs({ problemPanelWidth: size })}
              pane1={
                <div
                  style={{
                    padding: '6px 4px 6px 6px',
                    height: '100%',
                    minHeight: 0,
                    overflowY: 'auto',
                    position: 'relative',
                  }}
                >
                  <ChallengeProblemPanel
                    challenge={session.currentChallenge}
                    hintsRevealed={session.hintsRevealed}
                    onRevealHint={session.revealNextHint}
                    isInterviewMode={config.mode === 'interview'}
                    onCollapse={() => updateLayoutPrefs({ isProblemCollapsed: true })}
                  />
                </div>
              }
              pane2={renderWorkbench()}
            />
          </div>
        )}
      </div>

      {/* Time's Up Expiration Modal */}
      <TimeUpModal
        isOpen={session.isTimeUp && !timeUpDismissed}
        onClose={() => setTimeUpDismissed(true)}
        onSubmit={handleTimeUpSubmit}
        onContinue={handleTimeUpContinue}
        onRestart={handleTimeUpRestart}
      />

      {/* Completion Modal */}
      <ChallengeCompletionModal
        isOpen={showCompletionModal}
        challenge={session.currentChallenge}
        testResults={session.testResults}
        elapsedSeconds={session.elapsedSeconds}
        hintsRevealed={session.hintsRevealed}
        config={config}
        hasNextQuestion={hasNext}
        onClose={() => setShowCompletionModal(false)}
        onNextQuestion={handleNextQuestion}
        onTryAgain={() => setShowCompletionModal(false)}
        onReviewSolution={() => {
          setShowCompletionModal(false);
          setShowSolutionModal(true);
        }}
      />

      {/* Solution Review Modal */}
      <ChallengeSolutionModal
        isOpen={showSolutionModal}
        challenge={session.currentChallenge}
        onClose={() => setShowSolutionModal(false)}
      />
    </div>
  );
};
