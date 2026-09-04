import React, { useState, useMemo, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { InterviewDifficulty, InterviewQuestionItem } from '../types/challenge';

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

  const toggleFollowUp = (id: string) => {
    setRevealedFollowUps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter questions
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

  const masteredPercentage = Math.round(
    (masteredIds.length / INTERVIEW_QUESTIONS_LIST.length) * 100
  );

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '1080px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      className="interview-page"
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-purple-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <Award size={22} />
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
          items={visibleQuestions.map((item: InterviewQuestionItem) => {
            const isMastered = masteredIds.includes(item.id);
            const isFollowUpRevealed = revealedFollowUps[item.id];
            const badgeVariant = DIFFICULTY_BADGE_VARIANTS[item.difficulty] || 'default';

            return {
              id: item.id,
              title: (
                <div id={`interview-q-${item.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    #{item.id.replace('int-', '')}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {item.question}
                  </span>
                </div>
              ),
              badge: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                  {/* Short Answer */}
                  <div
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

                  {/* Deep Dive */}
                  <div
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

                  {/* Code Example (if available) */}
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

                  {/* Candidate Pitfall */}
                  {item.commonPitfalls && item.commonPitfalls.length > 0 && (
                    <div
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

                  {/* Follow-Up Question (Adaptive Questioning) */}
                  {item.followUp && (
                    <div
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
                          onClick={() => toggleFollowUp(item.id)}
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
                </div>
              ),
            };
          })}
          allowMultiple
        />
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
    </div>
  );
};
