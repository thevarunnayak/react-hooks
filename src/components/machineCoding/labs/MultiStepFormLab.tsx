import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { Check, ArrowRight, ArrowLeft, User, Shield, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Fullstack', label: 'Fullstack' },
  { value: 'DevOps', label: 'DevOps' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'Junior', label: 'Junior' },
  { value: 'Mid', label: 'Mid-Level' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Lead', label: 'Staff / Lead' },
];

interface WizardData {
  // Step 1: Account
  username: string;
  email: string;
  // Step 2: Profile
  fullName: string;
  role: 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps';
  experienceLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  // Step 3: Preferences
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  twoFactorAuth: boolean;
}

const DEFAULT_DATA: WizardData = {
  username: '',
  email: '',
  fullName: '',
  role: 'Frontend',
  experienceLevel: 'Mid',
  theme: 'dark',
  notifications: true,
  twoFactorAuth: false,
};

export const MultiStepFormLab: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardData>(() => {
    try {
      const saved = localStorage.getItem('mc_lab_wizard');
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mc_lab_wizard', JSON.stringify(formData));
    } catch {}
  }, [formData]);

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.username.trim() || formData.username.length < 3) {
        errs.username = 'Username must be at least 3 characters.';
      }
      if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
        errs.email = 'Please enter a valid email address.';
      }
    } else if (step === 2) {
      if (!formData.fullName.trim()) {
        errs.fullName = 'Full name is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(4, s + 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleJumpToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setErrors({});
    } else if (step === currentStep + 1 && validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(1) && validateStep(2)) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_DATA);
    setCurrentStep(1);
    setIsSubmitted(false);
    setErrors({});
  };

  const STEPS = [
    { num: 1, label: 'Account', icon: <User size={13} /> },
    { num: 2, label: 'Profile', icon: <Sliders size={13} /> },
    { num: 3, label: 'Settings', icon: <Shield size={13} /> },
    { num: 4, label: 'Review', icon: <CheckCircle2 size={13} /> },
  ];

  if (isSubmitted) {
    return (
      <Card variant="glass" padding="lg" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <CheckCircle2 size={32} />
        </div>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
          Registration Submitted!
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
          Welcome onboard, <strong>{formData.fullName}</strong> ({formData.username}). Your profile settings have been registered.
        </p>
        <Button variant="secondary" icon={<RotateCcw size={14} />} onClick={handleReset}>
          Reset Wizard
        </Button>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 560, margin: '0 auto' }}>
      {/* Stepper Progress Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {/* Connecting line */}
        <div style={{ position: 'absolute', top: 14, left: 24, right: 24, height: 2, backgroundColor: 'var(--border-subtle)', zIndex: 0 }} />

        {STEPS.map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <div
              key={s.num}
              onClick={() => handleJumpToStep(s.num)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                zIndex: 1,
                cursor: s.num <= currentStep ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: isCurrent ? 'var(--accent-primary)' : isDone ? 'var(--accent-success)' : 'var(--bg-surface)',
                  border: isCurrent || isDone ? 'none' : '2px solid var(--border-default)',
                  color: isCurrent || isDone ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isDone ? <Check size={14} /> : s.num}
              </div>
              <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content Card */}
      <Card variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Step 1: Account */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Step 1: Account Credentials
            </h4>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                USERNAME *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. dev_sarah"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${errors.username ? 'var(--accent-danger)' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              {errors.username && <span style={{ fontSize: '11px', color: 'var(--accent-danger)', marginTop: 3, display: 'block' }}>{errors.username}</span>}
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. sarah@example.com"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${errors.email ? 'var(--accent-danger)' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              {errors.email && <span style={{ fontSize: '11px', color: 'var(--accent-danger)', marginTop: 3, display: 'block' }}>{errors.email}</span>}
            </div>
          </div>
        )}

        {/* Step 2: Profile */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Step 2: Professional Profile
            </h4>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                FULL NAME *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Sarah Chen"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${errors.fullName ? 'var(--accent-danger)' : 'var(--border-default)'}`, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              {errors.fullName && <span style={{ fontSize: '11px', color: 'var(--accent-danger)', marginTop: 3, display: 'block' }}>{errors.fullName}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 10 }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ROLE</label>
                <CustomSelect
                  size="sm"
                  fullWidth
                  value={formData.role}
                  options={ROLE_OPTIONS}
                  onChange={(val) => setFormData({ ...formData, role: val as any })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SENIORITY</label>
                <CustomSelect
                  size="sm"
                  fullWidth
                  value={formData.experienceLevel}
                  options={EXPERIENCE_OPTIONS}
                  onChange={(val) => setFormData({ ...formData, experienceLevel: val as any })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Step 3: Account Preferences
            </h4>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>PREFERRED THEME</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: t })}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${formData.theme === t ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      backgroundColor: formData.theme === t ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                      color: formData.theme === t ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                      fontSize: 'var(--text-xs)',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                />
                Receive automated deployment notifications
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.twoFactorAuth}
                  onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })}
                />
                Enable Two-Factor Authentication (2FA)
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Step 4: Review & Confirm
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, backgroundColor: 'var(--bg-subtle)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Username:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formData.username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formData.fullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Role & Seniority:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formData.experienceLevel} {formData.role}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>2FA Security:</span>
                <strong style={{ color: formData.twoFactorAuth ? 'var(--accent-success)' : 'var(--text-muted)' }}>{formData.twoFactorAuth ? 'Enabled' : 'Disabled'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={<ArrowLeft size={14} />}
            disabled={currentStep === 1}
            onClick={handleBack}
          >
            Back
          </Button>

          {currentStep < 4 ? (
            <Button size="sm" variant="primary" onClick={handleNext}>
              <span>Next Step</span>
              <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Button>
          ) : (
            <Button size="sm" variant="primary" icon={<Check size={14} />} onClick={handleSubmit}>
              Submit Registration
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
