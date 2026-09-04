import { useState, useEffect, useRef, useCallback } from 'react';

// Browser-safe types for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface UseSpeechSearchReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  clearError: () => void;
}

export function useSpeechSearch(onSpeechResult?: (text: string) => void): UseSpeechSearchReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const restartTimeoutRef = useRef<any>(null);
  const onSpeechResultRef = useRef(onSpeechResult);

  useEffect(() => {
    onSpeechResultRef.current = onSpeechResult;
  }, [onSpeechResult]);

  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const isSpeechSynthesisSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanly detach and abort any active SpeechRecognition instance
  const cleanupCurrentSession = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      const activeRec = recognitionRef.current;
      recognitionRef.current = null;
      try {
        // Detach listeners before aborting so no rogue abort/end events alter state
        activeRec.onstart = null;
        activeRec.onresult = null;
        activeRec.onerror = null;
        activeRec.onend = null;
        activeRec.abort();
      } catch {
        try {
          activeRec.stop();
        } catch {}
      }
    }
  }, []);

  // Creates a pristine SpeechRecognition instance per session to avoid browser state corruption
  const createAndStartSession = useCallback(() => {
    cleanupCurrentSession();

    if (!isSpeechRecognitionSupported) {
      setError('Voice speech recognition is not supported in this browser.');
      setIsListening(false);
      shouldListenRef.current = false;
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      const recognition = new SpeechRecognitionClass();
      const isSafari =
        typeof navigator !== 'undefined' &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      // Safari handles continuous=false much better, and restarts cleanly via onend
      recognition.continuous = !isSafari;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (shouldListenRef.current) {
          setIsListening(true);
          setError(null);
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            currentFinal += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        const combined = (currentFinal + currentInterim).trim();
        setTranscript(combined);
        if (combined && onSpeechResultRef.current) {
          onSpeechResultRef.current(combined);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const err = event.error;

        // Ambient silence or normal abort are non-fatal
        if (err === 'no-speech') {
          return;
        }
        if (err === 'aborted') {
          return;
        }

        let userMsg = 'Speech recognition error occurred.';
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          userMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
        } else if (err === 'audio-capture') {
          userMsg = 'No microphone was found or microphone is busy. Please check audio devices.';
        } else if (err === 'network') {
          userMsg = 'Speech recognition network connection error. Please try again.';
        }

        shouldListenRef.current = false;
        setIsListening(false);
        setError(userMsg);
      };

      recognition.onend = () => {
        // If user wants continuous listening and no fatal error occurred, restart on the next event loop tick
        if (shouldListenRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldListenRef.current) {
              createAndStartSession();
            }
          }, 150);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      shouldListenRef.current = false;
      setIsListening(false);
      setError('Could not initialize speech recognition: ' + (err?.message || 'Unknown error'));
    }
  }, [cleanupCurrentSession, isSpeechRecognitionSupported]);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    shouldListenRef.current = true;

    // Explicitly verify / prompt microphone permission via getUserMedia if available
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release tracks so SpeechRecognition has clean exclusive access
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr: any) {
      if (
        permErr?.name === 'NotAllowedError' ||
        permErr?.name === 'PermissionDeniedError' ||
        permErr?.name === 'SecurityError'
      ) {
        shouldListenRef.current = false;
        setIsListening(false);
        setError('Microphone access blocked. Please allow microphone access in your browser address bar.');
        return;
      }
      if (permErr?.name === 'NotFoundError' || permErr?.name === 'DevicesNotFoundError') {
        shouldListenRef.current = false;
        setIsListening(false);
        setError('No microphone hardware detected on this device.');
        return;
      }
    }

    if (shouldListenRef.current) {
      createAndStartSession();
    }
  }, [createAndStartSession]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    cleanupCurrentSession();
  }, [cleanupCurrentSession]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      cleanupCurrentSession();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [cleanupCurrentSession]);

  // Text-to-Speech Output
  const speak = useCallback((text: string) => {
    if (!isSpeechSynthesisSupported) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [isSpeechSynthesisSupported]);

  const stopSpeaking = useCallback(() => {
    if (!isSpeechSynthesisSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setIsSpeaking(false);
  }, [isSpeechSynthesisSupported]);

  return {
    isListening,
    transcript,
    error,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearError,
  };
}
