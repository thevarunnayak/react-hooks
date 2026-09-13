import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MACHINE_CODING_PROBLEMS,
  MACHINE_CODING_PROBLEMS_BY_ID,
  MACHINE_CODING_CATEGORIES,
} from '../data/machineCoding/problems';
import {
  MachineCodingProblem,
  MachineCodingCategory,
  MachineCodingDifficulty,
} from '../types/machineCoding';
import { Card } from '../components/ui/Card';
import { Badge, BadgeProps } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { CustomSelect } from '../components/ui/CustomSelect';
import { MachineCodingLabRunner } from '../components/machineCoding/labs/MachineCodingLabRunner';
import { ChallengeModeView } from '../components/machineCoding/challenges/ChallengeModeView';
import {
  Terminal,
  Code2,
  Eye,
  BookOpen,
  Copy,
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  AlertCircle,
  Clock,
  Zap,
  Tag,
} from 'lucide-react';

export interface MachineCodingPageProps {
  onNavigate?: (route: string, param?: string, subParam?: string) => void;
  initialProblemId?: string;
  initialSubParam?: string;
}

const DIFFICULTY_VARIANTS: Record<MachineCodingDifficulty, BadgeProps['variant']> = {
  Beginner: 'default',
  Intermediate: 'cyan',
  Advanced: 'purple',
};

const getEstimatedTime = (p: MachineCodingProblem): string => {
  if (p.estimatedTime) return p.estimatedTime;
  if (p.difficulty === 'Beginner') return '25 mins';
  if (p.difficulty === 'Intermediate') return '35 mins';
  return '50 mins';
};

