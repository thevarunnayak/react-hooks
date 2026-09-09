import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CHALLENGES_LIST, CHALLENGE_CATEGORIES } from '../../data/challenges';
import { Zap, Clock, HelpCircle, Layers, Sliders, CheckSquare, Square } from 'lucide-react';

export interface ChallengeSessionConfig {
  questionCount: number;
  timeLimitMinutes: number; // 0 for no timer
  difficulty: string;
  categories: string[];
}

interface ChallengeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChallenge: (config: ChallengeSessionConfig) => void;
}

const QUESTION_COUNTS = [5, 10, 15, 20, 25];

const TIME_LIMITS = [
  { label: '3 min (Speed)', value: 3 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: 'No Timer', value: 0 },
];

const DIFFICULTY_STEPS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const ChallengeModeModal: React.FC<ChallengeModeModalProps> = ({
  isOpen,
  onClose,
  onStartChallenge,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  const [difficultyIndex, setDifficultyIndex] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 560);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 560);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedDifficulty = DIFFICULTY_STEPS[difficultyIndex];
  const allAvailableCategories = useMemo(
    () => CHALLENGE_CATEGORIES.filter((c) => c !== 'All'),
    []
  );

  // Toggle single category selection
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories([...allAvailableCategories]);
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  // Compute matching questions count
  const matchingQuestions = useMemo(() => {
    return CHALLENGES_LIST.filter((ch) => {
      const matchesDiff =
        selectedDifficulty === 'All' || ch.difficulty === selectedDifficulty;
      const matchesCat =
        selectedCategories.length === 0 || selectedCategories.includes(ch.category);
      return matchesDiff && matchesCat;
    });
  }, [selectedDifficulty, selectedCategories]);

  const handleStart = () => {
    onStartChallenge({
      questionCount: Math.min(questionCount, matchingQuestions.length),
      timeLimitMinutes,
      difficulty: selectedDifficulty,
      categories: selectedCategories.length > 0 ? selectedCategories : ['All'],
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              color: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={16} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Challenge Mode
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 400 }}>
              Test your React skills under timed exam conditions
            </div>
          </div>
        </div>
      }
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px 0' }}>
        {/* 1. Number of Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <HelpCircle size={13} />
            <span>Number of Questions</span>
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {QUESTION_COUNTS.map((cnt) => {
              const isSelected = questionCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  style={{
                    flex: '1 1 50px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
                    color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {cnt} Qs
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Time Limit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Clock size={13} />
            <span>Time Limit</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(85px, 1fr))', gap: '6px' }}>
            {TIME_LIMITS.map((t) => {
              const isSelected = timeLimitMinutes === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTimeLimitMinutes(t.value)}
                  style={{
                    padding: '7px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
                    color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Difficulty Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Sliders size={13} />
              <span>Difficulty Level:</span>
            </label>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-primary-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {selectedDifficulty}
            </span>
          </div>

          <div style={{ padding: '0 4px' }}>
            <input
              type="range"
              min={0}
              max={DIFFICULTY_STEPS.length - 1}
              step={1}
              value={difficultyIndex}
              onChange={(e) => setDifficultyIndex(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              {DIFFICULTY_STEPS.map((step, idx) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setDifficultyIndex(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '10px',
                    color: difficultyIndex === idx ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontWeight: difficultyIndex === idx ? 700 : 500,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Topics Multi-Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Layers size={13} />
              <span>
                Topics {selectedCategories.length > 0 ? `(${selectedCategories.length} selected)` : '(All Topics)'}
              </span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={selectAllCategories}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <CheckSquare size={11} /> Select All
              </button>
              <button
                type="button"
                onClick={clearCategories}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Square size={11} /> Clear
              </button>
            </div>
          </div>

          <div
            className="pill-scrollbar"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '6px 2px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            {allAvailableCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-purple)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--accent-purple-subtle)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pool Summary & Start Action */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            gap: isMobile ? '10px' : '12px',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textAlign: isMobile ? 'center' : 'left' }}>
            Available Questions:{' '}
            <strong style={{ color: matchingQuestions.length > 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {matchingQuestions.length}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'center' : 'flex-end', width: isMobile ? '100%' : 'auto' }}>
            <Button size="sm" variant="ghost" onClick={onClose} style={{ flex: isMobile ? 1 : 'initial' }}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={matchingQuestions.length === 0}
              icon={<Zap size={14} />}
              onClick={handleStart}
              style={{ flex: isMobile ? 2 : 'initial' }}
            >
              {isMobile ? `Start (${Math.min(questionCount, matchingQuestions.length)} Qs)` : `Start Challenge (${Math.min(questionCount, matchingQuestions.length)} Qs)`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
