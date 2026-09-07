import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { InterviewQuestionItem } from '../types/challenge';
import {
  AudioSegment,
  AudioPlaybackState,
  AudioPlayerSettings,
  PauseCadenceMode,
  AudioProgressInfo,
} from '../types/interviewAudio';
import {
  buildAudioQueueForQuestions,
} from '../services/interviewAudio/audioSegmentBuilder';
import {
  STORAGE_AUDIO_SETTINGS_KEY,
  DEFAULT_AUDIO_SETTINGS,
  AUDIO_SETTINGS_CHANGED_EVENT,
} from '../services/interviewAudio/voicePacks';

const STORAGE_PROGRESS_KEY = 'react_hooks_audio_progress_v2';

// Pause configurations in milliseconds based on cadence mode
const PAUSE_DURATIONS: Record<
  PauseCadenceMode,
  { interSegment: number; interQuestion: number }
> = {
  natural: { interSegment: 750, interQuestion: 1400 },
  snappy: { interSegment: 350, interQuestion: 750 },
  extended: { interSegment: 1200, interQuestion: 2200 },
};

export interface SavedAudioProgress {
  questionId: string;
  questionNumber: number;
  questionTitle: string;
  segmentId: string;
  timestamp: number;
}

export function useInterviewAudio(questions: InterviewQuestionItem[]) {
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>('idle');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeCharIndex, setActiveCharIndex] = useState<number>(0);

  // Load persisted settings
  const [settings, setSettings] = useState<AudioPlayerSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUDIO_SETTINGS_KEY);
      return saved ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) } : DEFAULT_AUDIO_SETTINGS;
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  });

  // Load saved progress
  const [savedProgress, setSavedProgress] = useState<SavedAudioProgress | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROGRESS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage write errors
    }
  }, [settings]);

  // Synchronize when settings are modified elsewhere (e.g. Main SettingsModal)
  useEffect(() => {
    const handleSettingsUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_AUDIO_SETTINGS_KEY);
        if (saved) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch {
        // Ignore parsing errors
      }
    };

    window.addEventListener(AUDIO_SETTINGS_CHANGED_EVENT, handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener(AUDIO_SETTINGS_CHANGED_EVENT, handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // Build the complete flattened audio queue
  const queue = useMemo<AudioSegment[]>(() => {
    return buildAudioQueueForQuestions(questions);
  }, [questions]);

  const currentSegment = queue[currentSegmentIndex] || null;

  const currentQuestion = useMemo(() => {
    if (!currentSegment) return null;
    return questions.find((q) => q.id === currentSegment.questionId) || null;
  }, [currentSegment, questions]);

  const currentQuestionIndex = useMemo(() => {
    if (!currentSegment) return 0;
    const idx = questions.findIndex((q) => q.id === currentSegment.questionId);
    return idx >= 0 ? idx : 0;
  }, [currentSegment, questions]);

  // References for utterance management and timeouts
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null
  );
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const speakSegmentRef = useRef<(index: number) => void>(() => {});

  // Keep isPlayingRef synchronized safely
  useEffect(() => {
    isPlayingRef.current = playbackState === 'playing';
  }, [playbackState]);

  // Populate available device voices
  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;

    const updateVoices = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);

        // Auto-select preferred natural English voice if voiceURI not yet configured
        setSettings((prev) => {
          if (prev.voiceURI && voices.some((v) => v.voiceURI === prev.voiceURI)) {
            return prev;
          }
          // Prioritize high quality English voices
          const preferredVoice =
            voices.find(
              (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Natural') ||
                  v.name.includes('Google') ||
                  v.name.includes('Samantha') ||
                  v.name.includes('Daniel') ||
                  v.name.includes('Karen') ||
                  v.name.includes('Moira') ||
                  v.name.includes('Siri'))
            ) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];

          return {
            ...prev,
            voiceURI: preferredVoice ? preferredVoice.voiceURI : null,
          };
        });
      }
    };

    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  // Save progress whenever current segment changes while playing or paused
  useEffect(() => {
    if (!currentSegment || !currentQuestion) return;
    const progress: SavedAudioProgress = {
      questionId: currentQuestion.id,
      questionNumber: currentSegment.questionNumber,
      questionTitle: currentQuestion.question,
      segmentId: currentSegment.id,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
      setSavedProgress(progress);
    } catch {
      // Ignore storage errors
    }
  }, [currentSegment, currentQuestion]);

  // Clear any active pause timers
  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  // Speak a specific segment index
  const speakSegment = useCallback(
    (index: number) => {
      const synth = synthRef.current;
      if (!synth || index < 0 || index >= queue.length) {
        setPlaybackState('completed');
        return;
      }

      clearPauseTimer();
      synth.cancel(); // Cancel any existing speech

      const segment = queue[index];
      setCurrentSegmentIndex(index);
      setActiveCharIndex(0);
      setPlaybackState('playing');

      const utterance = new SpeechSynthesisUtterance(segment.speechText);
      activeUtteranceRef.current = utterance;

      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;

      if (settings.voiceURI && availableVoices.length > 0) {
        const selectedVoice = availableVoices.find((v) => v.voiceURI === settings.voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          setActiveCharIndex(event.charIndex);
        }
      };

      utterance.onend = () => {
        if (!isPlayingRef.current) return;

        // Determine if next segment transitions to a new question
        const isLastInQueue = index >= queue.length - 1;
        if (isLastInQueue) {
          setPlaybackState('completed');
          return;
        }

        const nextSegment = queue[index + 1];
        const isNextQuestion = nextSegment && nextSegment.questionId !== segment.questionId;
        const pauseConfig = PAUSE_DURATIONS[settings.pauseMode] || PAUSE_DURATIONS.natural;
        const pauseDelay = isNextQuestion
          ? pauseConfig.interQuestion
          : pauseConfig.interSegment;

        // Schedule natural breathing pause before speaking next segment
        isTransitioningRef.current = true;
        pauseTimerRef.current = window.setTimeout(() => {
          isTransitioningRef.current = false;
          if (isPlayingRef.current) {
            speakSegmentRef.current(index + 1);
          }
        }, pauseDelay);
      };

      utterance.onerror = (err) => {
        // 'interrupted' or 'canceled' are normal during skip/pause actions
        if (err.error !== 'interrupted' && err.error !== 'canceled') {
          console.warn('[SpeechSynthesis] Utterance error:', err);
        }
      };

      synth.speak(utterance);
    },
    [queue, settings.rate, settings.pitch, settings.voiceURI, settings.pauseMode, availableVoices, clearPauseTimer]
  );

  useEffect(() => {
    speakSegmentRef.current = speakSegment;
  }, [speakSegment]);

  // Play / Start
  const play = useCallback(
    (targetIndex?: number) => {
      const idx = typeof targetIndex === 'number' ? targetIndex : currentSegmentIndex;
      speakSegment(idx);
    },
    [currentSegmentIndex, speakSegment]
  );

  // Pause
  const pause = useCallback(() => {
    clearPauseTimer();
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
    }
    setPlaybackState('paused');
  }, [clearPauseTimer]);

  // Resume
  const resume = useCallback(() => {
    speakSegment(currentSegmentIndex);
  }, [currentSegmentIndex, speakSegment]);

  // Toggle Play / Pause
  const togglePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      pause();
    } else {
      resume();
    }
  }, [playbackState, pause, resume]);

  // Stop & Reset
  const stop = useCallback(() => {
    clearPauseTimer();
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
    }
    setPlaybackState('idle');
    setCurrentSegmentIndex(0);
    setActiveCharIndex(0);
  }, [clearPauseTimer]);

  // Jump to specific Question by ID
  const jumpToQuestion = useCallback(
    (questionId: string) => {
      const segIndex = queue.findIndex((s) => s.questionId === questionId);
      if (segIndex !== -1) {
        speakSegment(segIndex);
      }
    },
    [queue, speakSegment]
  );

  // Jump to specific Segment by ID
  const jumpToSegment = useCallback(
    (segmentId: string) => {
      const segIndex = queue.findIndex((s) => s.id === segmentId);
      if (segIndex !== -1) {
        speakSegment(segIndex);
      }
    },
    [queue, speakSegment]
  );

  // Next Question
  const nextQuestion = useCallback(() => {
    if (!currentSegment) return;
    const currentQId = currentSegment.questionId;
    const nextQSegmentIndex = queue.findIndex(
      (s, idx) => idx > currentSegmentIndex && s.questionId !== currentQId
    );
    if (nextQSegmentIndex !== -1) {
      speakSegment(nextQSegmentIndex);
    } else {
      // Loop or complete
      setPlaybackState('completed');
    }
  }, [currentSegment, currentSegmentIndex, queue, speakSegment]);

  // Previous Question
  const prevQuestion = useCallback(() => {
    if (!currentSegment) return;
    const currentQId = currentSegment.questionId;

    // Find the first segment of the current question
    const firstOfCurrent = queue.findIndex((s) => s.questionId === currentQId);

    // If we are well into the current question (> first segment), restart current question
    if (currentSegmentIndex > firstOfCurrent) {
      speakSegment(firstOfCurrent);
      return;
    }

    // Otherwise, jump to the first segment of the previous question
    for (let i = currentSegmentIndex - 1; i >= 0; i--) {
      if (queue[i].questionId !== currentQId) {
        const prevQId = queue[i].questionId;
        const firstOfPrev = queue.findIndex((s) => s.questionId === prevQId);
        speakSegment(firstOfPrev);
        return;
      }
    }
  }, [currentSegment, currentSegmentIndex, queue, speakSegment]);

  // Next Segment
  const nextSegment = useCallback(() => {
    if (currentSegmentIndex < queue.length - 1) {
      speakSegment(currentSegmentIndex + 1);
    }
  }, [currentSegmentIndex, queue.length, speakSegment]);

  // Previous Segment
  const prevSegment = useCallback(() => {
    if (currentSegmentIndex > 0) {
      speakSegment(currentSegmentIndex - 1);
    }
  }, [currentSegmentIndex, speakSegment]);

  // Relative Seek (-10s / +10s)
  const seekRelative = useCallback(
    (deltaSeconds: number) => {
      // In TTS, a relative jump shifts by roughly 1 segment per ~10-15 seconds
      const deltaSegments = deltaSeconds > 0 ? 1 : -1;
      const targetIndex = Math.max(
        0,
        Math.min(queue.length - 1, currentSegmentIndex + deltaSegments)
      );
      speakSegment(targetIndex);
    },
    [currentSegmentIndex, queue.length, speakSegment]
  );

  // Settings Setters
  const setRate = useCallback((rate: number) => {
    setSettings((prev) => ({ ...prev, rate }));
  }, []);

  const setPitch = useCallback((pitch: number) => {
    setSettings((prev) => ({ ...prev, pitch }));
  }, []);

  const setVoiceURI = useCallback((voiceURI: string | null) => {
    setSettings((prev) => ({ ...prev, voiceURI }));
  }, []);

  const setPauseMode = useCallback((pauseMode: PauseCadenceMode) => {
    setSettings((prev) => ({ ...prev, pauseMode }));
  }, []);

  const setAutoFollow = useCallback((autoFollow: boolean) => {
    setSettings((prev) => ({ ...prev, autoFollow }));
  }, []);

  const setIsMinimized = useCallback((isMinimized: boolean) => {
    setSettings((prev) => ({ ...prev, isMinimized }));
  }, []);

  const setShowTranscript = useCallback((showTranscript: boolean) => {
    setSettings((prev) => ({ ...prev, showTranscript }));
  }, []);

  const setHighlightSentences = useCallback((highlightSentences: boolean) => {
    setSettings((prev) => ({ ...prev, highlightSentences }));
  }, []);

  const setShowScrubberThumb = useCallback((showScrubberThumb: boolean) => {
    setSettings((prev) => ({ ...prev, showScrubberThumb }));
  }, []);

  const setActivePersonaId = useCallback((activePersonaId: string | null) => {
    setSettings((prev) => ({ ...prev, activePersonaId }));
  }, []);

  const seekToSegmentIndex = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, Math.min(queue.length - 1, index));
      speakSegment(targetIndex);
    },
    [queue.length, speakSegment]
  );

  // Voice Preview Utility
  const previewVoice = useCallback(
    (voiceURI: string) => {
      const synth = synthRef.current;
      if (!synth) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Hello! This is how I will sound while guiding your React senior interview preparation."
      );
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      const voice = availableVoices.find((v) => v.voiceURI === voiceURI);
      if (voice) {
        utterance.voice = voice;
      }
      synth.speak(utterance);
    },
    [settings.rate, settings.pitch, availableVoices]
  );

  // Dismiss saved progress
  const dismissSavedProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_PROGRESS_KEY);
      setSavedProgress(null);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Resume saved progress
  const resumeSavedProgress = useCallback(() => {
    if (!savedProgress) return;
    const targetIdx = queue.findIndex((s) => s.id === savedProgress.segmentId);
    if (targetIdx !== -1) {
      speakSegment(targetIdx);
    } else {
      const qIdx = queue.findIndex((s) => s.questionId === savedProgress.questionId);
      if (qIdx !== -1) {
        speakSegment(qIdx);
      }
    }
  }, [savedProgress, queue, speakSegment]);

  // Overall progress statistics
  const progressInfo = useMemo<AudioProgressInfo>(() => {
    const totalSegments = queue.length;
    const progressPercent =
      totalSegments > 0 ? Math.round(((currentSegmentIndex + 1) / totalSegments) * 100) : 0;

    // Estimate seconds: ~12 seconds per segment on average
    const currentTimeSec = Math.round(currentSegmentIndex * 12);
    const totalDurationSec = Math.round(totalSegments * 12);

    return {
      currentTimeSec,
      totalDurationSec,
      progressPercent,
      currentSegmentIndex,
      totalSegments,
      currentQuestionIndex,
      totalQuestions: questions.length,
    };
  }, [queue.length, currentSegmentIndex, currentQuestionIndex, questions.length]);

  // Global Keyboard Shortcuts (Space, ArrowLeft, ArrowRight, KeyM)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input, textarea, or search
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space' && (playbackState === 'playing' || playbackState === 'paused')) {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        nextQuestion();
      } else if (e.code === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        prevQuestion();
      } else if (e.code === 'KeyM' && playbackState !== 'idle') {
        e.preventDefault();
        setIsMinimized(!settings.isMinimized);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackState, togglePlayPause, nextQuestion, prevQuestion, settings.isMinimized, setIsMinimized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPauseTimer();
      synthRef.current?.cancel();
    };
  }, [clearPauseTimer]);

  return {
    // State
    playbackState,
    currentSegment,
    currentQuestion,
    currentSegmentIndex,
    currentQuestionIndex,
    activeCharIndex,
    settings,
    availableVoices,
    savedProgress,
    progressInfo,
    queue,

    // Controls
    play,
    pause,
    resume,
    togglePlayPause,
    stop,
    jumpToQuestion,
    jumpToSegment,
    nextQuestion,
    prevQuestion,
    nextSegment,
    prevSegment,
    seekRelative,
    seekToSegmentIndex,
    previewVoice,
    dismissSavedProgress,
    resumeSavedProgress,

    // Settings
    setRate,
    setPitch,
    setVoiceURI,
    setPauseMode,
    setAutoFollow,
    setIsMinimized,
    setShowTranscript,
    setHighlightSentences,
    setShowScrubberThumb,
    setActivePersonaId,
  };
}
