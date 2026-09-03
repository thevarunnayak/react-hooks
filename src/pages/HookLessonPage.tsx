import React, { useState, useEffect } from 'react';
import { HookLessonData } from '../types/hook';
import {
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Code2,
  Layers,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Edit3,
  Save,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Accordion } from '../components/ui/Accordion';
import { Tooltip } from '../components/ui/Tooltip';
import { t } from '../i18n/i18n';

// Dedicated Interactive Labs
import { UseStateLab } from '../components/labs/UseStateLab';
import { UseEffectLab } from '../components/labs/UseEffectLab';
import { UseRefLab } from '../components/labs/UseRefLab';
import { UseMemoCallbackLab } from '../components/labs/UseMemoCallbackLab';
import { UseReducerLab } from '../components/labs/UseReducerLab';
import { UseContextLab } from '../components/labs/UseContextLab';
import { ConcurrentLab } from '../components/labs/ConcurrentLab';
import { StrictModeLab } from '../components/labs/StrictModeLab';

export interface HookLessonPageProps {
  lesson: HookLessonData;
  isBookmarked: boolean;
  isCompleted: boolean;
  onToggleBookmark: (hookId: string) => void;
  onToggleComplete: (hookId: string) => void;
  onNavigateHook: (hookId: string) => void;
  onOpenInPlayground?: (hookId: string) => void;
}

export const HookLessonPage: React.FC<HookLessonPageProps> = ({
  lesson,
  isBookmarked,
  isCompleted,
  onToggleBookmark,
  onToggleComplete,
  onNavigateHook,
  onOpenInPlayground,
}) => {
  // Personal notes per hook
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    try {
      const allNotes = JSON.parse(localStorage.getItem('react_hooks_notes') || '{}');
      setNoteText(allNotes[lesson.id] || '');
    } catch {
      setNoteText('');
    }
  }, [lesson.id]);

  const saveNote = () => {
    try {
      const allNotes = JSON.parse(localStorage.getItem('react_hooks_notes') || '{}');
      allNotes[lesson.id] = noteText;
      localStorage.setItem('react_hooks_notes', JSON.stringify(allNotes));
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Render the appropriate interactive lab
  const renderInteractiveLab = () => {
    switch (lesson.id) {
      case 'useState':
        return <UseStateLab />;
      case 'useEffect':
        return <UseEffectLab />;
      case 'useRef':
        return <UseRefLab />;
      case 'useMemo':
      case 'useCallback':
        return <UseMemoCallbackLab />;
      case 'useReducer':
        return <UseReducerLab />;
      case 'useContext':
        return <UseContextLab />;
      case 'useTransition':
      case 'useDeferredValue':
        return <ConcurrentLab />;
      case 'useLayoutEffect':
        return <StrictModeLab />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '960px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      className="hook-lesson-page"
    >
      {/* 1. Header & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="primary">{lesson.category}</Badge>
            <Badge variant="default">React {lesson.reactVersion}</Badge>
            <Badge variant="purple">{lesson.difficulty}</Badge>
          </div>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {lesson.name}()
          </h1>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
            {lesson.tagline}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant={isBookmarked ? 'primary' : 'outline'}
            icon={<Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />}
            onClick={() => onToggleBookmark(lesson.id)}
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>

          <Button
            size="sm"
            variant={isCompleted ? 'primary' : 'secondary'}
            icon={<CheckCircle2 size={14} />}
            onClick={() => onToggleComplete(lesson.id)}
          >
            {isCompleted ? t('common.completed') : t('common.markComplete')}
          </Button>

          {onOpenInPlayground && (
            <Tooltip content={t('lessons.openInBuilderTooltip')} placement="bottom">
              <Button
                size="sm"
                variant="outline"
                icon={<Layers size={14} />}
                onClick={() => onOpenInPlayground(lesson.id)}
              >
                {t('lessons.openInBuilder')}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* 2. What is it & Why does it exist? */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <Card variant="glass" padding="md">
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)', marginBottom: '6px' }}>
            1. What is it?
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {lesson.whatIsIt}
          </p>
        </Card>

        <Card variant="glass" padding="md">
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-purple-text)', marginBottom: '6px' }}>
            2. Why does it exist?
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {lesson.whyExists}
          </p>
        </Card>
      </div>

      {/* 3. Real-world Analogy */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-warning-subtle)',
            color: 'var(--accent-warning-text)',
            flexShrink: 0,
          }}
        >
          <Lightbulb size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Real-World Analogy: {lesson.analogy.metaphor}
          </h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {lesson.analogy.description}
          </p>
        </div>
      </Card>

      {/* 4. Syntax & Mental Model */}
      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={18} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            Syntax & Mental Model
          </h3>
        </div>

        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-code)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
          }}
        >
          {lesson.syntax}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
            EXECUTION PIPELINE:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {lesson.mentalModel.diagramSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {idx + 1}.
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 5. Interactive Lab Demonstration (THE CENTERPIECE OF LESSON) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Interactive Lab Experiment
          </h3>
        </div>
        {renderInteractiveLab()}
      </section>

      {/* 6. Code Examples */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Card variant="elevated" padding="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{lesson.primaryExample.title}</span>
            <Badge variant="default">Idiomatic Pattern</Badge>
          </div>
          <pre
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-code)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.6,
              overflowX: 'auto',
              color: 'var(--text-primary)',
            }}
          >
            <code>{lesson.primaryExample.code}</code>
          </pre>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
            {lesson.primaryExample.description}
          </p>
        </Card>
      </div>

      {/* 7. Common Pitfalls (Bad vs Good Code) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--accent-danger)' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Common Traps & How to Fix Them
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lesson.commonMistakes.map((mistake, idx) => (
            <Card key={idx} variant="elevated" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} />
                  <span>{mistake.title}</span>
                </span>
                <Badge variant="danger">{mistake.dangerLevel.toUpperCase()}</Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-danger-text)' }}>
                    DON'T DO THIS:
                  </span>
                  <pre
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <code>{mistake.badCode}</code>
                  </pre>
                </div>

                <div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-success-text)' }}>
                    DO THIS INSTEAD:
                  </span>
                  <pre
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <code>{mistake.goodCode}</code>
                  </pre>
                </div>
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {mistake.explanation}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 8. Senior Interview Questions */}
      {lesson.interviewQuestions.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-purple)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Senior Interview Questions
            </h3>
          </div>

          <Accordion
            items={lesson.interviewQuestions.map((q, idx) => ({
              id: `q-${idx}`,
              title: q.question,
              badge: <Badge variant="purple">{q.difficulty}</Badge>,
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Answer: </strong>
                    <span>{q.answer}</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <strong>Deep Dive: </strong>
                    <span>{q.deepDive}</span>
                  </div>
                </div>
              ),
            }))}
          />
        </section>
      )}

      {/* 9. Personal Notes (Stored Locally) */}
      <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={15} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              My Personal Notes (Saved Locally)
            </span>
          </div>
          <Button
            size="xs"
            variant="primary"
            icon={<Save size={12} />}
            onClick={saveNote}
          >
            {noteSaved ? 'Saved!' : 'Save Note'}
          </Button>
        </div>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={`Write key observations about ${lesson.name}() here. Automatically stored in your browser...`}
          rows={3}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            resize: 'vertical',
          }}
        />
      </Card>

      {/* 10. Key Takeaway */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--accent-primary-subtle)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Lightbulb size={22} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          <strong>Key Takeaway: </strong> {lesson.keyTakeaway}
        </div>
      </div>
    </div>
  );
};
