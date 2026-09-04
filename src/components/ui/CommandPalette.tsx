import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Boxes,
  Layers,
  CheckCircle2,
  Award,
  BookOpen,
  CornerDownLeft,
} from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { getSearchIndex } from '../../services/search/searchIndex';
import { searchCorpus } from '../../services/search/fuzzySearch';
import { useSpeechSearch } from '../../hooks/useSpeechSearch';
import { SearchDocCategory, SearchResultItem } from '../../types/search';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, param?: string) => void;
}

const CATEGORY_TABS: { id: SearchDocCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hook', label: 'React Hooks' },
  { id: 'custom_hook', label: 'Custom Hooks' },
  { id: 'architecture', label: 'Architectures' },
  { id: 'challenge', label: 'Challenges' },
  { id: 'interview', label: 'Interviews' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchDocCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Native Web Speech hook for voice search and TTS
  const {
    isListening,
    error: speechError,
    clearError,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeechSearch((voiceText) => {
    setQuery(voiceText);
    setSelectedIndex(0);
  });

  const handleClose = () => {
    stopListening();
    stopSpeaking();
    clearError();
    setQuery('');
    setActiveCategory('all');
    setSelectedIndex(0);
    setSpeakingId(null);
    onClose();
  };

  useClickOutside(paletteRef, handleClose);
  useKeyboardShortcut('Escape', handleClose);

  // Load search corpus index
  const corpus = useMemo(() => getSearchIndex(), []);

  // Compute fuzzy search results with Levenshtein typo tolerance & NL ranking
  const filteredResults: SearchResultItem[] = useMemo(() => {
    return searchCorpus(corpus, query, activeCategory, 25);
  }, [corpus, query, activeCategory]);

  // Focus input, lock background scroll, remove scrollbars, and prevent scroll leakage
  useEffect(() => {
    if (!isOpen) return;

    // Apply modal-open class and overflow locks to both root document and body
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollbarWidth = 'none';
    document.body.style.scrollbarWidth = 'none';

    // Active wheel listener to strictly contain scrolling within results container
    const handleGlobalWheel = (e: WheelEvent) => {
      const resultsEl = resultsContainerRef.current;
      if (!resultsEl) {
        e.preventDefault();
        return;
      }

      // If wheel is outside results container (e.g. on backdrop, header, categories), block it
      if (!resultsEl.contains(e.target as Node)) {
        e.preventDefault();
        return;
      }

      // Inside results container: prevent chaining when hitting top or bottom boundary
      const { scrollTop, scrollHeight, clientHeight } = resultsEl;
      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;

      if (isScrollingUp && scrollTop <= 0) {
        e.preventDefault();
      } else if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 1) {
        e.preventDefault();
      }
    };

    // Active touchmove listener to block touch scrolling outside results list
    const handleGlobalTouchMove = (e: TouchEvent) => {
      const resultsEl = resultsContainerRef.current;
      if (!resultsEl || !resultsEl.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });

    const timer = setTimeout(() => inputRef.current?.focus(), 50);

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.scrollbarWidth = '';
      document.body.style.scrollbarWidth = '';
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleSelect = (result: SearchResultItem) => {
    handleClose();
    onNavigate(result.doc.route, result.doc.param);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Cycle through category tabs
      const currentIdx = CATEGORY_TABS.findIndex((t) => t.id === activeCategory);
      const nextIdx = (currentIdx + (e.shiftKey ? -1 : 1) + CATEGORY_TABS.length) % CATEGORY_TABS.length;
      setActiveCategory(CATEGORY_TABS[nextIdx].id);
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      clearError();
      startListening();
    }
  };

  const handleToggleSpeak = (e: React.MouseEvent, result: SearchResultItem) => {
    e.stopPropagation();
    if (speakingId === result.doc.id && isSpeaking) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      const textToRead = `${result.doc.title}. ${result.doc.subtitle || ''} ${result.matchedSnippet || ''}`;
      speak(textToRead);
      setSpeakingId(result.doc.id);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'hook':
        return <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />;
      case 'custom_hook':
        return <Boxes size={16} style={{ color: 'var(--accent-purple)' }} />;
      case 'architecture':
        return <Layers size={16} style={{ color: '#10b981' }} />;
      case 'challenge':
        return <CheckCircle2 size={16} style={{ color: 'var(--accent-warning)' }} />;
      case 'interview':
        return <Award size={16} style={{ color: '#ec4899' }} />;
      case 'page':
      default:
        return <BookOpen size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '9vh',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        overscrollBehavior: 'contain',
        touchAction: 'none',
      }}
    >
      <div
        ref={paletteRef}
        role="dialog"
        aria-modal="true"
        aria-label="Universal Search and Command Palette"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Search Input Bar with Speech Dictation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <Search
            size={18}
            style={{
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening... speak your search query...'
                : speechError
                ? 'Microphone issue. Click retry or mic to speak...'
                : 'Search hooks, architectures, challenges...'
            }
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              color: 'var(--text-primary)',
              width: '100%',
              outline: 'none',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          />

          {/* Clear Query Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                flexShrink: 0,
              }}
              aria-label="Clear query"
            >
              <X size={15} />
            </button>
          )}

          {/* Voice Input Microphone Button */}
          {isSpeechRecognitionSupported ? (
            <button
              type="button"
              onClick={handleToggleVoice}
              title={
                speechError
                  ? `Microphone issue: ${speechError} — Click to retry`
                  : isListening
                  ? 'Microphone active (Listening...) — Click to stop'
                  : 'Start voice search'
              }
              aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isListening
                  ? '#ef4444'
                  : speechError
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'transparent',
                color: isListening ? '#ffffff' : speechError ? '#ef4444' : 'var(--text-muted)',
                border: isListening
                  ? '1px solid #ef4444'
                  : speechError
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.55)' : 'none',
                flexShrink: 0,
              }}
            >
              <Mic size={16} />
            </button>
          ) : (
            <span
              title="Voice search available in Chrome, Safari & Edge"
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                opacity: 0.4,
                flexShrink: 0,
              }}
            >
              <MicOff size={16} />
            </span>
          )}

          <kbd
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '3px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Voice Input Error Alert */}
        {speechError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '8px 18px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>⚠️</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {speechError}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleToggleVoice}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '2px 4px',
                }}
              >
                Retry
              </button>
              <button
                type="button"
                onClick={clearError}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  lineHeight: 1,
                }}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORY_TABS.map((tab) => {
            const isTabActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSelectedIndex(0);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isTabActive ? 'var(--accent-primary-subtle)' : 'transparent',
                  color: isTabActive ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                  border: isTabActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  fontSize: '11px',
                  fontWeight: isTabActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {filteredResults.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No results found for "{query}"
              </div>
              <div style={{ fontSize: '12px' }}>
                Try searching in natural words like <em>"prevent re-render"</em>, <em>"debounce input"</em>, or <em>"sync storage"</em>.
              </div>
            </div>
          ) : (
            filteredResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              const isThisSpeaking = speakingId === result.doc.id && isSpeaking;

              return (
                <div
                  key={result.doc.id}
                  data-index={idx}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                    border: isSelected
                      ? '1px solid var(--border-default)'
                      : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {renderIcon(result.doc.iconType)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {result.doc.title}
                      </span>

                      {result.doc.badge && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {result.doc.badge}
                        </span>
                      )}

                      {result.doc.difficulty && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 600,
                            padding: '1px 5px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor:
                              result.doc.difficulty === 'Beginner'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : result.doc.difficulty === 'Intermediate'
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(239, 68, 68, 0.12)',
                            color:
                              result.doc.difficulty === 'Beginner'
                                ? '#10b981'
                                : result.doc.difficulty === 'Intermediate'
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        >
                          {result.doc.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Matched Snippet / Natural Language Context */}
                    <div
                      style={{
                        fontSize: '11px',
                        lineHeight: 1.4,
                        color: isSelected ? 'var(--text-secondary)' : 'var(--text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {result.matchedSnippet}
                    </div>
                  </div>

                  {/* Actions: Audio TTS & Enter Hint */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
                    {isSpeechSynthesisSupported && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleSpeak(e, result)}
                        title={isThisSpeaking ? 'Stop reading' : 'Read aloud with text-to-speech'}
                        aria-label={isThisSpeaking ? 'Stop speech' : 'Read aloud'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: isThisSpeaking ? 'var(--accent-primary-subtle)' : 'transparent',
                          color: isThisSpeaking ? 'var(--accent-primary)' : 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {isThisSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}

                    {isSelected && (
                      <CornerDownLeft size={13} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Keyboard Shortcuts & Status */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>
              <kbd style={{ padding: '1px 4px', background: 'var(--bg-subtle)', borderRadius: '3px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>↑</kbd>
              {' '}
              <kbd style={{ padding: '1px 4px', background: 'var(--bg-subtle)', borderRadius: '3px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>↓</kbd> Navigate
            </span>
            <span>
              <kbd style={{ padding: '1px 4px', background: 'var(--bg-subtle)', borderRadius: '3px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>↵</kbd> Select
            </span>
            <span>
              <kbd style={{ padding: '1px 4px', background: 'var(--bg-subtle)', borderRadius: '3px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>Tab</kbd> Filter
            </span>
          </div>

          <div style={{ fontWeight: 500 }}>
            {filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'}
          </div>
        </div>
      </div>
    </div>
  );
};
