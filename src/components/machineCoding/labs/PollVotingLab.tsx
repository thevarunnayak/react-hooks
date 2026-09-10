import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
  CheckCircle2,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Plus,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  color: string;
}

const INITIAL_POLL_OPTIONS: PollOption[] = [
  {
    id: 'actions',
    label: 'Actions & useActionState (Native form state & error handling)',
    votes: 184,
    color: '#3b82f6',
  },
  {
    id: 'optimistic',
    label: 'useOptimistic (Instant speculative UI mutations without latency)',
    votes: 142,
    color: '#10b981',
  },
  {
    id: 'use-hook',
    label: 'use(Promise) (Direct resource unwrapping with Suspense fallback)',
    votes: 118,
    color: '#8b5cf6',
  },
  {
    id: 'rsc',
    label: 'Server Actions & Streaming RSC Architecture',
    votes: 215,
    color: '#f59e0b',
  },
  {
    id: 'metadata',
    label: 'Native Asset & Hoisted <title> / <link> Management',
    votes: 62,
    color: '#ec4899',
  },
];

export const PollVotingLab: React.FC = () => {
  const [options, setOptions] = useState<PollOption[]>(INITIAL_POLL_OPTIONS);
  const [userVotedId, setUserVotedId] = useState<string | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [newOptionText, setNewOptionText] = useState('');
  const [lastActivity, setLastActivity] = useState<string | null>(null);

  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive state
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 800 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 800);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Total votes calculation
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  // Find winning option
  const winningOption = [...options].sort((a, b) => b.votes - a.votes)[0];

  // Cast vote
  const handleVote = (optionId: string) => {
    if (userVotedId === optionId) return;

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        if (opt.id === userVotedId) {
          return { ...opt, votes: Math.max(0, opt.votes - 1) };
        }
        return opt;
      })
    );
    setUserVotedId(optionId);
  };

  // Revoke vote
  const handleRevokeVote = () => {
    if (!userVotedId) return;
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === userVotedId ? { ...opt, votes: Math.max(0, opt.votes - 1) } : opt
      )
    );
    setUserVotedId(null);
  };

  // Add custom option
  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    const colors = ['#06b6d4', '#84cc16', '#a855f7', '#f97316'];
    const chosenColor = colors[options.length % colors.length];

    const newOpt: PollOption = {
      id: `custom-${Date.now()}`,
      label: newOptionText.trim(),
      votes: 1,
      color: chosenColor,
    };

    setOptions((prev) => [...prev, newOpt]);
    setUserVotedId(newOpt.id);
    setNewOptionText('');
  };

  // Live incoming stream simulation
  useEffect(() => {
    if (!isLiveStreaming) {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      return;
    }

    streamTimerRef.current = setInterval(() => {
      setOptions((prev) => {
        if (prev.length === 0) return prev;
        const randomIdx = Math.floor(Math.random() * prev.length);
        const target = prev[randomIdx];
        setLastActivity(`+1 live vote counted for "${target.label.slice(0, 24)}..."`);

        return prev.map((opt, i) => (i === randomIdx ? { ...opt, votes: opt.votes + 1 } : opt));
      });
    }, 2400);

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isLiveStreaming]);

  // Reset poll
  const resetPoll = () => {
    setOptions(INITIAL_POLL_OPTIONS);
    setUserVotedId(null);
    setLastActivity(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <Card variant="glass" padding="md">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                }}
              >
                <BarChart3 size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Real-Time Poll & Voting System
              </h3>
              {isLiveStreaming && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '11px',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                  STREAMING VOTES
                </span>
              )}
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Real-time percentage recalculations, animated progress bars, single-vote locking with revoke support, and simulated live traffic.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant={isLiveStreaming ? 'secondary' : 'primary'}
              icon={isLiveStreaming ? <Pause size={14} /> : <Play size={14} />}
              onClick={() => setIsLiveStreaming((p) => !p)}
            >
              {isLiveStreaming ? 'Pause Traffic' : 'Resume Traffic'}
            </Button>

            {userVotedId && (
              <Button size="sm" variant="ghost" onClick={handleRevokeVote}>
                Change Vote
              </Button>
            )}

            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={resetPoll}>
              Reset Poll
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Poll Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : 'minmax(320px, 1fr) 280px',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Left: Voting Question & Option Bars */}
        <Card variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Badge variant="primary">OFFICIAL LAB POLL</Badge>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {totalVotes.toLocaleString()} total votes cast
              </span>
            </div>
            <h4
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                lineHeight: '1.4',
                color: 'var(--text-primary)',
              }}
            >
              Which React 19 innovation will provide the biggest performance leap in your enterprise codebase?
            </h4>
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {options.map((opt) => {
              const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isSelected = userVotedId === opt.id;
              const isWinner = winningOption.id === opt.id && totalVotes > 0;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  style={{
                    position: 'relative',
                    borderRadius: '8px',
                    border: isSelected
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, transform 0.15s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(59, 130, 246, 0.25)' : 'var(--shadow-sm)',
                  }}
                  className="poll-option-card"
                >
                  {/* Background Progress Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${percentage}%`,
                      backgroundColor: `${opt.color}1c`,
                      borderRight: `3px solid ${opt.color}`,
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Option Foreground Content */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: isSelected
                            ? `6px solid var(--accent-primary)`
                            : '2px solid var(--border-strong)',
                          backgroundColor: 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {isWinner && (
                        <span
                          title="Current Leading Choice"
                          style={{
                            color: '#fbbf24',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trophy size={16} />
                        </span>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {percentage}%
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {opt.votes.toLocaleString()} votes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Custom Option Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              paddingTop: 14,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <input
              type="text"
              placeholder="Suggest your own option..."
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
              style={{
                flex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={handleAddOption}>
              Add & Vote
            </Button>
          </div>
        </Card>

        {/* Right: Live Poll Stats & Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Leading Choice Card */}
          <Card variant="glass" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                }}
              >
                <Trophy size={18} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Leaderboard Leader
                </span>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {winningOption.label.slice(0, 28)}...
                </h5>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                {totalVotes > 0 ? Math.round((winningOption.votes / totalVotes) * 100) : 0}%
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ({winningOption.votes.toLocaleString()} total votes)
              </span>
            </div>
          </Card>

          {/* Activity Ticker Card */}
          <Card variant="glass" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <TrendingUp size={16} style={{ color: '#10b981' }} />
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Live Ingestion Stream
              </h5>
            </div>

            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 12px',
                borderRadius: '6px',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {lastActivity || 'Waiting for live incoming vote stream...'}
            </div>
          </Card>

          {/* Voting State Info */}
          <Card variant="glass" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Your Ballot Status
              </span>
              {userVotedId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
                    Ballot Cast & Locked
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Click an option to cast your vote
                </span>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Reactive Percentage Recalculation
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Computes proportional distributions in O(N) linear time on every vote delta, smoothly animating bar widths via CSS cubic-bezier transitions.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Idempotent Vote Swapping
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Prevents ballot inflation by decrementing prior selection counts before incrementing new choice, accurately modeling atomic database transactions.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Simulated SSE / WebSocket Feed
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Demonstrates high-frequency state updates without UI unmounting or layout disruption, matching live production polling streams.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
