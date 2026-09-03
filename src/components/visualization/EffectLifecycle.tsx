import React, { useState } from 'react';
import { RotateCw, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export const EffectLifecycle: React.FC = () => {
  const [count, setCount] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);

  const runSimulation = () => {
    setActiveStep(1); // Render
    setTimeout(() => {
      setActiveStep(2); // DOM update
      setTimeout(() => {
        setActiveStep(3); // Screen Paint
        setTimeout(() => {
          setActiveStep(4); // Cleanup
          setTimeout(() => {
            setActiveStep(5); // Effect runs
            setHistory((prev) => [
              `Render #${count + 1}: Cleanup executed -> New Effect executed (count: ${count + 1})`,
              ...prev.slice(0, 4),
            ]);
            setTimeout(() => setActiveStep(0), 1200);
          }, 400);
        }, 400);
      }, 400);
    }, 400);
  };

  const steps = [
    { num: 1, name: '1. Render', desc: 'Component function executes, JSX returned' },
    { num: 2, name: '2. Commit DOM', desc: 'React updates actual DOM nodes' },
    { num: 3, name: '3. Browser Paint', desc: 'User visually sees UI update' },
    { num: 4, name: '4. Run Cleanup', desc: 'Cleanup from previous render runs' },
    { num: 5, name: '5. Run Effect', desc: 'New effect callback executes' },
  ];

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-default)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <h4 style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
            useEffect Lifecycle & Execution Flow
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            size="xs"
            variant="primary"
            icon={<RotateCw size={12} />}
            disabled={activeStep > 0}
            onClick={() => {
              setCount((c) => c + 1);
              runSimulation();
            }}
          >
            Trigger Re-render (+1)
          </Button>
        </div>
      </div>

      {/* Step Progress Line */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}
      >
        {steps.map((step) => {
          const isActive = activeStep === step.num;
          const isPassed = activeStep > step.num;
          return (
            <div
              key={step.num}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive
                  ? 'var(--accent-primary-subtle)'
                  : isPassed
                  ? 'var(--bg-surface)'
                  : 'var(--bg-subtle)',
                border: isActive
                  ? '2px solid var(--accent-primary)'
                  : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 200ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: isActive ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                  }}
                >
                  {step.name}
                </span>
                {isPassed && <Check size={12} style={{ color: 'var(--accent-success)' }} />}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Execution Log */}
      {history.length > 0 && (
        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-code)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>// Execution Log</div>
          {history.map((h, i) => (
            <div key={i} style={{ color: i === 0 ? 'var(--accent-success-text)' : 'var(--text-muted)' }}>
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