export const MachineCodingPage: React.FC<MachineCodingPageProps> = ({
  onNavigate,
  initialProblemId,
  initialSubParam,
}) => {
  const isChallengeRoute =
    initialProblemId === 'challenge' ||
    initialProblemId === 'challenge-mode' ||
    initialProblemId?.startsWith('challenge-');

  const [activeSection, setActiveSection] = useState<'labs' | 'challenge'>(() =>
    isChallengeRoute ? 'challenge' : 'labs'
  );

  useEffect(() => {
    if (isChallengeRoute) {
      setActiveSection('challenge');
    } else if (initialProblemId && MACHINE_CODING_PROBLEMS_BY_ID.has(initialProblemId)) {
      setActiveSection('labs');
    }
  }, [initialProblemId, isChallengeRoute]);

  // Check if a specific problem is selected via route / param
  const activeProblem: MachineCodingProblem | null = useMemo(() => {
    if (initialProblemId && MACHINE_CODING_PROBLEMS_BY_ID.has(initialProblemId)) {
      return MACHINE_CODING_PROBLEMS_BY_ID.get(initialProblemId) || null;
    }
    return null;
  }, [initialProblemId]);

  // Tab state for individual problem view
  const [activeTab, setActiveTab] = useState<'live' | 'code' | 'explanation'>('live');
  const [copied, setCopied] = useState(false);

  // Automatically reset to 'live' tab when navigating to a lab or switching problems
  useEffect(() => {
    setActiveTab('live');
    setCopied(false);
  }, [initialProblemId]);

  // Catalog / List filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MachineCodingCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<MachineCodingDifficulty | 'All'>('All');

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 860;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtered problems for the list screen
  const filteredProblems = useMemo(() => {
    return MACHINE_CODING_PROBLEMS.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.conceptsUsed.some((c) => c.name.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q);

      return matchesCat && matchesDiff && matchesSearch;
    });
  }, [selectedCategory, selectedDifficulty, search]);

  const difficultyOptions = useMemo(() => {
    const diffConfigs: { value: MachineCodingDifficulty | 'All'; label: string; dotColor: string }[] = [
      { value: 'All', label: 'All Difficulties', dotColor: 'var(--text-muted)' },
      { value: 'Beginner', label: 'Beginner', dotColor: 'var(--accent-success, #10b981)' },
      { value: 'Intermediate', label: 'Intermediate', dotColor: 'var(--accent-cyan, #06b6d4)' },
      { value: 'Advanced', label: 'Advanced', dotColor: 'var(--accent-purple, #8b5cf6)' },
    ];

    return diffConfigs.map((cfg) => {
      const count =
        cfg.value === 'All'
          ? (selectedCategory === 'All'
              ? MACHINE_CODING_PROBLEMS.length
              : MACHINE_CODING_PROBLEMS.filter((p) => p.category === selectedCategory).length)
          : MACHINE_CODING_PROBLEMS.filter(
              (p) =>
                p.difficulty === cfg.value &&
                (selectedCategory === 'All' || p.category === selectedCategory)
            ).length;

      return {
        value: cfg.value,
        label: `${cfg.label} (${count})`,
        icon: (
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: cfg.dotColor,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        ),
      };
    });
  }, [selectedCategory]);

  // Track the most recently active/opened problem ID so when returning to the catalog,
  // we can automatically scroll smoothly to that exact problem card
  const lastActiveProblemIdRef = useRef<string | null>(initialProblemId || null);

  useEffect(() => {
    if (initialProblemId) {
      lastActiveProblemIdRef.current = initialProblemId;
    }
  }, [initialProblemId]);

  // When returning to list view (activeProblem is null, but we just came from an active problem)
  useEffect(() => {
    if (!activeProblem && lastActiveProblemIdRef.current) {
      const targetId = lastActiveProblemIdRef.current;
      lastActiveProblemIdRef.current = null; // Clear so subsequent filter clicks don't re-scroll

      const timer = setTimeout(() => {
        const el = document.getElementById(`problem-card-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight card temporarily with pulse to provide immediate visual confirmation
          el.style.transition = 'border-color 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease';
          el.style.borderColor = 'var(--accent-primary)';
          el.style.boxShadow = '0 0 24px rgba(59, 130, 246, 0.45)';
          el.style.transform = 'scale(1.02)';
          setTimeout(() => {
            el.style.borderColor = '';
            el.style.boxShadow = '';
            el.style.transform = '';
          }, 1800);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeProblem]);

  const handleOpenLab = (id: string) => {
    lastActiveProblemIdRef.current = id;
    onNavigate?.('machine-coding', id);
  };

  const handleBackToList = () => {
    onNavigate?.('machine-coding');
  };

  const handleCopyCode = () => {
    if (!activeProblem) return;
    navigator.clipboard.writeText(activeProblem.solutionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Previous & Next navigation for detail view
  const currentIndex = activeProblem
    ? MACHINE_CODING_PROBLEMS.findIndex((p) => p.id === activeProblem.id)
    : -1;
  const prevProblem = currentIndex > 0 ? MACHINE_CODING_PROBLEMS[currentIndex - 1] : null;
  const nextProblem =
    currentIndex >= 0 && currentIndex < MACHINE_CODING_PROBLEMS.length - 1
      ? MACHINE_CODING_PROBLEMS[currentIndex + 1]
      : null;

  // ==========================================
  // VIEW 0: CHALLENGE MODE (Simulated Interview & Test Suites)
  // ==========================================
  if (activeSection === 'challenge') {
    const targetChallengeId =
      initialSubParam ||
      (initialProblemId &&
      initialProblemId !== 'challenge' &&
      initialProblemId !== 'challenge-mode'
        ? initialProblemId.replace('challenge-', '')
        : undefined);

    return (
      <ChallengeModeView
        initialChallengeId={targetChallengeId}
        onNavigateChallenge={(challengeId) => {
          if (challengeId) {
            onNavigate?.('machine-coding', 'challenge', challengeId);
          } else {
            onNavigate?.('machine-coding', 'challenge');
          }
        }}
        onExitToLabs={() => {
          setActiveSection('labs');
          onNavigate?.('machine-coding');
        }}
      />
    );
  }

  // ==========================================
  // VIEW 1: DEDICATED LAB SCREEN (When a problem is selected)
  // ==========================================
  if (activeProblem) {
    return (
      <div
        style={{
          padding: 'var(--space-4) clamp(12px, 3vw, var(--space-8))',
          maxWidth: '1380px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 'var(--space-3)' : 'var(--space-4)',
        }}
        className="machine-coding-lab-detail"
      >
        {/* Top Navigation & Breadcrumbs Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            paddingBottom: 4,
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Button
            size="sm"
            variant="outline"
            icon={<ArrowLeft size={15} />}
            onClick={handleBackToList}
            style={{ fontWeight: 600 }}
          >
            Back to All 25 Problems
          </Button>

          {/* Sequential Prev / Next Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Button
              size="xs"
              variant="secondary"
              icon={<ChevronLeft size={14} />}
              disabled={!prevProblem}
              onClick={() => prevProblem && onNavigate?.('machine-coding', prevProblem.id)}
            >
              Prev
            </Button>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                padding: '0 4px',
              }}
            >
              {currentIndex + 1} / {MACHINE_CODING_PROBLEMS.length}
            </span>
            <Button
              size="xs"
              variant="secondary"
              iconRight={<ChevronRight size={14} />}
              disabled={!nextProblem}
              onClick={() => nextProblem && onNavigate?.('machine-coding', nextProblem.id)}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Problem Header Card */}
        <Card
          variant="elevated"
          padding="lg"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: isMobile ? 'var(--space-4)' : 'var(--space-5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    backgroundColor: 'var(--accent-primary-subtle)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Question {activeProblem.number} of {MACHINE_CODING_PROBLEMS.length}
                </span>
                <Badge variant={DIFFICULTY_VARIANTS[activeProblem.difficulty]} size="sm">
                  {activeProblem.difficulty}
                </Badge>
                <Badge variant="purple" size="sm">
                  {activeProblem.category}
                </Badge>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {getEstimatedTime(activeProblem)}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(var(--text-lg), 3.5vw, var(--text-2xl))', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {activeProblem.number}. {activeProblem.title}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                size="sm"
                variant="secondary"
                icon={copied ? <Check size={14} style={{ color: 'var(--accent-success)' }} /> : <Copy size={14} />}
                onClick={handleCopyCode}
              >
                {copied ? 'Code Copied!' : 'Copy Solution Code'}
              </Button>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
            {activeProblem.summary}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {activeProblem.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </Card>

        {/* 3 View Tabs: Live Lab, Solution Code, Explanation */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 6,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 6,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            onClick={() => setActiveTab('live')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'live' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'live' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Eye size={14} />
            <span>Live Interactive Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'code' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'code' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Code2 size={14} />
            <span>Solution Code</span>
          </button>

          <button
            onClick={() => setActiveTab('explanation')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'explanation' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'explanation' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <BookOpen size={14} />
            <span>Explanation & Concepts</span>
          </button>
        </div>

        {/* TAB 1: Live Interactive Sandbox (Full Width) */}
        {activeTab === 'live' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card
              variant="elevated"
              padding="lg"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: isMobile ? 'var(--space-3)' : 'var(--space-6)',
              }}
            >
              <MachineCodingLabRunner problemId={activeProblem.id} />
            </Card>

            {/* Quick Context & Solution Link Card */}
            <Card
              variant="glass"
              padding="md"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ready to inspect the implementation details?
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Explore clean React 19 source code, state management patterns, and architectural edge cases.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="xs"
                  variant="outline"
                  icon={<BookOpen size={13} />}
                  onClick={() => setActiveTab('explanation')}
                >
                  View Concepts
                </Button>
                <Button
                  size="xs"
                  variant="primary"
                  icon={<Code2 size={13} />}
                  onClick={() => setActiveTab('code')}
                >
                  View Solution Code
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: Solution Code */}
        {activeTab === 'code' && (
          <Card
            variant="elevated"
            padding="md"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  TypeScript / React 19 Implementation
                </span>
                <span style={{ fontSize: '10px', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary-subtle)', padding: '1px 6px', borderRadius: '4px' }}>
                  {activeProblem.solutionCode.split('\n').length} lines
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  color: copied ? 'var(--accent-success)' : 'var(--accent-primary)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
              </button>
            </div>

            <pre
              style={{
                margin: 0,
                padding: isMobile ? '12px' : '18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-code)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: isMobile ? '11px' : '12px',
                lineHeight: 1.55,
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%',
                color: 'var(--text-code)',
              }}
            >
              <code>{activeProblem.solutionCode}</code>
            </pre>
          </Card>
        )}

        {/* TAB 3: Explanation & Concepts */}
        {activeTab === 'explanation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Problem Explanation */}
            <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
                Problem Overview & Real-World Purpose
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                {activeProblem.explanation}
              </div>
            </Card>

            {/* Requirements Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} />
                  <span>Functional Requirements</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {activeProblem.requirements.functional.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </Card>

              <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={14} />
                  <span>Non-Functional Requirements</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {activeProblem.requirements.nonFunctional.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Concepts Used */}
            <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
                Core Concepts & Patterns Applied
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 10 }}>
                {activeProblem.conceptsUsed.map((concept, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                      {concept.name}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {concept.description}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Edge Cases */}
            <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} />
                <span>Interview Edge Cases to Watch Out For</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {activeProblem.edgeCases.map((ec, i) => (
                  <li key={i}>{ec}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Bottom Navigation Footer */}
        <Card
          variant="glass"
          padding="md"
          style={{
            marginTop: 8,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: 12,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {prevProblem ? (
            <Button
              size="sm"
              variant="outline"
              icon={<ChevronLeft size={15} />}
              onClick={() => onNavigate?.('machine-coding', prevProblem.id)}
              style={{
                flex: isMobile ? '1 1 auto' : '0 1 280px',
                justifyContent: 'flex-start',
                textAlign: 'left',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Prev: #{prevProblem.number}. {prevProblem.title}
              </span>
            </Button>
          ) : (
            <div style={{ flex: isMobile ? '0' : '0 1 280px' }} />
          )}

          <Button
            size="sm"
            variant="ghost"
            icon={<ArrowLeft size={14} />}
            onClick={handleBackToList}
            style={{ fontWeight: 600 }}
          >
            All 25 Problems
          </Button>

          {nextProblem ? (
            <Button
              size="sm"
              variant="primary"
              iconRight={<ChevronRight size={15} />}
              onClick={() => onNavigate?.('machine-coding', nextProblem.id)}
              style={{
                flex: isMobile ? '1 1 auto' : '0 1 280px',
                justifyContent: 'flex-end',
                textAlign: 'right',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Next: #{nextProblem.number}. {nextProblem.title}
              </span>
            </Button>
          ) : (
            <div style={{ flex: isMobile ? '0' : '0 1 280px' }} />
          )}
        </Card>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: MASTER LIST / CATALOG SCREEN (When no problem selected)
  // ==========================================
  return (
    <div
      style={{
        padding: 'var(--space-5) clamp(12px, 3vw, var(--space-8))',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      className="machine-coding-catalog-page"
    >
      {/* Catalog Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Badge variant="primary" size="sm">
              2026 INTERVIEW ESSENTIALS
            </Badge>
            <Badge variant="cyan" size="sm">
              25 HANDS-ON LABS
            </Badge>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              100% Client-Side • Zero External APIs
            </span>
          </div>

          {/* Section Switcher: Labs vs Challenge Mode */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: 3,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => {
                setActiveSection('labs');
                onNavigate?.('machine-coding');
              }}
              style={{
                padding: '6px 14px',
                border: 'none',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              25 Hands-On Labs
            </button>
            <button
              onClick={() => {
                setActiveSection('challenge');
                onNavigate?.('machine-coding', 'challenge');
              }}
              style={{
                padding: '6px 14px',
                border: 'none',
                background: 'none',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Zap size={13} style={{ color: 'var(--accent-warning)' }} />
              <span>⚡ Challenge Mode (Simulator)</span>
            </button>
          </div>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          25 Frontend Machine Coding Questions
        </h1>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '820px',
            margin: 0,
          }}
        >
          If you're preparing for a Frontend interview in 2026, don't just revise React concepts. Practice building real features from scratch. Select any lab below to open its dedicated workspace with live interactive execution, production TypeScript code, and architecture breakdowns.
        </p>

        {/* Challenge Mode Spotlight Banner */}
        <Card
          variant="elevated"
          padding="md"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-lg)',
            marginTop: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Practice Like a Real Interview in Challenge Mode
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                37 challenges with timed countdowns, automated test suites, and hidden edge cases.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            iconRight={<ArrowRight size={14} />}
            onClick={() => {
              setActiveSection('challenge');
              onNavigate?.('machine-coding', 'challenge');
            }}
          >
            Enter Challenge Mode
          </Button>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card
        variant="glass"
        padding="md"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: isMobile ? '1 1 100%' : '1 1 280px', minWidth: 0 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search 25 problems by name, tag, or concept (e.g. 'debounce', 'virtual', 'drag')..."
            />
          </div>

          {/* Difficulty Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Difficulty:
            </span>
            <div style={{ flex: isMobile ? 1 : 'none', minWidth: isMobile ? 0 : 175 }}>
              <CustomSelect
                fullWidth={isMobile}
                size="sm"
                variant="elevated"
                value={selectedDifficulty}
                onChange={(val) => setSelectedDifficulty(val as MachineCodingDifficulty | 'All')}
                options={difficultyOptions}
                style={{ minWidth: isMobile ? '100%' : 175 }}
                ariaLabel="Filter problems by difficulty"
              />
            </div>
          </div>
        </div>

        {/* Category Carousel Tabs */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 2,
          }}
        >
          {MACHINE_CODING_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All'
                ? MACHINE_CODING_PROBLEMS.length
                : MACHINE_CODING_PROBLEMS.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>{cat}</span>
                <span style={{ fontSize: '10px', opacity: isSelected ? 0.9 : 0.6 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>
          Showing {filteredProblems.length} of {MACHINE_CODING_PROBLEMS.length} Machine Coding Questions
        </span>
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '11px',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Grid of 25 Problem Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {filteredProblems.map((problem) => (
          <Card
            key={problem.id}
            id={`problem-card-${problem.id}`}
            variant="elevated"
            padding="lg"
            interactive
            onClick={() => handleOpenLab(problem.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Card Meta Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-primary)',
                      backgroundColor: 'var(--accent-primary-subtle)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    #{String(problem.number).padStart(2, '0')}
                  </span>
                  <Badge variant={DIFFICULTY_VARIANTS[problem.difficulty]} size="sm">
                    {problem.difficulty}
                  </Badge>
                </div>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {getEstimatedTime(problem)}
                </span>
              </div>

              {/* Title & Category */}
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
                  {problem.category}
                </span>
                <h2
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: '2px 0 0 0',
                    lineHeight: 1.35,
                  }}
                >
                  {problem.title}
                </h2>
              </div>

              {/* Summary Description */}
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {problem.summary}
              </p>

              {/* Key Functional Bullets Preview */}
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {problem.requirements.functional.slice(0, 3).map((req, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    <CheckCircle2 size={12} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions & Tags */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              {/* Tag Chips */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {problem.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
                {problem.tags.length > 4 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                    +{problem.tags.length - 4} more
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Interactive Lab • Code
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--accent-primary-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Open Lab <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
