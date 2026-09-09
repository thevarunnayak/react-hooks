import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CHALLENGES_LIST, CHALLENGE_CATEGORIES } from '../data/challenges';
import { Card } from '../components/ui/Card';
import { Badge, BadgeProps } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Accordion } from '../components/ui/Accordion';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Filter,
  Check,
  Crosshair,
  List,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ChallengeItem } from '../types/challenge';
import { ChallengeModeModal, ChallengeSessionConfig } from '../components/challenges/ChallengeModeModal';
import { ChallengeSessionView } from '../components/challenges/ChallengeSessionView';
import { usePopupAlert } from '../hooks/usePopupAlert';
import { CustomPopupAlert } from '../components/ui/CustomPopupAlert';

const INITIAL_BATCH_SIZE = 15;
const BATCH_INCREMENT = 15;

const DIFFICULTY_BADGES: Record<string, BadgeProps['variant']> = {
  Beginner: 'default',
  Intermediate: 'cyan',
  Advanced: 'purple',
  Expert: 'primary',
};

const STORAGE_KEY_ANSWERS = 'react_hooks_challenge_answers';
const STORAGE_KEY_SUBMITTED = 'react_hooks_challenge_submitted';
const STORAGE_KEY_REVEALED = 'react_hooks_challenge_revealed';
const STORAGE_KEY_LAST_ATTEMPTED = 'react_hooks_challenge_last_attempted';
const STORAGE_KEY_VIEW_MODE = 'react_hooks_challenge_view_mode';

type ViewMode = 'focus' | 'accordion';
type TileFilter = 'all' | 'unattempted' | 'incorrect' | 'correct';

