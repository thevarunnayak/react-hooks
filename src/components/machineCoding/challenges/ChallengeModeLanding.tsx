import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Play,
  Shuffle,
  Layers,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  RotateCcw,
  Zap,
  Target,
  Infinity as InfinityIcon,
  Code2,
  Cpu,
  Server,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SearchInput } from '../../ui/SearchInput';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  ALL_CHALLENGES,
  CHALLENGE_SETS,
  CHALLENGE_CATEGORIES,
  getRandomChallenges,
  getChallengeById,
} from '../../../data/machineCodingChallenges';
import {
  MachineCodingChallenge,
  ChallengeSet,
  ChallengeDifficulty,
  ChallengeCategory,
  ChallengeTrack,
  ChallengeSessionConfig,
  ChallengeModeType,
  ChallengeSessionMode,
  ChallengeRecord,
} from '../../../types/machineCodingChallenge';

export interface ChallengeModeLandingProps {
  completedRecords: Record<string, ChallengeRecord>;
  onStartSession: (challenges: MachineCodingChallenge[], config: ChallengeSessionConfig) => void;
  onBackToLabs: () => void;
}

export const ChallengeModeLanding: React.FC<ChallengeModeLandingProps> = ({
  completedRecords,
  onStartSession,
  onBackToLabs,
}) => {
  const [activeModeTab, setActiveModeTab] = useState<ChallengeModeType>('single');

  // Shared Session Settings (Time dropdown with unlimited, Style)
  const [selectedTimeOption, setSelectedTimeOption] = useState<string>('30');
  const isTimed = selectedTimeOption !== 'unlimited';
  const durationMinutes = selectedTimeOption === 'unlimited' ? 0 : Number(selectedTimeOption);
  const [sessionMode, setSessionMode] = useState<ChallengeSessionMode>('practice');

  // 1. Single Challenge State
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<ChallengeTrack | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'All'>('All');

  // 2. Random Challenge State
  const [randomCount, setRandomCount] = useState<number>(3);
  const [randomDifficulty, setRandomDifficulty] = useState<ChallengeDifficulty | 'Mixed'>('Mixed');
  const [randomCategory, setRandomCategory] = useState<ChallengeCategory | 'All'>('All');
  const [randomPreview, setRandomPreview] = useState<MachineCodingChallenge[]>(() =>
    getRandomChallenges(3, 'Mixed', 'All')
  );

  const handleRandomizeAgain = () => {
    setRandomPreview(getRandomChallenges(randomCount, randomDifficulty, randomCategory));
  };

  // Filtered single challenges
  const filteredChallenges = useMemo(() => {
    return ALL_CHALLENGES.filter((c) => {
      const trackVal = c.track || 'frontend';
      const matchesTrack = selectedTrack === 'All' || trackVal === selectedTrack;
      const matchesDiff = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q);

      return matchesTrack && matchesDiff && matchesCat && matchesSearch;
    });
  }, [selectedTrack, selectedDifficulty, selectedCategory, search]);

  // Handlers for starting
  const handleStartSingle = (challenge: MachineCodingChallenge) => {
    const config: ChallengeSessionConfig = {
      type: 'single',
      mode: sessionMode,
      isTimed,
      durationMinutes,
      difficulty: challenge.difficulty,
      allowPause: sessionMode === 'practice',
    };
    onStartSession([challenge], config);
  };

  const handleStartRandom = () => {
    const config: ChallengeSessionConfig = {
      type: 'random',
      mode: sessionMode,
      isTimed,
      durationMinutes,
      difficulty: randomDifficulty,
      questionCount: randomPreview.length,
      allowPause: sessionMode === 'practice',
    };
    onStartSession(randomPreview, config);
  };

  const handleStartSet = (set: ChallengeSet) => {
    const challenges = set.challengeIds
      .map((id) => getChallengeById(id))
      .filter((c): c is MachineCodingChallenge => !!c);

    const config: ChallengeSessionConfig = {
      type: 'set',
      mode: sessionMode,
      isTimed,
      durationMinutes: isTimed ? set.recommendedMinutes : 0,
      difficulty: set.difficulty,
      setId: set.id,
      allowPause: sessionMode === 'practice',
    };
    onStartSession(challenges, config);
  };

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
      className="challenge-mode-landing"
    >
      {/* Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Badge variant="primary" size="sm">
              REACTLABZ INTERVIEW SIMULATOR
            </Badge>
            <Badge variant="cyan" size="sm">
              {ALL_CHALLENGES.length} INTERVIEW CHALLENGES
            </Badge>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Frontend & Backend Tracks • 100% Client-Side Sandbox
            </span>
          </div>

          <Button size="xs" variant="ghost" onClick={onBackToLabs}>
            ← Back to Hands-On Labs
          </Button>
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
          Challenge Mode
        </h1>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '840px',
            margin: 0,
          }}
        >
          Simulate a real frontend machine-coding interview. Read realistic requirements, write your React solution in the live editor, interact with the preview sandbox, and execute automated test suites against public and hidden edge cases.
        </p>
      </div>

      {/* Mode Settings Bar (Timed/Untimed, Duration, Practice vs Interview) */}
      <Card
        variant="elevated"
        padding="md"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          zIndex: 40,
        }}
      >
        {/* Left: Mode Tabs (Single / Random / Set) */}
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
            onClick={() => setActiveModeTab('single')}
            style={{
              padding: '6px 14px',
              border: 'none',
              background: activeModeTab === 'single' ? 'var(--bg-surface)' : 'none',
              color: activeModeTab === 'single' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeModeTab === 'single' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Target size={13} />
            <span>Single Challenge</span>
          </button>
          <button
            onClick={() => setActiveModeTab('random')}
            style={{
              padding: '6px 14px',
              border: 'none',
              background: activeModeTab === 'random' ? 'var(--bg-surface)' : 'none',
              color: activeModeTab === 'random' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeModeTab === 'random' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Shuffle size={13} />
            <span>Random Challenge</span>
          </button>
          <button
            onClick={() => setActiveModeTab('set')}
            style={{
              padding: '6px 14px',
              border: 'none',
              background: activeModeTab === 'set' ? 'var(--bg-surface)' : 'none',
              color: activeModeTab === 'set' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeModeTab === 'set' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Layers size={13} />
            <span>Challenge Sets</span>
          </button>
        </div>

        {/* Right: Time & Interview Mode Config */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Time Selector Dropdown */}
          {activeModeTab !== 'set' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Time:</span>
              <div style={{ minWidth: 175 }}>
                <CustomSelect
                  value={selectedTimeOption}
                  onChange={(val) => setSelectedTimeOption(val)}
                  size="sm"
                  variant="elevated"
                  options={[
                    {
                      value: '15',
                      label: '15 minutes',
                      icon: <Clock size={13} style={{ color: 'var(--accent-primary)' }} />,
                    },
                    {
                      value: '30',
                      label: '30 minutes',
                      icon: <Clock size={13} style={{ color: 'var(--accent-primary)' }} />,
                    },
                    {
                      value: '45',
                      label: '45 minutes',
                      icon: <Clock size={13} style={{ color: 'var(--accent-primary)' }} />,
                    },
                    {
                      value: '60',
                      label: '60 minutes',
                      icon: <Clock size={13} style={{ color: 'var(--accent-primary)' }} />,
                    },
                    {
                      value: 'unlimited',
                      label: 'Unlimited (No limit)',
                      icon: <InfinityIcon size={13} style={{ color: 'var(--accent-success)' }} />,
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* Practice vs Interview Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Style:</span>
            <button
              onClick={() => setSessionMode('practice')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: sessionMode === 'practice' ? '1px solid var(--accent-success)' : '1px solid var(--border-subtle)',
                backgroundColor: sessionMode === 'practice' ? 'var(--accent-success-subtle)' : 'transparent',
                color: sessionMode === 'practice' ? 'var(--accent-success-text)' : 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: sessionMode === 'practice' ? 700 : 500,
              }}
            >
              Practice
            </button>
            <button
              onClick={() => setSessionMode('interview')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: sessionMode === 'interview' ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                backgroundColor: sessionMode === 'interview' ? 'var(--accent-purple-subtle)' : 'transparent',
                color: sessionMode === 'interview' ? '#d8b4fe' : 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: sessionMode === 'interview' ? 700 : 500,
              }}
            >
              Interview (Strict)
            </button>
          </div>
        </div>
      </Card>

      {/* TAB 1: SINGLE CHALLENGE BROWSER */}
      {activeModeTab === 'single' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search, Category & Difficulty Filter Bar */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
              position: 'relative',
              zIndex: 20,
            }}
          >
            <div style={{ flex: '1 1 240px' }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search challenges by title, tag, or concept..."
              />
            </div>

            {/* Track Custom Dropdown */}
            <div style={{ minWidth: 160 }}>
              <CustomSelect
                value={selectedTrack}
                onChange={(val) => setSelectedTrack(val as any)}
                size="sm"
                variant="elevated"
                options={[
                  { value: 'All', label: `All Tracks (${ALL_CHALLENGES.length})` },
                  {
                    value: 'frontend',
                    label: `Frontend (${ALL_CHALLENGES.filter((c) => (c.track || 'frontend') === 'frontend').length})`,
                    icon: <Code2 size={13} style={{ color: 'var(--accent-primary)' }} />,
                  },
                  {
                    value: 'backend',
                    label: `Backend (${ALL_CHALLENGES.filter((c) => c.track === 'backend').length})`,
                    icon: <Cpu size={13} style={{ color: 'var(--accent-purple, #8b5cf6)' }} />,
                  },
                ]}
              />
            </div>

            {/* Category Custom Dropdown */}
            <div style={{ minWidth: 210 }}>
              <CustomSelect
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val as any)}
                size="sm"
                variant="elevated"
                options={[
                  { value: 'All', label: `All Categories (${ALL_CHALLENGES.length})` },
                  ...CHALLENGE_CATEGORIES.map((cat) => ({
                    value: cat,
                    label: `${cat} (${ALL_CHALLENGES.filter((c) => c.category === cat).length})`,
                  })),
                ]}
              />
            </div>

            {/* Difficulty Custom Dropdown */}
            <div style={{ minWidth: 180 }}>
              <CustomSelect
                value={selectedDifficulty}
                onChange={(val) => setSelectedDifficulty(val as any)}
                size="sm"
                variant="elevated"
                options={[
                  { value: 'All', label: `All Difficulties (${ALL_CHALLENGES.length})` },
                  {
                    value: 'Easy',
                    label: `Easy (${ALL_CHALLENGES.filter((c) => c.difficulty === 'Easy').length})`,
                    icon: (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-success, #10b981)',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                  {
                    value: 'Medium',
                    label: `Medium (${ALL_CHALLENGES.filter((c) => c.difficulty === 'Medium').length})`,
                    icon: (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-cyan, #06b6d4)',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                  {
                    value: 'Hard',
                    label: `Hard (${ALL_CHALLENGES.filter((c) => c.difficulty === 'Hard').length})`,
                    icon: (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-purple, #8b5cf6)',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {/* Challenge Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 14,
            }}
          >
            {filteredChallenges.map((challenge) => {
              const isDone = !!completedRecords[challenge.id]?.passedAll;
              const diffVariant =
                challenge.difficulty === 'Easy'
                  ? 'success'
                  : challenge.difficulty === 'Medium'
                  ? 'cyan'
                  : 'purple';

              return (
                <Card
                  key={challenge.id}
                  variant="glass"
                  padding="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'transform 180ms ease, border-color 180ms ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Badge variant={diffVariant as any} size="sm">
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant={challenge.track === 'backend' ? 'purple' : 'primary'} size="sm">
                          {challenge.track === 'backend' ? 'Backend' : 'Frontend'}
                        </Badge>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--text-muted)' }}>
                        <Clock size={11} />
                        <span>{challenge.estimatedTime}</span>
                      </div>
                    </div>

                    <h3
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {challenge.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {challenge.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {challenge.testCases.length} tests ({challenge.testCases.filter((t) => !t.hidden).length} public)
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isDone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--accent-success)', fontSize: '11px', fontWeight: 600 }}>
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                      <Button
                        size="xs"
                        variant={isDone ? 'outline' : 'primary'}
                        iconRight={<Play size={10} />}
                        onClick={() => handleStartSingle(challenge)}
                      >
                        {isDone ? 'Practice' : 'Start'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RANDOM CHALLENGE GENERATOR */}
      {activeModeTab === 'random' && (
        <Card
          variant="glass"
          padding="lg"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: 'var(--text-lg)', fontWeight: 800 }}>
              Random Challenge Generator
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Configure interview parameters and test yourself against a surprise question set without duplicate problems.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
              position: 'relative',
              zIndex: 20,
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Number of Questions
              </label>
              <CustomSelect
                value={String(randomCount)}
                onChange={(val) => {
                  const count = Number(val);
                  setRandomCount(count);
                  setRandomPreview(getRandomChallenges(count, randomDifficulty, randomCategory));
                }}
                size="sm"
                variant="elevated"
                options={[
                  { value: '1', label: '1 Question' },
                  { value: '3', label: '3 Questions' },
                  { value: '5', label: '5 Questions' },
                ]}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Difficulty
              </label>
              <CustomSelect
                value={randomDifficulty}
                onChange={(val) => {
                  const diff = val as any;
                  setRandomDifficulty(diff);
                  setRandomPreview(getRandomChallenges(randomCount, diff, randomCategory));
                }}
                size="sm"
                variant="elevated"
                options={[
                  { value: 'Mixed', label: 'Mixed Difficulties' },
                  {
                    value: 'Easy',
                    label: 'Easy Only',
                    icon: (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-success, #10b981)',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                  {
                    value: 'Medium',
                    label: 'Medium Only',
                    icon: (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-cyan, #06b6d4)',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                  {
                    value: 'Hard',
                    label: 'Hard Only',
                    icon: (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-purple, #8b5cf6)',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                ]}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Category
              </label>
              <CustomSelect
                value={randomCategory}
                onChange={(val) => {
                  const cat = val as any;
                  setRandomCategory(cat);
                  setRandomPreview(getRandomChallenges(randomCount, randomDifficulty, cat));
                }}
                size="sm"
                variant="elevated"
                options={[
                  { value: 'All', label: 'All Categories' },
                  ...CHALLENGE_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
            </div>
          </div>

          {/* Selected Questions Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Generated Challenge Set ({randomPreview.length})
              </span>
              <Button size="xs" variant="ghost" icon={<RotateCcw size={11} />} onClick={handleRandomizeAgain}>
                Randomize Again
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {randomPreview.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {idx + 1}. {item.title}
                  </span>
                  <Badge variant={item.difficulty === 'Easy' ? 'success' : item.difficulty === 'Medium' ? 'cyan' : 'purple'} size="sm">
                    {item.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Button size="md" variant="primary" iconRight={<Play size={14} />} onClick={handleStartRandom}>
            Start Random Challenge
          </Button>
        </Card>
      )}

      {/* TAB 3: CURATED CHALLENGE SETS */}
      {activeModeTab === 'set' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {CHALLENGE_SETS.map((set) => {
            const challenges = set.challengeIds
              .map((id) => getChallengeById(id))
              .filter((c): c is MachineCodingChallenge => !!c);

            return (
              <Card
                key={set.id}
                variant="glass"
                padding="md"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Badge variant={set.difficulty === 'Easy' ? 'success' : set.difficulty === 'Medium' ? 'cyan' : set.difficulty === 'Hard' ? 'purple' : 'default'} size="sm">
                      {set.difficulty}
                    </Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Clock size={11} />
                      <span>{set.recommendedMinutes} mins</span>
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: 'var(--text-base)', fontWeight: 800 }}>
                    {set.title}
                  </h3>

                  <p style={{ margin: '0 0 12px 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {set.description}
                  </p>

                  {/* Questions in Set */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {challenges.map((q, idx) => (
                      <div key={q.id} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{idx + 1}.</span>
                        <span>{q.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  iconRight={<Play size={12} />}
                  onClick={() => handleStartSet(set)}
                >
                  Start Set ({challenges.length} Problems)
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
