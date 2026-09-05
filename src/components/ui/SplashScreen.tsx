import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrandLogo } from './BrandLogo';
import { ArrowRight } from 'lucide-react';

export interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 1200,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing React 19 Hook Engines...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const hasFinishedRef = useRef(false);

  const triggerFinish = useCallback((delayMs = 380) => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onFinishRef.current?.();
    }, delayMs);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    let completed = false;

    // Use 20ms interval so progression runs reliably regardless of tab focus or RAF throttling
    const interval = setInterval(() => {
      if (completed) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusText('Initializing React 19 Hook Engines...');
      } else if (pct < 70) {
        setStatusText('Loading Reactive Visualizer Workbenches...');
      } else if (pct < 98) {
        setStatusText('Calibrating Architectural Lab Graphs...');
      } else {
        setStatusText('Workspace Ready');
      }

      if (pct >= 100) {
        completed = true;
        clearInterval(interval);
        setTimeout(() => {
          triggerFinish(380);
        }, 120);
      }
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        completed = true;
        clearInterval(interval);
        triggerFinish(180);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [minDurationMs, triggerFinish]);

  const handleSkip = () => {
    triggerFinish(180);
  };

  return (
    <div
      onClick={handleSkip}
      role="dialog"
      aria-label="ReactLabz Splash Screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(9, 12, 20, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1), transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Background Decorative Radial Gradient */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Brand Card */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '40px 32px',
          maxWidth: '460px',
          width: '90%',
        }}
      >
        {/* Floating Brand Logo with Glow */}
        <div
          style={{
            position: 'relative',
            marginBottom: '22px',
            animation: 'floatGlow 3s ease-in-out infinite',
          }}
        >
          <BrandLogo size={76} glow={true} />
        </div>

        {/* Brand Name Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #ffffff 40%, #93c5fd 80%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ReactLabz
          </h1>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))',
              color: '#a5b4fc',
              border: '1px solid rgba(165, 180, 252, 0.35)',
              letterSpacing: '0.05em',
            }}
          >
            STUDIO
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            margin: '0 0 28px 0',
            fontSize: '13px',
            color: '#94a3b8',
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          Interactive React Hooks Studio & Visual Architecture Lab
        </p>

        {/* Sleek Progress Track */}
        <div
          id="splash-progress-track"
          style={{
            width: '100%',
            maxWidth: '280px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '14px',
            position: 'relative',
          }}
        >
          <div
            id="splash-progress-bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #06b6d4, #6366f1, #a855f7)',
              borderRadius: '999px',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.7)',
              transition: 'width 60ms linear',
            }}
          />
        </div>

        {/* Progress Text & Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '280px',
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <span id="splash-status-text" style={{ color: '#94a3b8' }}>{statusText}</span>
          <span id="splash-progress-percent" style={{ fontWeight: 600, color: '#e2e8f0' }}>{progress}%</span>
        </div>

        {/* Skip Hint */}
        <div
          style={{
            marginTop: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#475569',
            transition: 'color 0.2s ease',
          }}
        >
          <span>Click anywhere or press Esc to enter</span>
          <ArrowRight size={11} />
        </div>
      </div>

      <style>{`
        @keyframes floatGlow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};