export interface ChallengesPageProps {
  onNavigate?: (route: string) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ onNavigate }) => {
  const { popupState, showConfirm, closePopup } = usePopupAlert();
  // View mode state (Interactive view vs Accordion view)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_VIEW_MODE) as ViewMode) || 'focus';
    } catch {
      return 'focus';
    }
  });

  // Local-first persistent attempts
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_ANSWERS) || '{}');
    } catch {
      return {};
    }
  });

  const [submitted, setSubmitted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SUBMITTED) || '{}');
    } catch {
      return {};
    }
  });

  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_REVEALED) || '{}');
    } catch {
      return {};
    }
  });

  // Filter and search state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  // Focus mode state (restores last attempted question from localStorage or fallback to highest submitted)
  const [focusedIndex, setFocusedIndex] = useState<number>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_LAST_ATTEMPTED);
      if (savedId) {
        const idx = CHALLENGES_LIST.findIndex((ch) => ch.id === savedId);
        if (idx !== -1) return idx;
      }
      // Fallback: check existing saved submissions or answers to find the last attempted question
      const savedSubmitted = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBMITTED) || '{}');
      const savedAnswers = JSON.parse(localStorage.getItem(STORAGE_KEY_ANSWERS) || '{}');
      for (let i = CHALLENGES_LIST.length - 1; i >= 0; i--) {
        const id = CHALLENGES_LIST[i].id;
        if (savedSubmitted[id] || savedAnswers[id] !== undefined) {
          return i;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return 0;
  });
  const [tileFilter, setTileFilter] = useState<TileFilter>('all');

  // Focus View toggle (hides filters to show questions only)
  const [isFocusViewActive, setIsFocusViewActive] = useState(false);

  // Challenge Mode state
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [activeChallengeSession, setActiveChallengeSession] = useState<{
    challenges: ChallengeItem[];
    timeLimitMinutes: number;
    config: ChallengeSessionConfig;
  } | null>(null);

  // Accordion mode progressive infinite scrolling state
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_LAST_ATTEMPTED);
      if (savedId) {
        const idx = CHALLENGES_LIST.findIndex((ch) => ch.id === savedId);
        if (idx >= INITIAL_BATCH_SIZE) {
          return idx + 5;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_BATCH_SIZE;
  });
  const [activeAccordionId] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_ATTEMPTED) || undefined;
    } catch {
      return undefined;
    }
  });
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [isNarrow, setIsNarrow] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 960 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsNarrow(window.innerWidth < 960);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollCategories = (dir: 'left' | 'right') => {
    categoryScrollRef.current?.scrollBy({
      left: dir === 'left' ? -260 : 260,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
    } catch {
      // Ignore storage errors
    }
  }, [viewMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(selectedAnswers));
    } catch {
      // Ignore storage errors
    }
  }, [selectedAnswers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBMITTED, JSON.stringify(submitted));
    } catch {
      // Ignore storage errors
    }
  }, [submitted]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVEALED, JSON.stringify(revealedAnswers));
    } catch {
      // Ignore storage errors
    }
  }, [revealedAnswers]);

  const handleSelectOption = (challengeId: string, optionIdx: number) => {
    if (submitted[challengeId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [challengeId]: optionIdx }));
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ATTEMPTED, challengeId);
    } catch {
      // Ignore storage errors
    }
  };

  const handleSubmitAnswer = (challengeId: string) => {
    setSubmitted((prev) => ({ ...prev, [challengeId]: true }));
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ATTEMPTED, challengeId);
    } catch {
      // Ignore storage errors
    }
  };

  const handleGiveUp = (challengeId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [challengeId]: true }));
  };

  const handleHideAnswer = (challengeId: string) => {
    setRevealedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
  };

  const handleResetChallenge = (challengeId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
    setSubmitted((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
    setRevealedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
  };

  const toggleHint = (challengeId: string) => {
    setRevealedHints((prev) => ({ ...prev, [challengeId]: !prev[challengeId] }));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setFocusedIndex(0);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setFocusedIndex(0);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulty(diff);
    setFocusedIndex(0);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setFocusedIndex(0);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  // Filtered dataset
  const filteredChallenges = useMemo(() => {
    return CHALLENGES_LIST.filter((ch) => {
      const matchesCat = selectedCategory === 'All' || ch.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || ch.difficulty === selectedDifficulty;
      const matchesType = selectedType === 'All' || ch.type === selectedType;

      const qText = search.toLowerCase();
      const matchesSearch =
        !search ||
        ch.title.toLowerCase().includes(qText) ||
        ch.question.toLowerCase().includes(qText) ||
        ch.category.toLowerCase().includes(qText) ||
        ch.id.toLowerCase().includes(qText) ||
        (ch.codeSnippet && ch.codeSnippet.toLowerCase().includes(qText));

      return matchesCat && matchesDiff && matchesType && matchesSearch;
    });
  }, [search, selectedCategory, selectedDifficulty, selectedType]);

  // Ensure focused index is bounded
  const safeFocusedIndex = Math.min(Math.max(0, focusedIndex), Math.max(0, filteredChallenges.length - 1));
  const activeChallenge = filteredChallenges[safeFocusedIndex];

  // Sync active question to localStorage for seamless restoration across page reloads
  useEffect(() => {
    if (activeChallenge?.id) {
      try {
        localStorage.setItem(STORAGE_KEY_LAST_ATTEMPTED, activeChallenge.id);
      } catch {
        // Ignore storage errors
      }
    }
  }, [activeChallenge?.id]);

  // Accordion infinite scroll slice
  const visibleChallenges = useMemo(() => {
    return filteredChallenges.slice(0, visibleCount);
  }, [filteredChallenges, visibleCount]);

  const hasMore = visibleCount < filteredChallenges.length;

  // Infinite scroll intersection observer for Accordion view
  useEffect(() => {
    if (viewMode !== 'accordion') return;
    const target = observerTargetRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredChallenges.length));
        }
      },
      { rootMargin: '350px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [viewMode, hasMore, filteredChallenges.length]);

  // Dynamic category counts based on selected difficulty level and challenge type
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    CHALLENGE_CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });

    CHALLENGES_LIST.forEach((ch) => {
      const matchesDiff = selectedDifficulty === 'All' || ch.difficulty === selectedDifficulty;
      const matchesType = selectedType === 'All' || ch.type === selectedType;
      if (matchesDiff && matchesType) {
        counts.All += 1;
        counts[ch.category] = (counts[ch.category] || 0) + 1;
      }
    });

    return counts;
  }, [selectedDifficulty, selectedType]);

  // Overall Statistics Calculation
  const stats = useMemo(() => {
    const submittedCount = Object.keys(submitted).length;
    let correctCount = 0;

    CHALLENGES_LIST.forEach((ch) => {
      if (submitted[ch.id] && selectedAnswers[ch.id] === ch.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const incorrectCount = submittedCount - correctCount;
    const accuracy = submittedCount > 0 ? Math.round((correctCount / submittedCount) * 100) : 0;
    const progressPercent = Math.round((submittedCount / CHALLENGES_LIST.length) * 100);

    return { submittedCount, correctCount, incorrectCount, accuracy, progressPercent };
  }, [submitted, selectedAnswers]);

  // Filtered tiles for navigator in Focus Mode
  const navigatorTiles = useMemo(() => {
    return filteredChallenges.map((ch, idx) => {
      const isSub = !!submitted[ch.id];
      const isCorr = isSub && selectedAnswers[ch.id] === ch.correctOptionIndex;
      const status: 'correct' | 'incorrect' | 'unattempted' = !isSub
        ? 'unattempted'
        : isCorr
        ? 'correct'
        : 'incorrect';

      return {
        challenge: ch,
        index: idx,
        displayNumber: ch.id.replace('ch-', ''),
        status,
      };
    }).filter((item) => {
      if (tileFilter === 'all') return true;
      return item.status === tileFilter;
    });
  }, [filteredChallenges, submitted, selectedAnswers, tileFilter]);

  // Challenge Mode Launcher
  const handleStartChallenge = (config: ChallengeSessionConfig) => {
    const pool = CHALLENGES_LIST.filter((ch) => {
      const matchesDiff =
        config.difficulty === 'All' || ch.difficulty === config.difficulty;
      const matchesCat =
        config.categories.includes('All') || config.categories.includes(ch.category);
      return matchesDiff && matchesCat;
    });

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const sampled = shuffled.slice(0, Math.min(config.questionCount, pool.length));

    const sessionPayload = {
      challenges: sampled,
      timeLimitMinutes: config.timeLimitMinutes,
      config,
    };

    try {
      localStorage.setItem('react_hooks_active_challenge_session', JSON.stringify(sessionPayload));
    } catch {
      // Ignore storage errors
    }

    if (onNavigate) {
      onNavigate('challenge-session');
    } else {
      setActiveChallengeSession(sessionPayload);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render the interactive challenge body
  const renderChallengeContent = (challenge: ChallengeItem) => {
    const userAnswer = selectedAnswers[challenge.id];
    const isSubmitted = submitted[challenge.id];
    const isCorrect = isSubmitted && userAnswer === challenge.correctOptionIndex;
    const isRevealed = !!revealedAnswers[challenge.id];
    const showHint = revealedHints[challenge.id];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
        {/* Title & Question */}
        <div>
          <h3 style={{ fontSize: 'clamp(var(--text-sm), 2.5vw, var(--text-md))', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {challenge.title}
          </h3>
          <p style={{ fontSize: 'clamp(12px, 2vw, var(--text-sm))', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.55 }}>
            {challenge.question}
          </p>
        </div>

        {/* Code Snippet */}
        {challenge.codeSnippet && (
          <pre
            style={{
              margin: 0,
              padding: isMobile ? '10px 12px' : '12px 14px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(10.5px, 2vw, var(--text-xs))',
              lineHeight: 1.55,
              overflowX: 'auto',
              maxWidth: '100%',
              WebkitOverflowScrolling: 'touch',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <code>{challenge.codeSnippet}</code>
          </pre>
        )}

        {/* Answer Options */}
        {challenge.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {challenge.options.map((option, optIdx) => {
              const isSelected = userAnswer === optIdx;
              const isRightAnswer = optIdx === challenge.correctOptionIndex;
              const shouldShowRightAnswer = isSubmitted && (isCorrect || isRevealed) && isRightAnswer;
              const isWrongSelection = isSubmitted && isSelected && !isCorrect;

              let bgColor = 'var(--bg-surface-elevated)';
              let borderColor = 'var(--border-default)';

              if (shouldShowRightAnswer) {
                bgColor = 'var(--accent-success-subtle)';
                borderColor = 'var(--accent-success)';
              } else if (isWrongSelection) {
                bgColor = 'var(--accent-danger-subtle)';
                borderColor = 'var(--accent-danger)';
              } else if (isSelected) {
                borderColor = 'var(--accent-primary)';
                bgColor = 'var(--accent-primary-subtle)';
              }

              let radioBorderColor = 'var(--border-strong)';
              let radioDotColor: string | null = null;

              if (shouldShowRightAnswer) {
                radioBorderColor = 'var(--accent-success)';
                radioDotColor = 'var(--accent-success)';
              } else if (isWrongSelection) {
                radioBorderColor = 'var(--accent-danger)';
                radioDotColor = 'var(--accent-danger)';
              } else if (isSelected) {
                radioBorderColor = 'var(--accent-primary)';
                radioDotColor = 'var(--accent-primary)';
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(challenge.id, optIdx)}
                  style={{
                    padding: isMobile ? '8px 10px' : '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    cursor: isSubmitted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    gap: isMobile ? '8px' : '10px',
                    fontSize: 'clamp(11.5px, 2vw, var(--text-xs))',
                    color: 'var(--text-primary)',
                    lineHeight: 1.45,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${radioBorderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {radioDotColor && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: radioDotColor,
                        }}
                      />
                    )}
                  </span>
                  <span style={{ flex: '1 1 auto', minWidth: '180px' }}>{option}</span>
                  {isSubmitted && !isCorrect && isRevealed && isRightAnswer && (
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: 'var(--accent-success-text)',
                        backgroundColor: 'var(--accent-success-subtle)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        letterSpacing: '0.02em',
                        flexShrink: 0,
                      }}
                    >
                      Correct Answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Hint Bar & Submit / Reset / Give Up Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => toggleHint(challenge.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              <HelpCircle size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>{showHint ? 'Hide Hint' : 'View Hint'}</span>
            </button>

            {showHint && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', wordBreak: 'break-word' }}>
                "{challenge.hint}"
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isSubmitted ? (
              <Button
                size="xs"
                variant="primary"
                disabled={userAnswer === undefined}
                onClick={() => handleSubmitAnswer(challenge.id)}
              >
                Submit Answer
              </Button>
            ) : isCorrect ? (
              <Button
                size="xs"
                variant="ghost"
                icon={<RotateCcw size={12} />}
                onClick={() => handleResetChallenge(challenge.id)}
              >
                Try Again
              </Button>
            ) : (
              <>
                {!isRevealed ? (
                  <Button
                    size="xs"
                    variant="outline"
                    icon={<Eye size={12} />}
                    onClick={() => handleGiveUp(challenge.id)}
                  >
                    Give Up & Show Answer
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={<EyeOff size={12} />}
                    onClick={() => handleHideAnswer(challenge.id)}
                  >
                    Hide Answer
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="primary"
                  icon={<RotateCcw size={12} />}
                  onClick={() => handleResetChallenge(challenge.id)}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Detailed Explanation Banner */}
        {isSubmitted && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isCorrect
                ? 'var(--accent-success-subtle)'
                : isRevealed
                ? 'rgba(168, 85, 247, 0.08)'
                : 'var(--accent-danger-subtle)',
              border: isCorrect
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : isRevealed
                ? '1px solid rgba(168, 85, 247, 0.3)'
                : '1px solid rgba(244, 63, 94, 0.3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              lineHeight: 1.55,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              animation: 'fadeIn 200ms ease-out',
            }}
          >
            {isCorrect ? (
              <CheckCircle2 size={16} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />
            ) : isRevealed ? (
              <Sparkles size={16} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <XCircle size={16} style={{ color: 'var(--accent-danger)', flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ flex: 1 }}>
              {isCorrect ? (
                <>
                  <strong style={{ color: 'var(--accent-success-text)' }}>Correct! </strong>
                  <span>{challenge.explanation}</span>
                </>
              ) : isRevealed ? (
                <>
                  <strong style={{ color: 'var(--accent-purple-text)' }}>Answer Revealed: </strong>
                  <span>{challenge.explanation}</span>
                </>
              ) : (
                <div>
                  <strong style={{ color: 'var(--accent-danger-text)' }}>Incorrect. </strong>
                  <span>
                    That's not the right answer. Review the code snippet and try again, or click "Give Up & Show Answer" to reveal the solution.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // If Challenge Mode session is active, render the exam / result view
  if (activeChallengeSession) {
    return (
      <div
        style={{
          padding: 'var(--space-6) var(--space-8)',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
        className="challenges-page-session"
      >
        <ChallengeSessionView
          challenges={activeChallengeSession.challenges}
          timeLimitMinutes={activeChallengeSession.timeLimitMinutes}
          onExit={() => setActiveChallengeSession(null)}
          onRetake={() => handleStartChallenge(activeChallengeSession.config)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 'var(--space-4) clamp(12px, 3.5vw, var(--space-8))',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      }}
      className="challenges-page"
    >
      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              <Trophy size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(var(--text-lg), 4vw, var(--text-2xl))', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Interactive React Hooks Challenges
              </h1>
              <p style={{ fontSize: 'clamp(12px, 2.5vw, var(--text-sm))', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Test your understanding of render snapshots, closure traps, effect dependencies, and optimization hooks.
              </p>
            </div>
          </div>

          {/* Action Row: View Switcher & Challenge Mode on Far Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px', flexWrap: 'wrap', marginLeft: isMobile ? '0' : 'auto' }}>
            {/* View Mode Segmented Control */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-subtle)',
                padding: '2px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                height: '32px',
                boxSizing: 'border-box',
              }}
            >
              <button
                onClick={() => setViewMode('focus')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: isMobile ? '0 8px' : '0 12px',
                  height: '24px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: 'var(--text-xs)',
                  fontWeight: viewMode === 'focus' ? 700 : 500,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'focus' ? 'var(--bg-surface)' : 'transparent',
                  color: viewMode === 'focus' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'focus' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Crosshair size={13} />
                <span>{isMobile ? 'Interactive' : 'Interactive View'}</span>
              </button>

              <button
                onClick={() => setViewMode('accordion')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: isMobile ? '0 8px' : '0 12px',
                  height: '24px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: 'var(--text-xs)',
                  fontWeight: viewMode === 'accordion' ? 700 : 500,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'accordion' ? 'var(--bg-surface)' : 'transparent',
                  color: viewMode === 'accordion' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'accordion' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <List size={13} />
                <span>{isMobile ? 'Accordion' : 'Accordion View'}</span>
              </button>
            </div>

            {/* Focus View Button (Hides filter and progress sections for distraction-free questionnaire) */}
            <button
              onClick={() => setIsFocusViewActive((prev) => !prev)}
              title={isFocusViewActive ? 'Exit Focus View (Show filters & progress)' : 'Focus View (Hide filters & progress)'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '32px',
                padding: isMobile ? '0 8px' : '0 12px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${isFocusViewActive ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                backgroundColor: isFocusViewActive ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
                color: isFocusViewActive ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: isFocusViewActive ? 700 : 500,
                cursor: 'pointer',
                boxShadow: isFocusViewActive ? 'var(--shadow-xs)' : 'none',
                transition: 'all var(--transition-fast)',
                boxSizing: 'border-box',
              }}
            >
              {isFocusViewActive ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{isMobile ? 'Focus' : 'Focus View'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Progress & Accuracy Tracker with Start a Challenge button (Hidden in Focus View) */}
        {!isFocusViewActive && (
          <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Progress: {stats.submittedCount} / {CHALLENGES_LIST.length} completed ({stats.progressPercent}%)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Accuracy: {stats.correctCount} correct ({stats.accuracy}%)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Start a Challenge Button */}
                <button
                  onClick={() => setIsChallengeModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Zap size={13} style={{ color: '#fef08a' }} />
                  <span>Start a Challenge</span>
                </button>

                {stats.submittedCount > 0 && (
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={<RotateCcw size={11} />}
                    onClick={() => {
                      showConfirm({
                        title: 'Reset Challenge Progress',
                        message: 'Are you sure you want to reset all challenge answers and progress? This action cannot be undone.',
                        type: 'danger',
                        confirmText: 'Yes, Reset All',
                        cancelText: 'Cancel',
                        onConfirm: () => {
                          setSelectedAnswers({});
                          setSubmitted({});
                          setRevealedAnswers({});
                          setFocusedIndex(0);
                          try {
                            localStorage.removeItem(STORAGE_KEY_LAST_ATTEMPTED);
                          } catch {
                            // Ignore storage errors
                          }
                        },
                      });
                    }}
                  >
                    Reset Progress
                  </Button>
                )}
              </div>
            </div>

            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stats.progressPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-primary)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Redesigned Spacious Filter Card (Hidden when Focus View is active) */}
      {!isFocusViewActive && (
        <Card
          variant="glass"
          padding="md"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {/* Row 1: Search & Difficulty Level */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 260px', width: '100%', minWidth: 0 }}>
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Search 250+ challenges, questions, code..."
              />
            </div>

            {/* Difficulty Segmented Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Level:
              </span>
              <div
                className="no-scrollbar"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '2px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  gap: '2px',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((diff) => {
                  const isActive = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => handleDifficultyChange(diff)}
                      style={{
                        padding: isMobile ? '3px 8px' : '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: isMobile ? '11px' : 'var(--text-xs)',
                        fontWeight: isActive ? 700 : 500,
                        border: 'none',
                        backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Category Carousel (With Left/Right Scroll Arrows & Clean Mask Fade) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Categories ({categoryCounts.All || 0})
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => scrollCategories('left')}
                  title="Scroll categories left"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => scrollCategories('right')}
                  title="Scroll categories right"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div
              ref={categoryScrollRef}
              className="no-scrollbar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflowX: 'auto',
                padding: '4px 2px',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                width: '100%',
              }}
            >
              {CHALLENGE_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] ?? 0;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: isMobile ? '4px 10px' : '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: isMobile ? '11px' : 'var(--text-xs)',
                      fontWeight: isSelected ? 700 : 500,
                      whiteSpace: 'nowrap',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-purple)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-purple-subtle)' : 'var(--bg-surface-elevated)',
                      color: isSelected ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                      opacity: count === 0 ? 0.45 : 1,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      flexShrink: 0,
                    }}
                  >
                    <span>{cat}</span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.25)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--accent-purple-text)' : 'var(--text-muted)',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Challenge Type Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Filter size={11} /> Type:
              </span>
              {['All', 'predict', 'find_bug', 'fix_hook', 'choose_hook', 'optimize', 'debug', 'architecture'].map((t) => {
                const isActive = selectedType === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      border: '1px solid',
                      borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                      backgroundColor: isActive ? 'var(--accent-cyan-subtle)' : 'transparent',
                      color: isActive ? 'var(--accent-cyan-text)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {t.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* VIEW 1: INTERACTIVE VIEW (Split Screen: Single Question Left + Question Number Tiles Right) */}
      {viewMode === 'focus' && (
        <div style={{ display: 'flex', gap: isNarrow ? 'var(--space-4)' : 'var(--space-6)', alignItems: 'flex-start', flexWrap: 'wrap', width: '100%', minWidth: 0 }}>
          {filteredChallenges.length === 0 ? (
            <Card variant="default" padding="lg" style={{ textAlign: 'center', padding: 'var(--space-8)', width: '100%' }}>
              <HelpCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)' }}>
                No challenges matched your search
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                Try adjusting your search query, difficulty level, or category filter.
              </p>
            </Card>
          ) : (
            <>
              {/* Left Panel: Focused Single Challenge Card */}
              <div style={{ flex: isNarrow ? '1 1 100%' : '1 1 560px', minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeChallenge && (
                  <Card
                    variant="elevated"
                    padding="lg"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      border: submitted[activeChallenge.id]
                        ? selectedAnswers[activeChallenge.id] === activeChallenge.correctOptionIndex
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : revealedAnswers[activeChallenge.id]
                          ? '1px solid rgba(168, 85, 247, 0.4)'
                          : '1px solid rgba(244, 63, 94, 0.4)'
                        : undefined,
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary-text)' }}>
                          Question {safeFocusedIndex + 1} of {filteredChallenges.length}
                        </span>
                        <Badge variant="purple">{activeChallenge.type.replace('_', ' ').toUpperCase()}</Badge>
                        <Badge variant={DIFFICULTY_BADGES[activeChallenge.difficulty] || 'default'}>
                          {activeChallenge.difficulty}
                        </Badge>
                        {submitted[activeChallenge.id] && (
                          <Badge
                            variant={
                              selectedAnswers[activeChallenge.id] === activeChallenge.correctOptionIndex
                                ? 'success'
                                : revealedAnswers[activeChallenge.id]
                                ? 'purple'
                                : 'danger'
                            }
                          >
                            {selectedAnswers[activeChallenge.id] === activeChallenge.correctOptionIndex
                              ? 'Correct'
                              : revealedAnswers[activeChallenge.id]
                              ? 'Revealed'
                              : 'Incorrect'}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="cyan">{activeChallenge.category}</Badge>
                    </div>

                    {/* Challenge Interactive Body */}
                    {renderChallengeContent(activeChallenge)}
                  </Card>
                )}

                {/* Bottom Navigation Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-surface)',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    gap: '6px',
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ChevronLeft size={14} />}
                    disabled={safeFocusedIndex === 0}
                    onClick={() => {
                      setFocusedIndex((p) => Math.max(0, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {isMobile ? 'Prev' : 'Previous Question'}
                  </Button>

                  <span style={{ fontSize: 'clamp(10px, 2vw, var(--text-xs))', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    #{activeChallenge?.id.replace('ch-', '')} ({safeFocusedIndex + 1}/{filteredChallenges.length})
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safeFocusedIndex >= filteredChallenges.length - 1}
                    onClick={() => {
                      setFocusedIndex((p) => Math.min(filteredChallenges.length - 1, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {isMobile ? 'Next' : 'Next Question'} <ChevronRight size={14} style={{ marginLeft: '2px' }} />
                  </Button>
                </div>
              </div>

              {/* Right Panel: Question Number Tiles Navigator Sidebar */}
              <div
                style={{
                  flex: isNarrow ? '1 1 100%' : '0 0 320px',
                  width: '100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: isNarrow ? 'static' : 'sticky',
                  top: '20px',
                }}
              >
                <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Navigator Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, margin: 0, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Question Navigator
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {navigatorTiles.length} items
                    </span>
                  </div>

                  {/* Tile Status Filter Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    {(['all', 'unattempted', 'incorrect', 'correct'] as TileFilter[]).map((f) => {
                      const isActive = tileFilter === f;
                      return (
                        <button
                          key={f}
                          onClick={() => setTileFilter(f)}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '10px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
                            backgroundColor: isActive ? 'var(--accent-primary-subtle)' : 'transparent',
                            color: isActive ? 'var(--accent-primary-text)' : 'var(--text-muted)',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tile Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
                      gap: '5px',
                      maxHeight: isNarrow ? '240px' : '440px',
                      overflowY: 'auto',
                      padding: '4px 2px',
                      scrollbarWidth: 'thin',
                    }}
                  >
                    {navigatorTiles.map((tile) => {
                      const isCurrent = tile.index === safeFocusedIndex;
                      let bgColor = 'var(--bg-surface)';
                      let borderColor = 'var(--border-subtle)';
                      let textColor = 'var(--text-secondary)';

                      if (tile.status === 'correct') {
                        bgColor = 'var(--accent-success-subtle)';
                        borderColor = 'var(--accent-success)';
                        textColor = 'var(--accent-success-text)';
                      } else if (tile.status === 'incorrect') {
                        bgColor = 'var(--accent-danger-subtle)';
                        borderColor = 'var(--accent-danger)';
                        textColor = 'var(--accent-danger-text)';
                      }

                      return (
                        <button
                          key={tile.challenge.id}
                          onClick={() => {
                            setFocusedIndex(tile.index);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          title={`#${tile.displayNumber}: ${tile.challenge.title} (${tile.status})`}
                          style={{
                            height: '36px',
                            borderRadius: 'var(--radius-sm)',
                            border: isCurrent ? '2px solid var(--accent-primary)' : `1px solid ${borderColor}`,
                            backgroundColor: bgColor,
                            color: isCurrent ? 'var(--accent-primary-text)' : textColor,
                            fontSize: '11px',
                            fontWeight: isCurrent ? 800 : 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            boxShadow: isCurrent ? '0 0 0 2px var(--accent-primary-subtle)' : 'none',
                          }}
                        >
                          {tile.displayNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigator Legend */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--accent-success)' }} />
                      <span>Correct</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--accent-danger)' }} />
                      <span>Incorrect</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--border-strong)' }} />
                      <span>Unattempted</span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW 2: ACCORDION INFINITE SCROLL MODE */}
      {viewMode === 'accordion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Results Count & Infinite Scroll Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Showing {visibleChallenges.length} of {filteredChallenges.length} challenges
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </span>

            {hasMore && (
              <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 600 }}>
                Scroll down to load more challenges automatically
              </span>
            )}
          </div>

          {visibleChallenges.length === 0 ? (
            <Card variant="default" padding="lg" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <HelpCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)' }}>
                No challenges matched your search
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                Try adjusting your search query, difficulty level, or category filter.
              </p>
            </Card>
          ) : (
            <Accordion
              defaultOpenId={activeAccordionId}
              allowMultiple
              items={visibleChallenges.map((challenge) => {
                const isSub = !!submitted[challenge.id];
                const isCorr = isSub && selectedAnswers[challenge.id] === challenge.correctOptionIndex;
                const isRev = !isCorr && !!revealedAnswers[challenge.id];
                const diffVariant = DIFFICULTY_BADGES[challenge.difficulty] || 'default';

                return {
                  id: challenge.id,
                  title: (
                    <div
                      id={`challenge-accordion-${challenge.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        flexWrap: 'wrap',
                        gap: '8px',
                        paddingRight: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary-text)' }}>
                          #{challenge.id.replace('ch-', '')}
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {challenge.title}
                        </span>
                        <Badge variant="purple">{challenge.type.replace('_', ' ').toUpperCase()}</Badge>
                        <Badge variant={diffVariant}>{challenge.difficulty}</Badge>
                        <Badge variant="cyan">{challenge.category}</Badge>
                      </div>

                      <div>
                        {isSub ? (
                          <Badge variant={isCorr ? 'success' : isRev ? 'purple' : 'danger'}>
                            {isCorr ? 'Correct' : isRev ? 'Revealed' : 'Incorrect'}
                          </Badge>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Unattempted
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                  content: (
                    <div style={{ padding: '8px 4px 4px 4px' }}>
                      {renderChallengeContent(challenge)}
                    </div>
                  ),
                };
              })}
            />
          )}

          {/* Infinite Scroll Sentinel & Load More Fallback */}
          {filteredChallenges.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              {hasMore ? (
                <div
                  ref={observerTargetRef}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    width: '100%',
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredChallenges.length))}
                  >
                    Load More ({filteredChallenges.length - visibleCount} remaining)
                  </Button>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Loading more challenges as you scroll...
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Check size={14} style={{ color: 'var(--accent-success)' }} />
                  <span>All {filteredChallenges.length} challenges loaded</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Challenge Mode Setup Modal */}
      <ChallengeModeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onStartChallenge={handleStartChallenge}
      />

      {/* Global Custom Confirmation / Alert Dialog */}
      <CustomPopupAlert {...popupState} onClose={closePopup} />
    </div>
  );
};
