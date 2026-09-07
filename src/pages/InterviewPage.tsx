import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { INTERVIEW_QUESTIONS_LIST, INTERVIEW_CATEGORIES } from '../data/interviews';
import { Card } from '../components/ui/Card';
import { Badge, BadgeProps } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Accordion } from '../components/ui/Accordion';
import {
  Award,
  CheckCircle2,
  HelpCircle,
  Code2,
  AlertTriangle,
  Lightbulb,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Headphones,
  Sparkles,
  Workflow,
  Compass,
  Volume2,
} from 'lucide-react';
import { InterviewDifficulty, InterviewQuestionItem } from '../types/challenge';
import { useInterviewAudio } from '../hooks/useInterviewAudio';
import { AudioCoachPlayer } from '../components/interviewAudio/AudioCoachPlayer';
import { AudioSettingsModal } from '../components/interviewAudio/AudioSettingsModal';
import { AudioTranscriptDrawer } from '../components/interviewAudio/AudioTranscriptDrawer';
import { ResumeAudioBanner } from '../components/interviewAudio/ResumeAudioBanner';
import { buildQuestionAudioSegments } from '../services/interviewAudio/audioSegmentBuilder';

const DIFFICULTY_BADGE_VARIANTS: Record<InterviewDifficulty, BadgeProps['variant']> = {
  Junior: 'default',
  Mid: 'default',
  Senior: 'purple',
  Architect: 'cyan',
  Principal: 'primary',
  Lead: 'warning',
};

