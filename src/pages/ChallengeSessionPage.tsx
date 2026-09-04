import React, { useState, useEffect } from 'react';
import { ChallengeItem } from '../types/challenge';
import { CHALLENGES_LIST } from '../data/challenges';
import { ChallengeSessionConfig } from '../components/challenges/ChallengeModeModal';
import { ChallengeSessionView } from '../components/challenges/ChallengeSessionView';

const STORAGE_KEY_SESSION = 'react_hooks_active_challenge_session';

interface StoredSessionData {
  challenges: ChallengeItem[];
  timeLimitMinutes: number;
  config: ChallengeSessionConfig;
}

export interface ChallengeSessionPageProps {
  onNavigate: (route: string) => void;
}

export const ChallengeSessionPage: React.FC<ChallengeSessionPageProps> = ({ onNavigate }) => {
  const [sessionData, setSessionData] = useState<StoredSessionData | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSION);
      if (raw) {
        return JSON.parse(raw) as StoredSessionData;
      }
    } catch {
      // Ignore storage read errors
    }

    // Default fallback session if navigated to directly
    const shuffled = [...CHALLENGES_LIST].sort(() => 0.5 - Math.random());
    return {
      challenges: shuffled.slice(0, 10),
      timeLimitMinutes: 10,
      config: {
        questionCount: 10,
        timeLimitMinutes: 10,
        difficulty: 'All',
        categories: ['All'],
      },
    };
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExit = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } catch {
      // Ignore storage errors
    }
    onNavigate('challenges');
  };

  const handleRetake = () => {
    if (!sessionData) return;
    const { config } = sessionData;

    const pool = CHALLENGES_LIST.filter((ch) => {
      const matchesDiff =
        config.difficulty === 'All' || ch.difficulty === config.difficulty;
      const matchesCat =
        config.categories.includes('All') || config.categories.includes(ch.category);
      return matchesDiff && matchesCat;
    });

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const sampled = shuffled.slice(0, Math.min(config.questionCount, pool.length));

    const updated: StoredSessionData = {
      challenges: sampled,
      timeLimitMinutes: config.timeLimitMinutes,
      config,
    };

    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }

    setSessionData(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!sessionData) {
    return null;
  }

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}
      className="challenge-session-page"
    >
      <ChallengeSessionView
        key={sessionData.challenges.map((c) => c.id).join(',')}
        challenges={sessionData.challenges}
        timeLimitMinutes={sessionData.timeLimitMinutes}
        onExit={handleExit}
        onRetake={handleRetake}
      />
    </div>
  );
};
export default ChallengeSessionPage;
