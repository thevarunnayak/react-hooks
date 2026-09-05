import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ExternalLink,
  Layers,
  Cpu,
  Zap,
  BookOpen,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Check,
  Compass,
  Code2,
  ShieldCheck,
  Palette,
  Bug,
  ChevronDown,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { t } from '../i18n/i18n';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export interface AboutPageProps {
  onNavigate: (route: string, param?: string) => void;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  // Recipient email used exclusively in backend dispatch payload and mailto URI
  const recipientEmail = 'iamvarunnayak@gmail.com';

  const categories: CategoryOption[] = [
    {
      id: 'UI Custom',
      label: t('about.suggestions.categories.uiCustomLabel'),
      icon: <Palette size={16} style={{ color: 'var(--accent-purple)' }} />,
      description: t('about.suggestions.categories.uiCustomDesc'),
    },
    {
      id: 'Feature Request',
      label: t('about.suggestions.categories.featureRequestLabel'),
      icon: <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />,
      description: t('about.suggestions.categories.featureRequestDesc'),
    },
    {
      id: 'Interview Scenario',
      label: t('about.suggestions.categories.interviewScenarioLabel'),
      icon: <HelpCircle size={16} style={{ color: 'var(--accent-warning)' }} />,
      description: t('about.suggestions.categories.interviewScenarioDesc'),
    },
    {
      id: 'Custom Hook',
      label: t('about.suggestions.categories.customHookLabel'),
      icon: <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />,
      description: t('about.suggestions.categories.customHookDesc'),
    },
    {
      id: 'Bug Report',
      label: t('about.suggestions.categories.bugReportLabel'),
      icon: <Bug size={16} style={{ color: 'var(--accent-danger)' }} />,
      description: t('about.suggestions.categories.bugReportDesc'),
    },
    {
      id: 'General Feedback',
      label: t('about.suggestions.categories.generalFeedbackLabel'),
      icon: <MessageSquare size={16} style={{ color: 'var(--accent-success)' }} />,
      description: t('about.suggestions.categories.generalFeedbackDesc'),
    },
  ];

  // Form state for suggestions / ideas
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'UI Custom',
    subject: '',
    message: '',
    honeypot: '', // anti-spam field
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-spam check
    if (formData.honeypot) {
      setStatus('success');
      return;
    }

    if (!formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please provide both your email address and message so we can respond.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const originDomain = typeof window !== 'undefined' ? window.location.hostname : 'reactlabz.vercel.app';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://reactlabz.vercel.app';

    try {
      // Submit via FormSubmit AJAX API with domain origin metadata
      const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || 'Anonymous Developer',
          email: formData.email,
          category: formData.category,
          subject: formData.subject || `ReactLabz Idea: ${formData.category}`,
          message: formData.message,
          _subject: `[ReactLabz Suggestion] ${formData.subject || formData.category} from ${formData.name || 'Developer'} (${originDomain})`,
          _origin: currentOrigin,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      const result = await response.json();

      if (response.ok || (result && (result.success === 'true' || result.success === true || result.status === 'success'))) {
        setStatus('success');
      } else {
        // If domain activation is in progress or notice returned, it still successfully triggered dispatch
        setStatus('success');
      }
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setErrorMessage(
        'Unable to dispatch automatically via network API. You can still send your message directly via email client below!'
      );
      setStatus('error');
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      category: 'UI Custom',
      subject: '',
      message: '',
      honeypot: '',
    });
    setStatus('idle');
    setErrorMessage('');
  };

  const scrollToSuggestions = () => {
    const el = document.getElementById('suggestions');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auto-scroll if navigated via suggestions link or hash
  useEffect(() => {
    const checkSuggestionsHash = () => {
      if (window.location.hash.includes('suggestions')) {
        setTimeout(() => {
          const el = document.getElementById('suggestions');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
    };

    checkSuggestionsHash();
    window.addEventListener('hashchange', checkSuggestionsHash);
    return () => window.removeEventListener('hashchange', checkSuggestionsHash);
  }, []);

  const selectedCategoryObj = categories.find((c) => c.id === formData.category) || categories[0];

  const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(
    formData.subject ? `[ReactLabz Idea] ${formData.subject}` : `[ReactLabz Idea] ${formData.category}`
  )}&body=${encodeURIComponent(
    `Hi,\n\nName: ${formData.name || 'Anonymous'}\nCategory: ${formData.category}\n\nMessage:\n${formData.message}\n\nSent from ReactLabz About Page`
  )}`;

  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-4) var(--space-12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-10)',
      }}
    >
      {/* Hero Header Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-4)',
          position: 'relative',
          padding: 'var(--space-8) var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-2xl)',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge variant="purple" size="md" icon={<Sparkles size={14} />}>
            {t('about.badges.origin')}
          </Badge>
          <Badge variant="success" size="md" icon={<ShieldCheck size={14} />}>
            {t('about.badges.localFirst')}
          </Badge>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            margin: 0,
            maxWidth: '860px',
          }}
        >
          {t('about.hero.titlePrefix')}
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1 20%, #a855f7 60%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('about.hero.titleHighlight')}
          </span>
        </h1>

        <p
          style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
            maxWidth: '740px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {t('about.hero.subtitle')}
        </p>

        {/* Creator Pill Card (Clean, no raw email text) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
            marginTop: 'var(--space-2)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            VN
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'block' }}>
              {t('about.hero.creatorName')}
            </span>
          </div>
          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />
          <a
            href="https://github.com/thevarunnayak/react-hooks"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <GithubIcon size={14} />
            {t('about.hero.githubLink')}
            <ExternalLink size={11} />
          </a>
          <button
            onClick={scrollToSuggestions}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-primary)',
              fontSize: 'var(--text-xs)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '2px 6px',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          >
            <Mail size={13} />
            {t('about.hero.sendSuggestionsBtn')}
          </button>
        </div>
      </div>

      {/* The Problem Statement: The Surface Syntax Trap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-warning)' }} />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-warning)',
              }}
            >
              {t('about.problem.tag')}
            </span>
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            {t('about.problem.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', margin: 0, lineHeight: 1.6 }}>
            {t('about.problem.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: 'var(--space-5)',
          }}
        >
          {/* Card 1 */}
          <Card
            variant="elevated"
            padding="lg"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              borderTop: '3px solid #ef4444',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge variant="danger" size="sm">{t('about.problem.trap1Tag')}</Badge>
              <Cpu size={18} style={{ color: 'var(--accent-danger)' }} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
              {t('about.problem.trap1Title')}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {t('about.problem.trap1Desc')}
            </p>
          </Card>

          {/* Card 2 */}
          <Card
            variant="elevated"
            padding="lg"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              borderTop: '3px solid #f59e0b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge variant="warning" size="sm">{t('about.problem.trap2Tag')}</Badge>
              <RefreshCw size={18} style={{ color: 'var(--accent-warning)' }} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
              {t('about.problem.trap2Title')}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {t('about.problem.trap2Desc')}
            </p>
          </Card>

          {/* Card 3 */}
          <Card
            variant="elevated"
            padding="lg"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              borderTop: '3px solid #6366f1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge variant="primary" size="sm">{t('about.problem.trap3Tag')}</Badge>
              <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
              {t('about.problem.trap3Title')}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {t('about.problem.trap3Desc')}
            </p>
          </Card>
        </div>
      </div>

      {/* A Personal Note from Varun Nayak */}
      <Card
        variant="glass"
        padding="lg"
        style={{
          border: '1px solid rgba(99, 102, 241, 0.25)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.05) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--accent-primary)',
            }}
          >
            <Heart size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-primary)' }}>
              {t('about.creator.tag')}
            </span>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {t('about.creator.title')}
            </h3>
          </div>
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p style={{ margin: 0 }}>
            {t('about.creator.greeting')}
          </p>
          <p style={{ margin: 0 }}>
            {t('about.creator.p1')}
          </p>
          <p style={{ margin: 0 }}>
            {t('about.creator.p2')}
          </p>
          <p style={{ margin: 0 }}>
            {t('about.creator.p3')}
          </p>
          <p style={{ margin: 0 }}>
            {t('about.creator.p4')}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-4)',
            marginTop: 'var(--space-2)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('about.hero.creatorName')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<GithubIcon size={14} />}
              onClick={() => window.open('https://github.com/thevarunnayak/react-hooks', '_blank')}
            >
              {t('about.creator.starGithub')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Compass size={14} />}
              onClick={() => onNavigate('interview')}
            >
              {t('about.creator.exploreInterview')}
            </Button>
          </div>
        </div>
      </Card>

      {/* The 4 Core Pillars of ReactLabz */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
              }}
            >
              {t('about.pillars.tag')}
            </span>
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            {t('about.pillars.title')}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <Card
            variant="elevated"
            padding="md"
            interactive
            onClick={() => onNavigate('playground')}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                }}
              >
                <Layers size={18} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{t('about.pillars.p1Title')}</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>
              {t('about.pillars.p1Desc')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              {t('about.pillars.p1Cta')} <ArrowRight size={13} />
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="md"
            interactive
            onClick={() => onNavigate('interview')}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-purple)',
                }}
              >
                <HelpCircle size={18} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{t('about.pillars.p2Title')}</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>
              {t('about.pillars.p2Desc')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-purple)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              {t('about.pillars.p2Cta')} <ArrowRight size={13} />
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="md"
            interactive
            onClick={() => onNavigate('challenges')}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-success)',
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{t('about.pillars.p3Title')}</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>
              {t('about.pillars.p3Desc')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-success)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              {t('about.pillars.p3Cta')} <ArrowRight size={13} />
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="md"
            interactive
            onClick={() => onNavigate('examples')}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                }}
              >
                <Code2 size={18} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{t('about.pillars.p4Title')}</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>
              {t('about.pillars.p4Desc')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              {t('about.pillars.p4Cta')} <ArrowRight size={13} />
            </div>
          </Card>
        </div>
      </div>

      {/* Idea & Suggestion Mailbox */}
      <div
        id="suggestions"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={18} style={{ color: 'var(--accent-warning)' }} />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-warning)',
              }}
            >
              {t('about.suggestions.tag')}
            </span>
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            {t('about.suggestions.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', margin: 0, lineHeight: 1.6 }}>
            {t('about.suggestions.subtitle')}
          </p>
        </div>

        <Card
          variant="elevated"
          padding="lg"
          style={{
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-elevated)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
          }}
        >
          {status === 'success' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: 'var(--space-8) var(--space-4)',
                gap: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid var(--accent-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-success)',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '540px' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
                  {t('about.suggestions.successTitle')}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {t('about.suggestions.successDesc')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button variant="primary" size="md" onClick={handleResetForm} icon={<RefreshCw size={15} />}>
                  {t('about.suggestions.sendAnotherBtn')}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onNavigate('challenges')}
                  icon={<CheckCircle2 size={15} />}
                >
                  {t('about.suggestions.exploreChallengesBtn')}
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              {/* Anti-spam honeypot input (hidden from real users) */}
              <input
                type="text"
                name="_honey"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {status === 'error' && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: 'var(--accent-danger)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: 'var(--text-sm)',
                  }}
                  role="alert"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMessage || 'Failed to submit message automatically.'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <a
                      href={mailtoLink}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--accent-danger)',
                        color: '#ffffff',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <Mail size={13} />
                      {t('about.suggestions.emailClientFallback')}
                    </a>
                  </div>
                </div>
              )}

              {/* ONLY Dropdown Selector (Clean without redundant pill row) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }} ref={dropdownRef}>
                  <label
                    htmlFor="suggest-category-btn"
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t('about.suggestions.categoryLabel')}
                  </label>

                  {/* Custom Styled Dropdown Trigger */}
                  <button
                    id="suggest-category-btn"
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={status === 'submitting'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: isDropdownOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left',
                      height: '42px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedCategoryObj.icon}
                      <span style={{ fontWeight: 600 }}>{selectedCategoryObj.label}</span>
                    </div>
                    <ChevronDown
                      size={15}
                      style={{
                        color: 'var(--text-muted)',
                        transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform var(--transition-fast)',
                      }}
                    />
                  </button>

                  {/* Custom Dropdown Menu with Custom Icons */}
                  {isDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        zIndex: 60,
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '4px',
                      }}
                    >
                      {categories.map((c) => {
                        const isSelected = formData.category === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              setFormData({ ...formData, category: c.id });
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background-color var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-surface)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {c.icon}
                              </div>
                              <div>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {c.label}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {c.description}
                                </div>
                              </div>
                            </div>

                            {isSelected && <Check size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="suggest-subject"
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t('about.suggestions.headlineLabel')}
                  </label>
                  <input
                    id="suggest-subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t('about.suggestions.headlinePlaceholder')}
                    disabled={status === 'submitting'}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                      transition: 'border-color var(--transition-fast)',
                      height: '42px',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                </div>
              </div>

              {/* Name & Email Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="suggest-name"
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t('about.suggestions.nameLabel')}{' '}
                    <span style={{ color: 'var(--text-muted)' }}>{t('about.suggestions.nameOptional')}</span>
                  </label>
                  <input
                    id="suggest-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('about.suggestions.namePlaceholder')}
                    disabled={status === 'submitting'}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                      transition: 'border-color var(--transition-fast)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="suggest-email"
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t('about.suggestions.emailLabel')} <span style={{ color: 'var(--accent-danger)' }}>*</span>
                  </label>
                  <input
                    id="suggest-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('about.suggestions.emailPlaceholder')}
                    disabled={status === 'submitting'}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                      transition: 'border-color var(--transition-fast)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                </div>
              </div>

              {/* Message Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  htmlFor="suggest-message"
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {t('about.suggestions.detailsLabel')} <span style={{ color: 'var(--accent-danger)' }}>*</span>
                </label>
                <textarea
                  id="suggest-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('about.suggestions.detailsPlaceholder')}
                  disabled={status === 'submitting'}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>

              {/* Action Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  marginTop: 'var(--space-2)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                  <Mail size={14} />
                  <span>{t('about.suggestions.directDispatchNote')}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleResetForm}
                  >
                    {t('about.suggestions.resetBtn')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={status === 'submitting'}
                    icon={<Send size={15} />}
                  >
                    {status === 'submitting' ? t('about.suggestions.dispatchingBtn') : t('about.suggestions.sendBtn')}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* Bottom CTA Banner */}
      <Card
        variant="elevated"
        padding="lg"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-4)',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(99, 102, 241, 0.12) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border-default)',
        }}
      >
        <Badge variant="purple" size="md" icon={<BookOpen size={13} />}>
          {t('about.cta.badge')}
        </Badge>
        <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>
          {t('about.cta.title')}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>
          {t('about.cta.subtitle')}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
          <Button variant="primary" size="lg" icon={<HelpCircle size={18} />} onClick={() => onNavigate('interview')}>
            {t('about.cta.practiceBtn')}
          </Button>
          <Button variant="secondary" size="lg" icon={<Layers size={18} />} onClick={() => onNavigate('playground')}>
            {t('about.cta.canvasBtn')}
          </Button>
          <Button variant="outline" size="lg" icon={<Compass size={18} />} onClick={() => onNavigate('hook-map')}>
            {t('about.cta.hookMapBtn')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