export const InterviewPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [revealedFollowUps, setRevealedFollowUps] = useState<Record<string, boolean>>({});
  const [openQuestionIds, setOpenQuestionIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userHasScrolledAway, setUserHasScrolledAway] = useState(false);

  // Local-first persistent mastery tracking
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('react_hooks_interview_mastered') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('react_hooks_interview_mastered', JSON.stringify(masteredIds));
    } catch {
      // Ignore storage errors
    }
  }, [masteredIds]);

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const [expandedKnowledgeIds, setExpandedKnowledgeIds] = useState<Record<string, boolean>>({});

  const toggleKnowMore = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedKnowledgeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollowUp = (id: string) => {
    setRevealedFollowUps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter questions based on search, category, and difficulty
  const filteredQuestions = useMemo(() => {
    return INTERVIEW_QUESTIONS_LIST.filter((q) => {
      const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      const qText = search.toLowerCase();
      const matchesSearch =
        !search ||
        q.question.toLowerCase().includes(qText) ||
        q.shortAnswer.toLowerCase().includes(qText) ||
        q.deepDive.toLowerCase().includes(qText) ||
        q.category.toLowerCase().includes(qText) ||
        q.id.toLowerCase().includes(qText);

      return matchesCat && matchesDiff && matchesSearch;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  // Initialize Audio Learning Hook
  const audio = useInterviewAudio(filteredQuestions);

  // Dynamic category counts based on selected difficulty level
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    INTERVIEW_CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });

    INTERVIEW_QUESTIONS_LIST.forEach((q) => {
      const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      if (matchesDiff) {
        counts.All += 1;
        counts[q.category] = (counts[q.category] || 0) + 1;
      }
    });

    return counts;
  }, [selectedDifficulty]);

  const INITIAL_BATCH_SIZE = 20;
  const BATCH_INCREMENT = 15;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (dir: 'left' | 'right') => {
    categoryScrollRef.current?.scrollBy({
      left: dir === 'left' ? -260 : 260,
      behavior: 'smooth',
    });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulty(diff);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  // Slice questions progressively for infinite load
  const visibleQuestions = useMemo(() => {
    return filteredQuestions.slice(0, visibleCount);
  }, [filteredQuestions, visibleCount]);

  const hasMore = visibleCount < filteredQuestions.length;

  // Infinite scroll intersection observer
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredQuestions.length));
        }
      },
      { rootMargin: '350px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, filteredQuestions.length]);

  // Synchronize Audio Question: Automatically expand question accordion card and reveal follow-up if narrated
  useEffect(() => {
    if (!audio.currentQuestion?.id) return;
    const qId = audio.currentQuestion.id;

    // Ensure the question's card is expanded
    setOpenQuestionIds((prev) => (prev.includes(qId) ? prev : [...prev, qId]));

    // Ensure question is loaded in visibleQuestions
    const qIndex = filteredQuestions.findIndex((q) => q.id === qId);
    if (qIndex >= 0 && qIndex >= visibleCount) {
      setVisibleCount(qIndex + 10);
    }

    // If active segment is follow-up, automatically reveal the follow-up answer
    if (audio.currentSegment?.type === 'follow-up') {
      setRevealedFollowUps((prev) => ({ ...prev, [qId]: true }));
    }
  }, [audio.currentQuestion?.id, audio.currentSegment?.type, filteredQuestions, visibleCount]);

  // Smooth Auto-Scroll to Active Section
  const isProgrammaticScrollRef = useRef(false);

  const scrollToActiveSegment = useCallback(() => {
    if (!audio.currentSegment) return;
    const el = document.getElementById(audio.currentSegment.targetElementId);
    if (el) {
      isProgrammaticScrollRef.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setUserHasScrolledAway(false);
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 800);
    }
  }, [audio.currentSegment]);

  useEffect(() => {
    if (audio.playbackState === 'playing' && audio.settings.autoFollow && audio.currentSegment) {
      scrollToActiveSegment();
    }
  }, [audio.currentSegment, audio.playbackState, audio.settings.autoFollow, scrollToActiveSegment]);

  // Detect manual user scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      if (audio.playbackState === 'playing' && audio.settings.autoFollow) {
        setUserHasScrolledAway(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [audio.playbackState, audio.settings.autoFollow]);

  // Accordion Toggle Handler
  const handleAccordionToggle = (id: string) => {
    setOpenQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Segments for transcript drawer
  const transcriptSegments = useMemo(() => {
    if (!audio.currentQuestion) return [];
    return buildQuestionAudioSegments(
      audio.currentQuestion,
      audio.progressInfo.currentQuestionIndex
    );
  }, [audio.currentQuestion, audio.progressInfo.currentQuestionIndex]);

  const masteredPercentage = Math.round(
    (masteredIds.length / INTERVIEW_QUESTIONS_LIST.length) * 100
  );

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8) 120px var(--space-8)',
        maxWidth: '1080px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        position: 'relative',
      }}
      className="interview-page"
    >
      {/* Resume Audio Session Banner */}
      {audio.savedProgress && audio.playbackState === 'idle' && (
        <ResumeAudioBanner
          progress={audio.savedProgress}
          onResume={audio.resumeSavedProgress}
          onDismiss={audio.dismissSavedProgress}
        />
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--accent-purple-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Senior React Engineer Interview Bank
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                220 rigorous architectural questions testing internal Fiber workings, concurrent transitions, stale closures, Suspense, and state systems.
              </p>
            </div>
          </div>

          {/* Primary Audio Learning Player Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant={audio.playbackState === 'playing' ? 'secondary' : 'primary'}
              size="sm"
              icon={<Headphones size={15} />}
              onClick={() => {
                if (audio.playbackState === 'playing') {
                  audio.pause();
                } else if (audio.playbackState === 'paused') {
                  audio.resume();
                } else {
                  audio.play();
                }
              }}
            >
              {audio.playbackState === 'playing'
                ? 'Pause Audio Coach'
                : audio.playbackState === 'paused'
                ? 'Resume Audio Coach'
                : 'Listen to Interview Prep'}
            </Button>
          </div>
        </div>

        {/* Progress & Mastery Tracker */}
        <Card variant="glass" padding="sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent-success)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Self-Assessment Mastery: {masteredIds.length} / {INTERVIEW_QUESTIONS_LIST.length} mastered ({masteredPercentage}%)
            </span>
          </div>

          <div style={{ flex: 1, minWidth: '160px', maxWidth: '280px', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${masteredPercentage}%`,
                height: '100%',
                backgroundColor: 'var(--accent-success)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </Card>
      </div>

      {/* Redesigned Spacious Filter Card */}
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
        {/* Row 1: Search & Level Filter */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 320px', minWidth: '240px' }}>
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search 220 senior questions, answers, internals..."
            />
          </div>

          {/* Difficulty Segmented Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Level:
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-subtle)',
                padding: '3px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                gap: '2px',
              }}
            >
              {['All', 'Senior', 'Architect', 'Principal'].map((lvl) => {
                const isActive = selectedDifficulty === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => handleDifficultyChange(lvl)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: isActive ? 700 : 500,
                      border: 'none',
                      backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {lvl}
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
              gap: '8px',
              overflowX: 'auto',
              padding: '4px 2px',
              scrollBehavior: 'smooth',
            }}
          >
            {INTERVIEW_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] ?? 0;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: isSelected ? 700 : 500,
                    whiteSpace: 'nowrap',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-purple)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--accent-purple-subtle)' : 'var(--bg-surface-elevated)',
                    color: isSelected ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                    opacity: count === 0 ? 0.45 : 1,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span>{cat}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
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
      </Card>

      {/* Results Count & Infinite Scroll Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Showing {visibleQuestions.length} of {filteredQuestions.length} questions
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </span>

        {hasMore && (
          <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 600 }}>
            Scroll down to load more automatically
          </span>
        )}
      </div>

      {/* Accordion Questions List */}
      {visibleQuestions.length === 0 ? (
        <Card variant="default" padding="lg" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <HelpCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)' }}>
            No questions matched your search
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
            Try adjusting your search terms, level, or category filter.
          </p>
        </Card>
      ) : (
        <Accordion
          openIds={openQuestionIds}
          onToggle={handleAccordionToggle}
          items={visibleQuestions.map((item: InterviewQuestionItem) => {
            const isMastered = masteredIds.includes(item.id);
            const isFollowUpRevealed = revealedFollowUps[item.id];
            const badgeVariant = DIFFICULTY_BADGE_VARIANTS[item.difficulty] || 'default';
            const isQuestionActiveInAudio = audio.currentQuestion?.id === item.id;
            const isPlayerOn = audio.playbackState === 'playing' || audio.playbackState === 'paused';
            const isThisQuestionActiveInAudio = isQuestionActiveInAudio && isPlayerOn;
            const currentSegmentId = audio.currentSegment?.id;

            const hasNewContent = Boolean(
              item.mentalModel ||
              (item.stepByStep && item.stepByStep.length > 0) ||
              item.practicalExample ||
              (item.misconceptions && item.misconceptions.length > 0) ||
              item.interviewInsight ||
              (item.relatedConcepts && item.relatedConcepts.length > 0)
            );

            // Show everything when player is on OR when user explicitly toggled "Know More"
            const isKnowMoreExpanded = isPlayerOn || Boolean(expandedKnowledgeIds[item.id]);

            return {
              id: item.id,
              title: (
                <div
                  id={`interview-q-${item.id}`}
                  className={`audio-clickable-segment ${
                    currentSegmentId === `${item.id}-question` ? 'audio-active-segment' : ''
                  }`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 4px',
                  }}
                  onClick={(e) => {
                    // If audio is playing, clicking title jumps to question
                    if (audio.playbackState !== 'idle') {
                      e.stopPropagation();
                      audio.jumpToSegment(`${item.id}-question`);
                    }
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    #{item.id.replace('int-', '')}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {item.question}
                  </span>
                  {isQuestionActiveInAudio && (
                    <span
                      title="Currently being narrated by Audio Coach"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--accent-purple)',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      <Volume2 size={13} style={{ animation: 'pulse 1s infinite' }} />
                    </span>
                  )}
                </div>
              ),
              badge: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Play Question Quick Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isQuestionActiveInAudio && audio.playbackState === 'playing') {
                        audio.pause();
                      } else {
                        audio.jumpToQuestion(item.id);
                      }
                    }}
                    title="Listen to this question aloud"
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: isQuestionActiveInAudio ? 'var(--accent-purple)' : 'var(--border-subtle)',
                      backgroundColor: isQuestionActiveInAudio ? 'var(--accent-purple-subtle)' : 'var(--bg-subtle)',
                      color: isQuestionActiveInAudio ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Headphones size={11} />
                    <span>{isQuestionActiveInAudio && audio.playbackState === 'playing' ? 'Playing' : 'Listen'}</span>
                  </button>

                  <Badge variant={badgeVariant} size="sm">
                    {item.difficulty}
                  </Badge>
                  {isMastered && (
                    <Badge variant="success" size="sm" icon={<Check size={10} />}>
                      Mastered
                    </Badge>
                  )}
                </div>
              ),
              subtitle: item.category,
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
                  {/* Category & Mastery Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Category: {item.category}
                    </span>
                    <Button
                      size="xs"
                      variant={isMastered ? 'primary' : 'outline'}
                      icon={isMastered ? <Check size={12} /> : <CheckCircle2 size={12} />}
                      onClick={(e) => toggleMastered(item.id, e)}
                    >
                      {isMastered ? 'Mastered' : 'Mark as Mastered'}
                    </Button>
                  </div>

                  {/* 1. Short Answer / Executive Summary */}
                  <div
                    id={`interview-summary-${item.id}`}
                    className={`audio-clickable-segment ${
                      currentSegmentId === `${item.id}-summary` ? 'audio-active-segment' : ''
                    }`}
                    onClick={() => audio.jumpToSegment(`${item.id}-summary`)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--accent-primary-subtle)',
                      borderLeft: '3px solid var(--accent-primary)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: 'var(--accent-primary-text)' }}>Executive Summary: </strong>
                    <span>{item.shortAnswer}</span>
                  </div>

                  {/* 2. Architectural Deep Dive */}
                  <div
                    id={`interview-deep-dive-${item.id}`}
                    className={`audio-clickable-segment ${
                      currentSegmentId === `${item.id}-deep-dive` ? 'audio-active-segment' : ''
                    }`}
                    onClick={() => audio.jumpToSegment(`${item.id}-deep-dive`)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.65,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Lightbulb size={14} style={{ color: 'var(--accent-purple)' }} />
                      <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
                        Architectural Deep Dive & Internals:
                      </strong>
                    </div>
                    <span>{item.deepDive}</span>
                  </div>

                  {/* 3. Code Reasoning (if available) */}
                  {item.codeExample && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <Code2 size={13} />
                        <strong>Code Reasoning:</strong>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          padding: '12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-code)',
                          border: '1px solid var(--border-subtle)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--text-primary)',
                          overflowX: 'auto',
                          lineHeight: 1.5,
                        }}
                      >
                        <code>{item.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* 4. Common Pitfalls & Traps */}
                  {item.commonPitfalls && item.commonPitfalls.length > 0 && (
                    <div
                      id={`interview-pitfall-${item.id}`}
                      className={`audio-clickable-segment ${
                        currentSegmentId === `${item.id}-pitfall` ? 'audio-active-segment' : ''
                      }`}
                      onClick={() => audio.jumpToSegment(`${item.id}-pitfall`)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--accent-danger-subtle)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        fontSize: '11px',
                        color: 'var(--accent-danger-text)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        lineHeight: 1.5,
                      }}
                    >
                      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Senior Pitfall / Interview Trap: </strong>
                        <span>{item.commonPitfalls.join(' ')}</span>
                      </div>
                    </div>
                  )}

                  {/* 5. Follow-Up Question (Adaptive Questioning) */}
                  {item.followUp && (
                    <div
                      id={`interview-followup-${item.id}`}
                      className={`audio-clickable-segment ${
                        currentSegmentId === `${item.id}-follow-up` ? 'audio-active-segment' : ''
                      }`}
                      onClick={() => audio.jumpToSegment(`${item.id}-follow-up`)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px dashed var(--border-default)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <HelpCircle size={14} style={{ color: 'var(--accent-primary)' }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Follow-Up Interviewer Probe:
                          </span>
                        </div>
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={<Eye size={12} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowUp(item.id);
                          }}
                        >
                          {isFollowUpRevealed ? 'Hide Answer' : 'Reveal Answer'}
                        </Button>
                      </div>

                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                        "{item.followUp.question}"
                      </div>

                      {isFollowUpRevealed && (
                        <div
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--bg-surface)',
                            borderLeft: '2px solid var(--accent-success)',
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong style={{ color: 'var(--accent-success-text)' }}>Model Response: </strong>
                          {item.followUp.answer}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Know More Toggle Button for Normal Reading */}
                  {hasNewContent && !isPlayerOn && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2px' }}>
                      <button
                        onClick={(e) => toggleKnowMore(item.id, e)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid',
                          borderColor: isKnowMoreExpanded ? 'var(--accent-purple)' : 'var(--border-default)',
                          backgroundColor: isKnowMoreExpanded ? 'var(--accent-purple-subtle)' : 'var(--bg-subtle)',
                          color: isKnowMoreExpanded ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <Sparkles size={12} style={{ color: 'var(--accent-purple)' }} />
                        <span>{isKnowMoreExpanded ? 'Show Less' : 'Know More'}</span>
                        {isKnowMoreExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  )}

                  {/* Audio Player Active Indicator (When player is on) */}
                  {hasNewContent && isPlayerOn && isThisQuestionActiveInAudio && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--accent-purple-subtle)',
                        border: '1px solid rgba(139, 92, 246, 0.25)',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={11} />
                        Full Senior Blueprint & Insights (Audio Active)
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Auto-Expanded</span>
                    </div>
                  )}

                  {/* EXTENDED SECTIONS: Hidden during normal reading unless 'Know More' is clicked, or shown automatically when Audio Player is on */}
                  {isKnowMoreExpanded && hasNewContent && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        paddingTop: '6px',
                        borderTop: '1px dashed var(--border-subtle)',
                        animation: 'fadeIn 0.25s ease-out',
                      }}
                    >
                      {/* Mental Model & Flow */}
                      {item.mentalModel && (
                        <div
                          id={`interview-mental-model-${item.id}`}
                          className={`audio-clickable-segment ${
                            currentSegmentId === `${item.id}-mental-model` ? 'audio-active-segment' : ''
                          }`}
                          onClick={() => audio.jumpToSegment(`${item.id}-mental-model`)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-purple)' }}>
                            <Workflow size={14} />
                            <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Mental Model & Execution Flow:
                            </strong>
                          </div>
                          <pre
                            style={{
                              margin: 0,
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--bg-code)',
                              border: '1px solid var(--border-subtle)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              color: 'var(--text-primary)',
                              overflowX: 'auto',
                              lineHeight: 1.45,
                            }}
                          >
                            <code>{item.mentalModel}</code>
                          </pre>
                        </div>
                      )}

                      {/* Step-by-Step Breakdown */}
                      {item.stepByStep && item.stepByStep.length > 0 && (
                        <div
                          style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <strong style={{ fontSize: '11px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Step-by-Step Lifecycle Sequence:
                          </strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {item.stepByStep.map((step, sIdx) => {
                              const isStepActive = currentSegmentId === `${item.id}-step-${sIdx}`;
                              return (
                                <div
                                  key={sIdx}
                                  id={`interview-step-${item.id}-${sIdx}`}
                                  className={`audio-clickable-segment ${isStepActive ? 'audio-active-segment' : ''}`}
                                  onClick={() => audio.jumpToSegment(`${item.id}-step-${sIdx}`)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    padding: '6px 8px',
                                    borderRadius: 'var(--radius-xs)',
                                    backgroundColor: isStepActive ? 'var(--accent-purple-subtle)' : 'var(--bg-subtle)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  <span
                                    style={{
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      backgroundColor: 'var(--bg-surface)',
                                      border: '1px solid var(--border-subtle)',
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      color: 'var(--accent-purple-text)',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {sIdx + 1}
                                  </span>
                                  <span>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Production Practical Example */}
                      {item.practicalExample && (
                        <div
                          id={`interview-example-${item.id}`}
                          className={`audio-clickable-segment ${
                            currentSegmentId === `${item.id}-example` ? 'audio-active-segment' : ''
                          }`}
                          onClick={() => audio.jumpToSegment(`${item.id}-example`)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                          }}
                        >
                          <strong style={{ color: 'var(--accent-primary-text)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>
                            Production Architecture Example:
                          </strong>
                          <span>{item.practicalExample}</span>
                        </div>
                      )}

                      {/* Candidate Misconceptions */}
                      {item.misconceptions && item.misconceptions.length > 0 && (
                        <div
                          id={`interview-misconceptions-${item.id}`}
                          className={`audio-clickable-segment ${
                            currentSegmentId === `${item.id}-misconception` ? 'audio-active-segment' : ''
                          }`}
                          onClick={() => audio.jumpToSegment(`${item.id}-misconception`)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong style={{ color: 'var(--accent-warning-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Common Candidate Misconceptions:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {item.misconceptions.map((misc, mIdx) => (
                              <li key={mIdx}>{misc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Senior Interview Insight */}
                      {item.interviewInsight && (
                        <div
                          id={`interview-insight-${item.id}`}
                          className={`audio-clickable-segment ${
                            currentSegmentId === `${item.id}-insight` ? 'audio-active-segment' : ''
                          }`}
                          onClick={() => audio.jumpToSegment(`${item.id}-insight`)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--accent-purple-subtle)',
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            fontSize: '11px',
                            color: 'var(--accent-purple-text)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            lineHeight: 1.5,
                          }}
                        >
                          <Sparkles size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong>Senior Framing Insight: </strong>
                            <span>{item.interviewInsight}</span>
                          </div>
                        </div>
                      )}

                      {/* Related Concepts Tags */}
                      {item.relatedConcepts && item.relatedConcepts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Related:
                          </span>
                          {item.relatedConcepts.map((concept, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--bg-subtle)',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '10px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bottom Show Less Button when manually toggled in normal reading mode */}
                      {!isPlayerOn && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                          <button
                            onClick={(e) => toggleKnowMore(item.id, e)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-muted)',
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            <ChevronUp size={10} />
                            <span>Show Less</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ),
            };
          })}
          allowMultiple
        />
      )}

      {/* Floating Re-Anchor Follow Button (Appears if user manually scrolled away during playback) */}
      {userHasScrolledAway && audio.playbackState === 'playing' && audio.currentSegment && (
        <button
          onClick={scrollToActiveSegment}
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '24px',
            zIndex: 950,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Compass size={14} />
          <span>↳ Follow Audio (Q#{audio.progressInfo.currentQuestionIndex + 1})</span>
        </button>
      )}

      {/* Infinite Scroll Sentinel & Load More Fallback */}
      {filteredQuestions.length > 0 && (
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
                onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredQuestions.length))}
              >
                Load More ({filteredQuestions.length - visibleCount} remaining)
              </Button>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Loading more questions as you scroll...
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
              <span>All {filteredQuestions.length} questions loaded</span>
            </div>
          )}
        </div>
      )}

      {/* Floating Audio Coach Player Deck */}
      <AudioCoachPlayer
        playbackState={audio.playbackState}
        currentSegment={audio.currentSegment}
        currentQuestion={audio.currentQuestion}
        progressInfo={audio.progressInfo}
        settings={audio.settings}
        onPlay={audio.play}
        onPause={audio.pause}
        onStop={audio.stop}
        onNextQuestion={audio.nextQuestion}
        onPrevQuestion={audio.prevQuestion}
        onSeekRelative={audio.seekRelative}
        onSeekToSegment={audio.seekToSegmentIndex}
        onRateChange={audio.setRate}
        onAutoFollowToggle={() => audio.setAutoFollow(!audio.settings.autoFollow)}
        onToggleMinimize={() => audio.setIsMinimized(!audio.settings.isMinimized)}
        onToggleTranscript={() => audio.setShowTranscript(!audio.settings.showTranscript)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Voice & Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={audio.settings}
        availableVoices={audio.availableVoices}
        onRateChange={audio.setRate}
        onPitchChange={audio.setPitch}
        onVoiceChange={audio.setVoiceURI}
        onPauseModeChange={audio.setPauseMode}
        onAutoFollowChange={audio.setAutoFollow}
        onHighlightSentencesChange={audio.setHighlightSentences}
        onShowScrubberThumbChange={audio.setShowScrubberThumb}
        onPreviewVoice={audio.previewVoice}
      />

      {/* Real-Time Narration Transcript Drawer */}
      <AudioTranscriptDrawer
        isOpen={audio.settings.showTranscript && audio.playbackState !== 'idle'}
        onClose={() => audio.setShowTranscript(false)}
        question={audio.currentQuestion}
        segments={transcriptSegments}
        currentSegmentId={audio.currentSegment?.id || null}
        isPlaying={audio.playbackState === 'playing'}
        onJumpToSegment={audio.jumpToSegment}
      />
    </div>
  );
};
