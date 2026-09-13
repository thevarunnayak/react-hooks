import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MachineCodingChallenge,
  ChallengeSessionConfig,
  TestExecutionResult,
  ChallengeRecord,
} from '../types/machineCodingChallenge';

const STORAGE_PREFIX_DRAFT = 'reactlabz_challenge_draft_';
const STORAGE_KEY_COMPLETED = 'reactlabz_challenge_completed_records';
const STORAGE_KEY_PREFERENCES = 'reactlabz_challenge_user_preferences';

export interface UseChallengeSessionReturn {
  currentChallenge: MachineCodingChallenge;
  sessionChallenges: MachineCodingChallenge[];
  currentIndex: number;
  userCode: string;
  isDirty: boolean;
  timeRemaining: number;
  elapsedSeconds: number;
  isPaused: boolean;
  isTimeUp: boolean;
  isTimed: boolean;
  testResults: TestExecutionResult | null;
  resultsByChallengeId: Record<string, TestExecutionResult>;
  hintsRevealed: number;
  completedRecords: Record<string, ChallengeRecord>;
  updateCode: (code: string) => void;
  resetCode: () => void;
  revealNextHint: () => void;
  setTestResults: (results: TestExecutionResult) => void;
  togglePause: () => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  recordSuccess: (scorePercent: number) => void;
  resetAllStorage: () => void;
}

export function useChallengeSession(
  challenges: MachineCodingChallenge[],
  config: ChallengeSessionConfig
): UseChallengeSessionReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentChallenge = challenges[currentIndex] || challenges[0];

  // User Code drafts
  const getDraftForChallenge = useCallback((challengeId: string, starter: string): string => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX_DRAFT + challengeId);
      if (saved !== null) return saved;
    } catch {}
    return starter;
  }, []);

  const [userCode, setUserCode] = useState<string>(() =>
    getDraftForChallenge(currentChallenge.id, currentChallenge.starterCode)
  );

  const [isDirty, setIsDirty] = useState(false);

  // Sync userCode when currentChallenge changes
  useEffect(() => {
    const draft = getDraftForChallenge(currentChallenge.id, currentChallenge.starterCode);
    setUserCode(draft);
    setIsDirty(draft !== currentChallenge.starterCode);
  }, [currentChallenge.id, currentChallenge.starterCode, getDraftForChallenge]);

  // Update & Auto-Save Draft
  const updateCode = useCallback(
    (newCode: string) => {
      setUserCode(newCode);
      setIsDirty(newCode !== currentChallenge.starterCode);
      try {
        localStorage.setItem(STORAGE_PREFIX_DRAFT + currentChallenge.id, newCode);
      } catch {}
    },
    [currentChallenge.id, currentChallenge.starterCode]
  );

  // Reset to original starter code
  const resetCode = useCallback(() => {
    setUserCode(currentChallenge.starterCode);
    setIsDirty(false);
    try {
      localStorage.removeItem(STORAGE_PREFIX_DRAFT + currentChallenge.id);
    } catch {}
  }, [currentChallenge.id, currentChallenge.starterCode]);

  // Hints
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const revealNextHint = useCallback(() => {
    setHintsRevealed((prev) => Math.min(currentChallenge.hints.length, prev + 1));
  }, [currentChallenge.hints.length]);

  // Reset hint count when switching questions
  useEffect(() => {
    setHintsRevealed(0);
  }, [currentIndex]);

  // Timer
  const totalSeconds = config.isTimed ? config.durationMinutes * 60 : 0;
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (config.isTimed) {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.isTimed, isPaused]);

  const togglePause = useCallback(() => {
    if (config.mode === 'interview' && !config.allowPause) {
      return; // strict interview mode prevents pausing
    }
    setIsPaused((p) => !p);
  }, [config.mode, config.allowPause]);

  // Test Results per challenge
  const [resultsByChallengeId, setResultsByChallengeId] = useState<Record<string, TestExecutionResult>>({});
  const testResults = resultsByChallengeId[currentChallenge.id] || null;

  const setTestResults = useCallback(
    (results: TestExecutionResult) => {
      setResultsByChallengeId((prev) => ({
        ...prev,
        [results.challengeId]: results,
      }));
    },
    []
  );

  // Navigation across questions
  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < challenges.length) {
        setCurrentIndex(index);
      }
    },
    [challenges.length]
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, challenges.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Completed records in localStorage
  const [completedRecords, setCompletedRecords] = useState<Record<string, ChallengeRecord>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COMPLETED);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const recordSuccess = useCallback(
    (scorePercent: number) => {
      const existing = completedRecords[currentChallenge.id];
      const record: ChallengeRecord = {
        id: currentChallenge.id,
        completedAt: Date.now(),
        bestTimeSeconds: existing
          ? Math.min(existing.bestTimeSeconds, elapsedSeconds)
          : elapsedSeconds,
        attempts: (existing?.attempts || 0) + 1,
        passedAll: true,
        scorePercent: Math.max(existing?.scorePercent || 0, scorePercent),
        mode: config.mode,
      };

      const updated = { ...completedRecords, [currentChallenge.id]: record };
      setCompletedRecords(updated);
      try {
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(updated));
      } catch {}
    },
    [completedRecords, currentChallenge.id, elapsedSeconds, config.mode]
  );

  const resetAllStorage = useCallback(() => {
    try {
      // Clear drafts
      challenges.forEach((c) => {
        localStorage.removeItem(STORAGE_PREFIX_DRAFT + c.id);
      });
      localStorage.removeItem(STORAGE_KEY_COMPLETED);
      localStorage.removeItem(STORAGE_KEY_PREFERENCES);
    } catch {}
    setCompletedRecords({});
    resetCode();
  }, [challenges, resetCode]);

  return {
    currentChallenge,
    sessionChallenges: challenges,
    currentIndex,
    userCode,
    isDirty,
    timeRemaining,
    elapsedSeconds,
    isPaused,
    isTimeUp,
    isTimed: config.isTimed,
    testResults,
    resultsByChallengeId,
    hintsRevealed,
    completedRecords,
    updateCode,
    resetCode,
    revealNextHint,
    setTestResults,
    togglePause,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    recordSuccess,
    resetAllStorage,
  };
}
